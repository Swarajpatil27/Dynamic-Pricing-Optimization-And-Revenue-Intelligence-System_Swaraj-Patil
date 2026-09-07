# PricePilot AI - Database

This directory contains the database schema, sample seed data, and documentation for the PricePilot AI system.

## Database Technology

PricePilot AI currently uses:

- SQLite
- SQLAlchemy
- FastAPI backend

The application database is named:

`pricepilot.db`

The database connection is configured in:

`pricepilot-backend/app/db/database.py`

## Directory Structure

```text
database/
├── schema.sql
├── seed.sql
└── README.md