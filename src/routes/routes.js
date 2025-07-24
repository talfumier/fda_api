import express from "express";
import health from "./health.js";

export function routes(app) {
  app.use("/api/health", health);
}
