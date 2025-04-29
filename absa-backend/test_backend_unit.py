import io
import pytest
import pandas as pd
import spacy
from fastapi.testclient import TestClient
from main import app, AspectExtractor, sentiment_analyzer  # Replace 'main' with your filename (without .py)

client = TestClient(app)

# ---------- Aspect Extraction Unit Test ----------
def test_extract_aspects_single_aspect():
    extractor = AspectExtractor(spacy.load("en_core_web_sm"))
    text = "The camera quality is excellent."
    aspects = extractor.extract_aspects(text)
    assert isinstance(aspects, list)
    assert "camera" in aspects or any("camera" in a for a in aspects)

# ---------- Sentiment Analysis Unit Test ----------
def test_sentiment_analysis_positive():
    result = sentiment_analyzer("I love this phone!")[0]
    assert result['label'].lower() == "positive"

# ---------- Missing ReviewText Column ----------
def test_upload_csv_missing_reviewtext():
    data = pd.DataFrame({"OtherColumn": ["Missing review"]})
    csv_io = io.StringIO()
    data.to_csv(csv_io, index=False)
    csv_io.seek(0)

    response = client.post(
        "/upload-csv/",
        files={"file": ("test_missing.csv", csv_io.getvalue(), "text/csv")}
    )
    assert response.status_code == 400
    assert "Missing columns" in response.json()["detail"]

# ---------- Successful CSV Upload ----------
def test_upload_csv_success():
    data = pd.DataFrame({"ReviewText": ["The battery life is amazing."]})
    csv_io = io.StringIO()
    data.to_csv(csv_io, index=False)
    csv_io.seek(0)

    response = client.post(
        "/upload-csv/",
        files={"file": ("test_success.csv", csv_io.getvalue(), "text/csv")}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "categoryCounts" in json_data
    assert "sentimentSummary" in json_data
    assert "reportBlob" in json_data

# ---------- Force Internal Server Error ----------
def test_upload_csv_internal_error():
    broken_csv_content = "not,a,real,csv\nwithout,reviewtext,header\n"
    response = client.post(
        "/upload-csv/",
        files={"file": ("test_broken.csv", broken_csv_content, "text/csv")}
    )
    assert response.status_code == 500
    assert "Error processing file" in response.json()["detail"]
