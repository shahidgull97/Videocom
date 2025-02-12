// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from './pages/Home';
import Home from "./Pages/Home/Home";
// import VideoCall from './pages/VideoCall';
import VideoCall from "./Pages/VideoCall/VideoCall";
// import "./styles/global.css";
import Signup from "./Pages/SignUp/signup";
import Login from "./Pages/Login/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<VideoCall />} />
      </Routes>
    </Router>
  );
}

export default App;
