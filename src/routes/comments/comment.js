import express from "express";
import {routeHandler} from "../../middleware/routeHandler.js";
import {getModels} from "../../mariadb/models/sqlModels.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {textTranslate, emailRedirect} from "../../utilityFunctions.js";

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    const {ExpoComment, StatusTracking} = getModels(req.db);

    const data = await ExpoComment.model.create(req.body);
    await StatusTracking.model.create({
      idExpoComment: data.idExpoComment,
      idStatus: 28, //idStatus = 28 >>> candidate
    });
    const id = data.idExpoComment;

    const name = "festivaldesarts";
    let title = await textTranslate(
      "votre avis a bien été reçu",
      req.body.lang,
      "fr",
    );
    title = `${
      req.headers["x-app-origin"] === "test" ? "Test - " : ""
    }FestivalDesArts : ${title.toLowerCase()}`;
    sendBasicEmail(
      emailRedirect("user", req.body.email, req.headers["x-app-origin"]),
      name,
      title,
      await textTranslate(
        `Votre avis ref.${data.idExpoComment} avec le texte "${req.body.text}" et la note ${req.body.rating}/5 a été transmis à l'organisation pour validation.
      Il devrait être mis en ligne prochainement.`,
        req.body.lang,
        "fr",
      ),
    );
    title = await textTranslate("validation d'avis en attente", req.lang, "fr");
    title = `${
      req.headers["x-app-origin"] === "test" ? "Test - " : ""
    }FestivalDesArts : ${title.toLowerCase()}`;
    sendBasicEmail(
      emailRedirect("org", null, req.headers["x-app-origin"]),
      name,
      title,
      await textTranslate(
        `L'avis émis par ${req.body.email} avec le texte "${req.body.text}" et la note ${req.body.rating}/5 attend votre validation.`,
        req.body.lang,
        "fr",
      ),
    );
    res.send(
      new Success(`ExpoComment id:${id} successfully created !`, data, true),
    );
  }),
);
export default router;
