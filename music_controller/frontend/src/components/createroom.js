import React, { useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function CreateRoomPage() {
    const navigate = useNavigate();
    const defaultvotes =2 ;
    const[guestCanPause , setGuestCanPause] = useState(true);
    const[votesToSkip , setVotesToSkip] = useState(defaultvotes);

    const handleVotesChange =  (e) => {
        setVotesToSkip(e.target.value);
    };

    const handleGuestCanPauseChange = (e) => {
        setGuestCanPause(e.target.value === "true" ? true : false);
    };

    const handleRoomButtonPressed = () => {
        const requestOption = {
            method: "POST" ,
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };
        fetch("api/create-room" , requestOption)
            .then((response) => response.json())
            .then((data) => navigate('/room/'+ data.code));
    };

    return(
        <Grid container spacing={1}>
            <Grid item xs = {12} align="center">
                <Typography component="h4" variant="h4">
                    Create a Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">Guest Control of Playback</div>
                    </FormHelperText>
                    <RadioGroup row defaultValue="true" onChange={handleGuestCanPauseChange}>
                        <FormControlLabel value="true" control= {<Radio color="primary" />} label ="Play/Pause" labelPlacement = "bottom" />
                        <FormControlLabel value="false" control= {<Radio color="secondary" />} label ="No Control" labelPlacement = "bottom" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required
                        type="number"
                        onChange={handleVotesChange}
                        value={votesToSkip}
                        inputProps={{
                            min:1,
                            style: {textAlign: "center"},
                        }}
                    />
                    <FormHelperText>
                        <div align="center">Votes Required to Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="primary" variant="contained" onClick={handleRoomButtonPressed}>
                    Create A Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" to="/" component={Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
    );
};

