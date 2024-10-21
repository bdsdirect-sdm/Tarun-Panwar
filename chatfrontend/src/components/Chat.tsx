import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button, Container, TextField, Typography, Box, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Chat: React.FC = () => {
  const { id } = useParams();
  const chatRoomId = id;

  // Use useRef to hold the socket instance
  const socket = useRef<Socket | null>(null);

  // Define state types
  const [message, setMessage] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [socketID, setSocketID] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>('');

  // Fetch messages when the component mounts or when chatRoomId changes
  useEffect(() => {
    // Fetch messages for the specific chatRoomId
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api//chatrooms/${chatRoomId}/message${chatRoomId}`);
        if (response.status === 200) {
          setMessages(response.data.map((msg: any) => msg.content)); // Map the content of the messages
        } else {
          console.log('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Call the fetchMessages function if the chatRoomId exists
    if (chatRoomId) {
      fetchMessages();
    }

    // Initialize socket connection
    socket.current = io('http://localhost:9000');

    // Listen for socket connection
    socket.current.on('connect', () => {
      console.log(socket.current?.id);
      setSocketID(socket.current?.id || '');
      console.log('connected', socket.current?.id);
    });

    // Listen for received messages
    socket.current.on('receive-message', (data: string) => {
      console.log('receive-message', data);
      setMessages((messages) => [...messages, data]);
    });

    // Cleanup on disconnection
    return () => {
      socket.current?.disconnect();
    };
  }, [chatRoomId]); // Re-run effect when chatRoomId changes

  // Handle message send
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    socket.current?.emit('message', { message, room });

    try {
      const response = await axios.post('http://localhost:9000/api/send-message', {
        chatRoomId,   // Pass the chat room ID
        content: message,  // Pass the message content
      });

      console.log(response);

      if (response.status === 200) {
        console.log('Message sent and saved successfully:', response.data);
      } else {
        console.log('Failed to send message:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  // Handle joining a room
  const joinRoomHandler = (e: React.FormEvent) => {
    console.log('room', roomName);
    e.preventDefault();
    socket.current?.emit('join-room', roomName);
    console.log('Receiver Id', roomName);
    setRoomName('');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 50 }} />
      <Typography variant="h6" sx={{ color: 'white' }}>
        Socket ID: {socketID || 'Connecting...'}
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <h5>Join Room</h5>
        <TextField
          value={roomName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)} // Properly typed onChange
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Join Room
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} // Properly typed onChange
          id="outlined-basic"
          label="Message"
          variant="outlined"
        />
        <TextField
          value={room}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)} // Properly typed onChange
          id="outlined-basic"
          label="Room"
          variant="outlined"
        />
        <br />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>

      <Stack>
        {messages.map((m, i) => (
          <Typography
            key={i}
            variant="h6"
            component="div"
            gutterBottom
            sx={{
              width: '65%',
              background: 'white',
              margin: '5px',
              padding: '0px 7px',
              borderRadius: '8px',
            }}
          >
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default Chat;
