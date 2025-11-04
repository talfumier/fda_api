import express from "express";
import {v2 as cloudinary} from "cloudinary";
import {authHandler} from "../../middleware/authHandler.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {BadRequest, NotFound} from "../../mariadb/models/validation/errors.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {environment} from "../../config/environment.js";

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
export default router;
