"use client";
import React, { useState, useEffect, use } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import OccupancyHistogram from "../../components/OccupancyHistogram";
import {
  fetchBuildingAverageData,
  fetchEnergyTrendsData,
  fetchOccupancyTrendsData,
  fetchCarbonEmissionsTrendsData,
  fetchHvacUsageTrendsData,
  fetchWaterUsageTrendsData,
  fetchEnergyVsOccupancyData,
} from "../../api/api";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import Slider from "@mui/material/Slider";

interface BuildingPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface BuildingDetails {
  squareFootage: number;
  address: string;
  yearBuilt: number;
  floors: number;
  buildingType: string;
}


interface BuildingAverageData {
  "Building Name": string;
  Description: string;
  Location: string;
  Averages: {
    "Energy Consumption (kWh)": number;
    "Occupancy (People)": number;
    "Carbon Emissions (kg CO2)": number;
    "HVAC Usage (Hours)": number;
    "Renewable Energy Contribution (%)": number;
    "Water Usage (Gallons)": number;
  };
  address?: string;
  squareFootage?: number;
  yearBuilt?: number;
  floors?: number;
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc'
      }}>
        <p>{`Date: ${formattedDate}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BuildingPage: React.FC<BuildingPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // Add the interface here
  interface BuildingDetails {
    squareFootage: number;
    address: string;
    yearBuilt: number;
    floors: number;
  }

  // Add these new states with your other existing states
  const [activeView, setActiveView] = useState<'metrics' | 'details'>('metrics');
  const [buildingDetails, setBuildingDetails] = useState<BuildingDetails>({
    squareFootage: 0,
    address: '955 Main Street',
    yearBuilt: 2015,
    floors: 18,
  });


  const [buildingData, setBuildingData] = useState<BuildingAverageData | null>(
    null
  );
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [simulated, setSimulated] = useState<boolean>(false);
  const [sliders, setSliders] = useState({
    energy: 0,
    occupancy: 0,
    carbon: 0,
    hvac: 0,
    renewable: 0,
    water: 0,
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [energyTrends, setEnergyTrends] = useState<any[]>([]);
  const [occupancyTrends, setOccupancyTrends] = useState<any[]>([]);
  const [carbonEmissionsTrends, setCarbonEmissionsTrends] = useState<any[]>([]);
  const [hvacUsageTrends, setHvacUsageTrends] = useState<any[]>([]);
  const [waterUsageTrends, setWaterUsageTrends] = useState<any[]>([]);
  const [energyVsOccupancy, setEnergyVsOccupancy] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [carbonScore, setCarbonScore] = useState<number>(0);
const [carbonAnomaly, setCarbonAnomaly] = useState<string>('');
const [waterScore, setWaterScore] = useState<number>(0);
const [waterAnomaly, setWaterAnomaly] = useState<string>('');
const [energyScore, setEnergyScore] = useState<number>(0);
const [energyAnomaly, setEnergyAnomaly] = useState<string>('');
const [recommendation, setRecommendation] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const data = await fetchBuildingAverageData(Number(id));

        

        setBuildingDetails({
          address: data.address || '955 Main Street', // Provide default value
          squareFootage: data.squareFootage || 0,
          yearBuilt: data.yearBuilt || 2015,
          floors: data.floors || 18
        });
        setBuildingData(data);

        setSliders({
          energy: data.Averages["Energy Consumption (kWh)"],
          occupancy: data.Averages["Occupancy (People)"],
          carbon: data.Averages["Carbon Emissions (kg CO2)"],
          hvac: data.Averages["HVAC Usage (Hours)"],
          renewable: data.Averages["Renewable Energy Contribution (%)"],
          water: data.Averages["Water Usage (Gallons)"],
        });

        

        const sustainabilityResponse = await fetch(
          `http://127.0.0.1:3001/buildings/${id}/sustainability`
        );
        const sustainabilityData = await sustainabilityResponse.json();
        setCarbonScore(sustainabilityData["Carbon Score"]);
        setCarbonAnomaly(sustainabilityData["Carbon Emissions (kg CO2) Anomaly"]);
        setWaterScore(sustainabilityData["Water Score"]);
        setWaterAnomaly(sustainabilityData["Water Usage (Gallons) Anomaly"]);
        setEnergyScore(sustainabilityData["Energy Score"]);
        setEnergyAnomaly(sustainabilityData["Energy Consumption (kWh) Anomaly"]);
        setSustainabilityScore(sustainabilityData["Sustainability Score"]);
        setTotalCost(sustainabilityData["Total Costs ($)"]);
        setRecommendation(sustainabilityData["Recommendations"]);

        setEnergyTrends(
          (await fetchEnergyTrendsData(Number(id))).map((d) => ({
            x: new Date(d.Date).getTime(),
            y: d["Energy Consumption (kWh)"],
          }))
        );
        setOccupancyTrends(
          (await fetchOccupancyTrendsData(Number(id))).map((d) => ({
            x: new Date(d.Date).getTime(),
            y: d["Occupancy (People)"],
          }))
        );
        setCarbonEmissionsTrends(
          (await fetchCarbonEmissionsTrendsData(Number(id))).map((d) => ({
            x: new Date(d.Date).getTime(),
            y: d["Carbon Emissions (kg CO2)"],
          }))
        );
        setHvacUsageTrends(
          (await fetchHvacUsageTrendsData(Number(id))).map((d) => ({
            x: new Date(d.Date).getTime(),
            y: d["HVAC Usage (Hours)"],
          }))
        );
        setWaterUsageTrends(
          (await fetchWaterUsageTrendsData(Number(id))).map((d) => ({
            x: new Date(d.Date).getTime(),
            y: d["Water Usage (Gallons)"],
          }))
        );
        setEnergyVsOccupancy(
          (await fetchEnergyVsOccupancyData(Number(id))).map((d) => ({
            x: parseInt(d.range.split("-")[0], 10),
            y: d.totalEnergy,
          }))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSimulate = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/${id}/sustainability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "Energy Consumption (kWh)": sliders.energy,
            occupancy: sliders.occupancy,
            "Carbon Emissions (kg CO2)": sliders.carbon,
            hvac: sliders.hvac,
            renewable: sliders.renewable,
            "Water Usage (Gallons)": sliders.water,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (
        data["Sustainability Score"] === undefined ||
        data["Total Costs ($)"] === undefined
      ) {
        throw new Error("Invalid response from server.");
      }

      setSustainabilityScore(data["Sustainability Score"]);
      setTotalCost(data["Total Costs ($)"]);
      setSimulated(true);
    } catch (error) {
      console.error("Error simulating data:", error);
      alert("Failed to simulate changes. Reverting to original data.");
    }
  };

  const handleReset = () => {
    if (buildingData) {
      setSliders({
        energy: buildingData.Averages["Energy Consumption (kWh)"],
        occupancy: buildingData.Averages["Occupancy (People)"],
        carbon: buildingData.Averages["Carbon Emissions (kg CO2)"],
        hvac: buildingData.Averages["HVAC Usage (Hours)"],
        renewable: buildingData.Averages["Renewable Energy Contribution (%)"],
        water: buildingData.Averages["Water Usage (Gallons)"],
      });
      setSimulated(false);
      handleSimulate();
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {buildingData ? (
          <div>
            <h1 className="text-3xl font-bold">{buildingData["Building Name"]}</h1>
            <p className="text-gray-600">{buildingData.Description}</p>
            <p className="text-gray-600">Location: {buildingData.Location}</p>
          </div>
        ) : (
          <p>Loading building data...</p>
        )}
        
        <button
          onClick={() => setActiveView(activeView === 'metrics' ? 'details' : 'metrics')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {activeView === 'metrics' ? 'View Details' : 'View Metrics'}
        </button>
      </div>
  
      {activeView === 'metrics' ? (
        <>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="col-span-2">
              <h3 className="text-xl font-semibold">Adjust Values:</h3>
              {Object.keys(sliders).map((key) => {
                const keyMapping: Record<
                  keyof typeof sliders,
                  keyof BuildingAverageData["Averages"]
                > = {
                  energy: "Energy Consumption (kWh)",
                  occupancy: "Occupancy (People)",
                  carbon: "Carbon Emissions (kg CO2)",
                  hvac: "HVAC Usage (Hours)",
                  renewable: "Renewable Energy Contribution (%)",
                  water: "Water Usage (Gallons)",
                };
                const originalValue =
                  buildingData?.Averages[keyMapping[key as keyof typeof sliders]];
                return (
                  <div key={key} className="mt-4 grid grid-cols-3 items-center">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {keyMapping[key as keyof typeof sliders]}
                    </label>
                    <span
                      className="text-sm font-medium text-blue-500 text-center cursor-pointer"
                      onClick={() => setEditingKey(editingKey === key ? null : key)}
                    >
                      {sliders[key as keyof typeof sliders].toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-gray-500 text-center">
                      {originalValue?.toFixed(2)}
                    </span>
                    {editingKey === key && (
                      <div className="col-span-3 mt-2">
                        <Slider
                          value={sliders[key as keyof typeof sliders]}
                          onChange={(e, value) =>
                            setSliders({
                              ...sliders,
                              [key]: value as number,
                            })
                          }
                          min={0}
                          max={key === "renewable" ? 100 : 2000}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                onClick={handleSimulate}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Simulate
              </button>
              <button
                onClick={handleReset}
                className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Reset
              </button>
            </div>
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Sustainability Score</h3>
              <div style={{ width: 150, height: 150 }}>
                <CircularProgressbar
                  value={sustainabilityScore}
                  text={`${sustainabilityScore.toFixed(2)}%`}
                  styles={buildStyles({
                    textColor: "#003366",
                    pathColor: "#0D47A1",
                    trailColor: "#E3F2FD",
                  })}
                />
              </div>
              <h3 className="text-lg font-semibold mt-6">Total Cost</h3>
              <p className="text-2xl font-bold text-black mt-2">
                ${totalCost?.toFixed(2) * 100}
              </p>
              {simulated && (
                <p className="text-sm text-red-500 mt-4">Simulated Data</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
          <div className="bg-white p-4 rounded-lg shadow mb-4">
  <h3 className="text-lg font-semibold text-center mb-2">Recommendations</h3>
  <div className="text-center">
    <div className={`text-sm px-4 py-2 rounded bg-blue-100 text-blue-800`}>
      {recommendation || "No immediate actions required."}
    </div>
  </div>
</div>
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-center mb-2">Carbon Score</h3>
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold mb-2">{carbonScore.toFixed(1)}</div>
      <div className={`text-sm px-2 py-1 rounded ${
        carbonAnomaly === "Normal" ? "bg-green-100 text-green-800" : 
        "bg-red-100 text-red-800"
      }`}>
        {carbonAnomaly}
      </div>
    </div>
  </div>
  
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-center mb-2">Water Score</h3>
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold mb-2">{waterScore.toFixed(1)}</div>
      <div className={`text-sm px-2 py-1 rounded ${
        waterAnomaly === "Normal" ? "bg-green-100 text-green-800" : 
        "bg-red-100 text-red-800"
      }`}>
        {waterAnomaly}
      </div>
    </div>
  </div>
  
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-center mb-2">Energy Score</h3>
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold mb-2">{energyScore.toFixed(1)}</div>
      <div className={`text-sm px-2 py-1 rounded ${
        energyAnomaly === "Normal" ? "bg-green-100 text-green-800" : 
        "bg-red-100 text-red-800"
      }`}>
        {energyAnomaly}
      </div>
    </div>
  </div>
</div>
  
          <h3 className="text-xl font-semibold mt-6">Graphs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-lg font-semibold">Energy Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis dataKey="y" name="Energy Consumption (kWh)" />
                  <Tooltip />
                  <Scatter data={energyTrends} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <OccupancyHistogram buildingId={Number(id)} />
            </div>
            <div>
              <h4 className="text-lg font-semibold">Carbon Emissions Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis dataKey="y" name="Carbon Emissions (kg CO2)" />
                  <Tooltip />
                  <Scatter data={carbonEmissionsTrends} fill="#FF6347" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-lg font-semibold">HVAC Usage Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis dataKey="y" name="HVAC Usage (Hours)" />
                  <Tooltip />
                  <Scatter data={hvacUsageTrends} fill="#4B0082" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Water Usage Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis dataKey="y" name="Water Usage (Gallons)" />
                  <Tooltip />
                  <Scatter data={waterUsageTrends} fill="#00BFFF" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Occupancy Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis dataKey="y" name="Occupancy (People)" />
                  <Tooltip />
                  <Scatter data={occupancyTrends} fill="#82ca9d" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Building Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Square Footage
                </label>
                <input
                  type="number"
                  value={buildingDetails.squareFootage}
                  onChange={(e) => setBuildingDetails({
                    ...buildingDetails,
                    squareFootage: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={buildingDetails.address}
                  onChange={(e) => setBuildingDetails({
                    ...buildingDetails,
                    address: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year Built
                </label>
                <input
                  type="number"
                  value={buildingDetails.yearBuilt}
                  onChange={(e) => setBuildingDetails({
                    ...buildingDetails,
                    yearBuilt: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Floors
                </label>
                <input
                  type="number"
                  value={buildingDetails.floors}
                  onChange={(e) => setBuildingDetails({
                    ...buildingDetails,
                    floors: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildingPage;
