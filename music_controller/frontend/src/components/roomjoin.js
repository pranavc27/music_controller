import React , {useState} from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Link , useNavigate } from "react-router-dom";

const RoomJoinPage = () => {

    const [roomCode , setRoomCode] = useState("");
    const [error , setError] = useState("");
    const navigate = useNavigate();

    const handleTextFieldChange = (e) => {
        setRoomCode(e.target.value);
    };

    const roomButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({
                code: roomCode,
            }),
        };
        fetch("/api/join-room", requestOptions)
        .then((response) => {
            if(response.ok)
            {
                navigate('/room/' + roomCode);
            }
            else{
                setError("Room not found.");
            }
        })
        .catch((error)=> {
            console.log(error);
        });
    };

    return(
        <Grid container spacing={1} align="center">
            <Grid item xs={12}>
                <Typography variant="h4" component="h4">
                    Join Room
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    error="Error"
                    label= "Code"
                    placeholder="Enter a room code" 
                    value={roomCode}
                    helperText={error}
                    variant="outlined"
                    onChange={handleTextFieldChange}
                />
            </Grid>
            <Grid item xs={12}>
                <Button
                   variant="contained"
                   color="primary"
                   onClick={roomButtonPressed} 
                >
                Enter Room
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="secondary" component={Link} to="/">
                    Back
                </Button>
            </Grid>
        </Grid>
    );
  
};

export default RoomJoinPage;