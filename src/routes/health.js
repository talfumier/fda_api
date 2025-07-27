import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {getModels} from "../mariadb/models/sqlModels.js";

const router = express.Router();

router.get(
  "/",
  routeHandler((req, res) => {
    const {User} = getModels(req.db);
    console.log("xxxx", User);
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
    });
  })
);
export default router;
