export const createSchema = async (db, schemaName) => {
  const safeName = schemaName.replace(/[^a-zA-Z0-9_]/g, "");

  await db.query(`
    CREATE SCHEMA IF NOT EXISTS ${safeName}
  `);
};
