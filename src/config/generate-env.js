import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const setEnv = () => {
  const writeFile = fs.writeFile;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const targetPath = path.join(__dirname, "/environment.js");

  const configFile = `export const environment = {
    sql_test_db_name: '${process.env.DB_NAME_TEST}',
    sql_prod_db_name: '${process.env.DB_NAME_PROD}',
    sql_db_user: '${process.env.DB_USER}',
    sql_db_userPwd: '${process.env.DB_USER_PWD}',

    // user: '${process.env.NATIONSOUND_DB_USER}',
    // userPwd: '${process.env.NATIONSOUND_DB_USERPWD}',
    // sql_db_name: '${process.env.NATIONSOUND_DB_NAME}',
    // sql_db_host:'${process.env.NATIONSOUND_SQL_DB_HOST}',
    // sql_db_port:'${process.env.NATIONSOUND_SQL_DB_PORT}',
    // mongo_db_connection:'${process.env.NATIONSOUND_MONGO_DB_CONNECTION}',
    sha256:'${process.env.API_SHA256}',
    salt_rounds:'${Number(process.env.API_SALT)}',
    mail_jet_api_key:'${process.env.MAILJET_API_KEY}',
    mail_jet_api_secret:'${process.env.MAILJET_API_SECRET}',
    mail_jet_sender:'${process.env.MAILJET_API_SENDER}',
    google_api_key:'${process.env.GOOGLE_API_KEY}',
    // cloudinary_name: '${process.env.NATIONSOUND_CLOUDINARY_NAME}',
    // cloudinary_api_key: '${process.env.NATIONSOUND_CLOUDINARY_APIKEY}',
    // cloudinary_api_secret: '${process.env.NATIONSOUND_CLOUDINARY_APISECRET}',
    // front_source_url:'${process.env.NATIONSOUND_FRONT_SOURCE_URL}',
    // bo_source_url:'${process.env.NATIONSOUND_BACK_OFFICE_URL}',
    // google_private_key:'${process.env.NATIONSOUND_GOOGLE_PRIVATE_KEY}',
    // google_client_email:'${process.env.NATIONSOUND_GOOGLE_CLIENT_EMAIL}',
    // google_backup_folder_id:'${
      process.env.NATIONSOUND_GOOGLE_BACKUP_FOLDER_ID
    }',
    
    api_port:'${process.env.API_PORT}',
    production: true,
  };`;
  writeFile(targetPath, configFile, (err) => {
    if (err) console.error(err);
    else
      console.log(
        `Node.js environment.js file generated correctly at ${targetPath} \n`
      );
  });
};

setEnv();
