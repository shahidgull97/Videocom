// frontend/src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import "./Home.css";
import "../../App.css";
import { Video, Users, Shield, Globe, Copy, Link } from "lucide-react";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoomId = uuidV4();
    setRoomId(newRoomId);
    setInviteLink(`${window.location.origin}/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim() !== "") {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="home-container">
      <div className="content-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Connect Face to Face, Anywhere</h1>
          <p className="hero-subtitle">
            High-quality video calls made simple. Join meetings, host virtual
            events, and stay connected.
          </p>

          <div className="auth-buttons">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <Video className="feature-icon" />
            <h3>HD Video</h3>
            <p>Crystal clear video quality for the best experience</p>
          </div>
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3>Group Calls</h3>
            <p>Connect with multiple participants seamlessly</p>
          </div>
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Secure</h3>
            <p>End-to-end encryption for your privacy</p>
          </div>
          <div className="feature-card">
            <Globe className="feature-icon" />
            <h3>Global Access</h3>
            <p>Connect from anywhere in the world</p>
          </div>
        </div>

        {/* Room Section */}
        <div className="room-section">
          <h2>Start or Join a Meeting</h2>

          <div className="create-room">
            <button className="btn-create" onClick={handleCreateRoom}>
              Create New Room
            </button>
          </div>

          {inviteLink && (
            <div className="invite-section">
              <p>Share this link to invite others:</p>
              <div className="invite-link">
                <input type="text" value={inviteLink} readOnly />
                <button
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="join-room">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="btn-join" onClick={handleJoinRoom}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
