import express from "express";
import {QueryTypes} from "sequelize";
import {routeHandler} from "../../middleware/routeHandler.js";
import {Success} from "../../mariadb/models/validation/success.js";

const router = express.Router();

router.get(
  "/:stored_proc",
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
export default router;
