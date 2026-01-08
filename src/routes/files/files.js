import express from "express";
import {v2 as cloudinary} from "cloudinary";
import {QueryTypes} from "sequelize";
import https from "https";
import archiver from "archiver";
import {authHandler} from "../../middleware/authHandler.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {BadRequest, NotFound} from "../../mariadb/models/validation/errors.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {environment} from "../../config/environment.js";
import {processSqlQueryData} from "./../../utilityFunctions.js";

const router = express.Router();

cloudinary.config({
  cloud_name: environment.cloudinary_name,
  api_key: environment.cloudinary_api_key,
  api_secret: environment.cloudinary_api_secret,
});
router.post(
  "/cloudinary-upload",
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const options = {
      public_id: req.body.publicId,
      folder: `${environment.cloudinary_folder}${
        req.headers["x-app-origin"] === "prod" ? "/prod" : ""
      }`,
      unique_filename: true,
      use_filename: true,
    };
    if (
      Object.keys(req.query).length > 0 &&
      JSON.stringify(req.query).includes("raw")
    )
      options.resource_type = "raw";
    const result = await cloudinary.uploader.upload(req.body.data, options);
    res.send(
      new Success(
        `File ${req.body.publicId} successfully uploaded to Cloudinary.`,
        result.secure_url,
        true
      )
    );
  })
);
router.post(
  "/cloudinary-delete",
  [authHandler],
  routeHandler(async (req, res) => {
    const publicId = req.body.publicId;
    if (!publicId)
      return res.send(new BadRequest("Missing cloudinary publicId"));
    const option = {};
    if (
      Object.keys(req.query).length > 0 &&
      JSON.stringify(req.query).includes("raw")
    )
      option.resource_type = "raw";
    const result = await cloudinary.uploader.destroy(
      `${environment.cloudinary_folder}${
        req.headers["x-app-origin"] === "prod" ? "/prod" : ""
      }/${publicId}`,
      option
    );
    if (result.result === "ok")
      res.send(
        new Success(`File ${publicId} deleted from cloudinary.`, null, true)
      );
    else res.send(new NotFound(`File ${publicId} not found on cloudinary.`));
  })
);
function groupDataByArtist(rows) {
  const artistsMap = new Map();
  for (const row of rows) {
    // Create unique key for each artist
    const artistKey = `${row.lastName}_${row.firstName}`;
    // If artist doesn't exist in map, create their entry
    if (!artistsMap.has(artistKey)) {
      artistsMap.set(artistKey, {
        idExpo: row.idExpo,
        lastName: row.lastName,
        firstName: row.firstName,
        email: row.email,
        phone: row.phone,
        avatar: row.avatar,
        avatar_url: row.avatar_url,
        resume_fr: row.resume_fr,
        resume_en: row.resume_en,
        idStatus: row.idStatus,
        artworks: [],
      });
    }
    // Add the artwork to this artist's artworks array
    artistsMap.get(artistKey).artworks.push({
      idOeuvre: row.idOeuvre,
      title_fr: row.title_fr,
      title_en: row.title_en,
      desc_fr: row.desc_fr,
      desc_en: row.desc_en,
      completionDate: row.completionDate,
      price: row.price,
      reserved: row.reserved,
      width: row.width,
      height: row.height,
      weight: row.weight,
      domain_fr: row.domain_fr,
      domain_en: row.domain_en,
      tech_fr: row.tech_fr,
      tech_en: row.tech_en,
      media_fr: row.media_fr,
      media_en: row.media_en,
      idFile: row.idFile,
      oeuvre_url: row.oeuvre_url,
      showRoom: row.showRoom,
      screen: row.screen,
    });
  }
  // Convert Map to Array
  return Array.from(artistsMap.values());
}
router.get(
  "/cloudinary-download-zip/:stored_proc/:params/:values",
  [authHandler],
  routeHandler(async (req, res) => {
    const {stored_proc, params, values} = req.params;
    const sqlParams = {};
    const keys = params.replaceAll(":", "").split(",");
    values.split(";").map((val, idx) => {
      sqlParams[keys[idx]] = val;
    });
    let dataArr = await req.db.query(`CALL ${stored_proc}(${params})`, {
      type: QueryTypes.SELECT,
      replacements: sqlParams,
    });
    dataArr = processSqlQueryData(dataArr);
    const artists = groupDataByArtist(dataArr[0]);
    const quality = 90;
    if (!artists || !Array.isArray(artists) || artists.length === 0) {
      return res.send(new BadRequest("Missing or invalid artists array"));
    }
    const archive = archiver("zip", {
      zlib: {level: 9}, // Maximum compression
    });
    // Set response headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=artists_export.zip"
    );
    // Pipe archive to response
    archive.pipe(res);
    // Handle errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });
    // Process each artist
    for (const artist of artists) {
      const artistFolder = `${sanitizeFilename(
        artist.lastName
      )}_${sanitizeFilename(artist.firstName)}`;
      // Add artist info as JSON
      const artistData = {
        lastName: artist.lastName,
        firstName: artist.firstName,
        email: artist.email,
        phone: artist.phone,
        resume_fr: artist.resume_fr,
        resume_en: artist.resume_en,
      };
      archive.append(JSON.stringify(artistData, null, 2), {
        name: `${artistFolder}/info.json`,
      });
      // Download and add profile picture (converted to JPEG)
      if (artist.avatar_url) {
        try {
          const jpegUrl = convertCloudinaryToJpeg(artist.avatar_url, quality);
          const imageStream = await downloadFromCloudinary(jpegUrl);

          archive.append(imageStream, {
            name: `${artistFolder}/profile.jpg`,
          });
        } catch (error) {
          console.error(
            `Failed to download profile picture for ${artist.firstName} ${artist.lastName}:`,
            error.message
          );
        }
      }
      // Download and add artwork images (converted to JPEG)
      if (artist.artworks && artist.artworks.length > 0) {
        for (let i = 0; i < artist.artworks.length; i++) {
          const artwork = artist.artworks[i];
          try {
            const artworkName = artwork.title_en
              ? sanitizeFilename(artwork.title_en)
              : `artwork_${i + 1}`;
            const artworkData = {
              title_fr: artwork.title_fr,
              title_en: artwork.title_en,
              desc_fr: artwork.desc_fr,
              desc_en: artwork.desc_en,
              completionDate: artwork.completionDate,
              price: artwork.price,
              reserved: artwork.reserved,
              width: artwork.width,
              height: artwork.height,
              weight: artwork.weight,
              domain_fr: artwork.domain_fr,
              domain_en: artwork.domain_en,
              tech_fr: artwork.tech_fr,
              tech_en: artwork.tech_en,
              media_fr: artwork.media_fr,
              media_en: artwork.media_en,
            };
            archive.append(JSON.stringify(artworkData, null, 2), {
              name: `${artistFolder}/artworks/${artworkName}/info.json`,
            });
            const jpegUrl = convertCloudinaryToJpeg(
              artwork.oeuvre_url,
              quality
            );
            const imageStream = await downloadFromCloudinary(jpegUrl);
            archive.append(imageStream, {
              name: `${artistFolder}/artworks/${artworkName}/${artworkName}.jpg`,
            });
          } catch (error) {
            console.error(
              `Failed to download artwork for ${artist.firstName} ${artist.lastName}:`,
              error.message
            );
          }
        }
      }
    }
    // Finalize the archive
    await archive.finalize();
  })
);
function convertCloudinaryToJpeg(url, quality = 90) {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex !== -1) {
    const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);
    // Remove existing format transformations and webp extension
    let cleanAfterUpload = afterUpload
      .replace(/f_\w+,?/g, "")
      .replace(/q_\d+,?/g, "")
      .replace(".webp", ".jpg");
    // Clean up any double slashes or commas
    cleanAfterUpload = cleanAfterUpload
      .replace(/\/+/g, "/")
      .replace(/,+/g, ",");
    // Add JPEG format with quality transformation
    return `${beforeUpload}f_jpg,q_${quality}/${cleanAfterUpload}`;
  }
  return url.replace(".webp", ".jpg");
}
function downloadFromCloudinary(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download: ${url}, status: ${response.statusCode}`
            )
          );
          return;
        }
        resolve(response);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
function sanitizeFilename(filename) {
  if (!filename) return "unknown";
  return filename.replace(/[^a-z0-9_\-]/gi, "_").substring(0, 100);
}
export default router;
