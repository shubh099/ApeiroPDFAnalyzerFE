import { useState } from 'react';
import { Loader2, AlertTriangle, Search } from 'lucide-react';

// API Configuration - Change this one URL for localhost or production
//const API_BASE_URL = 'http://localhost:8000';  // For localhost development
const API_BASE_URL = 'https://apeiropdfanalyzerbe.onrender.com';  // For production deployment

// Simple markdown to JSX converter for clarifications
function MarkdownText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={elements.length} className="text-gray-700 mb-3 leading-relaxed">
          {currentParagraph.join(' ')}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Heading level 2 (##)
    if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h2 key={elements.length} className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {trimmedLine.substring(3)}
        </h2>
      );
    }
    // Heading level 3 (###)
    else if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h3 key={elements.length} className="text-lg font-semibold text-gray-800 mt-3 mb-2">
          {trimmedLine.substring(4)}
        </h3>
      );
    }
    // Bold text (**text**)
    else if (trimmedLine.includes('**')) {
      flushParagraph();
      const parts = trimmedLine.split('**');
      const formatted = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      );
      elements.push(
        <p key={elements.length} className="text-gray-700 mb-3 leading-relaxed">
          {formatted}
        </p>
      );
    }
    // List items (- or *)
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      elements.push(
        <li key={elements.length} className="text-gray-700 ml-6 mb-1">
          {trimmedLine.substring(2)}
        </li>
      );
    }
    // Empty line
    else if (trimmedLine === '') {
      flushParagraph();
    }
    // Regular paragraph text
    else {
      currentParagraph.push(trimmedLine);
    }
  });

  flushParagraph(); // Flush any remaining paragraph

  return <div className="markdown-content">{elements}</div>;
}

function FindingCard({ finding, onGetClarification, clarification, loadingClarification }) {
  const severityColors = {
    high: 'bg-red-100 border-red-500 text-red-800',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-blue-100 border-blue-500 text-blue-800'
  };

  return (
    <div className="border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 mb-3 sm:mb-4 shadow-sm">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div>
          <span className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${severityColors[finding.severity]}`}>
            <span className="hidden sm:inline">{finding.type} - Severity: </span>{finding.severity.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-2.5 sm:mb-3">
        <span className="text-xs sm:text-sm text-gray-600 font-semibold">Location:</span>
        <p className="text-sm sm:text-base text-gray-800 mt-1 break-words">{finding.location || finding.locations?.join(', ')}</p>
      </div>

      <div className="mb-2.5 sm:mb-3">
        <span className="text-xs sm:text-sm text-gray-600 font-semibold">Issue:</span>
        <p className="text-sm sm:text-base text-gray-900 mt-1">{finding.issue}</p>
      </div>

      <div className="mb-2.5 sm:mb-3">
        <span className="text-xs sm:text-sm text-gray-600 font-semibold">Evidence:</span>
        <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg mt-1">
          {Array.isArray(finding.evidence) ? (
            <ul className="list-disc list-inside space-y-1">
              {finding.evidence.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-gray-700 break-words">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700 break-words">{finding.evidence}</p>
          )}
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm text-gray-600 font-semibold">Impact:</span>
        <p className="text-sm sm:text-base text-gray-800 mt-1">{finding.impact}</p>
      </div>

      <button
        onClick={() => onGetClarification(finding)}
        disabled={loadingClarification || clarification}
        className="w-full sm:w-auto bg-green-500 text-white px-4 py-2.5 sm:px-4 sm:py-2 rounded-lg sm:rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-sm sm:text-base font-medium"
      >
        {loadingClarification ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Searching for clarifications...</span>
            <span className="sm:hidden">Searching...</span>
          </>
        ) : clarification ? (
          <>✓ Clarification Found</>
        ) : (
          <>Get Clarifications</>
        )}
      </button>

      {clarification && (
        <div className="mt-3 sm:mt-4 bg-green-50 border-l-2 sm:border-l-4 border-green-500 p-3 sm:p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-green-600 text-lg sm:text-xl flex-shrink-0">💡</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800 mb-2 sm:mb-3 text-sm sm:text-base">Possible Clarification:</p>
              <div className="text-xs sm:text-sm">
                <MarkdownText text={clarification} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisDashboard({ contradictions, gaps, extractedData, activeFilter }) {
  const [clarifications, setClarifications] = useState({});
  const [loading, setLoading] = useState({});

  // Determine what to show based on filter
  const shouldShowContradictions = !activeFilter || activeFilter === 'contradictions';
  const shouldShowGaps = !activeFilter || activeFilter === 'gaps';

  const handleGetClarification = async (finding, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));

    // Use the document_context extracted by Gemini
    const documentContext = extractedData?.document_context || "Unknown healthcare document";

    try {
      const response = await fetch(`${API_BASE_URL}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding: finding,
          pdf_context: documentContext // Pass document context string
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClarifications(prev => ({ ...prev, [key]: data.clarification }));
      } else {
        alert('Failed to get clarification: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="mt-6 sm:mt-8 lg:mt-12 space-y-6 sm:space-y-8">
      {shouldShowContradictions && contradictions && contradictions.length > 0 && (
        <div>
          {/* Contradictions Section Heading */}
          <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-red-200 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">
                Contradictions <span className="text-red-600">({contradictions.length})</span>
              </h2>
            </div>
          </div>

          {contradictions.map((finding, index) => (
            <FindingCard
              key={index}
              finding={finding}
              onGetClarification={() => handleGetClarification(finding, index)}
              clarification={clarifications[index]}
              loadingClarification={loading[index]}
            />
          ))}
        </div>
      )}

      {shouldShowGaps && gaps && gaps.length > 0 && (
        <div>
          {/* Gaps Section Heading */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-yellow-200 p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">
                Gaps <span className="text-yellow-600">({gaps.length})</span>
              </h2>
            </div>
          </div>

          {gaps.map((finding, index) => (
            <FindingCard
              key={`gap-${index}`}
              finding={finding}
              onGetClarification={() => handleGetClarification(finding, `gap-${index}`)}
              clarification={clarifications[`gap-${index}`]}
              loadingClarification={loading[`gap-${index}`]}
            />
          ))}
        </div>
      )}

      {(!contradictions || contradictions.length === 0) &&
       (!gaps || gaps.length === 0) && (
        <div className="text-center text-gray-500 py-8 sm:py-12">
          <p className="text-base sm:text-lg">No issues found. The document appears to be consistent.</p>
        </div>
      )}
    </div>
  );
}
