import { Table, FileText, Folder, Package, Database } from 'lucide-react';

function TableDisplay({ extractedData, showSummary = true, showTables = true }) {
  if (!extractedData || !extractedData.tables || extractedData.tables.length === 0) {
    return (
      <div className="mt-6 sm:mt-8 lg:mt-12 bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full mb-4 sm:mb-6">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
        </div>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-semibold">No tables found in this PDF</p>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Try uploading a different document with table data.</p>
      </div>
    );
  }

  // Group tables by Fund
  const groupedByFund = {};

  extractedData.tables.forEach(table => {
    const fund = table.fund || 'Unspecified Fund';

    if (!groupedByFund[fund]) {
      groupedByFund[fund] = [];
    }

    groupedByFund[fund].push(table);
  });

  return (
    <div className="mt-6 sm:mt-8 lg:mt-12 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Summary Statistics */}
      {showSummary && extractedData.summary && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-indigo-200 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">Extraction Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md border border-indigo-100">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Tables</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-600">{extractedData.summary.total_tables}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md border border-purple-100">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Rows</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600">{extractedData.summary.total_rows}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md border border-pink-100">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Unique Funds</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-pink-600">{extractedData.summary.unique_funds}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md border border-indigo-100">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Categories</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-600">{extractedData.summary.unique_categories}</p>
            </div>
          </div>

          {/* List of Funds and Categories */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {extractedData.summary.funds && extractedData.summary.funds.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100">
                <p className="text-sm font-bold text-gray-700 mb-2">Funds:</p>
                <div className="flex flex-wrap gap-2">
                  {extractedData.summary.funds.map((fund, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {fund}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {extractedData.summary.categories && extractedData.summary.categories.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-purple-100">
                <p className="text-sm font-bold text-gray-700 mb-2">Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {extractedData.summary.categories.slice(0, 10).map((category, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {category}
                    </span>
                  ))}
                  {extractedData.summary.categories.length > 10 && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                      +{extractedData.summary.categories.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tables Grouped by Fund */}
      {showTables && (
        <>
          {/* Tables Section Heading */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Table className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">Tables</h2>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {Object.keys(groupedByFund).map((fund, fundIndex) => (
          <div
            key={fundIndex}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden"
          >
            {/* Fund Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white break-words">
                    {fund}
                  </h1>
                  <p className="text-indigo-100 text-xs sm:text-sm mt-1">
                    {groupedByFund[fund].length} table{groupedByFund[fund].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Tables within this Fund */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {groupedByFund[fund].map((table, tableIndex) => (
                <div key={tableIndex} className="border-l-2 sm:border-l-4 border-purple-400 pl-3 sm:pl-4 lg:pl-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-700 break-words">
                        {table.category}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                        {table.rows ? table.rows.length : 0} row{table.rows && table.rows.length !== 1 ? 's' : ''}, {table.headers ? table.headers.length : 0} column{table.headers && table.headers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 sm:border-2 shadow-lg bg-white -mx-3 sm:mx-0">
                    <table className="w-full border-collapse min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                        <tr>
                          {table.headers && table.headers.map((header, headerIndex) => (
                            <th
                              key={headerIndex}
                              className="border-b border-gray-300 sm:border-b-2 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-left font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows && table.rows.length > 0 ? (
                          table.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className={`transition-colors ${
                                rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-indigo-50`}
                            >
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-gray-700 text-xs sm:text-sm align-top"
                                >
                                  <div className="whitespace-pre-wrap break-words max-w-xs sm:max-w-sm lg:max-w-md">
                                    {cell || '-'}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={table.headers ? table.headers.length : 1}
                              className="border-b border-gray-200 px-3 py-4 sm:px-6 sm:py-8 text-center text-gray-500 italic text-sm"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Row count badge */}
                  {table.rows && table.rows.length > 0 && (
                    <div className="mt-2 sm:mt-3 flex justify-end">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 sm:gap-2">
                        <Table className="w-3 h-3" />
                        {table.rows.length} entries
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
          </div>
        </>
      )}

    </div>
  );
}

export default TableDisplay;
