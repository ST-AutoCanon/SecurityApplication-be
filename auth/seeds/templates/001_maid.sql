INSERT INTO auth.field_templates
(
    template_id,
    field_type_id,
    field_key,
    field_label,
    placeholder,
    options,
    validation,
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
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'full_name',
    'Full Name',
    'Enter Full Name',
    NULL,
    '{"minLength":3,"maxLength":100}'::jsonb,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    1
),

-- 2. Gender
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'gender',
    'Gender',
    'Select Gender',
    '["Male","Female","Other"]'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    2
),

-- 3. Mobile Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='mobile'),
    'mobile_number',
    'Mobile Number',
    'Enter Mobile Number',
    NULL,
    '{"pattern":"^[0-9]{10}$"}'::jsonb,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    3
),

-- 4. Aadhaar Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'aadhaar_number',
    'Aadhaar Number',
    'Enter Aadhaar Number',
    NULL,
    '{"pattern":"^[0-9]{12}$"}'::jsonb,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    4
),

-- 5. Address
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'address',
    'Address',
    'Enter Address',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    5
),

-- 6. Apartment Assigned
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'apartment_assigned',
    'Apartment Assigned',
    'Apartment Name',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    6
),

-- 7. Flat Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'flat_number',
    'Flat Number',
    'Enter Flat Number',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    7
),

-- 8. Work Type
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'work_type',
    'Work Type',
    'Select Work Type',
    '["Cook","Cleaner","Nanny","Driver","Housekeeping","Other"]'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    8
),

-- 9. Joining Date
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='date'),
    'joining_date',
    'Joining Date',
    'Select Joining Date',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    9
),

-- 10. Emergency Contact
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='mobile'),
    'emergency_contact',
    'Emergency Contact',
    'Enter Emergency Contact',
    NULL,
    '{"pattern":"^[0-9]{10}$"}'::jsonb,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    10
),

-- 11. Profile Photo
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='image'),
    'profile_photo',
    'Profile Photo',
    'Upload Photo',
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
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='descriptor'),
    'face_descriptor',
    'Face Descriptor',
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
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'status',
    'Status',
    'Select Status',
    '["Active","Inactive"]'::jsonb,
    NULL,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    13
),

-- 14. Created At
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='datetime'),
    'created_at',
    'Created At',
    NULL,
    NULL,
    NULL,
    FALSE,
    TRUE,
   TRUE,
    FALSE,
    FALSE,
    14
),

-- 15. Updated At
(
    (SELECT id FROM auth.table_templates WHERE template_key='maid'),
    (SELECT id FROM auth.field_types WHERE type_key='datetime'),
    'updated_at',
    'Updated At',
    NULL,
    NULL,
    NULL,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    15
);