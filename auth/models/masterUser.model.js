import masterAuthDB from "../../config/masterAuthDB.js";

/* =========================
   MASTER / SUPER ADMIN
========================= */
export const findMasterUserByEmail = async (email) => {
  const result = await masterAuthDB.query(
    `
    SELECT *
    FROM auth.users
    WHERE email = $1
    LIMIT 1
    `,
    [email],
  );

  return result.rows[0];
};

/* =========================
   CREATE USER
========================= */
export const createMasterUser = async (data) => {
  const result = await masterAuthDB.query(
    `
    INSERT INTO auth.users
    (
      first_name,
      last_name,
      email,
      password,
      role,
      organisation_id
    )
    VALUES
    ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.password,
      data.role,
      data.organisation_id || null,
    ],
  );

  return result.rows[0];
};

/* =========================
   GET USERS
========================= */
export const getMasterUsers = async () => {
  const result = await masterAuthDB.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      organisation_id,
      created_at
    FROM auth.users
    ORDER BY id DESC
    `,
  );

  return result.rows;
};

/* =========================
   ORG ADMIN LOGIN
========================= */
// export const findOrgAdminByEmail = async (email, organisationId) => {
//   const result = await masterAuthDB.query(
//     `
//     SELECT *
//     FROM auth.users
//     WHERE email = $1
//       AND organisation_id = $2
//       AND role = 'admin'
//     LIMIT 1
//     `,
//     [email, organisationId],
//   );

//   return result.rows[0];
// };
export const findOrgAdminByEmail = async (email, organisationId) => {
  const result = await masterAuthDB.query(
    `
    SELECT
      u.*,
      o.org_type
    FROM auth.users u
    INNER JOIN auth.organisations o
      ON o.id = u.organisation_id
    WHERE u.email = $1
      AND u.organisation_id = $2
      AND u.role = 'admin'
    LIMIT 1
    `,
    [email, organisationId],
  );

  return result.rows[0];
};

/* =========================
   ORG USER LOGIN (FIXED)
   NO SCHEMA USED ANYMORE
========================= */

export const findOrgUserByEmail = async (email, organisationId) => {
  const result = await masterAuthDB.query(
    `
    SELECT
      u.*,
      o.org_type
    FROM auth.users u
    INNER JOIN auth.organisations o
      ON o.id = u.organisation_id
    WHERE u.email = $1
      AND u.organisation_id = $2
    LIMIT 1
    `,
    [email, organisationId],
  );

  return result.rows[0];
};

export const findUserByInvitationToken = async (token) => {
  const result = await masterAuthDB.query(
    `
    SELECT *
    FROM auth.users
    WHERE invitation_token = $1
    LIMIT 1
    `,
    [token],
  );

  return result.rows[0];
};

export const updateUserPassword = async (userId, hashedPassword) => {
  await masterAuthDB.query(
    `
    UPDATE auth.users
    SET
      password = $1,
      invitation_token = NULL,
      invitation_expires_at = NULL,
      invitation_accepted = TRUE,
      updated_at = NOW()
    WHERE id = $2
    `,
    [hashedPassword, userId],
  );
};

export const findForgotPasswordUserByEmail = async (email, organisationId) => {
  const result = await masterAuthDB.query(
    `
    SELECT *
    FROM auth.users
    WHERE email = $1
      AND organisation_id = $2
      AND role IN ('admin', 'security')
      AND is_active = TRUE
    LIMIT 1
    `,
    [email, organisationId],
  );

  return result.rows[0];
};

export const saveResetPasswordToken = async (userId, token, expiresAt) => {
  await masterAuthDB.query(
    `
    UPDATE auth.users
    SET
      reset_password_token = $1,
      reset_password_expires_at = $2,
      updated_at = NOW()
    WHERE id = $3
    `,
    [token, expiresAt, userId],
  );
};

export const findUserByResetPasswordToken = async (token) => {
  const result = await masterAuthDB.query(
    `
    SELECT *
    FROM auth.users
    WHERE reset_password_token = $1
      AND reset_password_expires_at > NOW()
      AND role IN ('admin', 'security')
    LIMIT 1
    `,
    [token],
  );

  return result.rows[0];
};

export const updatePasswordAfterReset = async (userId, hashedPassword) => {
  await masterAuthDB.query(
    `
    UPDATE auth.users
    SET
      password = $1,
      reset_password_token = NULL,
      reset_password_expires_at = NULL,
      updated_at = NOW()
    WHERE id = $2
    `,
    [hashedPassword, userId],
  );
};
