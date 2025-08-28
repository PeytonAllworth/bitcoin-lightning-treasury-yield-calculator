
import React from "react";

export default function Layout({ children }) {
  return (
    // On desktop, this outer div provides a slightly darker background and padding for the frame effect.
    <div className="min-h-screen bg-gray-100 md:p-4 lg:p-6 text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>
        {`
          :root {
            --bitcoin-orange: #F7931A;
          }
          * {
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          }
        `}
      </style>
      {/* This inner div is the main content area. On desktop, it gets a border and shadow, creating the "framed" look. */}
      <div className="min-h-full bg-gray-50 md:rounded-lg md:border md:border-gray-200 md:shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}
