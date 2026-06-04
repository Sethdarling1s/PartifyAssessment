import pytest
from flask_app import create_app

@pytest.fixture()
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })

    # other setup can go here

    yield app

    # clean up / reset resources here


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()

# ── /api/years ────────────────────────────────────────────────────────────────
 
def test_get_years_status(client):
    """Years endpoint returns 200."""
    response = client.get("/api/years")
    assert response.status_code == 200
 
 
def test_get_years_returns_list(client):
    """Years endpoint returns a non-empty list."""
    response = client.get("/api/years")
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
 
 
def test_get_years_sorted_descending(client):
    """Years are returned in descending order (newest first)."""
    response = client.get("/api/years")
    data = response.get_json()
    assert data == sorted(data, reverse=True)

# ── /api/makes ────────────────────────────────────────────────────────────────
 
def test_get_makes_status(client):
    """Makes endpoint returns 200 for a valid year."""
    response = client.get("/api/makes?year=2015")
    assert response.status_code == 200
 
 
def test_get_makes_returns_list(client):
    """Makes endpoint returns a non-empty list for a valid year."""
    response = client.get("/api/makes?year=2015")
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
 
 
def test_get_makes_missing_year(client):
    """Makes endpoint returns 400 when year parameter is missing."""
    response = client.get("/api/makes")
    assert response.status_code == 400
 
 
def test_get_makes_invalid_year(client):
    """Makes endpoint returns 404 for a year not in the dataset."""
    response = client.get("/api/makes?year=1800")
    assert response.status_code == 404

# ── /api/models ───────────────────────────────────────────────────────────────
 
def test_get_models_status(client):
    """Models endpoint returns 200 for a valid year and make."""
    response = client.get("/api/models?year=2015&make=RAM")
    assert response.status_code == 200
 
 
def test_get_models_returns_list(client):
    """Models endpoint returns a non-empty list for a valid year and make."""
    response = client.get("/api/models?year=2015&make=RAM")
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
 
 
def test_get_models_missing_year(client):
    """Models endpoint returns 400 when year parameter is missing."""
    response = client.get("/api/models?make=RAM")
    assert response.status_code == 400
 
 
def test_get_models_missing_make(client):
    """Models endpoint returns 400 when make parameter is missing."""
    response = client.get("/api/models?year=2015")
    assert response.status_code == 400
 
 
def test_get_models_invalid_combination(client):
    """Models endpoint returns 404 for a year and make not in the dataset."""
    response = client.get("/api/models?year=2015&make=Zastava")
    assert response.status_code == 404

# ── /api/product-types ────────────────────────────────────────────────────────
 
def test_get_product_types_status(client):
    """Product types endpoint returns 200 for a valid year, make, and model."""
    response = client.get("/api/product-types?year=2015&make=RAM&model=1500")
    assert response.status_code == 200
 
 
def test_get_product_types_returns_list(client):
    """Product types endpoint returns a non-empty list for a valid combination."""
    response = client.get("/api/product-types?year=2015&make=RAM&model=1500")
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
 
 
def test_get_product_types_missing_year(client):
    """Product types endpoint returns 400 when year parameter is missing."""
    response = client.get("/api/product-types?make=RAM&model=1500")
    assert response.status_code == 400
 
 
def test_get_product_types_missing_make(client):
    """Product types endpoint returns 400 when make parameter is missing."""
    response = client.get("/api/product-types?year=2015&model=1500")
    assert response.status_code == 400
 
 
def test_get_product_types_missing_model(client):
    """Product types endpoint returns 400 when model parameter is missing."""
    response = client.get("/api/product-types?year=2015&make=RAM")
    assert response.status_code == 400
 
 
def test_get_product_types_invalid_combination(client):
    """Product types endpoint returns 404 for a combination not in the dataset."""
    response = client.get("/api/product-types?year=2015&make=RAM&model=Camry")
    assert response.status_code == 404

 


