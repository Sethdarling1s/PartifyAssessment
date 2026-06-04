from flask import Flask

def create_app():
    """Application factory: creates and configures the Flask app."""
    app = Flask(__name__, template_folder="templates", static_folder="static")

    from .routes import bp
    app.register_blueprint(bp)

    return app
