import {DataTypes} from "sequelize";
import express from "express";
import cors from "cors";
import {createSshConnection} from "./mariadb/dbConnections.js";
import {createLocalConnection} from "./mariadb/dbConnections.js";
import {defineSqlModels} from "./mariadb/models/defineSqlModels.js";
import {routes} from "./routes/routes.js";
import {environment} from "./config/environment.js";
import {selectDb} from "./middleware/selectDb.js";

/*DEALING MITH MARIADB*/
const dbConnections = environment.production
  ? [
      await createLocalConnection(environment.sql_test_db_name),
      await createLocalConnection(environment.sql_prod_db_name),
    ]
  : [await createSshConnection()];

if (Object.keys(dbConnections).length >= 1)
  dbConnections.map((conn) => {
    defineSqlModels(conn, DataTypes);
  });

/*DEALING WITH EXPRESS*/
const app = express();

app.use(
  cors({
    origin: ["127.0.0.1", "http://your-external-app.com"],
    allowedHeaders: ["Content-Type", "X-App-Origin"],
  })
);

app.locals.db = dbConnections; //store db connections in app.locals

app.use(selectDb); // Middleware to select test or prod database per request

app.use(express.json()); //Body parser express built-in middleware

routes(app); //request pipeline including error handling

const port = 3000;
app.listen(port, () => {
  return console.log(
    `[API]: ${
      environment.production ? "production" : "development"
    } server is listening on port ${port} 🚀`
  );
});
