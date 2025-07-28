import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {getModels} from "../mariadb/models/sqlModels.js";
import {sendResponse} from "../mariadb/models/validation/sendResponse.js";

const router = express.Router();

router.get(
  "/",
  routeHandler((req, res) => {
    // const user = getModels(req.db, "user");
    sendResponse(res, "Health check successful !");
  })
);
export default router;
