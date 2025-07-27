import express from "express";
import cors from "cors";
import {selectDb} from "../middleware/selectDb.js";
import health from "./health.js";
import {invalidPathHandler} from "../middleware/invalidPathHandler.js";
import {errorHandler} from "../middleware/errorHandler.js";

export function routes(app) {
  app.use(
    cors({
      origin: ["127.0.0.1", "http://your-external-app.com"],
      allowedHeaders: ["Content-Type", "X-App-Origin"],
    })
  );

  app.use(selectDb); // Middleware to select test or prod database per request based on x-app-origin header

  app.use(express.json({limit: "10mb"})); //Body parser express built-in middleware

  app.use("/api/health", health);

  app.use(invalidPathHandler); //invalid path handler middleware > eventually triggerered when none of the routes matches

  app.use(errorHandler); //custom error handler middleware > function signature : function (err,req,res,next) called by routeHandler try catch mechanism
}
