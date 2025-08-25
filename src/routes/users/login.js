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
    const {User,StatusTracking,UserConn} = getModels(req.db);
    let user = await User.model.findOne({
      where: {email: req.body.email},
    }); 
    const status=await StatusTracking.model.findAll({
      where: {idUser: user.idUser},
      order: [['createdAt', 'DESC']]
    })
    if (user && status.length>=1) {
      if (status[0].idStatus!==2)  //idStatus=2 >>> active account
        return res.send(
          new Unauthorized(status[0].idStatus==1?"Your account is still pending validation.":"Your account has been deactivated.")
        );        
      const pwd_valid = await bcrypt.compare(req.body.pwd, user.pwd);
      if (pwd_valid) {
        const expires_in=config.token_expires_in[req.headers['x-app-origin']==='dev'?'dev':'prod']
        const token = jwt.sign(
          {
            idUser: user.idUser,
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            idRole: user.idRole,
            idStatus:status[0].idStatus,
            lang:user.lang
          },
          environment.sha256, //signing algorithm secret key kept in an environment variable, Secure Hash Algorithm
          {
            expiresIn: expires_in,
          }
        );   
        await UserConn.model.create({idUser:user.idUser,maxOut:addHours(new Date(),expires_in.replace("h",""))});
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
