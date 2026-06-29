export const createTemplateTables = async (db, schemaName, template) => {
  for (const table of template.tables) {
    const columns = table.columns
      .map((col) => `"${col.name}" ${col.type}`)
      .join(",\n");

    await db.query(`
      CREATE TABLE IF NOT EXISTS "${schemaName}"."${table.name}" (
        ${columns}
      );
    `);
  }
};
