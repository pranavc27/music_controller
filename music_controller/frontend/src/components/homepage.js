import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes ,Route } from 'react-router-dom';
import { Link } from "react-router-dom";
import RoomJoinPage from "./roomjoin";
import CreateRoomPage from "./createroom";
import Button from "@mui/material/Button";
import { ButtonGroup } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Room from "./room";
import {Navigate} from "react-router-dom";


const HomePage = () => {
    const[roomCode , setRoomCode] = useState(null);

    useEffect(() => {
      fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        setRoomCode(data.roomCode);
      });
    }, []);

    const renderHomePage = () => {
      return(
        <Grid container spacing ={3} align="center">
          <Grid item xs ={12}>
            <Typography variant="h3">
              Music Party
            </Typography>

          </Grid>
          <Grid item xs ={12}>
            <ButtonGroup variant="contained" color="primary">
              <Button color="primary" component = {Link} to="/join">
                Join a Room
              </Button>
              <Button color="secondary" component = {Link} to="/create">
                Create a Room
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      );
    };

  const clearRoomCode = () => {
      setRoomCode(null);
    };

  return (
      <Router>
        <Routes>
          <Route
            path="/" 
            element={ roomCode ? <Navigate to={`/room/${roomCode}`} /> :  renderHomePage() }
          />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route 
          path="/room/:roomCode" 
          element={<Room leaveRoomCallback={clearRoomCode}/>} />
        </Routes>
      </Router>
    );
};

export default HomePage;