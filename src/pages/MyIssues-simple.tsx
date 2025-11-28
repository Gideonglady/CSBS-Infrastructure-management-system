import React from 'react';

const MyIssuesSimple: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">🚨 MY ISSUES SIMPLE TEST 🚨</h1>
      <div className="bg-red-500 text-white p-6 rounded-lg">
        <p className="text-xl">This is a very simple test page with no hooks or complex logic.</p>
        <p className="text-lg mt-2">Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MyIssuesSimple;
