INSERT INTO auth.field_types
(type_key, display_name, sql_type, description)
VALUES
('text','Text','TEXT','Plain text'),
('mobile','Mobile Number','VARCHAR(15)','Mobile number'),
('email','Email','TEXT','Email'),
('number','Number','INTEGER','Whole number'),
('decimal','Decimal','NUMERIC(10,2)','Decimal number'),
('boolean','Boolean','BOOLEAN','True / False'),
('date','Date','DATE','Date'),
('datetime','Date Time','TIMESTAMP','Date and Time'),
('image','Image','TEXT','Image Path'),
('file','File','TEXT','File Path'),
('descriptor','Face Descriptor','VECTOR(512)','Face Embedding'),
('enum','Dropdown','TEXT','Dropdown');