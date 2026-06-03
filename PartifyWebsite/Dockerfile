# ── Base image ────────────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM python:3.10-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

# Copy project files
COPY . .

# ── Production ────────────────────────────────────────────────────────────────
FROM builder AS production

ENV FLASK_ENV=production

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "3", "--timeout", "60", "flask_app.app:app"]

# ── Development ───────────────────────────────────────────────────────────────
FROM builder AS development

ENV FLASK_ENV=development

EXPOSE 8080

CMD ["python3", "-m", "flask", "--app", "app:app", "run", "--host=0.0.0.0", "--port=8080", "--debug"]