import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { LeadsProvider } from "./context/LeadsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LeadsProvider>
      <App />
    </LeadsProvider>
  </React.StrictMode>
);
