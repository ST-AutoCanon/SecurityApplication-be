// /*
// |--------------------------------------------------------------------------
// | CREATE VENDOR / SERVICE PROVIDER
// |--------------------------------------------------------------------------
// */

// export const createVendorServiceProvider = async (
//   client,
//   schemaName,
//   organisationId,
//   category,
//   name,
//   description,
//   services,
//   rating,
//   reviewCount,
//   phone,
//   createdBy
// ) => {
//   const query = `
//     INSERT INTO "${schemaName}".vendors_service_providers (
//       organisation_id,
//       category,
//       name,
//       description,
//       services,
//       rating,
//       review_count,
//       phone,
//       created_by
//     )
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//     RETURNING
//       id,
//       organisation_id,
//       category,
//       name,
//       description,
//       services,
//       rating,
//       review_count,
//       phone,
//       created_by,
//       created_at,
//       is_active
//   `;

//   const values = [
//     organisationId,
//     category,
//     name,
//     description || null,
//     services || null,
//     rating || 0,
//     reviewCount || 0,
//     phone || null,
//     createdBy || null,
//   ];

//   const result = await client.query(query, values);

//   return result.rows[0];
// };


// /*
// |--------------------------------------------------------------------------
// | ADMIN - GET ALL VENDORS
// |--------------------------------------------------------------------------
// */

// export const getAdminVendorServiceProviders = async (
//   client,
//   schemaName,
//   organisationId
// ) => {
//   const query = `
//     SELECT
//       id,
//       organisation_id,
//       category,
//       name,
//       description,
//       services,
//       rating,
//       review_count,
//       phone,
//       created_by,
//       created_at,
//       is_active
//     FROM "${schemaName}".vendors_service_providers
//     WHERE organisation_id = $1
//     ORDER BY created_at DESC
//   `;

//   const result = await client.query(query, [organisationId]);

//   return result.rows;
// };


// /*
// |--------------------------------------------------------------------------
// | USER - GET ACTIVE VENDORS
// |--------------------------------------------------------------------------
// */

// export const getUserVendorServiceProviders = async (
//   client,
//   schemaName,
//   organisationId
// ) => {
//   const query = `
//     SELECT
//       id,
//       organisation_id,
//       category,
//       name,
//       description,
//       services,
//       rating,
//       review_count,
//       phone,
//       created_at
//     FROM "${schemaName}".vendors_service_providers
//     WHERE organisation_id = $1
//       AND is_active = TRUE
//     ORDER BY created_at DESC
//   `;

//   const result = await client.query(query, [organisationId]);

//   return result.rows;
// };


// /*
// |--------------------------------------------------------------------------
// | UPDATE
// |--------------------------------------------------------------------------
// */

// export const updateVendorServiceProvider = async (
//   client,
//   schemaName,
//   organisationId,
//   id,
//   category,
//   name,
//   description,
//   services,
//   rating,
//   reviewCount,
//   phone
// ) => {
//   const query = `
//     UPDATE "${schemaName}".vendors_service_providers
//     SET
//       category = $1,
//       name = $2,
//       description = $3,
//       services = $4,
//       rating = $5,
//       review_count = $6,
//       phone = $7
//     WHERE id = $8
//       AND organisation_id = $9
//     RETURNING
//       id,
//       organisation_id,
//       category,
//       name,
//       description,
//       services,
//       rating,
//       review_count,
//       phone,
//       created_by,
//       created_at,
//       is_active
//   `;

//   const values = [
//     category,
//     name,
//     description || null,
//     services || null,
//     rating || 0,
//     reviewCount || 0,
//     phone || null,
//     id,
//     organisationId,
//   ];

//   const result = await client.query(query, values);

//   return result.rows[0];
// };


// /*
// |--------------------------------------------------------------------------
// | DELETE / SOFT DELETE
// |--------------------------------------------------------------------------
// */

// export const deleteVendorServiceProvider = async (
//   client,
//   schemaName,
//   organisationId,
//   id
// ) => {
//   const query = `
//     UPDATE "${schemaName}".vendors_service_providers
//     SET is_active = FALSE
//     WHERE id = $1
//       AND organisation_id = $2
//     RETURNING id
//   `;

//   const result = await client.query(query, [
//     id,
//     organisationId,
//   ]);

//   return result.rows[0];
// };


// /*
// |--------------------------------------------------------------------------
// | TOGGLE ACTIVE / INACTIVE
// |--------------------------------------------------------------------------
// */

// export const toggleVendorServiceProvider = async (
//   client,
//   schemaName,
//   organisationId,
//   id
// ) => {
//   const query = `
//     UPDATE "${schemaName}".vendors_service_providers
//     SET is_active = NOT is_active
//     WHERE id = $1
//       AND organisation_id = $2
//     RETURNING
//       id,
//       is_active
//   `;

