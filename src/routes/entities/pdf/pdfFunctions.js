import {chromium} from "playwright";
export async function generatePDF(
  source,
  url,
  params,
  paramsValues,
  header,
  token,
) {
  let browser;
  try {
    let finalUrl = `${source}/${url}`;
    if (params) {
      if (finalUrl.includes("catalogue_print"))
        finalUrl = `${finalUrl}?params=${params}&paramsValues=${paramsValues}`;
      else finalUrl = `${finalUrl}?${params}=${paramsValues}`;
    }
    browser = await chromium.launch();
    const page = await browser.newPage();

    page.on("console", (msg) => {
      console.log("Chromium headless log:", msg.text());
    });

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

    await page.addInitScript((token) => {
      window.__AUTH__ = token;
    }, token);

    const resp = await page.goto(finalUrl, {waitUntil: "domcontentloaded"});
    console.log("Front status:", resp?.status(), "URL:", page.url());

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

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {top: "12mm", right: "12mm", bottom: "12mm", left: "12mm"},
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:9px;width:100%;padding:0 12mm;color:#666;">
          ${header}
        </div>`,
      footerTemplate: `
        <div style="font-size:9px;width:100%;padding:0 12mm;color:#666;text-align:right;">
          Page <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>`,
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}
