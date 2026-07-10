INSERT INTO auth.field_templates (
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

-- 1. Full Name
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'text'),
    'full_name',
    'Full Name',
    'Enter Full Name',
    NULL,
    '{"minLength":3,"maxLength":100}'::jsonb,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    1
),

-- 2. Mobile Number
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'mobile'),
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
    2
),

-- 3. Email
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'email'),
    'email',
    'Email',
    'Enter Email',
    NULL,
    '{"format":"email"}'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    3
),

-- 4. Organization Name
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'text'),
    'organization_name',
    'Organization Name',
    'Enter Organization Name',
    NULL,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    4
),

-- 5. Role
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'enum'),
    'role',
    'Role',
    'Select Role',
    '[
        "Organizer",
        "Coordinator",
        "Event Manager",
        "Volunteer",
        "Committee Member",
        "Other"
    ]'::jsonb,
    NULL,
    'Organizer',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    5
),

-- 6. Event Name
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'text'),
    'event_name',
    'Event Name',
    'Enter Event Name',
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

-- 7. Status
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'enum'),
    'status',
    'Status',
    'Select Status',
    '[
        "Active",
        "Inactive",
        "Pending",
        "Blocked"
    ]'::jsonb,
    NULL,
    'Active',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    7
),

-- 8. Profile Photo
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'image'),
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
    8
),

-- 9. Face Descriptor
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'descriptor'),
    'face_descriptor',
    'Face Descriptor',
    NULL,
    NULL,
    NULL,
    NULL,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
    9
),

-- 10. Created At
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'datetime'),
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
    10
),

-- 11. Updated At
(
    (SELECT id FROM auth.table_templates WHERE template_key = 'organiser'),
    (SELECT id FROM auth.field_types WHERE type_key = 'datetime'),
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
    11
);