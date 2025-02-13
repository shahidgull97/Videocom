// frontend/src/pages/VideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./videocall.css";
import "../../App.css";
// import dotenv from "dotenv";
// dotenv.config();
// import VideoControls from "../components/VideoControls";
import VideoControls from "../videoControls/videoControlls";
// import ChatBox from "../components/ChatBox";
import ChatBox from "../chatbox/chatbox";

const socket = io("http://videocom-backend.onrender.com");
// const socket = io("http://192.168.31.51:4000");

const VideoCall = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localStreamRef = useRef(null);
  console.log("[CLIENT] Component rendering for user...");
  console.log("[CLIENT] roomId:", roomId);

  useEffect(() => {
    console.log("[CLIENT] useEffect triggered for room:", roomId);
    const initializeCall = async () => {
      console.log("[CLIENT] initializeCall started"); // Log at the start
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("[CLIENT] stream started"); // Log at the start
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("you are insede userRef with ", roomId);
        localStreamRef.current = stream;

        // ✅ Add STUN server for better connectivity
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        // ✅ Listen for new users **BEFORE** joining the room
        socket.on("user-joined", async (id) => {
          console.log(`[CLIENT] New user joined: ${id}`);

          if (!peerConnection.current) return;

          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("offer", { offer, target: id });
        });

        // ✅ Now, join the room
        console.log("[CLIENT] Checking roomId before emitting:", roomId);

        socket.emit("join-room", roomId);
        console.log(`[CLIENT] Emitting join-room event for room: ${roomId}`);

        // Handle incoming offer
        socket.on("offer", async ({ offer, target }) => {
          if (!peerConnection.current) return;

          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("answer", { answer, target });
        });

        // Handle answer
        socket.on("answer", async ({ answer }) => {
          if (!peerConnection.current) return;
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        // Handle ICE Candidates
        socket.on("ice-candidate", (candidate) => {
          if (candidate && peerConnection.current) {
            peerConnection.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        });

        // Send ICE Candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              roomId,
            });
          }
        };

        // ✅ Ensure Remote Video Updates
        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            setTimeout(() => {
              remoteVideoRef.current.srcObject = event.streams[0];
            }, 100);
          }
          setIsConnected(true);
        };
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeCall();
  }, []);

  // Toggle Mic (Mute / Unmute)
  const handleToggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      });
    }
  };

  // Toggle Video (On / Off)
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsVideoOn(track.enabled);
      });
    }
  };

  // End Call
  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    socket.emit("leave-room", roomId);
    window.location.href = "/"; // Redirect to homepage after ending call
  };

  // Send message function
  //   const sendMessage = () => {
  //     if (newMessage.trim()) {
  //       const message = { text: newMessage, sender: "You" };
  //       setMessages([...messages, message]);
  //       socket.emit("send-message", { message, roomId });
  //       setNewMessage("");
  //     }
  //   };

  return (
    <div className="video-call-container">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="local-video"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="remote-video"
      />
      {!isConnected && <p>Waiting for another participant...</p>}
      <VideoControls
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
      />
      <ChatBox socket={socket} roomId={roomId} />{" "}
      {/* ✅ Add ChatBox Component */}
    </div>
  );
};

export default VideoCall;
