import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.DEPLOY_TARGET === "github-pages" ? "/waypoint-local-planner/" : "/"
});
