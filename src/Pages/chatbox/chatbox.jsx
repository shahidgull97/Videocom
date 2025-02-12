// frontend/src/components/ChatBox.jsx
import React, { useState, useEffect } from "react";
import "./chat.css";
import "../../App.css";

const ChatBox = ({ socket, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = { text: newMessage, sender: "You" };
      setMessages([...messages, message]);
      socket.emit("send-message", { message, roomId });
      setNewMessage("");
    }
  };

  return (
    <div>
      <button className="chat-icon" onClick={() => setChatOpen(!chatOpen)}>
        💬
      </button>
      {chatOpen && (
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
