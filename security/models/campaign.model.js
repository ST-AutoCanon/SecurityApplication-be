// ===================== GET ALL CAMPAIGNS =====================

export const getAllCampaigns = async (db, schema) => {
  const query = `
    SELECT
      id,
      campaign_name,
      channel,
      category,
      subject,
      preheader,
      status,
      scheduled_at,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".campaigns
    ORDER BY updated_at DESC;
  `;

  const result = await db.query(query);

  return result.rows;
};

// ===================== GET CAMPAIGN BY ID =====================

export const getCampaignById = async (
  db,
  schema,
  campaignId
) => {
  const query = `
    SELECT
      id,
      campaign_name,
      channel,
      category,
      subject,
      preheader,
      status,
      scheduled_at,
      created_by,
      created_at,
      updated_at
    FROM "${schema}".campaigns
    WHERE id = $1;
  `;

  const result = await db.query(
    query,
    [campaignId]
  );

  return result.rows[0] || null;
};

// ===================== CREATE CAMPAIGN =====================

export const createCampaign = async (
  db,
  schema,
  data
) => {
  const query = `
    INSERT INTO "${schema}".campaigns
    (
      campaign_name,
      channel,
      category,
      subject,
      preheader,
      status,
      scheduled_at,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    data.campaign_name,
    data.channel || "Email",
    data.category || "Others",
    data.subject || null,
    data.preheader || null,
    data.status || "Draft",
    data.scheduled_at || null,
    data.created_by || null,
  ];

  const result = await db.query(
    query,
    values
  );

  return result.rows[0];
};

// ===================== UPDATE CAMPAIGN =====================

export const updateCampaign = async (
  db,
  schema,
  campaignId,
  data
) => {
  const query = `
    UPDATE "${schema}".campaigns
    SET
      campaign_name = $1,
      channel = $2,
      category = $3,
      subject = $4,
      preheader = $5,
      status = $6,
      scheduled_at = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    data.campaign_name,
    data.channel || "Email",
    data.category || "Others",
    data.subject || null,
    data.preheader || null,
    data.status || "Draft",
    data.scheduled_at || null,
    campaignId,
  ];

  const result = await db.query(
    query,
    values
  );

  return result.rows[0] || null;
};

// ===================== DELETE CAMPAIGN =====================

export const deleteCampaign = async (
  db,
  schema,
  campaignId
) => {
  const query = `
    DELETE FROM "${schema}".campaigns
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(
    query,
    [campaignId]
  );

  return result.rows[0] || null;
};