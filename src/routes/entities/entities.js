import express from "express";
import {routeHandler} from "../../middleware/routeHandler.js";
import {authHandler} from "../../middleware/authHandler.js";
import {getModels} from "../../mariadb/models/sqlModels.js";
import {
  BadRequest,
  Conflict,
  Unauthorized,
} from "../../mariadb/models/validation/errors.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {
  userIsAuthorized,
  userIsOrg,
  userIsOwner,
  validateIntegerId,
} from "../../utilityFunctions.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {textTranslate, emailRedirect} from "../../utilityFunctions.js";
import {generatePDF} from "./pdf/pdfFunctions.js";
import {getMasterUrl} from "../users/password.js";

const router = express.Router();

router.get(
  "/:modelName", //modelName must be capitalized such as User, UserConn ...
  routeHandler(async (req, res) => {
    const {modelName} = req.params;
    const {model} = getModels(req.db, modelName);
    const data = await model.findAll({attributes: {exclude: ["pwd"]}});
    res.send(new Success("Data retrieval successful", data));
  }),
);
router.get(
  "/:modelName/:id",
  routeHandler(async (req, res) => {
    const {modelName, id} = req.params;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const {model} = getModels(req.db, modelName);
    const data = await model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${modelName} id:${id} not found !`));
    if (modelName === "User") data.pwd = undefined;
    res.send(new Success("Data retrieval successful", data));
  }),
);
function getStatusTrackingBody(data, modelName) {
  switch (modelName) {
    case "Expo":
      return {idExpo: data.idExpo, idStatus: 11}; //idStatus = 11 >>> pending
    case "Booking":
      return {idBooking: data.idBooking, idStatus: 7}; //idStatus = 7 >>> draft
    case "BookingOeuvre":
      return {idBookingOeuvre: data.idBookingOeuvre, idStatus: 14}; //idStatus = 14 >>> draft
    case "Faq":
      return {idFaq: data.idFaq, idStatus: 25}; //idStatus = 25 >>> draft
  }
}
router.post(
  "/:modelName/",
  authHandler, //user must be authenticated
  routeHandler(async (req, res) => {
    const {modelName} = req.params;
    let cond = userIsAuthorized(req.user.idRole, modelName);
    if (!cond[0]) return res.send(cond[1]);
    if (
      ["User", "Expo", "Partner", "Doc", "ExpoDoc", "UserExpoRole"].includes(
        modelName,
      )
    ) {
      //a user is created through the register route, only organisation can create it from this route
      //expo ... can only be created by organisation
      cond = userIsOrg(req, modelName);
      if (!cond[0]) return res.send(cond[1]);
    }
    const models = getModels(req.db, modelName);
    const {model, validate} = models;
    let {master} = models;
    if (validate) {
      const {error} = validate(req.body, "post");
      if (error) return res.send(new BadRequest(error.details[0].message));
    }
    let data = null;
    let where = {};
    if (master === null || master !== "no-check")
      master = Object.keys(req.body); //master = null for StatusTracking model
    master.map((fld) => {
      if (req.body[fld] !== undefined) where[fld] = req.body[fld];
    });
    //for Status_Tracking, a given element can have the same idStatus multiple times at different timestamps
    //what is important is that the last one should be different from the one proposed for update in req.body >>> managed in front-end
    if (Object.keys(where).length >= 1)
      data = await model.findOne({
        where,
      });
    let id = null;
    if (data && modelName !== "StatusTracking") {
      id = data[`id${modelName}`];
      return res.send(
        new BadRequest(`${modelName} id:'${id}' does already exist !`), //example: tbooking master=[idExpo, idUser] >>> ensure that a given idUser cannot have several bookings for the idExpo
      );
    }
    try {
      data = await model.create(req.body);
    } catch (error) {
      console.error(
        `error at entities.js line 104 (idUser:${req.user.idUser}):`,
        error,
      );
    }
    if (["Expo", "Booking", "BookingOeuvre", "Faq"].includes(modelName)) {
      //Create corresponding status in tstatus_tracking for the newly created objects
      const {StatusTracking} = getModels(req.db);
      try {
        await StatusTracking.model.create(
          getStatusTrackingBody(data, modelName),
        );
      } catch (error) {
        console.error("error at entities.js line 112:", data, modelName, error);
      }
    }
    if (modelName === "StatusTracking") {
      let title = null,
        text = null,
        recipientLang = null,
        recipientEmail = null;
      //user status change
      if (Object.keys(req.body).includes("idUser")) {
        const cond = userIsOrg(req, modelName);
        if (!cond[0]) return res.send(cond[1]);
        const statusId = req.body.idStatus;
        const {model: mdl1} = getModels(req.db, "User");
        const {idRole, email, lang} = await mdl1.findByPk(req.body.idUser);
        recipientEmail = email;
        recipientLang = lang;
        const {model: mdl2} = getModels(req.db, "Role");
        const {role_fr} = await mdl2.findByPk(idRole);
        title = `votre compte a été ${statusId === 2 ? "validé" : "désactivé"}`;
        text = `Le compte avec l'identifiant ${email} et le rôle '${role_fr}' a été ${
          statusId === 2 ? "validé avec succès" : "désactivé"
        } !`;
      }
      //booking status change
      let attachments = null;
      if (Object.keys(req.body).includes("idBooking")) {
        const bookingUser = (
          await req.db.query("CALL booking_user(:bookingID)", {
            replacements: {bookingID: req.body.idBooking},
          })
        )[0];
        recipientLang = bookingUser.lang;
        recipientEmail = bookingUser.email;
        switch (req.body.idStatus) {
          case 8: //candidate
            title = "votre inscription a été enregistrée";
            text = `Nous vous confirmons que votre inscription réf:${bookingUser.idBooking} a bien été enregistrée.`;
            if (!bookingUser.idRole || bookingUser.idRole !== 2)
              text =
                text +
                `Elle sera traitée à partir du ${bookingUser.closureDateTime} par le comité de sélection qui ne manquera pas de revenir vers vous.`;
            break;
          case 9: //rejected
            title = "votre inscription a été refusée";
            text = `Le comité de sélection a le regret de vous informer que votre inscription réf:${bookingUser.idBooking} a été refusée par le comité de sélection.`;
            break;
          case 10: //accepted
            const fileBuffer = await generatePDF(
              getMasterUrl(req.headers["x-app-origin"]),
              `member/email_attacht_print/${recipientLang}`,
              "idBooking",
              bookingUser.idBooking,
              req.token,
            );
            const base64Content = fileBuffer.toString("base64");
            const pdfSizeBytes = fileBuffer.length;
            const base64SizeBytes = Buffer.byteLength(
              fileBuffer.toString("base64"),
              "utf8",
            );
            console.log(
              "PDF binary size MB:",
              (pdfSizeBytes / 1024 / 1024).toFixed(2),
              "PDF base64 size MB:",
              (base64SizeBytes / 1024 / 1024).toFixed(2),
            );
            attachments = [
              {
                ContentType: "application/pdf",
                Filename: `${bookingUser.lastName}_${bookingUser.firstName}_${bookingUser.idBooking}.pdf`,
                Base64Content: base64Content,
              },
            ];
            title = "votre inscription a été validée";
            text = `Votre inscription réf: ${bookingUser.idBooking} a été validée par le comité de sélection (voir le détail des oeuvres sélectionnées dans le fichier joint). `;
            if (!bookingUser.idRole || bookingUser.idRole !== 2)
              //no financial contribution for guest artists
              text =
                text +
                `Le montant de votre participation est de ${bookingUser.price}€, à régler avant le ${bookingUser.deadline}.`;
            break;
          case 27: //payment received
            title = "le paiement de votre inscription a été reçu";
            text = `Nous vous remercions pour le règlement de votre participation financière; votre inscription réf:${req.body.idBooking} est maintenant confirmée.`;
        }
      }
      //expo comment status change
      if (Object.keys(req.body).includes("idExpoComment")) {
        const cond = userIsOrg(req, modelName);
        if (!cond[0]) return res.send(cond[1]);
        const comment = (
          await req.db.query("CALL expo_comment(:expoCommentID)", {
            replacements: {expoCommentID: req.body.idExpoComment},
          })
        )[0];
        recipientLang = comment.lang;
        recipientEmail = comment.email;
        switch (req.body.idStatus) {
          case 28: //candidate >>> done in comment.js at comment creation (no user authentication)
            title = "votre avis a bien été reçu";
            text = `Votre avis ref.${comment.idExpoComment} avec le texte "${comment.text}" et la note ${comment.rating}/5 a été transmis à l'organisation pour validation.
              Il devrait être mis en ligne prochainement.`;
            break;
          case 30: //rejected
            title = "votre avis a été refusé";
            text = `Le comité d'organisation a le regret de vous informer que votre avis réf. ${comment.idExpoComment} a été refusé.`;
            break;
          case 29: //published
            title = "votre avis a été publié";
            text = `Le comité d'organisation a le plaisir de vous informer que votre avis réf. ${comment.idExpoComment} a été publié; il est maintenant visible sur le site.`;
        }
      }
      if (title && text) {
        title = await textTranslate(title, recipientLang, "fr");
        title = `${
          req.headers["x-app-origin"] === "test" ? "Test - " : ""
        }FestivalDesArts : ${title.toLowerCase()}`;
        sendBasicEmail(
          emailRedirect("user", recipientEmail, req.headers["x-app-origin"]),
          "festivaldesarts",
          title,
          await textTranslate(text, recipientLang, "fr"),
          req.headers["x-app-origin"] !== "dev" && //Cc to sender
            (Object.keys(req.body).includes("idBooking") ||
              Object.keys(req.body).includes("idExpoComment")),
          attachments,
        );
      }
    }
    if (modelName === "User") data.pwd = undefined;
    id = data[`id${modelName}`];
    res.send(
      new Success(`${modelName} id:${id} successfully created !`, data, true),
    );
  }),
);
router.patch(
  "/:modelName/:id",
  authHandler,
  routeHandler(async (req, res) => {
    const {modelName, id} = req.params;
    let cond = userIsAuthorized(req.user.idRole, modelName);
    if (!cond[0]) return res.send(cond[1]);
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const {model, validate} = getModels(req.db, modelName);
    if (validate) {
      error = validate(req.body, "patch").error;
      if (error) return res.send(new BadRequest(error.details[0].message));
    }
    const data = await model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${modelName} id:${id} not found !`));
    // user role change
    if (modelName === "User" && Object.keys(req.body).includes("idRole"))
      res.send(new Unauthorized(`User account role cannot be modified !`));
    await data.update(req.body);
    if (modelName === "User") data.pwd = undefined;
    res.send(
      new Success(`${modelName} id:${id} successfully updated !`, data, true),
    );
  }),
);
router.delete(
  "/:modelName/:id",
  authHandler,
  routeHandler(async (req, res) => {
    const {modelName, id} = req.params;
    let cond = userIsAuthorized(req.user.idRole, modelName);
    if (!cond[0]) return res.send(cond[1]);
    if (modelName !== "File") {
      const {error} = validateIntegerId(id);
      if (error) return res.send(new BadRequest(error.details[0].message));
    }
    const {model} = getModels(req.db, modelName);

    const data = await model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${modelName} id:${id} not found !`));
    if (modelName === "User") {
      cond = userIsOwner(req, data.email, "User") || userIsOrg(req, "User");
      if (!cond)
        return res.send(
          new Unauthorized(
            `Access to ${modelName} id:'${id}' for deletion denied >>> your account does not hold required privileges !`,
          ),
        );
    }
    try {
      await data.destroy();
      if (modelName === "User") data.pwd = undefined;
      res.send(
        new Success(
          `${modelName} id:'${id}' and associated records (if any) successfully deleted !`,
          null,
          true,
        ),
      );
    } catch (error) {
      //related records prevent entity deletion
      if (error.original.errno === 1451)
        return res.send(
          new Conflict(
            `${modelName} id:'${id}' cannot be deleted due to child records in linked tables !`,
          ),
        );
      else throw error;
    }
  }),
);
export default router;
