import React from "react";
import Sidebar from "./components/Sidebar"; 
import "./globals.css"; 

export const metadata = {
  title: "Building Dashboard",
  description: "Property Manager Dashboard with Building Insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          {/* Sidebar (always visible) */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 p-4">
            {children} {/* Render the active page here */}
          </div>
        </div>
      </body>
    </html>
  );
}
