import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Repo is served at https://smashhittech.github.io/SmashHitsHelps/
export default defineConfig({
  plugins: [react()],
  base: "/SmashHitsHelps/",
});
