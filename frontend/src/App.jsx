import { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [jobDesc, setJobDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const submit = async () => {
    if (!jobDesc || files.length === 0) {
      setError("Job description and resumes are required");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("job_description", jobDesc);
    for (let file of files) {
      formData.append("resumes", file);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/rank", formData);
      setResults(res.data.results);
    } catch {
      setError("Backend not running or CORS issue");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white/90 backdrop-blur-sm shadow-xl max-w-2xl w-full rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
            Resume Ranking
          </h1>
          <p className="text-sm sm:text-base text-center text-gray-600 mb-6 sm:mb-8">
            Upload Your resumes and job description to get your score.
          </p>

          
          <label className="block font-semibold mb-2 text-sm sm:text-base text-orange-600">Upload Resumes</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 sm:p-10 md:p-12 mb-4 sm:mb-6 text-center cursor-pointer transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <p className="text-sm sm:text-base text-blue-600 font-medium mb-1">
                Drop your resumes here or click to browse
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">Supports: PDF, DOCX formats</p>
              {files.length > 0 && (
                <p className="text-sm sm:text-base text-green-600 font-medium mt-2">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Job Description Section */}
          <label className="block font-semibold mb-2 text-sm sm:text-base text-gray-800">Job Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 mb-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            rows="6"
            maxLength={5000}
            placeholder="Paste the complete job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
          <div className="text-right text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            {jobDesc.length} / 5000
          </div>

          {/* Analyze & Rank Button */}
          <button
            onClick={submit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:from-purple-600 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze & Rank"}
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-3 text-center">{error}</p>
          )}

          {results.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3">Results</h2>
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-50 border rounded-md p-2.5 sm:p-3 mb-2 text-sm sm:text-base"
                >
                  <span className="truncate mr-2">{i + 1}. {r.name}</span>
                  <span
                    className={`font-bold whitespace-nowrap ${
                      r.score > 0.75
                        ? "text-green-600"
                        : r.score > 0.5
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {(r.score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}