import express from "express";
import {routeHandler} from "../../middleware/routeHandler.js";
import {textTranslate} from "../../utilityFunctions.js";

const router = express.Router();

router.post(
  "/", //no authentication required
  routeHandler(async (req, res) => {
    const text = await textTranslate(req.body.text, req.body.to, req.body.from);
    res.send({
      statusCode: "200",
      text,
    });
  })
);
export default router;
