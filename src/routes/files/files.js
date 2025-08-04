import express from "express";
import {v2 as cloudinary} from "cloudinary";
import {authHandler} from "../../middleware/authHandler.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {BadRequest, NotFound} from "../../mariadb/models/validation/errors.js";
import {environment} from "../../config/environment.js";

const router = express.Router();

cloudinary.config({
  cloud_name: environment.cloudinary_name,
  api_key: environment.cloudinary_api_key,
  api_secret: environment.cloudinary_api_secret,
});
router.post(
  "/cloudinary-upload-base64",
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const options = {
      public_id: req.body.publicId,
      folder: "festivaldesarts",
      unique_filename: true,
      use_filename: true,
    };
    const result = await cloudinary.uploader.upload(req.body.data, options);
    res.send({
      statusCode: "200",
      message: `Image ${req.body.publicId} successfully uploaded to Cloudinary.`,
      url: result.secure_url,
    });
  })
);
router.post(
  "/cloudinary-delete",
  [authHandler],
  routeHandler(async (req, res) => {
    const publicId = req.body.publicId;
    if (!publicId)
      return res.send(new BadRequest("Missing cloudinary publicId"));
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok")
      res.send({message: `Image ${publicId} deleted from cloudinary.`});
    else res.send(new NotFound(`Image ${publicId} not found on cloudinary.`));
  })
);
export default router;
