import os
import pandas as pd
from flask import Blueprint, jsonify, request, render_template
 
# ── Data loading ──────────────────────────────────────────────────────────────
 
# Build an absolute path to the CSV regardless of where Flask is invoked from.
# dirname() is called twice: once to get flask_app/, once to get the project root.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "parts.csv")
 
# Load once at startup — not on every request.
# strip() cleans any accidental whitespace in column names from the CSV.
df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()
df["Year"] = df["Year"].astype(str)

# A Blueprint namespaces this module's routes under a single registration point.
# All API routes are prefixed with /api via url_prefix in __init__.py.
bp = Blueprint("main", __name__)

@bp.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")

# ── API routes ────────────────────────────────────────────────────────────────
 
@bp.route("/api/years")
def get_years():
    """
    Return a sorted list of unique years from the dataset.
    Used to populate the Year dropdown on page load.
    """
    years = df['Year'].dropna().unique().tolist()
    return jsonify(sorted(years, reverse=True))

