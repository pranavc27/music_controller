import React from "react";
import { render } from "react-dom";

export default function App(props)
{
    return <h1>Testing React Code</h1>
}

const appDiv = document.getElementById("app");
render (<App /> , appDiv);