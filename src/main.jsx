import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GCPNavigator from "./app/GCPNavigator";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GCPNavigator />
  </StrictMode>
);

