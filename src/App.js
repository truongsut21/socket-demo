// App.js
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = '103.200.20.76:3002'; // Địa chỉ của socket server

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(''); // Room ID để join room
  const socketRef = useRef(null); // Ref để giữ kết nối socket

  useEffect(() => {
    // Khởi tạo kết nối socket chỉ một lần khi component mount
    socketRef.current = io(SOCKET_SERVER_URL);

    // Khi kết nối thành công
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.io server', socketRef.current.id);
    });

    // Khi nhận được message từ server
    socketRef.current.on('message', (data) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup khi component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (message.trim() && roomId) {
      socketRef.current.emit('createMessage', {
        senderId: socketRef.current.id, // ID của người gửi
        roomId: roomId, // ID của phòng chat
        message: message, // Nội dung tin nhắn
      });
      setMessage(''); // Reset message sau khi gửi
    }
  };

  // Tham gia phòng chat
  const joinRoom = () => {
    if (roomId.trim()) {
      socketRef.current.emit('joinRoom', roomId);
      console.log(`Joined room ${roomId}`);
    }
  };

  return (
    <div className="App">
      <h1>Socket.io Chat App</h1>

      <div>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>

      <div>
        <h2>Messages</h2>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>
              <strong>{msg.senderId}: </strong>{msg.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;