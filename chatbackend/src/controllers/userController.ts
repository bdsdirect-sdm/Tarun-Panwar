import { Request, Response } from "express";
import User from "../models/User";
import { upload } from "../middeware/multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import generatePassword from "../services/PasswordGenertor";
import { sendRegistrationEmail } from "../services/emailService";
import sequelize from "../config/db";
import { log, profile } from "console";
import { IntegerDataType, where } from "sequelize";
// import ChatRoom from '../models/ChatRoom';
// import Message from '../models/Message';
import { io } from "socket.io-client";
import Message from "../models/Message";
import ChatRoom from "../models/ChatRoom";
const JWT_SECRET = "12345";

export const registerUser = async (req: any, res: any) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      hobbies,
      userType,
      agencyId,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !gender || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("typeof agencyId", typeof agencyId);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const filesData = req.files as {
      profileImage?: Express.Multer.File[];
      resumeFile?: Express.Multer.File[];
    };

    console.log(filesData.profileImage);
    console.log(filesData.resumeFile);

    const profileImage =
      userType === "1" && filesData.profileImage
        ? filesData.profileImage[0].filename
        : null;
    const resumeFile =
      userType === "1" && filesData.resumeFile
        ? filesData.resumeFile[0].filename
        : null;

    console.log("profileImage{{{{", profileImage);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      userType,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies],
      profileImage,
      password: hashedPassword,
      resumeFile,
      agencyId: userType === "1" ? agencyId : null,
    });

    console.log("AgencyId", user.agencyId);

    await sendRegistrationEmail(email, firstName, password);

    return res
      .status(201)
      .json({ message: "User Registered Successfully", user });
  } catch (error) {
    console.error("Error message", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: any) => {
  const { email, password } = req.body;

  try {
    const user: any = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Include firstName, lastName, and email in the JWT payload
    const token = jwt.sign(
      {
        
        userId: user.id,
        userType: user.userType,
        firstName: user.firstName, // Include firstName
        lastName: user.lastName, // Include lastName
        email: user.email,
        status: user.status,
        // Include email
      },

      (process.env.JWT_SECRET as string) || JWT_SECRET, // Use the secret
      { expiresIn: "1h" }
    );
    console.log(user);

    // Set token in the cookie
    res.cookie("token", token, { httpOnly: true });

    // Send the token and user data in the response
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

export const dashboard = async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    const decoded: any = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || JWT_SECRET
    );
    const userId = decoded.userId;

    // Fetch user data including status
    const user: any = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userType = user.userType; // Extract userType from user
    const firstName = user.firstName;
    const lastName = user.lastName;
    const email = user.email;
    const status = user.status; // Get status from the user
    const agencyId = user.agencyId;
    console.log(agencyId)
    let userList: any[] = [];

    // Fetch agencies for Job Seeker
    if (userType === "1") {

      userList = await User.findAll({
        where: { userType: 2 , id:agencyId}, // Fetch only agencies
        attributes: [
          "id",
          "firstName",
          "lastName",
          "gender",
          "phone",
          "email",
          "userType",
          "profileImage",
          "resumeFile",
          "status",
        ],
      });
    }
    // Fetch job seekers for Agency
    else if (userType === "2") {
      userList = await User.findAll({
        where: {
          userType: 1, // Job Seekers
          agencyId: userId,
        },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "gender",
          "phone",
          "email",
          "userType",
          "profileImage",
          "status",
          "resumeFile",
        ],
      });
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const updatedUserList = userList.map((user) => ({
      ...user.toJSON(),
      profileImage: user.profileImage ? `${baseUrl}${user.profileImage}` : null,
      resumeFile: user.resumeFile ? `${baseUrl}${user.resumeFile}` : null,
    }));

    const loggedInUserDetail = {
      firstName,
      lastName,
      email,
      userType,
      userId,
      status, // Correctly include the status here
    };

    return res.status(200).json({ updatedUserList, loggedInUserDetail });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAgency = async (req: any, res: any) => {
  try {
    const agencies = await User.findAll({
      where: {
        userType: 2,
      },
      attributes: ["id", "firstName", "lastName"],
    });

    // Return the result
    return res.status(200).json({ agencies });
  } catch (error) {
    console.error("Error fetching job seekers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateStatus = async (req: any, res: any) => {
  try {
    // Get the user ID and the new status from the request body
    const { userId, status } = req.body;
    console.log(userId);
    // Update the status of the user with the given ID
    const [updated] = await User.update(
      { status: status }, // Update the 'status' field
      { where: { } } // Find the user by 'id'
    );

    if (updated) {
      // If the update was successful
      const updatedUser = await User.findOne({ where: { id: userId } });
      return res
        .status(200)
        .json({ message: "Status updated successfully", user: updatedUser });
    }

    // If no user was updated
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    // Handle any errors that occurred during the update
    return res
      .status(500)
      .json({ message: "Error updating status", error: error });
  }
};


export const initiateChat = async (req: any, res: any) => {
  try {
    const  receiverId  = req.body.userId;
    console.log(receiverId);
    console.log(receiverId,"rec")  // This is the job seeker's ID
    const token = req.headers.authorization?.split(' ')[1]; // Get JWT token from headers
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decodedToken: any = jwt.verify(token, JWT_SECRET);  // Decode the JWT
    const senderId =decodedToken.userId;  // Extract user ID from token
    console.log(decodedToken.userId,"sen")
    console.log('Logged-in agency ID:', senderId, 'Receiver (Job Seeker) ID:', receiverId);

    
    let chatRoom = await ChatRoom.findOne({
      where: {
        senderId: senderId,
        receiverId: receiverId,  // Make sure to use receiverId
      },
    });
    
    // If chat room doesn't exist, create a new one
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        senderId: senderId,
        receiverId: receiverId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat room initiated',
      chatRoomId: chatRoom.id,
    });
  } catch (error) {
    console.error('Error initiating chat:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};





export const sendMessage = async (req:any, res:any)=>{
  const { content , chatRoomId} = req.body;
  console.log(content , chatRoomId);
  try {
    // Find the chat room by name (if it's unique) or id
    // // const chatRoom = await ChatRoom.findOne({ where: { id: room } });
    // console.log(chatRoom);

    // if (!chatRoom) {
    //   return res.status(404).json({ message: 'Chat room not found' });
    // }

    // Save the message to the Message table
    const newMessage = await Message.create({
      content,
      chatRoomId
    });

    console.log(newMessage)

    return res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error('Error saving message:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}



export const getMessagesByChatRoomId = async (req: any, res: any) => {
  try {
    const { chatRoomId } = req.params; // Get chatRoomId from URL parameter

    if (!chatRoomId) {
      return res.status(400).json({ message: "chatRoomId is required" });
    }

    // Fetch all messages associated with the chatRoomId
    const messages = await Message.findAll({
      where: { chatRoomId },
      order: [['createdAt', 'ASC']], // Optionally order messages by createdAt
    });

    // Return the messages if found
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getChatRooms = async (req: any, res: any) => {

  try {
    const chatRooms = await ChatRoom.findAll();
    return res.status(200).json(chatRooms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching rooms" });
  }
};

export const messages = async (req: any, res: any) => {

  const { message, roomName } = req.body;
  console.log(message , roomName)
  try {
    let chatRoom = await ChatRoom.findOne({ where: { name: roomName } });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ name: roomName });
    }

    // const newMessage = await Message.create({
    //   content: message,
    //   chatRoomId: chatRoom.id,
    // });

    // Emit the message to all clients in the room via socket.io
    // io.to(roomName).emit('new_message', newMessage);

    // return res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending message" });
  }
};

export const getMessages = async (req: any, res: any) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.findAll({
      where: { chatRoomId: roomId },
      include: [
        { model: User, as: "sender", attributes: ["id", "username"] },
        { model: User, as: "receiver", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};
