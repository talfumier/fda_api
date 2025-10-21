import express from "express";
import bcrypt from "bcrypt";
import {routeHandler} from "../../middleware/routeHandler.js";
import {bodyCleanUp} from "../../utilityFunctions.js";
import {getModels} from "../../mariadb/models/sqlModels.js";
import {BadRequest} from "../../mariadb/models/validation/errors.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {environment} from "../../config/environment.js";
import {textTranslate, emailRedirect} from "../../utilityFunctions.js";

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    req.body = bodyCleanUp(req.body);
    if (req.body.role === 7)
      // 7 >> admin
      return res.send(
        new BadRequest(
          `User ${req.body.email} with full admin privileges cannot be created through the API.`
        )
      );
    const {User, StatusTracking, Role} = getModels(req.db);

    const {error} = User.validate(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let user = null;
    user = await User.model.findOne({
      //check that user being created does not already exist
      where: {
        email: req.body.email,
      },
    });
    if (user)
      return res.send(
        new BadRequest(`User '${user.email}' is already registered.`)
      );
    user = await User.model.create({
      ...req.body,
      pwd: await bcrypt.hash(req.body.pwd, parseInt(environment.salt_rounds)),
    });
    user.pwd = undefined; //does not return the password
    //Create corresponding status in tstatus_tracking for the newly created user
    await StatusTracking.model.create({idUser: user.idUser, idStatus: 1}); //idStatus = 1 >>> pending

    const role = await Role.model.findByPk(user.idRole);
    // const name = await textTranslate("do not reply", req.body.lang, "en");
    const name = "festivaldesarts";
    let title = await textTranslate(
      "votre compte a bien été créé",
      req.body.lang,
      "fr"
    );
    title = `${
      req.headers["x-app-origin"] === "test" ? "Test - " : ""
    }FestivalDesArts : ${title.toLowerCase()}`;
    sendBasicEmail(
      emailRedirect("user", user.email, req.headers["x-app-origin"]),
      name,
      title,
      await textTranslate(
        `Le compte avec l'identifiant ${user.email} et le rôle '${role.role_fr}' a été enregistré avec succès.
      Le compte est en attente de validation par l'organisation.`,
        req.body.lang,
        "fr"
      )
    );
    title = await textTranslate(
      "validation de compte en attente",
      req.body.lang,
      "fr"
    );
    title = `${
      req.headers["x-app-origin"] === "test" ? "Test - " : ""
    }FestivalDesArts : ${title.toLowerCase()}`;
    sendBasicEmail(
      emailRedirect("org", null, req.headers["x-app-origin"], req.body.role),
      name,
      title,
      await textTranslate(
        `Le compte avec l'identifiant ${user.email} (id: ${user.idUser}, rôle: ${role.role_fr}) attend votre validation.`,
        req.body.lang,
        "fr"
      )
    );
    res.send(
      new Success(
        `User '${user.email}' has been registered successfully.<br\>Waiting for account validation by the organisation.`,
        user,
        true
      )
    );
  })
);
export default router;
