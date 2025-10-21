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

const router = express.Router();

router.get(
  "/:modelName", //modelName must be capitalized such as User, UserConn ...
  routeHandler(async (req, res) => {
    const {modelName} = req.params;
    const {model} = getModels(req.db, modelName);
    const data = await model.findAll({attributes: {exclude: ["pwd"]}});
    res.send(new Success("Data retrieval successful", data));
  })
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
  })
);
router.post(
  "/:modelName/",
  authHandler, //user must be authenticated
  routeHandler(async (req, res) => {
    const {modelName} = req.params;
    let cond = userIsAuthorized(req.user.idRole, modelName);
    if (!cond[0]) return res.send(cond[1]);
    if (modelName === "User" || modelName === "Expo") {
      //a user is created through the register route, only organisation can create it from this route
      //expo can only be created by organisation
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
    if (master === null) master = Object.keys(req.body); //master = null for StatusTracking model
    master.map((fld) => {
      if (req.body[fld]) where[fld] = req.body[fld];
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
        new BadRequest(`${modelName} id:'${id}' does already exist !`) //example: tbooking master=[idExpo, idUser] >>> ensure that a given idUser cannot have several bookings for the idExpo
      );
    }
    data = await model.create(req.body);
    if (
      modelName === "Expo" || //Create corresponding status in tstatus_tracking for the newly created objects
      modelName === "Booking" ||
      modelName === "BookingOeuvre"
    ) {
      const {StatusTracking} = getModels(req.db);
      await StatusTracking.model.create(
        modelName === "Expo"
          ? {idExpo: data.idExpo, idStatus: 11} //idStatus = 11 >>> pending
          : modelName === "Booking"
          ? {idBooking: data.idBooking, idStatus: 7} //idStatus = 7 >>> draft
          : {idBookingOeuvre: data.idBookingOeuvre, idStatus: 14} //idStatus = 14 >>> draft
      );
    }
    if (modelName === "StatusTracking") {
      //user status change
      if (Object.keys(req.body).includes("idUser")) {
        const cond = userIsOrg(req, modelName);
        if (!cond[0]) return res.send(cond[1]);
        const statusId = req.body.idStatus;
        let title = await textTranslate(
          `votre compte a été ${statusId === 2 ? "validé" : "désactivé"}`,
          req.user.lang,
          "fr"
        );
        title = `${
          req.headers["x-app-origin"] === "test" ? "Test - " : ""
        }FestivalDesArts : ${title.toLowerCase()}`;
        const {model: mdl1} = getModels(req.db, "User");
        const {idRole, email} = await mdl1.findByPk(req.body.idUser);
        const {model: mdl2} = getModels(req.db, "Role");
        const {role_fr} = await mdl2.findByPk(idRole);
        sendBasicEmail(
          emailRedirect("user", email, req.headers["x-app-origin"]),
          // await textTranslate("do not reply", req.user.lang, "en"),
          "festivaldesarts",
          title,
          await textTranslate(
            `Le compte avec l'identifiant ${email} et le rôle '${role_fr}' a été ${
              statusId === 2 ? "validé avec succès" : "désactivé"
            } !`,
            req.user.lang,
            "fr"
          )
        );
      }
    }
    if (modelName === "User") data.pwd = undefined;
    id = data[`id${modelName}`];
    res.send(
      new Success(`${modelName} id:${id} successfully created !`, data, true)
    );
  })
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
      new Success(`${modelName} id:${id} successfully updated !`, data, true)
    );
  })
);
router.delete(
  "/:modelName/:id",
  authHandler,
  routeHandler(async (req, res) => {
    const {modelName, id} = req.params;
    let cond = userIsAuthorized(req.user.idRole, modelName);
    if (!cond[0]) return res.send(cond[1]);
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const {model} = getModels(req.db, modelName);

    const data = await model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${modelName} id:${id} not found !`));
    if (modelName === "User") {
      cond = userIsOwner(req, data.email, "User") || userIsOrg(req, "User");
      if (!cond)
        return res.send(
          new Unauthorized(
            `Access to ${modelName} id:'${id}' for deletion denied >>> your account does not hold required privileges !`
          )
        );
    }
    try {
      await data.destroy();
      if (modelName === "User") data.pwd = undefined;
      res.send(
        new Success(
          `${modelName} id:'${id}' and associated records (if any) successfully deleted !`,
          null,
          true
        )
      );
    } catch (error) {
      //related records prevent entity deletion
      if (error.original.errno === 1451)
        return res.send(
          new Conflict(
            `${modelName} id:'${id}' cannot be deleted due to child records in linked tables !`
          )
        );
      else throw error;
    }
  })
);
export default router;
