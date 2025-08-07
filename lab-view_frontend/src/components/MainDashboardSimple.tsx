import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const MainDashboardSimple: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Medical Lab Report Upload</h1>
        <p className="text-gray-600 mb-4">Welcome {user?.email}!</p>
        
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-lg text-gray-700">Upload functionality is being loaded...</p>
          <p className="text-sm text-gray-500 mt-2">If you're seeing this, the routing and auth are working correctly.</p>
        </div>
      </div>
    </div>
  );
};