const normalizeSqlType = (type) => {
  if (!type) throw new Error("SQL type missing");

  const t = type.toUpperCase().trim();

  // VARCHAR(n)
  if (/^VARCHAR\(\d+\)$/.test(t)) {
    return t;
  }

    if (/^VECTOR\(\d+\)$/.test(t)) {
      return t;
    }

  // CHARACTER VARYING(n)
  if (/^CHARACTER VARYING\(\d+\)$/.test(t)) {
    return t.replace("CHARACTER VARYING", "VARCHAR");
  }

  // NUMERIC(p,s)
  if (/^NUMERIC\(\d+,\d+\)$/.test(t)) {
    return t;
  }

  // DECIMAL(p,s)
  if (/^DECIMAL\(\d+,\d+\)$/.test(t)) {
    return t.replace("DECIMAL", "NUMERIC");
  }

  switch (t) {
    case "DATE":
      return "DATE";

    case "TIMESTAMP":
      return "TIMESTAMP";

    case "TEXT":
      return "TEXT";

    case "VARCHAR":
    case "CHARACTER VARYING":
      return "VARCHAR";

    case "BOOLEAN":
      return "BOOLEAN";

    case "INTEGER":
    case "INT":
      return "INTEGER";

    case "BIGINT":
      return "BIGINT";

    case "NUMERIC":
    case "DECIMAL":
      return "NUMERIC";

    case "DOUBLE":
    case "DOUBLE PRECISION":
      return "DOUBLE PRECISION";

    case "DOUBLE PRECISION[]":
      return "DOUBLE PRECISION[]";

    case "VECTOR":
        return "VECTOR(512)";

    case "JSON":
    case "JSONB":
      return "JSONB";

    case "UUID":
      return "UUID";

    case "ARRAY":
      return "TEXT[]";

    default:
      throw new Error(`Invalid SQL type: ${type}`);
  }
};

const formatDefaultValue = (value, sqlType) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const val = String(value);
  const type = sqlType.toUpperCase();

  // PostgreSQL functions
  if (
    val.toUpperCase() === "NOW()" ||
    val.toUpperCase() === "CURRENT_TIMESTAMP"
  ) {
    return ` DEFAULT ${val}`;
  }

  // Boolean
  if (type === "BOOLEAN") {
    return ` DEFAULT ${val.toLowerCase() === "true"}`;
  }

  // Numbers
  if (
    type.includes("INT") ||
    type.includes("BIGINT") ||
    type.includes("NUMERIC") ||
    type.includes("DOUBLE")
  ) {
    return ` DEFAULT ${val}`;
  }

  // Everything else (TEXT, DATE, UUID, etc.)
  return ` DEFAULT '${val.replace(/'/g, "''")}'`;
};

// export const buildCreateTableQuery = ({ schemaName, tableName, fields }) => {
//   const columns = [];

//   // Primary Key
//   columns.push(`id BIGSERIAL PRIMARY KEY`);

//   for (const field of fields) {
//     let column = `"${field.field_key}" ${field.sql_type}`;

//     if (field.is_required) {
//       column += " NOT NULL";
//     }

//     if (field.default_value) {
//       column += formatDefaultValue(field.default_value, field.sql_type);
//     }

//     columns.push(column);
//   }

//   const sql = `
//     CREATE TABLE "${schemaName}"."${tableName}" (

//       ${columns.join(",\n      ")}

//     );
//   `;

//   return sql;
// };

export const buildCreateTableQuery = ({ schemaName, tableName, fields }) => {
  const columns = [];

  // Primary Key
  columns.push(`id BIGSERIAL PRIMARY KEY`);

  for (const field of fields) {
    const safeType = normalizeSqlType(field.sql_type);

    let column = `"${field.field_key}" ${safeType}`;

    if (field.is_required) {
      column += " NOT NULL";
    }

    if (field.default_value !== undefined && field.default_value !== null) {
      const defaultClause = formatDefaultValue(field.default_value, safeType);

      column += defaultClause;
    }

    columns.push(column);
  }

  return `
    CREATE TABLE "${schemaName}"."${tableName}" (
      ${columns.join(",\n      ")}
    );
  `;
};
