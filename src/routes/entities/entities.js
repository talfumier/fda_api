import express from "express";
import {routeHandler} from "../../middleware/routeHandler.js";
import {authHandler} from "../../middleware/authHandler.js";
import {getModels} from "../../mariadb/models/sqlModels.js";
import {
  BadRequest,
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
import {textTranslate} from "../../utilityFunctions.js";

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
    console.log(req.user);
    if (!cond[0]) return res.send(cond[1]);
    if (modelName === "User") {
      cond = userIsOrg(req, modelName); //user (artist or partner role) is created through the register route, only organisation can create it from this route
      if (!cond[0]) return res.send(cond[1]);
    }
    const {model, validate, master} = getModels(req.db, modelName);
    if (validate) {
      const {error} = validate(req.body, "post");
      if (error) return res.send(new BadRequest(error.details[0].message));
    }
    let data = null;
    const where = {};
    master.map((fld) => {
      where[fld] = req.body[fld];
    });
    data = await model.findOne({
      where,
    });
    let id = null;
    if (data) {
      id = data[`id${modelName}`];
      return res.send(
        new BadRequest(`${modelName} id:'${id}' does already exist !`)
      );
    }
    data = await model.create(req.body);
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
    // user status or role change
    let userStatusChange = null;
    if (modelName === "User") {
      const keys = Object.keys(req.body);
      userStatusChange = keys.indexOf("idStatus") !== -1;
      if (userStatusChange) {
        const cond = userIsOrg(req, modelName);
        if (!cond[0]) return res.send(cond[1]);
      }
      if (keys.indexOf("idRole") !== -1)
        new Unauthorized(`User account role cannot be modified !`);
    }
    await data.update(req.body);
    if (userStatusChange) {
      const statusId = req.body.idStatus;
      let title = await textTranslate(
        `votre compte a été ${statusId === 2 ? "validé" : "désactivé"}`,
        req.lang,
        "fr"
      );
      title = "FestivalDesArts : " + title.toLowerCase();
      const {model: mdl} = getModels(req.db, "Role");
      const role = await mdl.findByPk(data.idRole);
      sendBasicEmail(
        data.email,
        title,
        await textTranslate(
          `Le compte avec l'identifiant ${data.email} et le rôle '${
            role.role_fr
          }' a été ${statusId === 2 ? "validé avec succès" : "désactivé"} !`,
          req.lang,
          "fr"
        )
      );
    }
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
          new Unauthorized(
            `${modelName} id:'${id}' cannot be deleted due to related records in related child tables !`
          )
        );
      else throw error;
    }
  })
);
export default router;
