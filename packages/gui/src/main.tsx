import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { HintsProvider } from "./components/hints/HintsProvider.js";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HintsProvider>
        <App />
      </HintsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
