import express from "express";
import {SitemapStream, streamToPromise} from "sitemap";
import {Readable} from "stream";
import {routeHandler} from "./../../middleware/routeHandler.js";

const router = express.Router();

router.get(
  "/sitemap.xml",
  routeHandler(async (req, res) => {
    const hostname = "https://festivaldesarts.merville31.fr";
    const pages = [
      {key: "home", priority: 1.0},
      {key: "catalogue", priority: 1.0},
      {key: "jury_awards", priority: 0.8},
      {key: "contact", priority: 0.7},
      {key: "legal", priority: 0.6},
    ];
    const links = pages.flatMap((page) => {
      const frUrl = `${hostname}/fr/${page.key}`;
      const enUrl = `${hostname}/en/${page.key}`;
      return [
        {
          url: `/fr/${page.key}`,
          changefreq: "monthly",
          priority: page.priority,
          links: [
            {lang: "fr", url: frUrl},
            {lang: "en", url: enUrl},
            {lang: "x-default", url: frUrl},
          ],
        },
        {
          url: `/en/${page.key}`,
          changefreq: "monthly",
          priority: page.priority,
          links: [
            {lang: "fr", url: frUrl},
            {lang: "en", url: enUrl},
            {lang: "x-default", url: frUrl},
          ],
        },
      ];
    });

    const stream = new SitemapStream({hostname});
    res.header("Content-Type", "application/xml");
    const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(
      (data) => data.toString(),
    );
    res.send(xml);
  }),
);
export default router;
