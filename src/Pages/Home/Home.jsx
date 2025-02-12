// frontend/src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import "./Home.css";
import "../../App.css";
const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  // Create a new room
  const handleCreateRoom = () => {
    const newRoomId = uuidV4(); // Generate unique room ID
    setRoomId(newRoomId);
    setInviteLink(`room/${newRoomId}`);
  };

  // Join existing room
  const handleJoinRoom = () => {
    if (roomId.trim() !== "") {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Video Call App</h1>

      {/* Login & Signup Buttons */}
      <div className="auth-buttons">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </div>

      <hr />

      {/* Room Creation & Invitation */}
      <button onClick={handleCreateRoom}>Create Room</button>

      {inviteLink && (
        <div className="invite-section">
          <p>Share this link to invite others:</p>
          <input type="text" value={inviteLink} readOnly />
          <button onClick={() => navigator.clipboard.writeText(inviteLink)}>
            Copy Link
          </button>
        </div>
      )}

      {/* Join Room Section */}
      <div className="join-room">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default Home;
