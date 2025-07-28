import {createTunnel} from "tunnel-ssh";
import {Sequelize} from "sequelize";
import {environment} from "../config/environment.js";

const tunnel_config = environment.tunnel_config;

//creates a SSH tunnel between local PC on which the API is running and the remote OVH server (127.0.0.1:3307 >>> 127.0.0.1:3306)
//used during development for connection with mariaDB fda_test on OVH server from the API on local PC
async function createSSHTunnel() {
  const ssh_config = environment.ssh_config;
  const tunnelOptions = {
    autoClose: true,
  };
  const serverOptions = {
    port: tunnel_config.source_port,
  };
  const sshOptions = {
    host: ssh_config.remote_host,
    port: ssh_config.remote_port,
    username: ssh_config.remote_user,
    privateKey: ssh_config.privateKey,
  };
  const forwardOptions = {
    srcAddr: tunnel_config.source_host,
    srcPort: tunnel_config.source_port,
    dstAddr: tunnel_config.dest_host,
    dstPort: tunnel_config.dest_port,
  };
  try {
    await createTunnel(
      tunnelOptions,
      serverOptions,
      sshOptions,
      forwardOptions
    );
    console.log(
      `✅ SSH tunnel successfully created on ${tunnel_config.source_host}:${tunnel_config.source_port} !`
    );
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.log(
        `✅ Reusing existing SSH tunnel on ${tunnel_config.source_host}:${tunnel_config.source_port} !`
      );
    } else {
      throw error;
    }
  }
}
//Connection to mariaDB fda_test using the above SSH tunnel
//used during development for connection with mariaDB fda_test on OVH server from the API on local PC
export async function createSshConnection() {
  await createSSHTunnel();
  const conn = new Sequelize(
    environment.sql_test_db_name,
    environment.sql_db_user,
    environment.sql_db_userPwd,
    {
      host: tunnel_config.source_host,
      port: tunnel_config.source_port,
      dialect: "mysql",
      logging: false,
    }
  );
  try {
    await conn.authenticate();
    console.log(
      `✅ mariaDB ${environment.sql_test_db_name} connection successful via SSH tunnel !`
    );
    return conn;
  } catch (err) {
    console.log(
      `❌ SSH connection to mariaDB ${environment.sql_test_db_name} failed: ${err} !`
    );
  }
}
//Local connection from the API running on the OVH server
//to the mariaDB fda_test database or fda_prod database
export async function createLocalConnection(dbName) {
  return new Promise(async (resolve, reject) => {
    const conn = new Sequelize(
      dbName,
      environment.sql_db_user,
      environment.sql_db_userPwd,
      {
        host: "127.0.0.1",
        port: 3306,
        dialect: "mysql",
        logging: false,
      }
    );
    let flg = 0;
    try {
      await conn.authenticate();
      console.log(
        `✅ Local connection to mariaDB ${dbName} on OVH server successful !`
      );
      flg += 1;
      await conn.sync({alter: true}); //tables and models syncing, alter=true means update tables where actual model definition has changed
      resolve(conn);
    } catch (err) {
      switch (flg) {
        case 0:
          reject(
            `❌ Local connection to mariaDB ${dbName} on OVH server failed: ${err} !`
          );
          break;
        case 1:
          reject(`❌ mariaDB ${dbName} sync operation failed: ${err} !`);
      }
    }
  });
}
