FROM python:3.12-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Development ---
FROM base AS development
COPY . .
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]

# --- Production ---
FROM base AS production
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
CMD ["gunicorn", "wsgi:app", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120"]
