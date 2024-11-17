"use client";

import React, { useEffect, useState } from "react";
import MapComponent from "./components/MapComponents";

interface Building {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

const HomePage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:3001/buildings");
        if (!response.ok) {
          throw new Error("Failed to fetch buildings");
        }
        const data = await response.json();
        // Map the data to the expected structure
        const mappedBuildings = data.map((building: any) => ({
          id: building["Building ID"],
          name: building["Building Name"],
          lat: building["Latitude"],
          lng: building["Longitude"],
        }));
        setBuildings(mappedBuildings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) {
    return <p>Loading buildings...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <MapComponent buildings={buildings} />
    </div>
  );
};

export default HomePage;
