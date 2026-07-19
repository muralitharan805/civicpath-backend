-- Automatically load and register extensions upon default database initialization
CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
