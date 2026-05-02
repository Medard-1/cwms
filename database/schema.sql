-- Run this in psql or pgAdmin after creating the 'cwms' database
-- psql -U postgres -d cwms -f schema.sql

CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    guardian VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    child_id INT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    case_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_records (
    id SERIAL PRIMARY KEY,
    child_id INT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    condition_name VARCHAR(100) NOT NULL,
    treatment TEXT,
    visit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_records (
    id SERIAL PRIMARY KEY,
    child_id INT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    school_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    performance VARCHAR(50),
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    child_id INT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
