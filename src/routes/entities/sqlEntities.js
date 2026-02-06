import express from "express";
import {QueryTypes} from "sequelize";
import {authHandler} from "../../middleware/authHandler.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {Success} from "../../mariadb/models/validation/success.js";
import {processSqlQueryData} from "./../../utilityFunctions.js";

const router = express.Router();

router.get(
  "/member/noparams/:stored_proc",
  authHandler, //user must be authenticated except for public routes refer to authHandler.js
  routeHandler(async (req, res) => {
    const {stored_proc} = req.params;
    let dataArr = await req.db.query(`CALL ${stored_proc}()`, {
      type: QueryTypes.SELECT,
    });
    dataArr = processSqlQueryData(dataArr);
    res.send(new Success("Data retrieval successful", dataArr)); //filter out meta data from SQL
  }),
);
router.get(
  "/member/:stored_proc/:params/:values",
  authHandler, //user must be authenticated
  routeHandler(async (req, res) => {
    const {stored_proc, params, values} = req.params;
    const sqlParams = {};
    if (params) {
      const keys = params.replaceAll(":", "").split(",");
      values.split(",").map((val, idx) => {
        sqlParams[keys[idx]] = val;
      });
    }
    let dataArr = await req.db.query(
      `CALL ${stored_proc}(${params ? params : ""})`,
      {
        type: QueryTypes.SELECT,
        replacements: sqlParams ? sqlParams : null,
      },
    );
    dataArr = processSqlQueryData(dataArr);
    res.send(new Success("Data retrieval successful", dataArr)); //filter out meta data from SQL
  }),
);
router.get(
  "/public/noparams/:stored_proc",
  routeHandler(async (req, res) => {
    const {stored_proc} = req.params;
    let dataArr = await req.db.query(`CALL ${stored_proc}()`, {
      type: QueryTypes.SELECT,
    });
    dataArr = processSqlQueryData(dataArr);
    res.send(new Success("Data retrieval successful", dataArr)); //filter out meta data from SQL
  }),
);
router.get(
  "/public/:stored_proc/:params/:values",
  routeHandler(async (req, res) => {
    const {stored_proc, params, values} = req.params;
    const sqlParams = {};
    if (params) {
      const keys = params.replaceAll(":", "").split(",");
      values.split(",").map((val, idx) => {
        sqlParams[keys[idx]] = val;
      });
    }
    try {
      let dataArr = await req.db.query(
        `CALL ${stored_proc}(${params ? params : ""})`,
        {
          type: QueryTypes.SELECT,
          replacements: sqlParams ? sqlParams : null,
        },
      );
      dataArr = processSqlQueryData(dataArr);
      res.send(new Success("Data retrieval successful", dataArr)); //filter out meta data from SQL
    } catch (error) {
      console.log(new Date(), error, stored_proc, params, sqlParams); //troubleshooting error raised in pm2 log
    }
  }),
);
export default router;
