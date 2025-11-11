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
    mongo_db_connection:'${process.env.NATIONSOUND_MONGO_DB_CONNECTION}',
    front_url_test:'${process.env.FRONT_URL_TEST}',
    front_url_prod:'${process.env.FRONT_URL_PROD}',
    sha256:'${process.env.API_SHA256}',
    salt_rounds:'${process.env.API_SALT}',
    mail_jet_api_key:'${process.env.MAILJET_API_KEY}',
    mail_jet_api_secret:'${process.env.MAILJET_API_SECRET}',
    mail_jet_sender:'${process.env.MAILJET_API_SENDER}',
    google_api_key:'${process.env.GOOGLE_API_KEY}',
    cloudinary_folder:'${process.env.CLOUDINARY_FOLDER}',
    cloudinary_name: '${process.env.CLOUDINARY_NAME}',
    cloudinary_api_key: '${process.env.CLOUDINARY_APIKEY}',
    cloudinary_api_secret: '${process.env.CLOUDINARY_APISECRET}',    
    api_port:'${process.env.API_PORT}',
    production: true,
  };`;
  writeFile(targetPath, configFile, (err) => {
    if (err) console.error(err);
    else
      console.log(
        `API environment.js file generated correctly at ${targetPath} \n`
      );
  });
};

setEnv();
