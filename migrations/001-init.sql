-- Up
CREATE TABLE parcels
(
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    file_id TEXT,
    shipment_type TEXT,
    shipment_locale TEXT,
    shipment_speed TEXT,
    attn_name TEXT,
    attn_phone TEXT,
    attn_organization TEXT,
    street_address TEXT,
    city TEXT,
    state_or_province TEXT,
    country TEXT,
    postal_code TEXT,
    us_value_of_goods TEXT,
    us_content_declaration TEXT,
    barcode TEXT,
    carrier_tracking_number TEXT,
    shipment_weight INT,
    shipment_length INT,
    shipment_width INT,
    shipment_height INT,
    shipping_method TEXT,
    shipment_status TEXT,
    creation_date TEXT,
    received_date TEXT
);

INSERT INTO parcels
    (user_id, street_address, attn_name,
    attn_organization, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "I SHOULD BE DELETED", "Iron Man", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebb");
INSERT INTO parcels
    (user_id, street_address, attn_name,
    attn_organization, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "123 Example Street", "Spiderman", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebc");

-- Down
DROP TABLE parcels;