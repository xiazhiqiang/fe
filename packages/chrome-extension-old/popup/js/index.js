// const sidePanelControl = document.getElementById("sidePanelControl");

// sidePanelControl.addEventListener("click", function (e) {
//   console.log("sidePanelControl");
// });

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";

const root = createRoot(document.getElementById("root-container"));
root.render(<App />);
