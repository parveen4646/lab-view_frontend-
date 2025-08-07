import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            © 2024 Lab View. Medical Lab PDF Processing System.
          </div>
          <div className="text-sm text-gray-500">
            Powered by AI & Modern Web Technologies
          </div>
        </div>
      </div>
    </footer>
  );
};

