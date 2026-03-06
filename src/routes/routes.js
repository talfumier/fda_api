import express from "express";
import cors from "cors";
import {selectDb} from "../middleware/selectDb.js";
import utilities from "./utilities.js";
import translate from "./google/translate.js";
import register from "./users/register.js";
import login from "./users/login.js";
import password from "./users/password.js";
import entities from "./entities//entities.js";
import sqlEntities from "./entities/sqlEntities.js";
import files from "./files/files.js";
import download from "../routes/entities/pdf/catalogue/download.js";
import {invalidPathHandler} from "../middleware/invalidPathHandler.js";
import {errorHandler} from "../middleware/errorHandler.js";

export function routes(app) {
  app.use(
    cors({
      origin: [
        "127.0.0.1",
        "http://localhost:5173",
        "https://test.festivaldesarts.merville31.fr",
        "https://festivaldesarts.merville31.fr",
      ],
      allowedHeaders: ["Content-Type", "X-Auth-Token", "X-App-Origin"],
    }),
  );

  app.use(selectDb); // Middleware to select test or prod database per request based on x-app-origin header

  app.use(express.json({limit: "10mb"})); //Body parser express built-in middleware

  app.use("/api/utilities", utilities);
  app.use("/api/translate", translate);
  app.use("/api/files", files);

  app.use("/api/register", register);
  app.use("/api/login", login);
  app.use("/api/resetpassword", password);

  app.use("/api/entities", entities);
  app.use("/api/sql-entities", sqlEntities);

  app.use("/api/catalogue", download);

  app.use(invalidPathHandler); //invalid path handler middleware > eventually triggerered when none of the routes matches

  app.use(errorHandler); //custom error handler middleware > function signature : function (err,req,res,next) called by routeHandler try catch mechanism
}
