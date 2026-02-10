import Joi from "joi";
import translate from "translate";
import langdetect from "langdetect";
import {parseDocument} from "htmlparser2";
import serialize from "dom-serializer";
import {Unauthorized} from "./mariadb/models/validation/errors.js";
import config from "./config/config.json" with {type: "json"};
import {environment} from "./config/environment.js";
import modelRoles from "./routes/entities/modelRoles.json" with {type: "json"};

export function processSqlQueryData(dataArr, pwd = true) {
  dataArr.map((data, idx) => {
    if (idx !== dataArr.length - 1)
      return Object.keys(data).map((key) => {
        try {
          if (pwd) data[key].pwd = undefined;
        } catch (error) {}
      });
  });
  dataArr = dataArr
    .map((data) => {
      return Object.values(data);
    })
    .slice(0, -1);
  return dataArr;
}
export function emailRedirect(cs, email, x_app_origin, role = null) {
  switch (cs) {
    case "user":
      //organisation users must have a valid email address
      //during test, when a mail is to be sent to a user not part of the organisation (it may be a fake email address),
      //it needs to be redirected to the connected organisation user running the tests or
      //if the route doesn't require authentication to the generic fda gmail address
      if (role && role >= 5) return email; //role is available when organisation user is actually authenticated
      if (
        email.toLowerCase().includes("merville31.fr") ||
        email.toLowerCase().includes("bonnet")
      )
        return email;
      switch (x_app_origin) {
        case "dev":
          return config.email_admin;
        case "test":
          return config.email_org.test;
        default: //i.e production
          return email;
      }
      break;
    case "org":
      if (role >= 6) return config.email_admin;
      switch (x_app_origin) {
        case "dev":
          return config.email_admin;
        case "test":
          return config.email_org.test;
        case "prod":
          return config.email_org.prod;
      }
  }
}
export function userIsAdmin(req) {
  if (req.user.idRole !== 6)
    return [
      false,
      new Unauthorized("Access denied. User must have 'admin' privileges !"),
    ];
  return [true, null];
}
export function userIsOrg(req, modelName) {
  if (req.user.idRole >= 5) return [true, null];
  return [
    false,
    new Unauthorized(
      `Access to data model ${modelName} denied >>> your account must have 'organisation' or 'admin' privileges !`,
    ),
  ];
}
export function userIsAuthorized(userIdRole, modelName) {
  if (modelRoles[modelName].idRole.indexOf(userIdRole) !== -1)
    return [true, null];
  return [
    false,
    new Unauthorized(
      `Access to data model ${modelName} denied >>> your account does not hold required privileges !`,
    ),
  ];
}
export function userIsOwner(req, email, modelName) {
  if (email !== req.user.email)
    return [
      false,
      new Unauthorized(
        `Access to data model ${modelName} denied >>> account 'owner' privileges required  !`,
      ),
    ];
  return [true, null];
}
export const JoiObjectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();
export function validateObjectId(id) {
  //ObjectId validation
  return JoiObjectIdSchema.validate(id);
}
export const JoiIntegerIdSchema = Joi.number().integer().min(0).required(); //integer >=0 required
export function validateIntegerId(id) {
  return JoiIntegerIdSchema.validate(id);
}
export async function textTranslate(text, to, from = null) {
  try {
    if (!text || from === to) return text;
    translate.engine = "google";
    translate.key = environment.google_api_key;
    const translated = await translate(text, {
      from: from ? from : langdetect.detect(text)[0].lang,
      to,
    });
    return translated;
  } catch (error) {
    console.log("String translation error: ", error);
    return text;
  }
}
export async function htmlTranslate(html, to, from = null) {
  try {
    if (!html || from === to) return html;
    const document = parseDocument(html);
    // Recursively walk and translate text nodes
    let original = null;
    async function translateNode(node) {
      if (node.type === "text") {
        original = node.data.trim();
        if (original) node.data = await textTranslate(original, to, from);
      } else if (node.children && node.children.length) {
        for (let child of node.children) {
          await translateNode(child);
        }
      }
    }
    for (let child of document.children) {
      await translateNode(child);
    }
    return serialize(document);
  } catch (error) {
    console.error("HTML translation error:", error);
    return html;
  }
}
export function bodyCleanUp(body) {
  const keys = Object.keys(body);
  keys.map((key) => {
    switch (key) {
      case "lastName":
      case "firstName":
      case "email":
        body[key] = body[key].toString().trim();
        break;
      default:
    }
  });
  return body;
}
export async function setTimestampFields(conn, dbName) {
  let sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_type = 'BASE TABLE';`;
  const [tbls] = await conn.query(sql);
  let tbl = null;

  for (tbl of tbls) {
    sql = `
      ALTER TABLE \`${tbl.table_name}\`
      ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
    const tableName = tbl.table_name;
    try {
      await conn.query(sql);
      console.log(
        `✅ table ${tbl.table_name} in mariaDB ${dbName} update operation successful !`,
      );
    } catch (error) {
      console.log(
        `❌ table ${tbl.table_name} in mariaDB ${dbName} update operation failed : ${error} !`,
      );
    }
  }
}
