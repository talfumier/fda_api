import Joi from "joi";
import translate from "translate";
import langdetect from "langdetect";
import {parseDocument} from "htmlparser2";
import serialize from "dom-serializer";
import {environment} from "../../config/environment.js";
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
        `✅ table ${tbl.table_name} in mariaDB ${dbName} update operation successful !`
      );
    } catch (error) {
      console.log(
        `❌ table ${tbl.table_name} in mariaDB ${dbName} update operation failed : ${error} !`
      );
    }
  }
}
