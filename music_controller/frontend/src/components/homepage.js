import React from "react";
import { BrowserRouter as Router, Routes ,Route } from 'react-router-dom';
import RoomJoinPage from "./roomjoin";
import CreateRoomPage from "./createroom";

export default function HomePage(props)
{
   return (
    <Router>
    <Routes>
    <Route exact path="/" element={<p>This is the home page</p>} />
      <Route exact path="/join" element={<RoomJoinPage />} />
      <Route exact path="/create" element={ <CreateRoomPage />} />
    </Routes>
  </Router>
  );
}