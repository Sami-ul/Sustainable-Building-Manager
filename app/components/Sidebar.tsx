"use client"; 

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBuilding, FaChevronLeft, FaChevronRight } from "react-icons/fa"; 

interface Building {
  id: number;
  name: string;
  location: string;
  coordinates: [number, number];
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:5000/buildings"); 
        if (!response.ok) {
          throw new Error("Failed to fetch buildings data");
        }
        const data = await response.json();
        setBuildings(
          data.map((building: any) => ({
            id: building["Building ID"],
            name: building["Building Name"],
            location: building.Location,
            coordinates: [
              parseFloat(building.Latitude),
              parseFloat(building.Longitude),
            ],
          }))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div
      className={`transition-all duration-300 bg-gray-800 text-white ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen flex flex-col`}
    >
      {/* Toggle Button */}
      <button
        className="p-2 m-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center justify-center"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-4">
            <Link href={`/`} className="hover:text-sky-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaBuilding className="mr-2" /> Buildings
              </h2>
            </Link>
            <ul>
              {buildings.map((building) => (
                <li key={building.id} className="mb-2">
                  <Link
                    href={`/buildings/${building.id}`}
                    className="block p-2 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
                  >
                    <div className="font-bold">{building.name}</div>
                    <div className="text-sm text-gray-400">{building.location}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700">
        <p
          className={`text-center text-xs text-gray-400 ${
            isCollapsed && "hidden"
          }`}
        >
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
