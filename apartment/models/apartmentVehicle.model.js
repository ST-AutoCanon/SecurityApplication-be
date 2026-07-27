/**
 * =====================================
 * APARTMENT VEHICLE MODEL
 * =====================================
 */

/**
 * Create Vehicle
 */
export const createApartmentVehicle = async (client, schemaName, vehicle) => {
  const result = await client.query(
    `
    INSERT INTO "${schemaName}".apartment_member_vehicle
    (
      member_id,
      vehicle_type,
      vehicle_number,
      vehicle_brand,
      parking_slot
    )
    VALUES
    (
      $1,$2,$3,$4,$5
    )
    RETURNING *;
    `,
    [
      vehicle.member_id,
      vehicle.vehicle_type,
      vehicle.vehicle_number,
      vehicle.vehicle_brand,
      vehicle.parking_slot,
    ],
  );

  return result.rows[0];
};

/**
 * Get Vehicles Of Member
 */
export const getApartmentVehicles = async (client, schemaName, memberId) => {
  const result = await client.query(
    `
    SELECT *
    FROM "${schemaName}".apartment_member_vehicle
    WHERE member_id = $1
    ORDER BY created_at DESC;
    `,
    [memberId],
  );

  return result.rows;
};

/**
 * Get Vehicle By Id
 */
export const getApartmentVehicleById = async (
  client,
  schemaName,
  vehicleId,
) => {
  const result = await client.query(
    `
    SELECT *
    FROM "${schemaName}".apartment_member_vehicle
    WHERE id = $1
    LIMIT 1;
    `,
    [vehicleId],
  );

  return result.rows[0];
};

/**
 * Update Vehicle
 */
export const updateApartmentVehicle = async (
  client,
  schemaName,
  vehicleId,
  vehicle,
) => {
  const result = await client.query(
    `
    UPDATE "${schemaName}".apartment_member_vehicle
    SET
      vehicle_type = $1,
      vehicle_number = $2,
      vehicle_brand = $3,
      parking_slot = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *;
    `,
    [
      vehicle.vehicle_type,
      vehicle.vehicle_number,
      vehicle.vehicle_brand,
      vehicle.parking_slot,
      vehicleId,
    ],
  );

  return result.rows[0];
};

/**
 * Delete Vehicle
 */
export const deleteApartmentVehicle = async (client, schemaName, vehicleId) => {
  const result = await client.query(
    `
    DELETE FROM "${schemaName}".apartment_member_vehicle
    WHERE id = $1
    RETURNING id;
    `,
    [vehicleId],
  );

  return result.rows[0];
};

/**
 * Check Duplicate Vehicle Number
 */
export const checkVehicleNumberExists = async (
  client,
  schemaName,
  vehicleNumber,
  excludeId = null,
) => {
  let query;
  let values;

  if (excludeId) {
    query = `
      SELECT id
      FROM "${schemaName}".apartment_member_vehicle
      WHERE vehicle_number = $1
      AND id <> $2
      LIMIT 1;
    `;

    values = [vehicleNumber, excludeId];
  } else {
    query = `
      SELECT id
      FROM "${schemaName}".apartment_member_vehicle
      WHERE vehicle_number = $1
      LIMIT 1;
    `;

    values = [vehicleNumber];
  }

  const result = await client.query(query, values);

  return result.rows[0];
};

/**
 * Vehicle Count Of Member
 */
export const getApartmentVehicleCount = async (
  client,
  schemaName,
  memberId,
) => {
  const result = await client.query(
    `
    SELECT COUNT(*)::INTEGER AS total
    FROM "${schemaName}".apartment_member_vehicle
    WHERE member_id = $1;
    `,
    [memberId],
  );

  return result.rows[0];
};

/**
 * Vehicles By Type
 */
export const getVehiclesByType = async (
  client,
  schemaName,
  memberId,
  vehicleType,
) => {
  const result = await client.query(
    `
    SELECT *
    FROM "${schemaName}".apartment_member_vehicle
    WHERE member_id = $1
    AND vehicle_type = $2
    ORDER BY created_at DESC;
    `,
    [memberId, vehicleType],
  );

  return result.rows;
};
