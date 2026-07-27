/**
 * =====================================
 * APARTMENT FAMILY MEMBER MODEL
 * =====================================
 */

/**
 * Validate Organisation Schema
 */
const validateSchema = (schemaName) => {
  if (!schemaName) {
    throw new Error("Organisation schema not found");
  }

  return schemaName;
};

/**
 * Create Family Member
 */
export const createApartmentFamilyMember = async (
  client,
  schemaName,
  family,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    INSERT INTO "${schemaName}".apartment_member_family
    (
      member_id,
      name,
      relationship,
      age,
      mobile_number
    )

    VALUES
    (
      $1,$2,$3,$4,$5
    )

    RETURNING *;
    `,
    [
      family.member_id,

      family.name,

      family.relationship,

      family.age,

      family.mobile_number,
    ],
  );

  return result.rows[0];
};

/**
 * Get All Family Members
 */
export const getApartmentFamilyMembers = async (
  client,
  schemaName,
  memberId,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    SELECT *

    FROM "${schemaName}".apartment_member_family

    WHERE member_id=$1

    ORDER BY id ASC;
    `,
    [memberId],
  );

  return result.rows;
};

/**
 * Get Family Member By Id
 */
export const getApartmentFamilyMemberById = async (
  client,
  schemaName,
  familyId,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    SELECT *

    FROM "${schemaName}".apartment_member_family

    WHERE id=$1

    LIMIT 1;
    `,
    [familyId],
  );

  return result.rows[0];
};

/**
 * Update Family Member
 */
export const updateApartmentFamilyMember = async (
  client,
  schemaName,
  familyId,
  family,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    UPDATE "${schemaName}".apartment_member_family

    SET

      name=$1,
      relationship=$2,
      age=$3,
      mobile_number=$4,
      updated_at=NOW()

    WHERE id=$5

    RETURNING *;
    `,
    [
      family.name,

      family.relationship,

      family.age,

      family.mobile_number,

      familyId,
    ],
  );

  return result.rows[0];
};

/**
 * Delete Family Member
 */
export const deleteApartmentFamilyMember = async (
  client,
  schemaName,
  familyId,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    DELETE FROM "${schemaName}".apartment_member_family

    WHERE id=$1

    RETURNING id;
    `,
    [familyId],
  );

  return result.rows[0];
};

/**
 * Get Family Member Count
 */
export const getApartmentFamilyMemberCount = async (
  client,
  schemaName,
  memberId,
) => {
  schemaName = validateSchema(schemaName);

  const result = await client.query(
    `
    SELECT COUNT(*)::INTEGER AS total

    FROM "${schemaName}".apartment_member_family

    WHERE member_id=$1;
    `,
    [memberId],
  );

  return result.rows[0];
};

/**
 * Check Duplicate Mobile Number
 */
export const checkFamilyMobileExists = async (
  client,
  schemaName,
  mobile,
  excludeId = null,
) => {
  schemaName = validateSchema(schemaName);

  let query;

  let values;

  if (excludeId) {
    query = `
    SELECT id

    FROM "${schemaName}".apartment_member_family

    WHERE mobile_number=$1

    AND id<>$2

    LIMIT 1;
    `;

    values = [mobile, excludeId];
  } else {
    query = `
    SELECT id

    FROM "${schemaName}".apartment_member_family

    WHERE mobile_number=$1

    LIMIT 1;
    `;

    values = [mobile];
  }

  const result = await client.query(query, values);

  return result.rows[0];
};

/**
 * Update Apartment Member Family Count
 */
export const updateFamilyMemberCount = async (client, schemaName, memberId) => {
  schemaName = validateSchema(schemaName);

  await client.query(
    `
    UPDATE "${schemaName}".apartment_member

    SET

    family_member_count =
    (
      SELECT COUNT(*)

      FROM "${schemaName}".apartment_member_family

      WHERE member_id=$1
    ),

    updated_at=NOW()

    WHERE id=$1;
    `,
    [memberId],
  );
};
