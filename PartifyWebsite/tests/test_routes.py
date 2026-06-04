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
