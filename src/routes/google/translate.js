import express from "express";
import {routeHandler} from "../../middleware/routeHandler.js";
import {textTranslate} from "../../utilityFunctions.js";
import {Success} from "../../mariadb/models/validation/success.js";

const router = express.Router();

router.post(
  "/", //no authentication required
  routeHandler(async (req, res) => {
    const translated = await textTranslate(
      req.body.text,
      req.body.to,
      req.body.from
    );
    res.send(new Success("text successfully translated", translated, false));
  })
);
export default router;
