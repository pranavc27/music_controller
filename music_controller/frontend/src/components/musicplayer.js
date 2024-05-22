import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const MusicPlayer = ({ 
  title = "Unknown Title",
  artist = "Unknown Artist",
  image_url = "https://p1.hiclipart.com/preview/995/888/40/music-player-icon-music-icon-solid-media-elements-icon-black-text-blackandwhite-line-logo-rectangle-circle-png-clipart.jpg", 
  is_playing = false,
  time = 0,
  duration = 1,
  votes = 0,
  votes_required = 1, }) => {
  
  const pauseSong = async () => {
    console.log("Pause button clicked");
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch("/spotify/pause", requestOptions);
    console.log("Pause response:", response);
  };

  const playSong = async () => {
    console.log("Play button clicked");
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch("/spotify/play", requestOptions);
    console.log("Play response:", response);
  };

  const skipSong = async () => {
    console.log("Skip button clicked");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch("/spotify/skip", requestOptions);
    console.log("Skip response:", response);
  };


  const songProgress = (time / duration) * 100;
  
    return (
      <Card>
        <Grid container alignItems="center">
          <Grid item align="center" xs={4}>
            <img src={image_url} height="100%" width="100%" alt="Album cover" />
          </Grid>
          <Grid item align="center" xs={8}>
            <Typography component="h5" variant="h5">
              {title}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              {artist}
            </Typography>
            <div>
              <IconButton onClick={is_playing ? pauseSong : playSong}>
              {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={skipSong}>
                {votes} / {votes_required}
                <SkipNextIcon />
              </IconButton>
            </div>
          </Grid>
        </Grid>
        <LinearProgress variant="determinate" value={songProgress} />
      </Card>
    );
  };
  
  export default MusicPlayer;
