from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import spacy
import pickle
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
import csv
import datetime

app = FastAPI()

# Add CORS middleware to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow only your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Loading models
nlp = spacy.load("en_core_web_sm")
with open('aspect_classifier_logreg.pkl', 'rb') as model_file:
    aspect_classifier = pickle.load(model_file)

with open('tfidf_vectorizer.pkl', 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

with open('label_encoder.pkl', 'rb') as le_file:
    label_encoder = pickle.load(le_file)

sentiment_model = AutoModelForSequenceClassification.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english')
sentiment_tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english')
sentiment_analyzer = pipeline("sentiment-analysis", model=sentiment_model, tokenizer=sentiment_tokenizer)

# Aspect extraction class
class AspectExtractor:
    def __init__(self, model):
        self.nlp = model

    def extract_aspects(self, text):
        doc = self.nlp(text)
        aspects = []
        for token in doc:
            if token.dep_ == "nsubj" and token.pos_ in ["NOUN", "PROPN"]:
                aspect = token.text
                compounds = [child.text for child in token.children if child.dep_ == "compound"]
                if compounds:
                    aspect = " ".join(compounds + [aspect])
                aspects.append(aspect)
        return aspects

aspect_extractor = AspectExtractor(model=nlp)

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    try:
        # Read file contents
        contents = await file.read()
        decoded = contents.decode('utf-8')
        df = pd.read_csv(io.StringIO(decoded), on_bad_lines='skip')

        # Check if necessary columns are present
        required_columns = ["ReviewText"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing_columns)}")

        category_counts = {}
        sentiment_counts = {}

        review_texts = df["ReviewText"].dropna().astype(str).tolist()

        sentiments = []
        for review in review_texts:
            sentiment = sentiment_analyzer(review[:512])[0]['label'].lower()
            if sentiment not in ["positive", "negative"]:
                sentiment = "neutral"
            sentiments.append(sentiment)

        for review_text, review_sentiment in zip(review_texts, sentiments):
            extracted_aspects = aspect_extractor.extract_aspects(review_text)
            for aspect in extracted_aspects:
                aspect_vector = vectorizer.transform([aspect])
                category_encoded = int(aspect_classifier.predict(aspect_vector)[0])
                category_name = label_encoder.inverse_transform([category_encoded])[0]
                category_counts[category_name] = category_counts.get(category_name, 0) + 1

                if category_name not in sentiment_counts:
                    sentiment_counts[category_name] = {"positive": 0, "negative": 0, "neutral": 0}
                sentiment_counts[category_name][review_sentiment] += 1

        sentiment_summary = {}
        for category, sentiments in sentiment_counts.items():
            total = sum(sentiments.values())
            summary_parts = [
                f"{round((count / total) * 100)}% {label}"
                for label, count in sentiments.items() if count > 0
            ]
            sentiment_summary[category] = ", ".join(summary_parts)

        report_data = [["Category", "Count", "Sentiment", "Sentiment Breakdown"]]
        for category, count in category_counts.items():
            sentiment_info = sentiment_summary.get(category, "No sentiment data")
            report_data.append([category, count, sentiment_info])

        # Create CSV content for the report
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(report_data)
        output.seek(0)

        # Convert the CSV content to a Blob-like object
        report_blob = output.getvalue()

         # Generate dynamic report name based on file name or current date
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")
        file_name = file.filename if file.filename else "reviews"
        report_name = f"Review Sentiment Report - {file_name.split('.')[0]} - {current_date}"

        return JSONResponse(content={
            "name": report_name,
            "categoryCounts": category_counts,
            "sentimentSummary": sentiment_summary,
            "reportBlob": report_blob
        })

    except HTTPException as http_exc:
        raise http_exc  # This will automatically return the 400 error if any columns are missing
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
