import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {addHours} from "date-fns";
import {routeHandler} from "../../middleware/routeHandler.js";
import {getModels} from "./../../mariadb/models/sqlModels.js";
import {NotFound, Unauthorized} from "../../mariadb/models/validation/errors.js";
import { Success } from "../../mariadb/models/validation/success.js";
import config from "../../config/config.json" with {type: "json"};
import {environment} from "../../config/environment.js"

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    const {User,UserConn} = getModels(req.db);
    let user = await User.model.findOne({
      where: {email: req.body.email},
    }); 
    if (user) {
      if (user.idStatus!==2)  //idStatus=2 >>> active account
        return res.send(
          new Unauthorized(user.idStatus===1?"Your account is still pending validation.":"Your account has been deactivated.")
        );        
      const pwd_valid = await bcrypt.compare(req.body.pwd, user.pwd);
      if (pwd_valid) {
        const token = jwt.sign(
          {
            idUser: user.idUser,
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            idRole: user.idRole,
            idStatus:user.idStatus,
            lang:user.lang
          },
          environment.sha256, //signing algorithm secret key kept in an environment variable, Secure Hash Algorithm
          {
            expiresIn: config.token_expires_in[req.headers["x-app-origin"]==='dev'?`'dev`:'prod'],
          }
        );   
        await UserConn.model.create({idUser:user.idUser,maxOut:addHours(new Date(),config.token_expires_in.replace("h",""))});
        user.pwd = undefined;
        return res
          .header("x-auth-token", token)
          .header("access-control-expose-headers", ["x-auth-token"])
          .send(new Success(`
            User '${user.email}' has been successfully logged-in.`,
            user, true)
          )
      }
      return res.send(new Unauthorized('Wrong password.'))
    }
    return res.send(new NotFound(`User '${req.body.email}' not found.`));
  })
);
export default router;
