import express from "express";
import {SitemapStream, streamToPromise} from "sitemap";
import {Readable} from "stream";
import {routeHandler} from "./../../middleware/routeHandler.js";

const router = express.Router();

router.get(
  "/sitemap.xml", //no authentication required
  routeHandler(async (req, res) => {
    const links = [
      {url: "/public/home", changefreq: "monthly", priority: 1.0},
      {url: "/public/catalogue", changefreq: "monthly", priority: 1},
      {url: "/public/jury_awards", changefreq: "monthly", priority: 0.8},
      {url: "/public/contact", changefreq: "monthly", priority: 0.7},
      {url: "/public/legal", changefreq: "monthly", priority: 0.6},
    ];
    const stream = new SitemapStream({
      hostname: "https://festivaldesarts.merville31.fr",
    });

    res.header("Content-Type", "application/xml");
    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(
      (data) => data.toString(),
    );
    res.send(xml);
  }),
);
export default router;
