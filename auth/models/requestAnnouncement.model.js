// // models/requestAnnouncement.model.js

// export const getRequestAnnouncements = async (
//   client,
//   schemaName
// ) => {
//   const query = `
//     SELECT
//       id,
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       announcement,
//       submitted_at,
//       reviewed_at
//     FROM "${schemaName}".quick_request_responses
//     WHERE announcement IS NOT NULL
//       AND BTRIM(announcement) <> ''
//     ORDER BY
//       COALESCE(reviewed_at, submitted_at) DESC
//   `;

//   const result = await client.query(query);

//   return result.rows;
// };
// models/requestAnnouncement.model.js

// export const getRequestAnnouncements = async (
//   client,
//   schemaName
// ) => {
//   const query = `
//     SELECT
//       id,
//       request_type_id,
//       org_id,
//       requested_by,
//       status,
//       announcement,
//       submitted_at,
//       reviewed_at,
//       expires_at
//     FROM "${schemaName}".quick_request_responses
//     WHERE announcement IS NOT NULL
//       AND BTRIM(announcement) <> ''
//     ORDER BY
//       COALESCE(reviewed_at, submitted_at) DESC
//   `;

//   const result = await client.query(query);

//   return result.rows;
// };
export const getRequestAnnouncements = async (
  client,
  schemaName
) => {
  const query = `
    SELECT
      id,
      request_type_id,
      org_id,
      requested_by,
      status,
      announcement,
      submitted_at,
      reviewed_at,
      start_date,
      expires_at
    FROM "${schemaName}".quick_request_responses
    WHERE announcement IS NOT NULL
      AND BTRIM(announcement) <> ''
    ORDER BY
      start_date DESC NULLS LAST,
      COALESCE(reviewed_at, submitted_at) DESC
  `;

  const result = await client.query(query);

  return result.rows;
};