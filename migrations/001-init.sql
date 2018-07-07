-- Up
CREATE TABLE parcels
(
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    street_address TEXT,
    recipient_name TEXT,
    recipient_first_name TEXT,
    recipient_last_name TEXT,
    organization_name TEXT,
    city TEXT,
    state_or_province TEXT,
    country TEXT,
    postal_code TEXT,
    barcode TEXT,
    post_tracking_number TEXT,
    parcel_weight INT,
    parcel_length INT,
    parcel_width INT,
    parcel_height INT,
    shipping_method TEXT,
    parcel_status TEXT,
    creation_date TEXT,
    received_date TEXT
);

INSERT INTO parcels
    (user_id, street_address, recipient_name,
    organization_name, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "123 Example Street", "Spiderman", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebc");
INSERT INTO parcels
    (user_id, street_address, recipient_name,
    organization_name, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "123 Example Street", "Iron Man", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebc");

-- Down
DROP TABLE parcels;