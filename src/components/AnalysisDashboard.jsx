import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function FindingCard({ finding, onGetClarification, clarification, loadingClarification }) {
  const severityColors = {
    high: 'bg-red-100 border-red-500 text-red-800',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-blue-100 border-blue-500 text-blue-800'
  };

  return (
    <div className="border-2 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColors[finding.severity]}`}>
            {finding.type} - Severity: {finding.severity.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <span className="text-sm text-gray-600 font-semibold">Location:</span>
        <p className="text-gray-800">{finding.location || finding.locations?.join(', ')}</p>
      </div>
      
      <div className="mb-3">
        <span className="text-sm text-gray-600 font-semibold">Issue:</span>
        <p className="text-gray-900">{finding.issue}</p>
      </div>
      
      <div className="mb-3">
        <span className="text-sm text-gray-600 font-semibold">Evidence:</span>
        <div className="bg-gray-50 p-3 rounded mt-1">
          {Array.isArray(finding.evidence) ? (
            <ul className="list-disc list-inside space-y-1">
              {finding.evidence.map((item, i) => (
                <li key={i} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700">{finding.evidence}</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <span className="text-sm text-gray-600 font-semibold">Impact:</span>
        <p className="text-gray-800">{finding.impact}</p>
      </div>
      
      <button
        onClick={() => onGetClarification(finding)}
        disabled={loadingClarification || clarification}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
      >
        {loadingClarification ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching for clarifications...
          </>
        ) : clarification ? (
          <>✓ Clarification Found</>
        ) : (
          <>Get Clarifications</>
        )}
      </button>
      
      {clarification && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-start">
            <span className="text-green-600 mr-2">💡</span>
            <div>
              <p className="font-semibold text-green-800 mb-2">Possible Clarification:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{clarification}</p>
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
      const response = await fetch('https://apeiropdfanalyzerbe.onrender.com/clarify', {
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
    <div className="mt-12">
      {shouldShowContradictions && contradictions && contradictions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Contradictions Found ({contradictions.length})
          </h2>
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
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            Gaps Found ({gaps.length})
          </h2>
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
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No issues found. The document appears to be consistent.</p>
        </div>
      )}
    </div>
  );
}
