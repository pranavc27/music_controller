import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CreateRoomPage from "./createroom";

const Room = ({ leaveRoomCallback }) => {
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });

  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { roomCode } = useParams();

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const response = await fetch("/api/get-room" + "?code=" + roomCode);
        if (!response.ok) {
          leaveRoomCallback();
          return;
        }
        const data = await response.json();

        setRoomDetails({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    if (!redirectToHome) {
      getRoomDetails();
    }
  }, [roomCode, redirectToHome, leaveRoomCallback]);

  const leaveButtonPressed = async () => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      await fetch("/api/leave-room", requestOptions);
      leaveRoomCallback();
      setRedirectToHome(true);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const updateShowSettings = (value) => {
    setShowSettings(value);
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={roomDetails.votesToSkip}
            guestCanPause={roomDetails.guestCanPause}
            roomCode={roomCode}
            updateCallback={() => 
            {
              updateShowSettings(false);
              setRoomDetails((prevRoomDetails) => 
              ({
                ...prevRoomDetails,
                votesToSkip: roomDetails.votesToSkip,
                guestCanPause: roomDetails.guestCanPause,
              })
            );
            }}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  if (redirectToHome) {
    return <Navigate to="/" />;
  }

  if(showSettings)
  {
    return renderSettings();
  }


  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Votes: {roomDetails.votesToSkip}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Guest Can Pause: {roomDetails.guestCanPause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Host: {roomDetails.isHost.toString()}
        </Typography>
      </Grid>
      {roomDetails.isHost ? renderSettingsButton() : null}
      <Grid item xs={12}>
        <Button
          color="secondary"
          variant="contained"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
