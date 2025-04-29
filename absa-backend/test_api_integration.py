import io
import pandas as pd
from fastapi.testclient import TestClient
from main import app
  # Adjust if your file path is different

client = TestClient(app)

def test_upload_csv_valid():
    # Create a dummy DataFrame
    data = pd.DataFrame({
        "ReviewText": [
            "I love the battery life of this phone.",
            "The screen resolution is terrible.",
            "Camera quality is good but the battery drains fast."
        ]
    })
    
    # Save the DataFrame to a CSV in memory
    csv_bytes = io.StringIO()
    data.to_csv(csv_bytes, index=False)
    csv_bytes.seek(0)

    # Send the CSV as a file upload
    response = client.post(
        "/upload-csv/",
        files={"file": ("test_reviews.csv", csv_bytes.getvalue(), "text/csv")},
    )

    assert response.status_code == 200
    response_json = response.json()

    # Check that keys exist
    assert "categoryCounts" in response_json
    assert "sentimentSummary" in response_json
    assert "reportBlob" in response_json

def test_upload_csv_missing_column():
    data = pd.DataFrame({
        "SomeOtherColumn": ["Test review"]
    })
    csv_bytes = io.StringIO()
    data.to_csv(csv_bytes, index=False)
    csv_bytes.seek(0)

    response = client.post(
        "/upload-csv/",
        files={"file": ("test_invalid.csv", csv_bytes.getvalue(), "text/csv")},
    )

    assert response.status_code == 400
    assert "ReviewText" in response.json()["detail"]
