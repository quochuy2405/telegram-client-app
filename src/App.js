import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { loginWithQR, getClient, getChats, client } from './telegramClient';
import './App.css';

function App() {
  const [qrUrl, setQrUrl] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // State để lưu chat được chọn
  const [messages, setMessages] = useState([]); // State để lưu tin nhắn của chat

  // Kiểm tra session khi khởi động
  useEffect(() => {
    const checkSession = async () => {
      const existingClient = await getClient();
      if (existingClient) {
        setIsLoggedIn(true);
        const chatList = await getChats();
        setChats(chatList);
      }
    };
    checkSession();
  }, []);

  // Đăng nhập bằng QR code
  const handleLogin = async () => {
    await loginWithQR((url) => setQrUrl(url));
    setIsLoggedIn(true);
    const chatList = await getChats();
    setChats(chatList);
  };

  // Lấy tin nhắn khi chọn chat
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    try {
      const chatMessages = await client.getMessages(chat.id, { limit: 20 }); // Lấy 20 tin nhắn gần nhất
      setMessages(
        chatMessages.map((msg) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.senderId?.toString(),
          date: new Date(msg.date * 1000).toLocaleTimeString(),
        }))
      );
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };
  useEffect(() => {
    handleLogin()
  }, [])
  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="login-container">
          <h1>Login to Telegram</h1>
          {qrUrl ? (
            <div>
              <p>Scan this QR code with your Telegram app:</p>
              <QRCodeCanvas value={qrUrl} size={256} />
            </div>
          ) : (
            <>Loading QR code...</>
          )}
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-list">
            <h1>Telegram Chats</h1>
            <ul>
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={selectedChat?.id === chat.id ? 'selected' : ''}
                >
                  {chat.title} ({chat.unreadCount} unread)
                </li>
              ))}
            </ul>
          </div>
          <div className="message-area">
            {selectedChat ? (
              <>
                <h2>{selectedChat.title}</h2>
                <div className="messages">
                  {messages.map((msg) => (
                    <div key={msg.id} className="message">
                      <span className="time">{msg.date}</span>
                      <span className="sender">{msg.sender}</span>: {msg.text}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Select a chat to view messages</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;