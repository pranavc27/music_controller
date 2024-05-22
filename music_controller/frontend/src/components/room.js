import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CreateRoomPage from "./createroom.js";
import MusicPlayer from "./musicplayer";
import { Navigate } from "react-router-dom";

const Room = ({ leaveRoomCallback }) => {
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [song, setSong] = useState({});
  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const response = await fetch("/api/get-room" + "?code=" + roomCode);
        if (!response.ok) {
          leaveRoomCallback();
          setRedirectToHome(true);
          return;
        }
        const data = await response.json();

        setRoomDetails({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });

        if (data.is_host) {
          authenticateSpotify();
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    const authenticateSpotify = async () => {
      try {
        const response = await fetch("/spotify/is-authenticated");
        const data = await response.json();
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
          const authResponse = await fetch("/spotify/get-auth-url");
          const authData = await authResponse.json();
          window.location.replace(authData.url);
        }
      } catch (error) {
        console.error("Error authenticating with Spotify:", error);
      }
    };

    const getCurrentSong = async () => {
      try {
        const response = await fetch("/spotify/current-song");
        if (!response.ok) {
          throw new Error("Failed to fetch current song");
        }
        const text = await response.text();
        if (!text) {
          throw new Error("Empty response from server");
        }
        const data = JSON.parse(text);
        setSong(data);
      } catch (error) {
        console.error("Error fetching current song:", error);
        setSong({});
      }
    };

    if (!redirectToHome) {
      getRoomDetails();
    }

    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
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
            updateCallback={() => {
              updateShowSettings(false);
              setRoomDetails((prevRoomDetails) => ({
                ...prevRoomDetails,
                votesToSkip: roomDetails.votesToSkip,
                guestCanPause: roomDetails.guestCanPause,
              }));
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

  if (showSettings) {
    return renderSettings();
  }

  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...song} />
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
