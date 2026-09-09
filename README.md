# PricePilot AI



## Dynamic Pricing Optimization and Revenue Intelligence System



PricePilot AI is a dynamic pricing and revenue intelligence system designed to help businesses make data-driven pricing decisions. The system combines product information, competitor prices, demand forecasting, pricing prediction, profitability analysis, and revenue optimization through a web-based application.



## Key Features



\* Product management and product search

\* Competitor price monitoring

\* Dynamic pricing recommendations

\* Demand forecasting

\* Pricing prediction using machine learning

\* Profitability analysis

\* Revenue optimization

\* Analytics dashboard

\* User authentication and role-based access

\* SQLite database integration through SQLAlchemy



## Project Structure



```text

PricePilot-AI/

â”œâ”€â”€ backend/

â”‚   â”œâ”€â”€ app/

â”‚   â”‚   â”œâ”€â”€ api/

â”‚   â”‚   â”œâ”€â”€ core/

â”‚   â”‚   â”œâ”€â”€ data/

â”‚   â”‚   â”œâ”€â”€ db/

â”‚   â”‚   â”œâ”€â”€ ml/

â”‚   â”‚   â”œâ”€â”€ models/

â”‚   â”‚   â”œâ”€â”€ schemas/

â”‚   â”‚   â””â”€â”€ services/

â”‚   â”œâ”€â”€ main.py

â”‚   â””â”€â”€ requirements.txt

â”‚

â”œâ”€â”€ database/

â”‚   â”œâ”€â”€ schema.sql

â”‚   â”œâ”€â”€ seed.sql

â”‚   â””â”€â”€ README.md

â”‚

â”œâ”€â”€ frontend/

â”‚

â”œâ”€â”€ .gitignore

â”œâ”€â”€ LICENSE

â””â”€â”€ README.md

```



## Technologies Used



### Frontend



\* Next.js

\* React

\* TypeScript



### Backend



\* Python

\* FastAPI

\* SQLAlchemy

\* Pydantic



### Machine Learning and Data Processing



\* Scikit-learn

\* NumPy

\* Pandas

\* Joblib



### Database



\* SQLite

\* SQLAlchemy



## Database



The application currently uses SQLite with SQLAlchemy. The database is created and initialized through the backend.



The main database configuration is located at:



```text

backend/app/db/database.py

```



SQL schema and sample seed data are available in:



```text

database/

```



The generated SQLite database file is intentionally excluded from Git using `.gitignore`.



## Setup and Run



### 1. Clone the Repository



```bash

git clone https://github.com/Swarajpatil27/Dynamic-Pricing-Optimization-And-Revenue-Intelligence-System\_Swaraj-Patil.git

cd Dynamic-Pricing-Optimization-And-Revenue-Intelligence-System\_Swaraj-Patil

```



### 2. Backend Setup



Open a terminal in the `backend` directory:



```bash

cd backend

```



Create a virtual environment:



```bash

python -m venv venv

```



Activate it on Windows:



```bash

venv\\Scripts\\activate

```



Install the required packages:



```bash

pip install -r requirements.txt

```



Start the FastAPI backend:



```bash

uvicorn app.main:app --reload

```



The backend API will normally be available at:



```text

http://127.0.0.1:8000

```



FastAPI documentation:



```text

http://127.0.0.1:8000/docs

```



### 3. Frontend Setup



Open another terminal and move to the frontend directory:



```bash

cd frontend

```



Install the Node.js dependencies:



```bash

npm install

```



Start the development server:



```bash

npm run dev

```



The frontend will normally be available at:



```text

http://localhost:3000

```



## Application Flow



```text

User

&#x20; â†“

Frontend Dashboard

&#x20; â†“

FastAPI Backend

&#x20; â†“

Database / Machine Learning Services

&#x20; â†“

Pricing \& Revenue Analysis

&#x20; â†“

Recommendations and Analytics

```



## Notes



\* Do not commit `.env` files or other secrets.

\* The SQLite database file is excluded from Git.

\* Backend dependencies are listed in `backend/requirements.txt`.

\* Database schema and sample data are maintained separately in the `database` directory.



## Project Purpose



The goal of PricePilot AI is to provide businesses with an intelligent platform for analyzing market conditions and making informed pricing decisions while improving profitability and revenue.



## License



This project is licensed under the MIT License. See the `LICENSE` file for details.




