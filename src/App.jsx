import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle, FileCheck2, Sparkles } from 'lucide-react';
import TableDisplay from './components/TableDisplay';

import AnalysisDashboard from './components/AnalysisDashboard';

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
  const [activeFilter, setActiveFilter] = useState(null); // 'contradictions', 'gaps', or null for all

  const handleDetectContradictions = async () => {
    console.log('🔍 Detect Contradictions button clicked');
    console.log('📊 Extracted Data:', extractedData);
    console.log('📋 Tables:', extractedData?.tables);

    setAnalyzingContradictions(true);
    try {
      console.log('🚀 Sending request to /analyze/contradictions');
      const response = await fetch('https://apeiropdfanalyzerbe.onrender.com/analyze/contradictions', {
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
      const response = await fetch('https://apeiropdfanalyzerbe.onrender.com/analyze/gaps', {
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

      const response = await fetch('https://apeiropdfanalyzerbe.onrender.com/upload', {
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
      const response = await fetch(`https://apeiropdfanalyzerbe.onrender.com/extract?file_id=${fileIdToExtract}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <FileCheck2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 tracking-tight">
            Healthy Policy AI Analysis
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            AI-powered document analysis to extract tables and detect contradictions & gaps
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Table Extraction
            </span>
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Contradiction Detection
            </span>
            <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Gap Analysis
            </span>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden transform hover:shadow-3xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-10 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Upload PDF Document
                </h2>
                <p className="text-indigo-100 text-base mt-2">
                  Supported format: PDF • Max size: 50MB
                </p>
              </div>
            </div>
          </div>

          <div className="p-12">

            {/* Drag and Drop Area */}
            <div
              className={`relative border-3 border-dashed rounded-3xl p-20 text-center transition-all duration-300 ${
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
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl">
                    <Upload className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-gray-600 mb-8 text-lg">
                    or click below to browse from your device
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl cursor-pointer hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    <FileText className="w-6 h-6" />
                    Browse Files
                  </label>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-purple-200 p-8 inline-flex items-center gap-6 shadow-xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xl font-bold text-gray-900 truncate max-w-md mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-base text-gray-600 font-semibold">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadSuccess(false);
                      setUploadError('');
                    }}
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-100 p-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {selectedFile && !uploadSuccess && (
              <div className="mt-10">
                <button
                  onClick={handleUpload}
                  disabled={uploading || extracting}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                >
                  {uploading || extracting ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      {uploading ? 'Uploading...' : 'Extracting Tables...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-7 h-7" />
                      Upload and Analyze
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="mt-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-3 border-green-400 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-green-900 text-2xl mb-2">
                      Upload Successful!
                    </p>
                    <p className="text-base text-green-700 mb-4 font-medium">
                      Your PDF has been uploaded and is ready for processing.
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 inline-block shadow-md border border-green-200">
                      <p className="text-sm font-mono text-gray-700">
                        File ID: <span className="font-bold text-green-700">{fileId}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mt-10 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-3 border-red-400 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <XCircle className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-red-900 text-2xl mb-2">Upload Failed</p>
                    <p className="text-base text-red-700 font-medium">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Error Message */}
            {extractError && (
              <div className="mt-10 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-3 border-orange-400 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <XCircle className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-orange-900 text-2xl mb-2">Extraction Failed</p>
                    <p className="text-base text-orange-700 font-medium">{extractError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Extracting Progress */}
            {extracting && (
              <div className="mt-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-3 border-blue-400 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Loader2 className="w-9 h-9 text-white animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-blue-900 text-2xl mb-2">Extracting Tables...</p>
                    <p className="text-base text-blue-700 font-medium">
                      Analyzing PDF structure and extracting table data. This may take a moment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display Extracted Tables */}
        {extractedData && !extracting && (
          <TableDisplay extractedData={extractedData} />
        )}

        {/* Analysis Buttons */}
        {extractedData && !extracting && (
                            <div className="mt-8 flex gap-4 justify-center">
                              <button
                                onClick={() => {
                                  if (contradictionsAnalyzed) {
                                    // Toggle filter
                                    setActiveFilter(activeFilter === 'contradictions' ? null : 'contradictions');
                                  } else {
                                    // Run analysis
                                    handleDetectContradictions();
                                  }
                                }}
                                disabled={analyzingContradictions}
                                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                                  contradictionsAnalyzed
                                    ? activeFilter === 'contradictions'
                                      ? 'bg-red-600 text-white ring-4 ring-red-300'
                                      : 'bg-red-500 text-white hover:bg-red-600'
                                    : analyzingContradictions
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                              >
                                {analyzingContradictions ? (
                                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                ) : contradictionsAnalyzed ? (
                                  <>✓ Contradictions Analyzed {contradictions.length > 0 && `(${contradictions.length})`}</>
                                ) : (
                                  <>Detect Contradictions</>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (gapsAnalyzed) {
                                    // Toggle filter
                                    setActiveFilter(activeFilter === 'gaps' ? null : 'gaps');
                                  } else {
                                    // Run analysis
                                    handleFindGaps();
                                  }
                                }}
                                disabled={analyzingGaps}
                                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                                  gapsAnalyzed
                                    ? activeFilter === 'gaps'
                                      ? 'bg-yellow-600 text-white ring-4 ring-yellow-300'
                                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    : analyzingGaps
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                }`}
                              >
                                {analyzingGaps ? (
                                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                ) : gapsAnalyzed ? (
                                  <>✓ Gaps Analyzed {gaps.length > 0 && `(${gaps.length})`}</>
                                ) : (
                                  <>Find Gaps</>
                                )}
                              </button>
                            </div>                )}
          
                <AnalysisDashboard
                  contradictions={contradictions}
                  gaps={gaps}
                  extractedData={extractedData}
                  activeFilter={activeFilter}
                />
          
        
      </div>
    </div>
  );
}

export default App;
