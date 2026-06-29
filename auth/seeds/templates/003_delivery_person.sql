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

-- 1. Full Name
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
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
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    2
),

-- 3. Email
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    3
),

-- 4. Company Name
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'company_name',
    'Company Name',
    'Enter Company Name',
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

-- 5. Delivery Partner
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'delivery_partner',
    'Delivery Partner',
    'Select Delivery Partner',
    '[
        "Amazon",
        "Flipkart",
        "Swiggy",
        "Zomato",
        "Blinkit",
        "Zepto",
        "BigBasket",
        "Porter",
        "Dunzo",
        "DTDC",
        "Blue Dart",
        "Delhivery",
        "India Post",
        "Other"
    ]'::jsonb,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    5
),

-- 6. Government ID Type
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'government_id_type',
    'Government ID Type',
    'Select ID Type',
    '[
        "Aadhaar",
        "Driving License",
        "Passport",
        "Voter ID",
        "PAN Card"
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

-- 7. Government ID Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'government_id_number',
    'Government ID Number',
    'Enter Government ID Number',
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

-- 8. Vehicle Number
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='text'),
    'vehicle_number',
    'Vehicle Number',
    'Enter Vehicle Number',
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

-- 9. Address
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    9
),

-- 10. Emergency Contact
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='mobile'),
    'emergency_contact',
    'Emergency Contact',
    'Enter Emergency Contact',
    NULL,
    '{"pattern":"^[0-9]{10}$"}'::jsonb,
    NULL,
    FALSE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    10
),

-- 11. Registration Date
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='date'),
    'registration_date',
    'Registration Date',
    'Select Registration Date',
    NULL,
    NULL,
    NULL,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    FALSE,
    11
),

-- 12. Profile Photo
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='image'),
    'profile_photo',
    'Profile Photo',
    'Upload Profile Photo',
    NULL,
    NULL,
    NULL,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    12
),

-- 13. Face Descriptor
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    13
),

-- 14. Status
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
    (SELECT id FROM auth.field_types WHERE type_key='enum'),
    'status',
    'Status',
    'Select Status',
    '["Active","Inactive","Blacklisted"]'::jsonb,
    NULL,
    'Active',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    14
),

-- 15. Created At
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    15
),

-- 16. Updated At
(
    (SELECT id FROM auth.table_templates WHERE template_key='delivery_person'),
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
    16
);