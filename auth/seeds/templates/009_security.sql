-- INSERT INTO auth.field_templates (
--         template_id,
--         field_type_id,
--         field_key,
--         field_label,
--         placeholder,
--         options,
--         validation,
--         default_value,
--         is_required,
--         is_system,
--         is_default,
--         is_visible,
--         allow_remove,
--         display_order
--     )
-- VALUES -- 1. Full Name
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'text'
--         ),
--         'full_name',
--         'Full Name',
--         'Enter Full Name',
--         NULL,
--         '{"minLength":3,"maxLength":100}'::jsonb,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         1
--     ),
--     -- 2. Mobile Number
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'mobile'
--         ),
--         'mobile_number',
--         'Mobile Number',
--         'Enter Mobile Number',
--         NULL,
--         '{"pattern":"^[0-9]{10}$"}'::jsonb,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         2
--     ),
--     -- 3. Email
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'email'
--         ),
--         'email',
--         'Email',
--         'Enter Email',
--         NULL,
--         '{"format":"email"}'::jsonb,
--         NULL,
--         FALSE,
--         FALSE,
--         TRUE,
--         TRUE,
--         TRUE,
--         3
--     ),
--     -- 4. Employee ID
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'text'
--         ),
--         'employee_id',
--         'Employee ID',
--         'Enter Employee ID',
--         NULL,
--         NULL,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         4
--     ),
--     -- 5. Designation
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'enum'
--         ),
--         'designation',
--         'Designation',
--         'Select Designation',
--         '[
--         "Security Guard",
--         "Supervisor",
--         "Head Guard",
--         "Security Officer",
--         "Manager"
--     ]'::jsonb,
--         NULL,
--         'Security Guard',
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         5
--     ),
--     -- 6. Shift
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'enum'
--         ),
--         'shift',
--         'Shift',
--         'Select Shift',
--         '[
--         "Morning",
--         "Afternoon",
--         "Night",
--         "General"
--     ]'::jsonb,
--         NULL,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         6
--     ),
--     -- 7. Joining Date
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'date'
--         ),
--         'joining_date',
--         'Joining Date',
--         NULL,
--         NULL,
--         NULL,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         7
--     ),
--     -- 8. Status
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'enum'
--         ),
--         'status',
--         'Status',
--         'Select Status',
--         '[
--         "Active",
--         "Inactive",
--         "On Leave",
--         "Suspended"
--     ]'::jsonb,
--         NULL,
--         'Active',
--         TRUE,
--         TRUE,
--         TRUE,
--         TRUE,
--         FALSE,
--         8
--     ),
--     -- 9. Profile Photo
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'image'
--         ),
--         'profile_photo',
--         'Profile Photo',
--         'Upload Photo',
--         NULL,
--         NULL,
--         NULL,
--         TRUE,
--         TRUE,
--         TRUE,
--         TRUE,
--         FALSE,
--         9
--     ),
--     -- 10. Face Descriptor
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'descriptor'
--         ),
--         'face_descriptor',
--         'Face Descriptor',
--         NULL,
--         NULL,
--         NULL,
--         NULL,
--         TRUE,
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         10
--     ),
--     -- 11. Created At
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'datetime'
--         ),
--         'created_at',
--         'Created At',
--         NULL,
--         NULL,
--         NULL,
--         'NOW()',
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         FALSE,
--         11
--     ),
--     -- 12. Updated At
--     (
--         (
--             SELECT id
--             FROM auth.table_templates
--             WHERE template_key = 'security'
--         ),
--         (
--             SELECT id
--             FROM auth.field_types
--             WHERE type_key = 'datetime'
--         ),
--         'updated_at',
--         'Updated At',
--         NULL,
--         NULL,
--         NULL,
--         'NOW()',
--         FALSE,
--         TRUE,
--         TRUE,
--         FALSE,
--         FALSE,
--         12
--     );


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
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
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
    '{
        "pattern":"^[A-Za-z ]+$",
        "minLength":3,
        "maxLength":100,
        "message":"Name should contain only letters and spaces."
    }'::jsonb,
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
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'mobile'
    ),
    'mobile_number',
    'Mobile Number',
    'Enter Mobile Number',
    NULL,
    '{
        "pattern":"^[0-9]{10}$",
        "minLength":10,
        "maxLength":10,
        "message":"Mobile number must be exactly 10 digits."
    }'::jsonb,
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
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'email'
    ),
    'email',
    'Email',
    'Enter Email',
    NULL,
    '{
        "format":"email",
        "message":"Please enter a valid email address."
    }'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    3
),

-- 4. Employee ID
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'text'
    ),
    'employee_id',
    'Employee ID',
    'Enter Employee ID',
    NULL,
    '{
        "minLength":3,
        "maxLength":20,
        "message":"Employee ID must be between 3 and 20 characters."
    }'::jsonb,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    4
),

-- 5. Designation
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'enum'
    ),
    'designation',
    'Designation',
    'Select Designation',
    '[
        "Security Guard",
        "Supervisor",
        "Head Guard",
        "Security Officer",
        "Manager"
    ]'::jsonb,
    NULL,
    'Security Guard',
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    5
),

-- 6. Shift
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'enum'
    ),
    'shift',
    'Shift',
    'Select Shift',
    '[
        "Morning",
        "Afternoon",
        "Night",
        "General"
    ]'::jsonb,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    6
),

-- 7. Joining Date
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'date'
    ),
    'joining_date',
    'Joining Date',
    NULL,
    NULL,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    7
),

-- 8. Status
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'enum'
    ),
    'status',
    'Status',
    'Select Status',
    '[
        "Active",
        "Inactive",
        "On Leave",
        "Suspended"
    ]'::jsonb,
    NULL,
    'Active',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    8
),

-- 9. Profile Photo
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'image'
    ),
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
    9
),

-- 10. Face Descriptor
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'descriptor'
    ),
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
    10
),

-- 11. Created At
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'datetime'
    ),
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
    11
),

-- 12. Updated At
(
    (
        SELECT id
        FROM auth.table_templates
        WHERE template_key = 'security'
    ),
    (
        SELECT id
        FROM auth.field_types
        WHERE type_key = 'datetime'
    ),
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
    12
);