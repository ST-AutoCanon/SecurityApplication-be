export const getAssignGates = async (client, schemaName) => {
  const result = await client.query(
    `
      SELECT
        id,
        name,
        status,
        created_at,
        updated_at
      FROM "${schemaName}".assign_gates
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
};

export const getAssignGateById = async (client, schemaName, id) => {
  const result = await client.query(
    `
      SELECT
        id,
        name,
        status,
        created_at,
        updated_at
      FROM "${schemaName}".assign_gates
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] || null;
};

// CREATE
// status will automatically be TRUE because of DB DEFAULT TRUE
export const createAssignGate = async (client, schemaName, name) => {
  const result = await client.query(
    `
      INSERT INTO "${schemaName}".assign_gates
      (
        name,
        created_at
      )
      VALUES
      (
        $1,
        NOW()
      )
      RETURNING
        id,
        name,
        status,
        created_at,
        updated_at
    `,
    [name],
  );

  return result.rows[0];
};

// UPDATE NAME
// Status is not changed here
export const updateAssignGate = async (client, schemaName, id, name) => {
  const result = await client.query(
    `
      UPDATE "${schemaName}".assign_gates
      SET
        name = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        name,
        status,
        created_at,
        updated_at
    `,
    [name, id],
  );

  return result.rows[0] || null;
};

// DEACTIVATE
export const deactivateAssignGate = async (client, schemaName, id) => {
  const result = await client.query(
    `
      UPDATE "${schemaName}".assign_gates
      SET
        status = false,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        status,
        created_at,
        updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

// ACTIVATE
export const activateAssignGate = async (client, schemaName, id) => {
  const result = await client.query(
    `
      UPDATE "${schemaName}".assign_gates
      SET
        status = true,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        status,
        created_at,
        updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const deleteAssignGate = async (client, schemaName, id) => {
  const result = await client.query(
    `
      DELETE FROM "${schemaName}".assign_gates
      WHERE id = $1
      RETURNING
        id,
        name,
        status,
        created_at,
        updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};