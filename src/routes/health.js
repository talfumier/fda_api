import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";

const router = express.Router();

router.get(
  "/",
  routeHandler((req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
    });
  })
);
export default router;
