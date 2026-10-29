FaultLine — Commerce Business Application
About the Project

FaultLine Commerce is a Django-based commerce application developed for the Code Clash 2026 individual debugging challenge. It simulates the backend and customer-facing workflows of an online shopping platform, allowing participants to investigate defects, understand business logic, and implement reliable fixes while preserving existing functionality.

This repository uses Django and Django REST Framework (DRF). It is a separate track from the Express.js and FastAPI versions of the challenge.

Key Features
Product Management: Browse products and manage product prices, stock, and validation rules.
Shopping Cart: Add products, update quantities, remove items, and maintain cart consistency.
Coupon System: Apply percentage-based or fixed-value discounts with date restrictions, minimum spend requirements, and usage limits.
Order Management: Create complete orders with price snapshots, validate checkout operations, and handle cancellations.
Inventory Management: Validate available stock during checkout and restore inventory correctly after eligible cancellations.
Simulated Payments: Validate payment references and amounts, confirm simulated payments, and process refunds.
Customer Accounts: Support customer sign-in, order history, and customer-specific order access.
Django Admin Panel: Manage products, coupons, carts, orders, payments, and audit history through the protected admin interface.
REST API: Expose commerce functionality through Django REST Framework endpoints.
Audit Logs: Record important business operations for tracking and debugging.
Automated Testing: Use public tests and additional regression tests to verify business rules and prevent unintended changes.
Technology Stack
Python 3.10+
Django
Django REST Framework
SQLite or the configured project database
pytest
pip and Python virtual environments

The project dependencies are documented in requirements.txt, with tested dependency versions provided in requirements.lock.

Application Interfaces
Interface	Path	Purpose
Customer Shop	/shop/	Browse products, sign in, manage carts, apply coupons, and view orders
Django Admin	/admin/	Manage commerce records and review audit history
REST API	/api/	Access commerce endpoints
Health Check	/api/health/	Check application health
Setup and Installation
Prerequisites

Install Python 3.10 and ensure the Python launcher (py) is available on Windows. On macOS or Linux, use python3.10.

1. Create a virtual environment

Windows PowerShell

powershell
py -3.10 -m venv .venv


macOS/Linux

bash
python3.10 -m venv .venv

2. Install dependencies

Windows PowerShell

powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt


macOS/Linux

bash
.venv/bin/python -m pip install -r requirements.txt

3. Configure environment variables

Windows PowerShell

powershell
Copy-Item .env.example .env


macOS/Linux

bash
cp .env.example .env


Configure local environment settings as required. Never commit .env, credentials, or local database files.

4. Apply database migrations

Windows PowerShell

powershell
.\.venv\Scripts\python.exe manage.py migrate


macOS/Linux

bash
.venv/bin/python manage.py migrate

5. Seed demo data
bash
python manage.py seed_demo


Use the appropriate virtual-environment Python executable for your operating system. The seed command creates demo products, coupons, and customers when they do not already exist.

Demo customer accounts:

Customer A: a@test.invalid
Customer B: b@test.invalid

The documented demo passwords are password_a and password_b. Use these accounts only in the local development environment.

6. Run Django system checks
bash
python manage.py check

7. Run the automated tests
bash
python -m pytest tests/ -q


For the exact challenge setup, run these commands using the virtual-environment Python executable rather than a system-wide Python installation.

8. Create an administrator
bash
python manage.py createsuperuser


Follow the prompts to create a local Django administrator account.

9. Start the development server
bash
python manage.py runserver 127.0.0.1:8000


Open the following URLs in your browser:

Customer shop: http://127.0.0.1:8000/shop/
Django admin: http://127.0.0.1:8000/admin/
API health check: http://127.0.0.1:8000/api/health/

Stop the development server with Ctrl+C.

Business Workflow

Browse Products → Sign In → Add to Cart → Apply Coupon → Checkout → Create Order → Confirm Simulated Payment → View Order History

Eligible cancellations and refunds follow the application's payment, inventory, and reference-validation rules.

Business Rules and Validation

The application must preserve the following business invariants:

Money is represented as integer paise in the API and database, while customer-facing pages display rupees.
Product prices, stock quantities, and cart quantities must satisfy the documented validation rules.
Adding the same product repeatedly increases its quantity in the existing cart.
Checkout validates current inventory and either creates a complete order with price snapshots and clears the cart or makes no changes.
Coupons must respect their discount type, validity dates, minimum spend, and usage limits.
Cancellation must respect payment state and restore inventory no more than once.
Simulated payment confirmations and refunds must validate references and amounts.
Customers must not be able to access another customer's orders.
Staff operations must enforce the required permissions and CSRF protections.

Refer to CHALLENGE_SPEC.md for the exact routes, request fields, response formats, status codes, and admin behavior.

Automated Testing and Debugging

The challenge requires participants to investigate defects in the supplied application and implement fixes without breaking working behavior.

Recommended debugging process:

Read `CHALLENGE
