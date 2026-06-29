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
VALUES -- 1. Full Name
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        '{"format":"email"}'::jsonb,
        NULL,
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        TRUE,
        3
    ),
    -- 4. Visitor Type
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'enum'
        ),
        'visitor_type',
        'Visitor Type',
        'Select Visitor Type',
        '[
        "Guest",
        "Relative",
        "Friend",
        "Courier",
        "Maintenance",
        "Food Delivery",
        "Cab Driver",
        "Service Engineer",
        "Other"
    ]'::jsonb,
        NULL,
        NULL,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        4
    ),
    -- 5. Visiting Resident
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'text'
        ),
        'resident_name',
        'Resident Name',
        'Enter Resident Name',
        NULL,
        NULL,
        NULL,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        5
    ),
    -- 6. Flat Number
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'text'
        ),
        'flat_number',
        'Flat Number',
        'Enter Flat Number',
        NULL,
        NULL,
        NULL,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        6
    ),
    -- 7. Purpose of Visit
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'text'
        ),
        'purpose',
        'Purpose of Visit',
        'Enter Purpose',
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
    -- 8. Government ID Type
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'enum'
        ),
        'government_id_type',
        'Government ID Type',
        'Select Government ID',
        '[
        "Aadhaar",
        "Driving License",
        "Passport",
        "PAN Card",
        "Voter ID"
    ]'::jsonb,
        NULL,
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
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'text'
        ),
        'government_id_number',
        'Government ID Number',
        'Enter ID Number',
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
    -- 10. Vehicle Number
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'text'
        ),
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
        10
    ),
    -- 11. Profile Photo
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        11
    ),
    -- 12. Face Descriptor
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        12
    ),
    -- 13. Status
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        "Expected",
        "Checked In",
        "Checked Out",
        "Cancelled",
        "Denied"
    ]'::jsonb,
        NULL,
        'Expected',
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        FALSE,
        13
    ),
    -- 14. Created At
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        14
    ),
    -- 15. Updated At
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'visitor'
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
        15
    );