import {DataTypes} from "sequelize";
import express from "express";
import {createSshConnection} from "./mariadb/dbConnections.js";
import {createLocalConnection} from "./mariadb/dbConnections.js";
import {defineSqlModels} from "./mariadb/models/sqlModels.js";
import {routes} from "./routes/routes.js";
import {environment} from "./config/environment.js";

/*DEALING MITH MARIADB*/
let n = 0;
const dbConnections = environment.production
  ? [
      await createLocalConnection(environment.sql_test_db_name),
      await createLocalConnection(environment.sql_prod_db_name),
    ]
  : [await createSshConnection(environment.sql_test_db_name)];
n = dbConnections.length;
if (n >= 1)
  dbConnections.map(async (conn) => {
    defineSqlModels(conn, DataTypes);
  });
/*DEALING WITH EXPRESS*/
const app = express();

app.locals.db = {
  test: dbConnections[0],
  ...(n > 1 ? {prod: dbConnections[1]} : {}),
}; //store db connections in app.locals

routes(app); //request pipeline including error handling

const port = parseInt(environment.api_port);
app.listen(port, () => {
  return console.log(
    `[API]: ${
      environment.production ? "production" : "development"
    } server is listening on port ${port} 🚀`
  );
});
