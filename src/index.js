import express from "express";
import {routes} from "./routes/routes.js";

/*DEALING WITH EXPRESS*/
const app = express();
routes(app); //request pipeline including error handling

const port = 3000;
app.listen(port, () => {
  return console.log(`[API]: server is listening on port ${port} 🚀`);
});