//   const result = await client.query(query, [
//     id,
//     organisationId,
//   ]);

//   return result.rows[0];
// };

/*
|--------------------------------------------------------------------------
| CREATE VENDOR / SERVICE PROVIDER
|--------------------------------------------------------------------------
*/

export const createVendorServiceProvider = async (
  client,
  schemaName,
  organisationId,
  category,
  name,
  description,
  services,
  recommendation,
  phone,
  icon,
  createdBy
) => {
  const query = `
    INSERT INTO "${schemaName}".vendors_service_providers (
      organisation_id,
      category,
      name,
      description,
      services,
      recommendation,
      phone,
      icon,
      created_by
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    RETURNING
      id,
      organisation_id,
      category,
      name,
      description,
      services,
      recommendation,
      phone,
      icon,
      created_by,
      created_at,
      is_active
  `;

  const values = [
    organisationId,
    category,
    name,
    description || null,
    services || null,
    recommendation || null,
    phone || null,
    icon || "settings",
    createdBy || null,
  ];

  const result = await client.query(query, values);

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL VENDORS
|--------------------------------------------------------------------------
*/

export const getAdminVendorServiceProviders = async (
  client,
  schemaName,
  organisationId
) => {
  const query = `
    SELECT
      id,
      organisation_id,
      category,
      name,
      description,
      services,
      recommendation,
      phone,
      icon,
      created_by,
      created_at,
      is_active
    FROM "${schemaName}".vendors_service_providers
    WHERE organisation_id = $1
    ORDER BY created_at DESC
  `;

  const result = await client.query(query, [
    organisationId,
  ]);

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| USER - GET ACTIVE VENDORS
|--------------------------------------------------------------------------
*/

export const getUserVendorServiceProviders = async (
  client,
  schemaName,
  organisationId
) => {
  const query = `
    SELECT
      id,
      organisation_id,
      category,
      name,
      description,
      services,
      recommendation,
      phone,
      icon,
      created_at
    FROM "${schemaName}".vendors_service_providers
    WHERE organisation_id = $1
      AND is_active = TRUE
    ORDER BY created_at DESC
  `;

  const result = await client.query(query, [
    organisationId,
  ]);

  return result.rows;
};


/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

export const updateVendorServiceProvider = async (
  client,
  schemaName,
  organisationId,
  id,
  category,
  name,
  description,
  services,
  recommendation,
  phone,
  icon
) => {
  const query = `
    UPDATE "${schemaName}".vendors_service_providers
    SET
      category = $1,
      name = $2,
      description = $3,
      services = $4,
      recommendation = $5,
      phone = $6,
      icon = $7
    WHERE id = $8
      AND organisation_id = $9
    RETURNING
      id,
      organisation_id,
      category,
      name,
      description,
      services,
      recommendation,
      phone,
      icon,
      created_by,
      created_at,
      is_active
  `;

  const values = [
    category,
    name,
    description || null,
    services || null,
    recommendation || null,
    phone || null,
    icon || "settings",
    id,
    organisationId,
  ];

  const result = await client.query(query, values);

  return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This is now a REAL DELETE.
|
| Toggle still handles active/inactive.
| Delete permanently removes the record.
|--------------------------------------------------------------------------
*/

// export const deleteVendorServiceProvider = async (
//   client,
//   schemaName,
//   organisationId,
//   id
// ) => {
//   const query = `
//     DELETE FROM "${schemaName}".vendors_service_providers
//     WHERE id = $1
//       AND organisation_id = $2
//     RETURNING
//       id,
//       organisation_id,
//       category,
//       name
//   `;

//   const result = await client.query(query, [
//     id,
//     organisationId,
//   ]);

//   return result.rows[0];
// };
export const deleteVendorServiceProvider = async (
  client,
  schemaName,
  organisationId,
  id
) => {
  const query = `
    DELETE FROM "${schemaName}".vendors_service_providers
    WHERE id = $1
      AND organisation_id = $2
    RETURNING id
  `;

  const result = await client.query(query, [
    id,
    organisationId,
  ]);

  return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE / INACTIVE
|--------------------------------------------------------------------------
*/

export const toggleVendorServiceProvider = async (
  client,
  schemaName,
  organisationId,
  id
) => {
  const query = `
    UPDATE "${schemaName}".vendors_service_providers
    SET is_active = NOT is_active
    WHERE id = $1
      AND organisation_id = $2
    RETURNING
      id,
      is_active
  `;

  const result = await client.query(query, [
    id,
    organisationId,
  ]);

  return result.rows[0];
};

