import express from "express";
import {chromium} from "playwright";
import {routeHandler} from "./../../../../middleware/routeHandler.js";
import {authHandler} from "./../../../../middleware/authHandler.js";

const router = express.Router();

router.post(
  "/",
  authHandler,
  routeHandler(async (req, res) => {
    let browser;
    try {
      const url = `${req.body.source}/public/catalogue_print?params=${req.body.params}&paramsValues=${req.body.paramsValues}`;

      browser = await chromium.launch();
      const page = await browser.newPage();

      page.on("requestfailed", (req) => {
        const u = req.url();
        if (u.includes("cloudinary") || req.resourceType() === "image") {
          console.log(
            "Request failed:",
            req.resourceType(),
            u,
            req.failure()?.errorText,
          );
        }
      });

      const resp = await page.goto(url, {waitUntil: "domcontentloaded"});
      console.log("Front status:", resp?.status(), "URL:", page.url());
      // Force lazy images to load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const stats = await page.evaluate(async () => {
        const imgs = Array.from(document.images);

        const waitOne = (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve(img.naturalWidth > 0);

            const done = (ok) => resolve(ok);
            img.addEventListener("load", () => done(true), {once: true});
            img.addEventListener("error", () => done(false), {once: true});
            setTimeout(() => done(false), 10000);
          });

        const results = await Promise.all(imgs.map(waitOne));
        return {
          total: imgs.length,
          loaded: results.filter(Boolean).length,
          failed: results.filter((x) => !x).length,
        };
      });
      console.log("Image stats:", stats);
      console.time("pdf generation");
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {top: "12mm", right: "12mm", bottom: "12mm", left: "12mm"},
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size:9px;width:100%;padding:0 12mm;color:#666;">
            Catalogue – Exposition
          </div>`,
        footerTemplate: `
          <div style="font-size:9px;width:100%;padding:0 12mm;color:#666;text-align:right;">
            Page <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>`,
      });
      console.timeEnd("pdf generation");
      console.log("PDF bytes:", pdfBuffer.length);
      console.log("Sending PDF...");
      res.status(200);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="catalogue.pdf"',
      );
      res.setHeader("Content-Length", String(pdfBuffer.length));
      res.setHeader("Cache-Control", "no-store");
      res.end(pdfBuffer);
      console.log("PDF Sent.");
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send("Error in API downlaod.js > catalague PDF generation");
    } finally {
      if (browser) await browser.close();
    }
  }),
);
export default router;
