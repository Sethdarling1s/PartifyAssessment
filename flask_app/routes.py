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


@bp.route("/api/makes")
def get_makes():
    """
    Return sorted makes for a given year.
    Query param: ?year=2015
    """
    year = request.args.get("year")
 
    if not year:
        return jsonify({"error": "Missing required query parameter: year"}), 400
 
    filtered = df[df["Year"] == year]
 
    if filtered.empty:
        return jsonify({"error": f"No data found for year '{year}'"}), 404

    makes = filtered["Make"].dropna().unique().tolist()
    return jsonify(sorted(makes))
 
 
@bp.route("/api/models")
def get_models():
    """
    Return sorted models for a given year and make.
    Query params: ?year=2015&make=RAM
    """
    year = request.args.get("year")
    make = request.args.get("make")
 
    if not year or not make:
        return jsonify({"error": "Missing required query parameters: year, make"}), 400
 
    filtered = df[(df["Year"] == year) & (df["Make"] == make)]
 
    if filtered.empty:
        return jsonify({"error": f"No data found for {year} {make}"}), 404
 
    models = filtered["Model"].dropna().unique().tolist()
    return jsonify(sorted(models))


@bp.route("/api/product-types")
def get_product_types():
    """
    Return sorted product types for a given year, make, and model.
    Query params: ?year=2015&make=RAM&model=1500
    """
    year  = request.args.get("year")
    make  = request.args.get("make")
    model = request.args.get("model")
 
    if not year or not make or not model:
        return jsonify({"error": "Missing required query parameters: year, make, model"}), 400
 
    filtered = df[
        (df["Year"]  == year)  &
        (df["Make"]  == make)  &
        (df["Model"] == model)
    ]
 
    if filtered.empty:
        return jsonify({"error": f"No data found for {year} {make} {model}"}), 404
 
    product_types = filtered["Product Type"].dropna().unique().tolist()
    return jsonify(sorted(product_types))

@bp.route("/api/url")
def get_url():
    """
    Look up and return the Partify collection URL for a given vehicle and
    optional product type. Year, make, and model are required. Product type
    is optional — omitting it returns the base collection URL without a filter.
 
    Query params: ?year=2015&make=RAM&model=1500&product_type=Front+Bumper
    """
    year         = request.args.get("year")
    make         = request.args.get("make")
    model        = request.args.get("model")
    product_type = request.args.get("product_type")  # Optional
 
    if not year or not make or not model:
        return jsonify({"error": "Missing required query parameters: year, make, model"}), 400
 
    filtered = df[
        (df["Year"]  == year)  &
        (df["Make"]  == make)  &
        (df["Model"] == model)
    ]
 
    if filtered.empty:
        return jsonify({"error": f"No data found for {year} {make} {model}"}), 404
 
    if product_type:
        # Match the specific product type row and return its URL directly.
        # Using the CSV's URL column ensures the URL always matches what
        # Partify expects, even if their format changes in the future.
        match = filtered[filtered["Product Type"] == product_type]
 
        if match.empty:
            return jsonify({"error": f"Product type '{product_type}' not found for {year} {make} {model}"}), 404
 
        url = match.iloc[0]["URL"]
    else:
        # No product type selected strip the query string from any row's URL
        # to get the base collection URL (e.g. /collections/2015-RAM-1500).
        url = filtered.iloc[0]["URL"].split("?")[0]
    url = url.replace(" ", "+")
    return jsonify({"url": url})


