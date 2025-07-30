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
