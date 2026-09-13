# PricePilot AI

## Dynamic Pricing Optimization and Revenue Intelligence System

PricePilot AI is an AI-powered dynamic pricing and revenue intelligence system designed to help businesses make data-driven pricing decisions.

The system combines product information, competitor pricing, demand forecasting, machine learning, profitability analysis, and revenue optimization through a web-based application.

---

## Key Features

- Product management and product search
- Competitor price monitoring
- Dynamic pricing recommendations
- AI-based price prediction
- Demand forecasting
- Profitability analysis
- Revenue optimization
- Analytics dashboard
- User authentication
- Role-based access
- SQLite database integration
- Machine learning model integration

---

## Project Structure

```text
PricePilot-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── competitors.py
│   │   │   ├── forecast.py
│   │   │   ├── pricing.py
│   │   │   ├── products.py
│   │   │   ├── profitability.py
│   │   │   └── revenue_optimization.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── data/
│   │   │   └── initial_products.csv
│   │   │
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── init_db.py
│   │   │   └── seed_products.py
│   │   │
│   │   ├── ml/
│   │   │   └── saved_models/
│   │   │       ├── demand_model.joblib
│   │   │       ├── demand_model.pkl
│   │   │       └── pricing_optimizer.pkl
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── pricepilot.db
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── frontend/
│
├── .gitignore
├── LICENSE
└── README.md
```

> The main application entry point is `backend/app/main.py`.
>
> The runtime SQLite database is located at `backend/pricepilot.db`.

---

## Technologies Used

### Frontend

- Next.js
- React
- TypeScript
- HTML
- CSS
- JavaScript

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

### Machine Learning and Data Processing

- Scikit-learn
- Random Forest Regressor
- NumPy
- Pandas
- Joblib

### Database

- SQLite
- SQLAlchemy ORM

### Authentication and Security

- JWT authentication
- Password hashing
- Role-based access control

---

## System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Frontend Dashboard  │
                    │     Next.js/React    │
                    └──────────┬──────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Database  │   │     ML     │   │  Business  │
       │   SQLite   │   │   Models   │   │   Logic    │
       └────────────┘   └────────────┘   └────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Pricing & Revenue   │
                    │    Optimization      │
                    └─────────────────────┘
```

---

## AI Pricing Optimization

PricePilot AI uses machine learning and pricing logic to recommend suitable product prices.

The pricing process considers:

- Cost price
- Current selling price
- Competitor price
- Product category
- Expected demand
- Profit margin
- Stock level
- Market pricing conditions

The system evaluates multiple candidate prices and estimates expected demand and profit for each candidate.

The price providing the best expected business outcome is selected as the AI-recommended price.

---

## Demand Forecasting

The demand forecasting module uses a trained machine learning model to estimate expected product demand.

The current model considers features such as:

- Product category
- Forecast horizon
- Selling price
- Competitor price
- Price ratio
- Seasonal multiplier
- Promotion information

The project currently uses a Random Forest regression model for demand prediction.

---

## Competitor Intelligence

The competitor intelligence module provides competitor-price information that can be used as a market benchmark.

This helps determine whether the current product price is:

- Below the competitor benchmark
- Close to the competitor benchmark
- Above the competitor benchmark

Competitor pricing is then considered during price optimization.

---

## Profitability Analysis

The profitability module helps analyze the financial impact of pricing decisions.

It considers:

- Cost price
- Selling price
- Recommended price
- Expected demand
- Unit profit
- Profit margin

This allows users to compare the expected profitability of different pricing decisions.

---

## Revenue Optimization

The revenue optimization module combines pricing and demand information to support better revenue and profit decisions.

The system aims to identify pricing strategies that balance:

- Customer demand
- Competitor pricing
- Product margins
- Inventory conditions
- Expected revenue
- Expected profit

---

## Product Management

The product catalog allows users to:

- Add products
- Edit products
- Search products
- View products
- Manage categories
- Set selling prices
- Set cost prices
- Track competitor prices
- Track stock levels

Products are stored in the application's SQLite database.

---

## Authentication

PricePilot AI includes authentication functionality for application users.

The authentication system supports:

- User registration
- User login
- Password security
- JWT-based authentication
- User roles
- Protected application functionality

---

## Database

The application currently uses SQLite with SQLAlchemy ORM.

The runtime database is located at:

```text
backend/pricepilot.db
```

The database configuration is located at:

```text
backend/app/db/database.py
```

Database initialization is handled by:

```text
backend/app/db/init_db.py
```

Product seeding functionality is available through:

```text
backend/app/db/seed_products.py
```

SQL schema and supporting database files are maintained separately in:

```text
database/
├── schema.sql
├── seed.sql
└── README.md
```

The SQLite database file is intentionally excluded from Git using `.gitignore`.

---

## Machine Learning Models

The trained model artifacts are stored in:

```text
backend/app/ml/saved_models/
```

Available model files include:

```text
demand_model.joblib
demand_model.pkl
pricing_optimizer.pkl
```

The demand model is used by the pricing optimization workflow to estimate expected demand for different candidate prices.

> The current machine learning prototype uses synthetic training data. Real historical sales, pricing, promotion, and market data would be required for production-level model validation.

---

## Backend API

The backend is developed using FastAPI.

The backend runs by default at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

The backend contains API modules for:

```text
Authentication
Products
Pricing
Analytics
Competitor Intelligence
Demand Forecasting
Profitability
Revenue Optimization
```

---

## Frontend Dashboard

The frontend is developed using Next.js and React.

The dashboard provides access to major system functionality including:

- Pricing Prediction
- Demand Forecast
- Competitor Analysis
- Profitability Analysis
- Revenue Optimization
- Product Catalog
- Product Search
- Analytics

The frontend communicates with the FastAPI backend through REST APIs.

The frontend runs by default at:

```text
http://localhost:3000
```

---

# Setup and Run

## 1. Clone the Repository

Clone the repository:

```bash
git clone https://github.com/Swarajpatil27/Dynamic-Pricing-Optimization-And-Revenue-Intelligence-System_Swaraj-Patil.git
```

Move into the project directory:

```bash
cd Dynamic-Pricing-Optimization-And-Revenue-Intelligence-System_Swaraj-Patil
```

---

## 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

### Windows

Activate the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required dependencies:

```powershell
python -m pip install -r requirements.txt
```

---

## 3. Initialize the Database

From the `backend` directory, run:

```powershell
python -m app.db.init_db
```

The database initialization process creates the required database tables.

If products already exist in the database, product seeding is skipped so that existing catalog data is not unnecessarily replaced.

---

## 4. Start the Backend

From the `backend` directory, start the FastAPI server:

```powershell
python -m uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Open the interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 5. Frontend Setup

