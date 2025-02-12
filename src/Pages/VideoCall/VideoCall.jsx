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

const socket = io("http://localhost:4000");

const VideoCall = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        localStreamRef.current = stream;

        // ✅ Fix 1: Add STUN Server for better connectivity
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream
          .getTracks()
          .forEach((track) => peerConnection.current.addTrack(track, stream));

        socket.emit("join-room", roomId);

        // ✅ Fix 2: Automatically send offer when a user joins
        socket.on("user-joined", async () => {
          if (!peerConnection.current) return;

          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId });
        });

        // Handle offer
        socket.on("offer", async (offer) => {
          if (!peerConnection.current) return;
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("answer", { answer, roomId });
        });

        // Handle answer
        socket.on("answer", async (answer) => {
          if (!peerConnection.current) return;
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        // Handle ICE Candidates
        socket.on("ice-candidate", (candidate) => {
          if (candidate && peerConnection.current) {
            peerConnection.current
              .addIceCandidate(new RTCIceCandidate(candidate))
              .catch((error) =>
                console.error("Failed to add ICE candidate:", error)
              );
          }
        });

        if (peerConnection.current) {
          peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                candidate: event.candidate,
                roomId,
              });
            }
          };

          // ✅ Fix 4: Ensure remote stream updates correctly
          peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
              setTimeout(() => {
                remoteVideoRef.current.srcObject = event.streams[0];
              }, 100);
            }
            setIsConnected(true);
          };
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeCall();
  }, [roomId]);

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
