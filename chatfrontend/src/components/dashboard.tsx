import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  usertype: string;
  resumeFile: string | null;
  profileImage: string | null;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  userType: string; // Changed to string from number
  agencyId: number | null;
  status: any | null; // Updated type
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in.");

        const response = await axios.get(
          "http://localhost:9000/api/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(response.data.updatedUserList);
        setLoggedInUser(response.data.loggedInUserDetail);

      } catch (error) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    // console.log(loggedInUser);
  }, []);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await axios.post("http://localhost:9000/api/update-status", {
        userId,
        status: newStatus,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: parseInt(newStatus) } : user
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Error updating user status. Please try again.");
    }
  };

  const handleChatClick = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");
  
      // Sending the userId to the API to initialize the chat
      const response = await axios.post(
        `http://localhost:9000/api/chat`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

        if (response.data.success) {
          // Navigate to the chat screen with the userId
          const chatRoomId=response.data.chatRoomId;
          
          
          navigate(`/chat/${chatRoomId}`);
        } else {
          console.error("Failed to initiate chat:", response.data.message);
          setError("Error initiating chat. Please try again.");
        }
    } catch (error) {
      console.error("Error initiating chat:", error);
      setError("Error initiating chat. Please try again.");
    }
    
    navigate(`/chat/${userId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", background: "black", minHeight: "100vh" }}>
      <h1 style={{ color: "#f9d9d9" }}>
        Hello,{" "}
        {loggedInUser
          ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
          : "User"}
        <br />
        Email, {loggedInUser ? `${loggedInUser.email}` : "User"}
      </h1>
      <h1 style={{ color: "#f9d9d9" }}>User Dashboard</h1>

      <table
        style={{ width: "100%", borderCollapse: "collapse", color: "#f9d9d9" }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              First Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Last Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Phone</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Gender</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              User Type
            </th>
            {loggedInUser?.userType === "2" && (
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                Profile Image
              </th>
            )}
            {loggedInUser?.userType === "2" && (
              <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                Resume File
              </th>
            )}
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Status
            </th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.firstName}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.lastName}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.email}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.phone}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.gender}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.userType === "1" ? "Job Seeker" : "Agency"}
              </td>
              {loggedInUser?.userType === "2" && (
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  {user.profileImage ? (
                    <img
                      src={`${user.profileImage}`}
                      alt="Profile"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "No image"
                  )}
                </td>
              )}
              {loggedInUser?.userType === "2" && (
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                  {user.resumeFile ? (
                    <a
                      href={`${user.resumeFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#f9d9d9" }}
                    >
                      Download Resume
                    </a>
                  ) : (
                    "No resume"
                  )}
                </td>
              )}
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {loggedInUser?.userType === "2" ? (
                  <select
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: "8px",
                      backgroundColor: "#f9d9d9",
                      color: "black",
                      border: "1px solid #ccc",
                      outline: "none",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                    value={user.status?.toString() || "0"}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                  >
                    <option value="0">Pending</option>
                    <option value="1">Accepted</option>
                    <option value="2">Rejected</option>
                  </select>
                ) : (
                  <span>
                    {loggedInUser?.status ===0 &&"Pending"}
                    {loggedInUser?.status===1 && "Accepted"}
                    {loggedInUser?.status===2 &&"Rejected"}
                  </span>
                )}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {user.status !== 1 ? (
                  <span>No Chat Available{user.status}</span>
                ) : (
                  <button
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleChatClick(user.id)}
                  >
                    Chat
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <center style={{ marginTop: "10%" }}>
        <button
          style={{
            background: "white",
            padding: "10px",
            color: "black",
            cursor: "pointer",
            border: "0.1px solid white",
          }}
          onClick={logout}
        >
          Logout
        </button>
      </center>
    </div>
  );
};

export default Dashboard;
