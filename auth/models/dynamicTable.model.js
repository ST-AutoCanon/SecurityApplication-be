import masterAuthDB from "../../config/masterAuthDB.js";

/* -------------------------------------------------------------------------- */
/*                                TEMPLATES                                   */
/* -------------------------------------------------------------------------- */

export const getTemplates = async () => {
  const result = await masterAuthDB.query(
    `
    SELECT
      id,
      template_key,
      template_name,
      description,
      organisation_type
    FROM auth.table_templates
    WHERE is_active = TRUE
    ORDER BY template_name;
    `,
  );

  return result.rows;
};

export const getTemplateById = async (client, templateId) => {
  const result = await client.query(
    `
    SELECT *
    FROM auth.table_templates
    WHERE id = $1
      AND is_active = TRUE
    LIMIT 1;
    `,
    [templateId],
  );
  console.log('result:', result);

  return result.rows[0];
};

/* -------------------------------------------------------------------------- */
/*                             TEMPLATE FIELDS                                */
/* -------------------------------------------------------------------------- */

export const getTemplateFields = async (client, templateId) => {
  const result = await client.query(
    `
    SELECT

        ft.id,

        ft.field_key,

        ft.field_label,

        ft.placeholder,

        ft.options,

        ft.validation,

        ft.default_value,

        ft.is_required,

        ft.is_system,

        ft.is_default,

        ft.is_visible,

        ft.allow_remove,

        ft.display_order,

        ftype.type_key,

        ftype.display_name,

        ftype.sql_type

    FROM auth.field_templates ft

    INNER JOIN auth.field_types ftype
        ON ftype.id = ft.field_type_id

    WHERE ft.template_id = $1

    ORDER BY ft.display_order;
    `,
    [templateId],
  );

  return result.rows;
};

/* -------------------------------------------------------------------------- */
/*                              ORGANISATION                                  */
/* -------------------------------------------------------------------------- */

export const getOrganisation = async (client, organisationId) => {
  const result = await client.query(
    `
    SELECT
        id,
        org_name,
        org_type,
        schema_name
    FROM auth.organisations
    WHERE id = $1
    LIMIT 1;
    `,
    [organisationId],
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------------- */
/*                           DYNAMIC TABLE METADATA                           */
/* -------------------------------------------------------------------------- */

export const createDynamicTable = async (client, data) => {
  const result = await client.query(
    `
    INSERT INTO auth.dynamic_tables
    (
        organisation_id,
        template_id,
        table_name,
        display_name,
        schema_name,
        created_by
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
    )
    RETURNING *;
    `,
    [
      data.organisationId,
      data.templateId,
      data.tableName,
      data.displayName,
      data.schemaName,
      data.createdBy,
    ],
  );

  return result.rows[0];
};

// export const createDynamicTableFields = async (
//   client,
//   dynamicTableId,
//   fields,
// ) => {
//   for (let index = 0; index < fields.length; index++) {
//     await client.query(
//       `
//       INSERT INTO auth.dynamic_table_fields
//       (
//           dynamic_table_id,
//           field_template_id,
//           display_order,
//           is_required
//       )
//       VALUES
//       (
//           $1,
//           $2,
//           $3,
//           $4
//       );
//       `,
//       [dynamicTableId, fields[index].id, index + 1, fields[index].is_required],
//     );
//   }
// };




///

export const createDynamicTableFields = async (
  client,
  dynamicTableId,
  fields,
) => {
  if (!fields || fields.length === 0) return;

  const values = [];
  const placeholders = [];

  fields.forEach((field, index) => {
    const base = index * 4;

    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`,
    );

    values.push(dynamicTableId, field.id, index + 1, field.is_required);
  });

  const query = `
    INSERT INTO auth.dynamic_table_fields
      (dynamic_table_id, field_template_id, display_order, is_required)
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (dynamic_table_id, field_template_id)
    DO UPDATE SET
      display_order = EXCLUDED.display_order,
      is_required = EXCLUDED.is_required;
  `;

  await client.query(query, values);
};

/* -------------------------------------------------------------------------- */
/*                          DUPLICATE TABLE CHECK                             */
/* -------------------------------------------------------------------------- */

export const getDynamicTableByName = async (
  client,
  organisationId,
  tableName,
) => {
  const result = await client.query(
    `
    SELECT id
    FROM auth.dynamic_tables
    WHERE organisation_id = $1
      AND table_name = $2
    LIMIT 1;
    `,
    [organisationId, tableName],
  );

  return result.rows[0];
};

export const getDynamicTableConfiguration = async (
  client,
  organisationId,
  templateId,
) => {
  const result = await client.query(
    `
    SELECT
        dt.id,
        dt.display_name,
        dt.table_name,
        ft.field_key
    FROM auth.dynamic_tables dt
    INNER JOIN auth.dynamic_table_fields dtf
        ON dt.id = dtf.dynamic_table_id
    INNER JOIN auth.field_templates ft
        ON ft.id = dtf.field_template_id
    WHERE dt.organisation_id = $1
      AND dt.template_id = $2
    ORDER BY dtf.display_order;
    `,
    [organisationId, templateId],
  );

  return result.rows;
};

export const getExistingTableColumns = async (client, schema, table) => {
  const result = await client.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1
      AND table_name = $2;
    `,
    [schema, table],
  );

  return result.rows.map((r) => r.column_name);
};

export const deleteDynamicTableFields = async (
  client,
  dynamicTableId,
  fieldKeys,
) => {
  if (!fieldKeys.length) return;

  await client.query(
    `
    DELETE FROM auth.dynamic_table_fields dtf
    USING auth.field_templates ft
    WHERE dtf.field_template_id = ft.id
      AND dtf.dynamic_table_id = $1
      AND ft.field_key = ANY($2::text[]);
    `,
    [dynamicTableId, fieldKeys],
  );
};
