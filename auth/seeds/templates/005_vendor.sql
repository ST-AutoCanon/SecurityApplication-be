INSERT INTO auth.field_templates (
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
VALUES -- 1. Company Name
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
        'company_name',
        'Company Name',
        'Enter Company Name',
        NULL,
        '{"minLength":3,"maxLength":100}'::jsonb,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        1
    ),
    -- 2. Contact Person
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
        'contact_person',
        'Contact Person',
        'Enter Contact Person',
        NULL,
        '{"minLength":3,"maxLength":100}'::jsonb,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        2
    ),
    -- 3. Mobile Number
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        3
    ),
    -- 4. Email
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        NULL,
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        TRUE,
        4
    ),
    -- 5. Vendor Category
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'enum'
        ),
        'vendor_category',
        'Vendor Category',
        'Select Category',
        '["Food","Decoration","Photography","Sound","Lighting","Security","Housekeeping","Other"]'::jsonb,
        NULL,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        5
    ),
    -- 6. Stall Number
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
        'stall_number',
        'Stall Number',
        'Enter Stall Number',
        NULL,
        NULL,
        FALSE,
        FALSE,
        TRUE,
        TRUE,
        TRUE,
        6
    ),
    -- 7. Vehicle Number
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
        'vehicle_number',
        'Vehicle Number',
        'Enter Vehicle Number',
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
            WHERE template_key = 'vendor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'enum'
        ),
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
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        FALSE,
        10
    ),
    -- 11. Face Descriptor
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        11
    ),
    -- 12. Status
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
        ),
        (
            SELECT id
            FROM auth.field_types
            WHERE type_key = 'enum'
        ),
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
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        13
    ),
    -- 14. Updated At
    (
        (
            SELECT id
            FROM auth.table_templates
            WHERE template_key = 'vendor'
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
        FALSE,
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        14
    );