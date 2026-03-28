import express from "express";
import {routeHandler} from "./../../../../middleware/routeHandler.js";
import {authHandler} from "./../../../../middleware/authHandler.js";
import {generatePDF} from "../pdfFunctions.js";

const router = express.Router();

router.post(
  "/",
  authHandler,
  routeHandler(async (req, res) => {
    try {
      const pdfBuffer = await generatePDF(
        req.body.source,
        req.body.url,
        req.body.params,
        req.body.paramsValues,
        req.body.header,
        req.token,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="catalogue.pdf"',
      );
      res.setHeader("Content-Length", String(pdfBuffer.length));
      res.setHeader("Cache-Control", "no-store");

      return res.status(200).end(pdfBuffer);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send("Error in API download.js > catalogue PDF generation");
    }
  }),
);
export default router;
