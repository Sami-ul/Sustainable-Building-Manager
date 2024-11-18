"use client";

import React, { useEffect, useState } from "react";
import MapComponent from "./components/MapComponents";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useRouter } from "next/navigation";

interface Building {
  id: number;
  name: string;
  lat: number;
  lng: number;
  sustainabilityScore?: number;
}

const HomePage = () => {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageSustainability, setAverageSustainability] = useState<number>(0);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:3001/buildings");
        if (!response.ok) {
          throw new Error("Failed to fetch buildings");
        }
        const data = await response.json();
        
        // Fetch sustainability scores for all buildings
        const buildingsWithScores = await Promise.all(
          data.map(async (building: any) => {
            const sustainabilityResponse = await fetch(
              `http://127.0.0.1:3001/buildings/${building["Building ID"]}/sustainability`
            );
            const sustainabilityData = await sustainabilityResponse.json();
            
            return {
              id: building["Building ID"],
              name: building["Building Name"],
              lat: building["Latitude"],
              lng: building["Longitude"],
              sustainabilityScore: sustainabilityData["Sustainability Score"]
            };
          })
        );

        // Calculate average sustainability score
        const totalScore = buildingsWithScores.reduce(
          (sum, building) => sum + (building.sustainabilityScore || 0),
          0
        );
        const average = totalScore / buildingsWithScores.length;
        
        setBuildings(buildingsWithScores);
        setAverageSustainability(average);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleBuildingClick = (buildingId: number) => {
    router.push(`/buildings/${buildingId}`);
  };

  if (loading) {
    return <p>Loading buildings...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white shadow-md p-4 mb-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Building Dashboard</h1>
          <div className="mt-2">
            <p className="text-lg">
              Average Sustainability Score: 
              <span className="font-bold text-blue-600 ml-2">
                {averageSustainability.toFixed(2)}%
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mb-4">
        {buildings.map((building) => (
          <div
            key={building.id}
            onClick={() => handleBuildingClick(building.id)}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{building.name}</h3>
              </div>
              <div style={{ width: 60, height: 60 }}>
                <CircularProgressbar
                  value={building.sustainabilityScore || 0}
                  text={`${(building.sustainabilityScore || 0).toFixed(0)}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: `rgba(62, 152, 199, ${(building.sustainabilityScore || 0) / 100})`,
                    textColor: '#3e98c7',
                    trailColor: '#d6d6d6'
                  })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-grow">
        <MapComponent buildings={buildings} />
      </div>
    </div>
  );
};

export default HomePage;