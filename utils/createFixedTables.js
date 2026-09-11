
export const createFixedTables = async (db, schemaName) => {
  // =====================================================
  // FORMS
  // =====================================================
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."forms" (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(500),
      fields_json JSONB NOT NULL,
      layout_columns INTEGER NOT NULL DEFAULT 2,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  await db.query(`
    ALTER TABLE "${schemaName}"."forms"
    ADD COLUMN IF NOT EXISTS layout_columns INTEGER NOT NULL DEFAULT 2;
  `);

  // Index for forms.created_by
  await db.query(`
    CREATE INDEX IF NOT EXISTS "idx_created_by"
    ON "${schemaName}"."forms" (created_by);
  `);

  // =====================================================
  // FORM RESPONSES
  // =====================================================
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."form_responses" (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      form_id INTEGER NOT NULL,
      response_json JSONB NOT NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

      CONSTRAINT "${schemaName}_form_responses_form_id_fkey"
        FOREIGN KEY (form_id)
        REFERENCES "${schemaName}"."forms"(id)
        ON DELETE CASCADE
    );
  `);

  // =====================================================
  // CAMPAIGNS
  // =====================================================
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."campaigns" (
      id SERIAL PRIMARY KEY,

      campaign_name VARCHAR(255) NOT NULL,

      channel VARCHAR(50)
        DEFAULT 'Email'
        NOT NULL,

      category VARCHAR(50)
        DEFAULT 'Others',

      subject VARCHAR(500),

      preheader TEXT,

      status VARCHAR(50)
        DEFAULT 'Draft'
        NOT NULL,

      scheduled_at TIMESTAMP,

      created_by VARCHAR(50),

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // =====================================================
  // CAMPAIGN BLOCKS
  // =====================================================
  await db.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."campaign_blocks" (
      id SERIAL PRIMARY KEY,

      campaign_id INTEGER NOT NULL,

      block_type VARCHAR(50) NOT NULL,

      "content" JSONB
        DEFAULT '{}'::JSONB
        NOT NULL,

      sort_order INTEGER
        DEFAULT 0
        NOT NULL,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL,

      CONSTRAINT "${schemaName}_campaign_blocks_campaign_id_fkey"
        FOREIGN KEY (campaign_id)
        REFERENCES "${schemaName}"."campaigns"(id)
        ON DELETE CASCADE
    );
  `);

  console.log(
    `✅ Fixed tables created for schema: ${schemaName}`
  );
};

