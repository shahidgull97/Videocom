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

const socket = io("https://videocom-backend.onrender.com");
// const socket = io("http://localhost:4000");

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
          video: false,
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
          socket.emit("offer", { offer, roomId: id });
        });

        // ✅ Now, join the room
        console.log("[CLIENT] Checking roomId before emitting:", roomId);

        socket.emit("join-room", roomId);
        console.log(`[CLIENT] Emitting join-room event for room: ${roomId}`);

        // Handle incoming offer
        socket.on("offer", async ({ offer, sender }) => {
          console.log(`[CLIENT] Received offer from ${sender}`);

          if (!peerConnection.current) {
            console.error("[CLIENT] PeerConnection is null, ignoring offer");
            return;
          }

          // ✅ Only setRemoteDescription if we are not already handling an offer
          if (peerConnection.current.signalingState === "stable") {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(offer)
            );

            console.log("[CLIENT] Creating and sending answer...");
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("answer", { answer, roomId });
          } else {
            console.warn(
              "[CLIENT] Ignoring new offer: Connection is not stable yet"
            );
          }
        });

        // Handle answer
        socket.on("answer", async ({ answer }) => {
          console.log("[CLIENT] Received answer", answer);

          if (!peerConnection.current) {
            console.error("[CLIENT] PeerConnection is null, ignoring answer");
            return;
          }

          // ✅ Check if signaling state is "have-local-offer" before setting remote description
          if (peerConnection.current.signalingState === "have-local-offer") {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
            console.log("[CLIENT] Remote description set successfully.");
          } else {
            console.warn(
              `[CLIENT] Cannot set remote answer. Current signaling state: ${peerConnection.current.signalingState}`
            );
          }
        });

        // Handle ICE Candidates
        socket.on("ice-candidate", ({ candidate }) => {
          if (candidate && peerConnection.current) {
            console.log("Received ICE Candidate:", candidate);
            peerConnection.current
              .addIceCandidate(new RTCIceCandidate(candidate))
              .catch((error) =>
                console.error("Error adding ICE candidate", error)
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

  return (
    <>
      <div className="video-call-container">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="local-video"
        />
        {!isConnected ? (
          <p>Waiting for another participant...</p>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        )}
      </div>
      <VideoControls
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
      />
      <ChatBox socket={socket} roomId={roomId} />{" "}
      {/* ✅ Add ChatBox Component */}
    </>
  );
};

export default VideoCall;
