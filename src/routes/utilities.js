import express from "express";
import {DataTypes} from "sequelize";
import _ from "lodash";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {deleteConnection} from "../mariadb/models/sqlModels.js";
import {createSshConnection} from "../mariadb/dbConnections.js";
import {defineSqlModels} from "../mariadb/models/sqlModels.js";
import {sendResponse} from "../mariadb/models/validation/sendResponse.js";
import {getModels} from "../mariadb/models/sqlModels.js";
import {Success} from "../mariadb/models/validation/success.js";

const router = express.Router();

router.get(
  "/health",
  routeHandler((req, res) => {
    sendResponse(
      res,
      `Health check successful >>> active database : ${req.db.config.database} !`
    );
  })
);
router.get(
  "/sync/:dbName", //dbName=fda_test or db=fda_prod >>> database to sync
  routeHandler(async (req, res) => {
    try {
      const dbName = req.params.dbName;
      if (dbName === req.db.config.database) {
        await req.db.close();
        deleteConnection(req.db); //delete connection associated data in modelCache weakMap
      }
      const conn = await createSshConnection(dbName, true);
      defineSqlModels(conn, DataTypes, true);
      await conn.sync({alter: true}); //tables and models syncing, alter=true means update tables where actual model definition has changed
      req.db = conn;
      sendResponse(res, `✅ mariaDB ${dbName} sync operation successful !`);
    } catch (error) {
      sendResponse(res, `❌ mariaDB ${dbName} sync operation failed : error !`);
    }
  })
);
router.get(
  "/fields/:modelName", //modelName must be capitalized such as User, UserConn ...
  authHandler, //user must be authenticated
  routeHandler(async (req, res) => {
    const {modelName} = req.params;
    const {model} = getModels(req.db, modelName);
    const fields = _.filter(
      Object.keys(model.getAttributes()),
      (field, idx) => {
        return idx !== 0 && field !== "createdAt" && field !== "updatedAt";
      }
    );
    res.send(new Success("Data retrieval successful", fields));
  })
);
export default router;
