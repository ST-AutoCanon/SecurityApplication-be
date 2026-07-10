    INSERT INTO auth.table_templates
    (
    template_key,
    template_name,
    description,
    organisation_type
    )
    VALUES
    ('maid','Maid','Apartment Maid Registration','APARTMENT'),
    ('service_provider','Service Provider','Service Provider Registration','APARTMENT'),
    ('delivery_person','Delivery Person','Delivery Person Registration','APARTMENT'),
    ('visitor','Visitor','Visitor Registration','APARTMENT'),
    ('security', 'Security', 'Apartment Security Staff Registration', 'APARTMENT'),


    ('vendor','Vendor','Event Vendor Registration','EVENT'),
    ('guest','Guest','Event Guest Registration','EVENT'),
    ('worker','Worker','Event Worker Registration','EVENT'),
    ('organiser', 'Organiser', 'Event Organiser Registration', 'EVENT'),
    
    ('patient_visitor','Patient Visitor','Hospital Patient Visitor Registration','HOSPITAL'),
    ('security', 'Security', 'Hospital Security Staff Registration', 'HOSPITAL');



    -- NOTE: Do not re-run this seed on an existing database, as it will attempt to insert all templates again.
-- For existing databases, insert only the new template records (e.g., Security, Organiser) directly into auth.table_templates.

--
-- INSERT INTO auth.table_templates
-- (template_key, template_name, description, organisation_type)
-- VALUES
-- ('security', 'Security', 'Apartment Security Staff Registration', 'APARTMENT'),
-- ('organiser', 'Organiser', 'Event Organiser Registration', 'EVENT');
--

-- Then execute:
-- \i C:/Users/vinay/OneDrive/Desktop/repositories/securityapplications/10-july/backend/auth/seeds/templates/009_security.sql
-- \i C:/Users/vinay/OneDrive/Desktop/repositories/securityapplications/10-july/backend/auth/seeds/templates/010_organiser.sql
--
-- Fresh database setups will automatically get these templates by running the seeds in order.
