import express, { Request, Response } from 'express';
import sequelize from '../src/config/db'
import User from './models/User';
import UserRoutes from './routes/UserRoutes';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import ChatRoom from './models/ChatRoom';
import Message from './models/Message';
import http from 'http';

const app = express();
app.use(cors());
const server = http.createServer(app);  // Use the HTTP server for Socket.io

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',  // You can specify the origin or '*' for all
    methods: ['GET', 'POST']
  }
});

// Set up socket.io connection
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

   // Handle joining a room
   socket.on('join-room', (room: string) => {
    socket.join(room); // Join the room
    console.log(`${socket.id} joined room: ${room}`);
  });

  // Example event to listen for incoming messages
  socket.on('message', async ({room , message , receiverId , senderId }) => {
    // console.log("Message received:", message, "in room", room, "receiver id is", receiverId , "sender id is", senderId);
    // console.log("RECEIVER ID ", receiverId);
    // console.log("SENDER ID", senderId);
    // if (!room || !message) {
    //   console.error("Missing room or message!");
    //   return;
    // }
    // try {

    //   console.log('dfgsdfgd');
    //   // const chatRoom = await ChatRoom.findAll();

    //   const chatRoom = await ChatRoom.findOne({
    //     where: {
    //       name: room
    //   }}
    // );
    //   console.log("chatRoom", chatRoom);

    //   if (!chatRoom) {
    //     console.error('Chat room not found!');

    //     const saveRoomData = await ChatRoom.create({
    //       name: room
    //     });


    //     console.log("saveRoomData Id is", saveRoomData.id);


    //     const newMessage = await Message.create({
    //       content: message,        
    //       senderId: 2,     
    //       receiverId: receiverId,
    //       chatRoomId: saveRoomData.id        
    //     });
  
    //     console.log('Message saved to database:', newMessage);
    //     return;
    //   }

    //   if (!receiverId) {
    //     console.error('Receiver ID is required for direct messages!');
    //     return;
    //   }
      // Create the message in the database
      

      // Send the message to everyone in the room except the sender
      socket.broadcast.to(room).emit("receive-message", message);

    // } catch (error) {
    //   console.error('Error saving message to DB:', error);
    // }
    
  });

});

// Middleware and Routes
app.use(express.json());
const PORT = process.env.PORT || 9000;
app.use('/uploads', express.static(path.join(__dirname, '../', 'uploads')));
app.use('/api', UserRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

// Starting the server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });  // Sync database
    // console.log(await Message.findAll());
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
