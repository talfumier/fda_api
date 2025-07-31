import express from "express";
import bcrypt from "bcrypt";
import _ from 'lodash';
import {routeHandler} from "../../middleware/routeHandler.js";
import {bodyCleanUp} from "../../mariadb/models/utilityFunctions.js";
import {getModels} from "../../mariadb/models/sqlModels.js";
import {BadRequest} from "../../mariadb/models/validation/errors.js";
import { sendBasicEmail } from "../../mailjet/sendEmail.js";
import {environment} from "../../config/environment.js";
import config from "../../config/config.json" with {type: "json"};
import { textTranslate } from "../../mariadb/models/utilityFunctions.js";

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    req.body = bodyCleanUp(req.body);
    if (req.body.role && req.body.role === 6)   //6 >> admin
      return res.send(
        new BadRequest(
          `User ${req.body.email} with admin privileges cannot be created through the API.`
        )
      );
    const{User,Role}=getModels(req.db);

    const {error} = User.validate(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let user = null;    
    user = await User.model.findOne({    //check that user being created does not already exist
      where: {
        email: req.body.email,
      },
    });
    if (user)
      return res.send(
        new BadRequest(`User ${user.email} is already registered.`)
      );

    user = await User.model.create(
      {...(_.omit(req.body, ["idRole"])),
        lang:req.lang,
        pwd:await bcrypt.hash(req.body.pwd, parseInt(environment.salt_rounds))});

    user.pwd = undefined; //does not return the password
    const role=(await Role.model.findByPk(req.body.idRole));
    sendBasicEmail(
      user.email,
      await textTranslate("FestivalDesArts: nouvel utilisateur enregistré",req.lang,"fr"),
      await textTranslate(`Le compte avec l'identifiant ${user.email} et le rôle '${role.role_fr}' a été enregistré avec succès.
      Le compte est en attente de validation par l'organisation.`,req.lang,"fr"));
    sendBasicEmail(
      config.email_org,
      await textTranslate("FestivalDesArts: validation de compte requise",req.lang,"fr"),
      await textTranslate(`Le compte avec l'identifiant ${user.email} (id: ${user.idUser}, rôle: ${role.role_fr}) attend votre validation.`,req.lang,"fr"));
    res.send({
      statusCode: "200",
      message: `User '${user.email}' successfully registered ! Account is waiting for validation by the organisation.`,
      data: user,
    });
  })
);
export default router;
