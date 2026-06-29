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
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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

-- 2. Mobile Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    2
),

-- 3. Email
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='email'),
    'email',
    'Email',
    'Enter Email',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    3
),

-- 4. Patient Name
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'patient_name',
    'Patient Name',
    'Enter Patient Name',
    NULL,
    '{"minLength":3,"maxLength":100}'::jsonb,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    4
),

-- 5. Patient ID
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'patient_id',
    'Patient ID',
    'Enter Patient ID',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    5
),

-- 6. Relationship
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'relationship',
    'Relationship',
    'Select Relationship',
    '["Father","Mother","Brother","Sister","Spouse","Son","Daughter","Relative","Friend","Other"]'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    6
),

-- 7. Purpose
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'purpose',
    'Purpose',
    'Enter Purpose',
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    7
),

-- 8. Government ID Type
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'government_id_type',
    'Government ID Type',
    'Select ID Type',
    '["Aadhaar","PAN","Passport","Driving License","Voter ID"]'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    8
),

-- 9. Government ID Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'government_id_number',
    'Government ID Number',
    'Enter Government ID Number',
    NULL,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    9
),



-- 10. Profile Photo
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    10
),

-- 11. Face Descriptor
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    11
),

-- 12. Status
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    12
),

-- 13. Created At
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    13
),

-- 14. Updated At
(
    (SELECT id FROM auth.table_templates WHERE template_key='patient_visitor'),
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
    14
);