INSERT INTO auth.field_templates
(
    template_id,
    field_type_id,
    field_key,
    field_label,
    placeholder,
    options,
    validation,
    default_value,
    is_required,
    is_system,
    is_default,
    is_visible,
    allow_remove,
    display_order
)
VALUES

-- 1. Company Name
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'company_name',
    'Company Name',
    'Enter Company Name',
    NULL,
    '{"minLength":2,"maxLength":100}'::jsonb,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    1
),

-- 2. Full Name
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'vendor'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'text'
    ),
    'full_name',
    'Full Name',
    'Enter Full Name',
    NULL,
    '{"minLength":3,"maxLength":100,"pattern":"^[A-Za-z]+(?:\\s+[A-Za-z]+)+$"}'::jsonb,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    2
),

-- 3. Service Type
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'service_type',
    'Service Type',
    'Select Service Type',
    '[
        "Electrician",
        "Plumber",
        "Housekeeping",
        "Pest Control",
        "Internet Provider",
        "Cable TV",
        "Security Agency",
        "Gardening",
        "Painting",
        "Carpenter",
        "Other"
    ]'::jsonb,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    3
),

-- 4. Mobile Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='mobile'),
    'mobile_number',
    'Mobile Number',
    'Enter Mobile Number',
    NULL,
    '{"pattern":"^[0-9]{10}$"}'::jsonb,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    4
),

-- 5. Email
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='email'),
    'email',
    'Email',
    'Enter Email Address',
    NULL,
    '{"format":"email"}'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    5
),

-- 6. GST Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'gst_number',
    'GST Number',
    'Enter GST Number',
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    6
),

-- 7. Address
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'address',
    'Address',
    'Enter Address',
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    7
),

-- 8. Available Timing
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'available_timing',
    'Available Timing',
    'Example: 9 AM - 6 PM',
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    8
),

-- 9. Contract Start Date
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='date'),
    'contract_start_date',
    'Contract Start Date',
    'Select Start Date',
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    9
),

-- 10. Contract End Date
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='date'),
    'contract_end_date',
    'Contract End Date',
    'Select End Date',
    NULL,
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    10
),

-- 11. Profile Photo
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='image'),
    'profile_photo',
    'Profile Photo',
    'Upload Photo',
    NULL,
    NULL,
    NULL,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    11
),

-- 12. Face Descriptor
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='descriptor'),
    'face_descriptor',
    'Face Descriptor',
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    12
),

-- 13. Status
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'status',
    'Status',
    'Select Status',
    '["Active","Inactive"]'::jsonb,
    NULL,
    'Active',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    13
),

-- 14. Created At
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='datetime'),
    'created_at',
    'Created At',
    NULL,
    NULL,
    NULL,
    'NOW()',
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    14
),

-- 15. Updated At
(
    (SELECT id FROM auth.table_templates WHERE template_key='service_provider'),
    (SELECT id FROM auth.field_types WHERE type_key='datetime'),
    'updated_at',
    'Updated At',
    NULL,
    NULL,
    NULL,
    'NOW()',
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    15
);