Open another terminal.

Move to the frontend directory:

```powershell
cd frontend
```

Install the Node.js dependencies:

```powershell
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# Application Flow

```text
User
  │
  ▼
Frontend Dashboard
  │
  ▼
FastAPI REST APIs
  │
  ├──────────────► Product Database
  │
  ├──────────────► Competitor Data
  │
  ├──────────────► Demand Forecasting
  │
  └──────────────► Pricing Optimization
                         │
                         ▼
                 Candidate Price Analysis
                         │
                         ▼
                 Expected Demand & Profit
                         │
                         ▼
                  AI Price Recommendation
                         │
                         ▼
                  Dashboard & Analytics
```

---

# Project Workflow

The main pricing workflow is:

```text
Product Information
        │
        ▼
Current Price + Cost + Competitor Price
        │
        ▼
Demand Prediction
        │
        ▼
Generate Candidate Prices
        │
        ▼
Predict Demand for Each Price
        │
        ▼
Calculate Expected Profit
        │
        ▼
Select Recommended Price
        │
        ▼
Display Pricing Recommendation
```

---

# Development Status

PricePilot AI is an active development project.

Current functionality includes:

- Product catalog management
- Product search
- User authentication
- Demand forecasting
- AI pricing prediction
- Competitor price analysis
- Profitability analysis
- Revenue optimization
- Machine learning integration
- FastAPI backend
- Next.js frontend
- SQLite database

---

# Important Notes

- The runtime SQLite database is located at `backend/pricepilot.db`.
- The SQLite database file is excluded from Git.
- Do not commit `.env` files, passwords, API keys, or other secrets.
- Backend dependencies are listed in `backend/requirements.txt`.
- Database schema and supporting SQL files are maintained in the `database` directory.
- The current machine learning model is a prototype trained using synthetic data.
- Real historical business data should be used for production-level model evaluation.
- Pricing recommendations are decision-support outputs and do not guarantee future sales or profit.

---

# Future Improvements

Potential future enhancements include:

- Integration with real-time e-commerce data
- Integration with real competitor-price sources
- Training using historical sales data
- Advanced demand forecasting
- Time-series forecasting
- Customer segmentation
- Promotion optimization
- Automated price updates
- Advanced analytics
- Cloud database deployment
- Model monitoring and retraining
- A/B testing of pricing strategies

---

# Project Goal

The goal of PricePilot AI is to provide businesses with an intelligent platform for analyzing market conditions, forecasting demand, optimizing prices, and making informed pricing decisions while improving profitability and revenue.

---

# License

This project is licensed under the MIT License.

See the `LICENSE` file for details.