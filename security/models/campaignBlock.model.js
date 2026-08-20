// campaign/models/campaignBlock.model.js

// ===================== GET ALL BLOCKS FOR CAMPAIGN =====================

export const getCampaignBlocks = async (db, schema, campaignId) => {
  const query = `
    SELECT
      id,
      campaign_id,
      block_type,
      content,
      sort_order,
      created_at,
      updated_at
    FROM "${schema}".campaign_blocks
    WHERE campaign_id = $1
    ORDER BY sort_order ASC, id ASC;
  `;

  const result = await db.query(query, [campaignId]);

  return result.rows;
};

// ===================== GET SINGLE BLOCK =====================

export const getCampaignBlockById = async (
  db,
  schema,
  blockId
) => {
  const query = `
    SELECT
      id,
      campaign_id,
      block_type,
      content,
      sort_order,
      created_at,
      updated_at
    FROM "${schema}".campaign_blocks
    WHERE id = $1;
  `;

  const result = await db.query(query, [blockId]);

  return result.rows[0] || null;
};

// ===================== CREATE BLOCK =====================

export const createCampaignBlock = async (
  db,
  schema,
  data
) => {
  const query = `
    INSERT INTO "${schema}".campaign_blocks
    (
      campaign_id,
      block_type,
      content,
      sort_order
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      campaign_id,
      block_type,
      content,
      sort_order,
      created_at,
      updated_at;
  `;

  const values = [
    data.campaign_id,
    data.block_type,
    JSON.stringify(data.content || {}),
    data.sort_order ?? 0,
  ];

  const result = await db.query(query, values);

  return result.rows[0];
};

// ===================== UPDATE BLOCK =====================

export const updateCampaignBlock = async (
  db,
  schema,
  blockId,
  data
) => {
  const query = `
    UPDATE "${schema}".campaign_blocks
    SET
      block_type = $1,
      content = $2,
      sort_order = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING
      id,
      campaign_id,
      block_type,
      content,
      sort_order,
      created_at,
      updated_at;
  `;

  const values = [
    data.block_type,
    JSON.stringify(data.content || {}),
    data.sort_order ?? 0,
    blockId,
  ];

  const result = await db.query(query, values);

  return result.rows[0] || null;
};

// ===================== DELETE BLOCK =====================

export const deleteCampaignBlock = async (
  db,
  schema,
  blockId
) => {
  const query = `
    DELETE FROM "${schema}".campaign_blocks
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [blockId]);

  return result.rows[0] || null;
};