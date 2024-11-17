export interface BuildingAverages {
    "Energy Consumption (kWh)": number;
    "Occupancy (People)": number;
    "Carbon Emissions (kg CO2)": number;
    "HVAC Usage (Hours)": number;
    "Renewable Energy Contribution (%)": number;
    "Water Usage (Gallons)": number;
  }
  
  export interface BuildingAverageData {
    address: string;
    yearBuilt: number;
    floors: number;
    squareFootage: number;
    "Building ID": number;
    "Building Name": string;
    "Location": string;
    "Description": string;
    "Square Footage": number;
    Averages: BuildingAverages;
  }
  