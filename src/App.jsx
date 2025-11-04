import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle, FileCheck2, Sparkles, Table } from 'lucide-react';
import TableDisplay from './components/TableDisplay';

import AnalysisDashboard from './components/AnalysisDashboard';

// API Configuration - Change this one URL for localhost or production
// const API_BASE_URL = 'http://localhost:8000';  // For localhost development
const API_BASE_URL = 'https://apeiropdfanalyzerbe.onrender.com';  // For production deployment

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileId, setFileId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractError, setExtractError] = useState('');
  const [contradictions, setContradictions] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [contradictionsAnalyzed, setContradictionsAnalyzed] = useState(false);
  const [gapsAnalyzed, setGapsAnalyzed] = useState(false);
  const [analyzingContradictions, setAnalyzingContradictions] = useState(false);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [activeFilter, setActiveFilter] = useState('tables'); // 'tables', 'contradictions', 'gaps', or null for all

  const handleDetectContradictions = async () => {
    console.log('🔍 Detect Contradictions button clicked');
    console.log('📊 Extracted Data:', extractedData);
    console.log('📋 Tables:', extractedData?.tables);

    setAnalyzingContradictions(true);
    try {
      console.log('🚀 Sending request to /analyze/contradictions');
      const response = await fetch(`${API_BASE_URL}/analyze/contradictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: extractedData.tables,
          document_context: extractedData.document_context || ''
        })
      });
      console.log('📡 Response received:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        console.log('✅ Contradictions found:', data.contradictions.length);
        setContradictions(data.contradictions);
        setContradictionsAnalyzed(true);
        setActiveFilter('contradictions'); // Auto-switch to contradictions view
      } else {
        console.error('❌ Analysis failed:', data.error);
        alert('Failed to detect contradictions: ' + data.error);
      }
    } catch (error) {
      console.error('💥 Error:', error);
      alert('Error detecting contradictions: ' + error.message);
    } finally {
      setAnalyzingContradictions(false);
    }
  };

  const handleFindGaps = async () => {
    setAnalyzingGaps(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analyze/gaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tables: extractedData.tables,
          document_context: extractedData.document_context || ''
        })
      });
      const data = await response.json();
      if (data.success) {
        setGaps(data.gaps);
        setGapsAnalyzed(true);
        setActiveFilter('gaps'); // Auto-switch to gaps view
      } else {
        alert('Failed to find gaps: ' + data.error);
      }
    } catch (error) {
      alert('Error finding gaps: ' + error.message);
    }
    setAnalyzingGaps(false);
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadError('');
      } else {
        setUploadError('Please select a PDF file');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadError('');
      } else {
        setUploadError('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    setExtractError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadSuccess(true);
        setFileId(data.file_id);

        // Automatically extract tables after successful upload
        await extractTables(data.file_id);
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const extractTables = async (fileIdToExtract) => {
    setExtracting(true);
    setExtractError('');

    try {
      const response = await fetch(`${API_BASE_URL}/extract?file_id=${fileIdToExtract}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setExtractedData(data);
      } else {
        setExtractError(data.error || data.detail || 'Extraction failed');
      }
    } catch (error) {
      setExtractError('Error extracting tables: ' + error.message);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 px-3 sm:py-12 sm:px-4 lg:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <FileCheck2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6 tracking-tight px-2">
            Health Policy AI
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium px-4">
            AI-powered document analysis to extract tables and detect contradictions & gaps
          </p>
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 flex-wrap px-2">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-indigo-100 text-indigo-700 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Table </span>Extraction
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-100 text-purple-700 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Contradiction </span>Detection
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-pink-100 text-pink-700 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Gap </span>Analysis
            </span>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden transform hover:shadow-3xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">
                  Upload PDF Document
                </h2>
                <p className="text-indigo-100 text-xs sm:text-sm lg:text-base mt-1 sm:mt-2">
                  PDF • Max 50MB
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-12">

            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 sm:border-3 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-20 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-[1.01] shadow-xl'
                  : 'border-gray-300 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl">
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 px-2">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 lg:mb-8 px-2">
                    or click below to browse from your device
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-xl sm:rounded-2xl cursor-pointer hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 font-bold text-base sm:text-lg lg:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    Browse Files
                  </label>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate max-w-full mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 font-semibold">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadSuccess(false);
                      setUploadError('');
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {selectedFile && !uploadSuccess && (
              <div className="mt-6 sm:mt-8 lg:mt-10">
                <button
                  onClick={handleUpload}
                  disabled={uploading || extracting}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                >
                  {uploading || extracting ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-spin" />
                      <span>{uploading ? 'Uploading...' : 'Extracting Tables...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                      <span>Upload and Analyze</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 sm:border-3 border-green-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-9 lg:h-9 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-green-900 text-base sm:text-xl lg:text-2xl mb-1 sm:mb-2">
                      Upload Successful!
                    </p>
                    <p className="text-sm sm:text-base text-green-700 mb-3 sm:mb-4 font-medium">
                      Your PDF has been uploaded and is ready for processing.
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-2 sm:px-5 sm:py-3 inline-block shadow-md border border-green-200">
                      <p className="text-xs sm:text-sm font-mono text-gray-700 break-all">
                        File ID: <span className="font-bold text-green-700">{fileId}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 sm:border-3 border-red-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-9 lg:h-9 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-red-900 text-base sm:text-xl lg:text-2xl mb-1 sm:mb-2">Upload Failed</p>
                    <p className="text-sm sm:text-base text-red-700 font-medium break-words">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Error Message */}
            {extractError && (
              <div className="mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 sm:border-3 border-orange-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-9 lg:h-9 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-orange-900 text-base sm:text-xl lg:text-2xl mb-1 sm:mb-2">Extraction Failed</p>
                    <p className="text-sm sm:text-base text-orange-700 font-medium break-words">{extractError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracting Progress */}
            {extracting && (
              <div className="mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 sm:border-3 border-blue-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-9 lg:h-9 text-white animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-blue-900 text-base sm:text-xl lg:text-2xl mb-1 sm:mb-2">Extracting Tables...</p>
                    <p className="text-sm sm:text-base text-blue-700 font-medium">
                      Analyzing PDF structure and extracting table data. This may take a moment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display Extraction Summary */}
        {extractedData && !extracting && (
          <TableDisplay extractedData={extractedData} showTables={false} />
        )}

        {/* Filter Buttons */}
        {extractedData && !extracting && (
          <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3 lg:gap-4 justify-center flex-wrap px-2">
            {/* Tables Button */}
            <button
              onClick={() => setActiveFilter('tables')}
              className={`px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 transition-all font-bold text-sm sm:text-base lg:text-lg shadow-lg ${
                activeFilter === 'tables'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white ring-2 sm:ring-4 ring-blue-300 scale-105'
                  : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-500 hover:shadow-xl'
              }`}
            >
              <Table className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tables</span>
            </button>

            {/* Contradictions Button */}
            <button
              onClick={() => {
                if (contradictionsAnalyzed) {
                  setActiveFilter('contradictions');
                } else {
                  handleDetectContradictions();
                }
              }}
              disabled={analyzingContradictions}
              className={`px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 transition-all font-bold text-sm sm:text-base lg:text-lg shadow-lg ${
                contradictionsAnalyzed
                  ? activeFilter === 'contradictions'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white ring-2 sm:ring-4 ring-red-300 scale-105'
                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
                  : analyzingContradictions
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
              }`}
            >
              {analyzingContradictions ? (
                <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> <span className="hidden xs:inline">Analyzing...</span><span className="xs:hidden">...</span></>
              ) : contradictionsAnalyzed ? (
                <><span className="hidden sm:inline">✓ Contradictions</span><span className="sm:hidden">✓ Contra.</span> {contradictions.length > 0 && `(${contradictions.length})`}</>
              ) : (
                <><span className="hidden sm:inline">Find Contradictions</span><span className="sm:hidden">Contradictions</span></>
              )}
            </button>

            {/* Gaps Button */}
            <button
              onClick={() => {
                if (gapsAnalyzed) {
                  setActiveFilter('gaps');
                } else {
                  handleFindGaps();
                }
              }}
              disabled={analyzingGaps}
              className={`px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 transition-all font-bold text-sm sm:text-base lg:text-lg shadow-lg ${
                gapsAnalyzed
                  ? activeFilter === 'gaps'
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white ring-2 sm:ring-4 ring-yellow-300 scale-105'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-xl'
                  : analyzingGaps
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-xl'
              }`}
            >
              {analyzingGaps ? (
                <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> <span className="hidden xs:inline">Analyzing...</span><span className="xs:hidden">...</span></>
              ) : gapsAnalyzed ? (
                <><span className="hidden sm:inline">✓ Gaps</span><span className="sm:hidden">✓</span> {gaps.length > 0 && `(${gaps.length})`}</>
              ) : (
                <><span className="hidden sm:inline">Find Gaps</span><span className="sm:hidden">Gaps</span></>
              )}
            </button>
          </div>
        )}

        {/* Display Tables */}
        {extractedData && !extracting && activeFilter === 'tables' && (
          <TableDisplay extractedData={extractedData} showSummary={false} />
        )}

        {/* Display Analysis Results */}
        {extractedData && !extracting && (activeFilter === 'contradictions' || activeFilter === 'gaps') && (
          <AnalysisDashboard
            contradictions={contradictions}
            gaps={gaps}
            extractedData={extractedData}
            activeFilter={activeFilter}
          />
        )}
          
        
      </div>
    </div>
  );
}

export default App;
