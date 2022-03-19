from io import StringIO
from urllib.parse import urlencode

import pandas as pd
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth
from flask import Flask, abort, jsonify, render_template, request

import settings

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/query", methods=["POST"])
def query():
    query = request.json["query"]

    auth = AWSRequestsAuth(
        aws_access_key=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        aws_host=f"{settings.AWS_NEPTUNE_HOST}:{settings.AWS_NEPTUNE_PORT}",
        aws_region=settings.AWS_REGION,
        aws_service="neptune-db",
    )

    request_params = {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Connection": "close",
            "Accept": "text/csv",
        },
        "data": urlencode({"query": query}),
        "timeout": settings.AWS_NEPTUNE_QUERY_TIMEOUT,
    }
    response = requests.post(
        f"https://{settings.AWS_NEPTUNE_HOST}:{settings.AWS_NEPTUNE_PORT}/sparql",
        **request_params,
        auth=auth,
    )
    try:
        response.raise_for_status()
    except Exception:
        abort(500, description=response.json())

    df = pd.read_csv(StringIO(response.text))
    df.index = df.index + 1  # to begin with index 1

    return df.to_html()


@app.errorhandler(500)
def error(e):
    return jsonify({"error": {"status": 500, "message": e.description}}), 500
