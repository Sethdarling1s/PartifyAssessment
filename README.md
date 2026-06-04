# Partify Parts Finder

A vehicle parts search tool built for the Partify coding assessment. Users select their vehicle's year, make, model, and optionally a part type through cascading dropdowns, then get redirected to the matching product collection on [partifyusa.com](https://partifyusa.com).

## Tech Stack

- **Frontend** — HTML, CSS, JavaScript
- **Backend** — Python, Flask
- **Data** — pandas, CSV dataset
- **Containerization** — Docker
- **Hosting** — Google Cloud Run

## Project Structure

```
PartifyAssessment/
├── app.py                  # Entry point — creates Flask app via factory
├── Dockerfile              # Multi-stage build (development + production)
├── docker-compose.yml      # Local development setup
├── requirements.txt        # Python dependencies
├── data/
│   └── parts.csv           # Vehicle parts dataset
├── flask_app/
│   ├── __init__.py         # App factory and Blueprint registration
│   ├── routes.py           # All API and frontend routes
│   ├── static/
│   │   ├── favicon.ico
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── main.js
│   └── templates/
│       └── index.html
└── tests/
    ├── __init__.py
    └── test_routes.py      # pytest test suite for all API endpoints
```

## Running Locally with Docker

**Prerequisites:** Docker Desktop installed and running.

**1. Clone the repository**
```bash
git clone https://github.com/Sethdarling1s/PartifyAssessment
cd PartifyAssessment
```

**2. Start the development server**
```bash
docker compose up --build
```

**3. Open the app**

Navigate to [http://localhost:8080](http://localhost:8080) in your browser.

**4. Stop the server**
```bash
docker compose down
```

## Running Tests

With the container running, execute the test suite:
```bash
docker compose run web pytest tests/ -v
```

## How It Works

The frontend makes API calls to the Flask backend as the user moves through each dropdown. Each selection filters the dataset and populates the next dropdown with only valid options for that vehicle. On submit, the backend looks up the matching URL directly from the CSV and returns it to the frontend, which redirects the user to the Partify collection page.

API endpoints:
- `GET /api/years` — returns all available years
- `GET /api/makes?year=` — returns makes for a given year
- `GET /api/models?year=&make=` — returns models for a given year and make
- `GET /api/product-types?year=&make=&model=` — returns part types for a given vehicle
- `GET /api/url?year=&make=&model=&product_type=` — returns the Partify collection URL

## Expanding the Dataset

To add vehicles or parts, add rows to `data/parts.csv` following the existing format and redeploy. No code changes required.
