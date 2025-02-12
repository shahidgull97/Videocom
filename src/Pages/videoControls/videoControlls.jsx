// frontend/src/components/VideoControls.jsx
import React from "react";
import "./videoControlls.css";
// frontend/src/components/VideoControls.jsx
import "../../App.css";

const VideoControls = ({
  onToggleMic,
  onToggleVideo,
  onEndCall,
  isMicOn,
  isVideoOn,
}) => {
  return (
    <div className="video-controls">
      <button onClick={onToggleMic} className={isMicOn ? "active" : ""}>
        {isMicOn ? "Mute Mic" : "Unmute Mic"}
      </button>
      <button onClick={onToggleVideo} className={isVideoOn ? "active" : ""}>
        {isVideoOn ? "Turn Off Video" : "Turn On Video"}
      </button>
      <button onClick={onEndCall} className="end-call">
        End Call
      </button>
    </div>
  );
};

export default VideoControls;
