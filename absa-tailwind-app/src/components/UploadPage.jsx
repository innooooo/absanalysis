import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const categoryLabelMap = {
  'battery': 'Battery',
  'design': 'Design',
  'camera': 'Camera',
  'connectivity': 'Connectivity',
  'screen': 'Screen',
  'performance': 'Performance',
  'price': 'Price',
  'storage': 'Storage',
  'software': 'Software',
  'support': 'Support',
  'misc': 'Miscellaneous',
};

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [sentimentSummary, setSentimentSummary] = useState({});
  const [reportReady, setReportReady] = useState(false); // Track if the report is ready
  const [reportBlob, setReportBlob] = useState(null); // Store the report blob for download

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setCategoryCounts({});
    setSentimentSummary({});
    setReportReady(false); // Reset when a new file is selected
    setReportBlob(null); // Reset report blob
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a CSV file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setUploading(true);
      const response = await fetch("http://localhost:8000/upload-csv/", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        setCategoryCounts(data.categoryCounts);
        setSentimentSummary(data.sentimentSummary);
        
        // Create Blob from report string
        const reportBlob = new Blob([data.reportBlob], { type: "text/csv" });
        setReportBlob(reportBlob); // Store the Blob for later download
        
        setMessage("File uploaded and analysis complete!");
        setReportReady(true); // Set report ready after successful upload and analysis
      } else {
        const errorData = await response.json();
        console.error("Error response from server:", errorData); // Log error details
        setMessage(`Error: ${errorData.detail || "An error occurred during upload."}`);
      }
    } catch (error) {
      console.error("Error during upload:", error); // Log full error details
      setMessage("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownloadReport = () => {
    if (reportBlob) {
      const downloadUrl = URL.createObjectURL(reportBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "analysis_report.csv";
      a.click();
    } else {
      setMessage("Report not available yet.");
    }
  };

  return (
    <div className="my-8 mx-8">
      <div className="my-8 font-bold text-5xl">Upload Reviews</div>
      <p className="text-lg mb-8">
        Select a CSV file to upload your product reviews for analysis. Ensure the file is formatted correctly.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg flex flex-col space-y-4">
  <label htmlFor="file-upload" className="font-medium text-gray-700">
    Upload CSV File:
  </label>
  <input 
    id="file-upload"
    type="file" 
    accept=".csv" 
    onChange={handleFileChange} 
    className="file-input file-input-bordered w-full p-2 border rounded"
  />
  <button 
    type="submit"
    disabled={uploading}
    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center space-x-2"
  >
    {uploading ? (
      <>
        <span>Uploading...</span>
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </>
    ) : "Submit"}
  </button>
  {message && (
    <p className="text-center text-sm text-gray-600">{message}</p>
  )}
</form>


      {/* Display the charts after the file is uploaded and processed */}
      {Object.keys(categoryCounts).length > 0 && reportReady && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Aspect Category Frequency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(categoryCounts).map(([id, value]) => ({ name: categoryLabelMap[id], value }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#60a5fa" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>

          {/* Display the sentiment summary after the chart */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Sentiment Summary by Category</h2>
            <ul className="space-y-2">
              {Object.entries(sentimentSummary).map(([catId, summary]) => (
                <li key={catId} className="text-gray-700">
                  <strong>{categoryLabelMap[catId] || catId}:</strong> {summary}
                </li>
              ))}
            </ul>
          </div>

          {/* Display the download button after the report is ready */}
          <button
            onClick={handleDownloadReport}
            className="mt-8 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            Download Report
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
