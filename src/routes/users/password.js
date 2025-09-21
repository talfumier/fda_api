import express from "express";
import bcrypt from "bcrypt";
import {format} from "date-fns";
import {getModels} from "./../../mariadb/models/sqlModels.js";
import {Token} from "../../mongodb/mongoModels.js";
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from "../../mariadb/models/validation/errors.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {environment} from "../../config/environment.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {
  htmlTranslate,
  textTranslate,
  validateIntegerId,
  emailRedirect,
} from "../../utilityFunctions.js";

const router = express.Router();

function getMasterUrl(cs) {
  switch (cs) {
    case "dev":
      return environment.front_url_dev;
    case "test":
      return environment.front_url_test;
    case "prod":
      return environment.front_url_prod;
  }
}

//request a new password
router.post(
  "/forgotPassword", //No authentication when requesting a new password
  routeHandler(async (req, res) => {
    const User = getModels(req.db, "User");
    const {error} = User.validate({email: req.body.email}, "postForgotPwd");
    if (error) return res.send(new BadRequest(error.details[0].message));
    const {email, lang} = req.body;
    const user = await User.model.findOne({
      where: {
        email,
      },
    });
    if (!user)
      return res.send(new NotFound(`User '${email}' could not be found.`));
    let token = await Token.findOne({userId: user.idUser});
    if (token) await token.deleteOne();
    const {randomBytes} = await import("node:crypto");
    const resetToken = randomBytes(256).toString("hex");
    const hash = await bcrypt.hash(
      resetToken,
      parseInt(environment.salt_rounds)
    );
    const data = await Token.create({
      userId: user.idUser,
      token: hash,
    });
    const name = await textTranslate("do not reply", lang, "en");
    let title = await textTranslate("mot de passe oublié", lang, "fr");
    title = "FestivalDesArts : " + title.toLowerCase() + " ?";
    const front_url = getMasterUrl(req.headers["x-app-origin"]);
    const link = `${front_url}/public/resetpassword?id=${data.userId}&random=${resetToken}`;
    let html = await htmlTranslate(
      `<div>
        <span>
          Veuillez suivre ce lien pour créer un nouveau mot de passe :
        </span>
        <span>
          <a href=999999999>Réinitialisation mot de passe
          </a>
        </span>
       <br />
       <br />
        <span>
          Ce lien est utilisable jusqu'à ${format(
            data.createdAt.getTime() + 300e3,
            "HH:mm:ss"
          )}.
        </span>
      </div>`,
      lang,
      "fr"
    );
    html = html.replace("999999999", link).replace(/"/g, "");
    sendBasicEmail(
      //resetToken sent in plain text (i.e. not hashed)
      emailRedirect("user", user.email, req.headers["x-app-origin"]),
      name,
      title,
      html,
      res, //Success response sent by sendBasicEmail function
      `Email with reset instructions is on its way to '${user.email}'.`
    );
  })
);
//process password reset following "forgot password" request
router.patch(
  "/forgotPassword/:id/:resetToken", //No authentication when updating a forgotten password
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const User = getModels(req.db, "User");
    error = User.validate(req.body, "patch").error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const user = await User.model.findByPk(id);
    if (!user) return res.send(new NotFound(`User ${id} could not be found.`));
    const token = await Token.findOne({userId: id});
    if (!token)
      return res.send(new Unauthorized("Invalid or expired reset token."));
    const isValid = await bcrypt.compare(req.params.resetToken, token.token);
    if (!isValid)
      return res.send(
        new Unauthorized("Invalid or expired password reset token.")
      );
    user.pwd = await bcrypt.hash(
      req.body.pwd,
      parseInt(environment.salt_rounds)
    );
    await user.save();
    res.send(
      new Success(
        `Password successfully reset for '${user.email}'.`,
        null,
        true
      )
    );
  })
);
export default router;
