import express from "express";
import {QueryTypes} from "sequelize";
import {authHandler} from "../../middleware/authHandler.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {Success} from "../../mariadb/models/validation/success.js";

const router = express.Router();

router.get(
  "/noparams/:stored_proc",
  authHandler, //user must be authenticated except for public routes refer to authHandler.js
  routeHandler(async (req, res) => {
    const {stored_proc} = req.params;
    let dataArr = await req.db.query(`CALL ${stored_proc}()`, {
      type: QueryTypes.SELECT,
    });
    dataArr.map((data, idx) => {
      if (idx !== dataArr.length - 1)
        return Object.keys(data).map((key) => {
          try {
            data[key].pwd = undefined;
          } catch (error) {}
        });
    });
    dataArr = dataArr.map((data) => {
      return Object.values(data);
    });
    res.send(new Success("Data retrieval successful", dataArr.slice(0, -1))); //filter out meta data from SQL
  })
);
router.get(
  "/:stored_proc/:params/:values",
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
      }
    );
    dataArr.map((data, idx) => {
      if (idx !== dataArr.length - 1)
        return Object.keys(data).map((key) => {
          try {
            data[key].pwd = undefined;
          } catch (error) {}
        });
    });
    dataArr = dataArr.map((data) => {
      return Object.values(data);
    });
    res.send(new Success("Data retrieval successful", dataArr.slice(0, -1))); //filter out meta data from SQL
  })
);
router.get(
  "/public/noparams/:stored_proc",
  authHandler, //user must be authenticated
  routeHandler(async (req, res) => {
    const {stored_proc} = req.params;
    let dataArr = await req.db.query(`CALL ${stored_proc}()`, {
      type: QueryTypes.SELECT,
    });
    dataArr.map((data, idx) => {
      if (idx !== dataArr.length - 1)
        return Object.keys(data).map((key) => {
          try {
            data[key].pwd = undefined;
          } catch (error) {}
        });
    });
    dataArr = dataArr.map((data) => {
      return Object.values(data);
    });
    res.send(new Success("Data retrieval successful", dataArr.slice(0, -1))); //filter out meta data from SQL
  })
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
    let dataArr = await req.db.query(
      `CALL ${stored_proc}(${params ? params : ""})`,
      {
        type: QueryTypes.SELECT,
        replacements: sqlParams ? sqlParams : null,
      }
    );
    dataArr.map((data, idx) => {
      if (idx !== dataArr.length - 1)
        return Object.keys(data).map((key) => {
          try {
            data[key].pwd = undefined;
          } catch (error) {}
        });
    });
    dataArr = dataArr.map((data) => {
      return Object.values(data);
    });
    res.send(new Success("Data retrieval successful", dataArr.slice(0, -1))); //filter out meta data from SQL
  })
);
export default router;
