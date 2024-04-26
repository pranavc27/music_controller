import React from "react";
import ReactDOM from "react-dom";
import HomePage from "./homepage";


export default function App(){
    return(
        <div className ="homepage">
            <HomePage />
        </div>
    );
}

const appDiv = document.getElementById("app");
ReactDOM.render(<App />, appDiv);