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
    const lang=req.headers["accept-language"];
    req.body = bodyCleanUp(req.body);
    if (req.body.role && req.body.role === 6)   //6 >> admin
      return res.send(
        new BadRequest(
          `User ${req.body.email} with admin privileges cannot be created through the API.`
        )
      );
    const{user,userRole,role}=getModels(req.db);

    const {error} = user.validate(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let usr = null;    
    usr = await user.model.findOne({    //check that user being created does not already exist
      where: {
        email: req.body.email,
      },
    });
    if (usr)
      return res.send(
        new BadRequest(`User ${usr.email} is already registered.`)
      );

    usr = await user.model.create({...(_.omit(req.body, ["idRole"])),pwd:await bcrypt.hash(req.body.pwd, environment.salt_rounds)});
    await userRole.model.create({idUser:usr.idUser,idRole:req.body.idRole});

    usr.pwd = undefined; //does not return the password
    const role_desc=(await role.model.findByPk(req.body.idRole)).role_fr;
    sendBasicEmail(
      usr.email,
      await textTranslate("FestivalDesArts: nouvel utilisateur enregistré",lang,"fr"),
      await textTranslate(`Le compte <b>${usr.email}</b> avec le rôle '${role_desc}' a été enregistré avec succès.
      Le compte est en attente de validation par l'organisation.`,lang,"fr"));
    sendBasicEmail(
      config.email_org,
      await textTranslate("FestivalDesArts: validation de compte requise",lang,"fr"),
      await textTranslate(`Le compte <b>${usr.email}</b> (id:${usr.id}) avec le rôle '${role_desc}' attend votre validation.`,lang,"fr"));
    res.send({
      statusCode: "200",
      message: `User '${usr.email}' successfully registered ! Account is waiting for validation by the organisation.`,
      data: usr,
    });
  })
);
export default router;
