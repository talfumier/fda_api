import express from "express";
import {DataTypes} from "sequelize";
import {routeHandler} from "../middleware/routeHandler.js";
import {deleteConnection} from "../mariadb/models/sqlModels.js";
import {createSshConnection} from "../mariadb/dbConnections.js";
import {defineSqlModels} from "../mariadb/models/sqlModels.js";
import {sendResponse} from "../mariadb/models/validation/sendResponse.js";

const router = express.Router();

router.get(
  "/health",
  routeHandler((req, res) => {
    console.log(navigator.language);
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
export default router;
