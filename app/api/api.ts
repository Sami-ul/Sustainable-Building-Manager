import { BuildingAverageData } from "../types/types";

export const fetchBuildingAverageData = async (buildingId: number): Promise<BuildingAverageData> => {
  const response = await fetch(`http://127.0.0.1:5000/buildings/${buildingId}/average`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchEnergyTrendsData = async (buildingId: number): Promise<{ Date: string; "Energy Consumption (kWh)": number }[]> => {
  const response = await fetch(`http://127.0.0.1:5000/graphs/energy_trends/${buildingId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch energy trends for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchOccupancyTrendsData = async (buildingId: number): Promise<{ Date: string; "Occupancy (People)": number }[]> => {
  const response = await fetch(`http://127.0.0.1:5000/graphs/occupancy_trends/${buildingId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch occupancy trends for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchCarbonEmissionsTrendsData = async (buildingId: number): Promise<{ Date: string; "Carbon Emissions (kg CO2)": number }[]> => {
  const response = await fetch(`http://127.0.0.1:5000/graphs/carbon_emissions_trends/${buildingId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch carbon emissions trends for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchHvacUsageTrendsData = async (buildingId: number): Promise<{ Date: string; "HVAC Usage (Hours)": number }[]> => {
  const response = await fetch(`http://127.0.0.1:5000/graphs/hvac_usage_trends/${buildingId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch HVAC usage trends for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchWaterUsageTrendsData = async (buildingId: number): Promise<{ Date: string; "Water Usage (Gallons)": number }[]> => {
  const response = await fetch(`http://127.0.0.1:5000/graphs/water_usage_trends/${buildingId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch water usage trends for Building ID ${buildingId}`);
  }
  return response.json();
};

export const fetchEnergyVsOccupancyData = async (
    buildingId: number
  ): Promise<{ range: string;
    totalEnergy: number; 
    averageEnergy: number; 
    count: number;  }[]> => {
    const response = await fetch(`http://127.0.0.1:5000/graphs/energy_vs_occupancy/${buildingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch energy vs occupancy data for Building ID ${buildingId}`);
    }
    return response.json();
  };
  
