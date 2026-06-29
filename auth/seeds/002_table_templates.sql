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

    ('vendor','Vendor','Event Vendor Registration','EVENT'),
    ('guest','Guest','Event Guest Registration','EVENT'),
    ('worker','Worker','Event Worker Registration','EVENT'),
    
    ('patient_visitor','Patient Visitor','Hospital Patient Visitor Registration','HOSPITAL');