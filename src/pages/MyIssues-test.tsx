import React from 'react';

const MyIssuesTest: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-green-500 text-white p-8 rounded-lg mb-6">
        <h1 className="text-4xl font-bold mb-4">🎯 MY ISSUES TEST 🎯</h1>
        <p className="text-xl">If you can see this green box, the My Issues page is working!</p>
        <p className="text-lg mt-2">Timestamp: {new Date().toLocaleString()}</p>
      </div>
      
      <div className="bg-blue-500 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">My Issues Page Status</h2>
        <ul className="space-y-2">
          <li>✅ React is rendering</li>
          <li>✅ Tailwind CSS is working</li>
          <li>✅ My Issues component is loading</li>
          <li>✅ Routing is functioning</li>
        </ul>
      </div>
    </div>
  );
};

export default MyIssuesTest;
