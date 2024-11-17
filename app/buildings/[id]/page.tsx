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
import { BuildingAverageData } from "../../types/types";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Slider from "@mui/material/Slider";

interface BuildingPageProps {
  params: Promise<{
    id: string;
  }>;
}

const BuildingPage: React.FC<BuildingPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const data = await fetchBuildingAverageData(Number(id));
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
          `http://127.0.0.1:5000/buildings/${id}/sustainability`
        );
        const sustainabilityData = await sustainabilityResponse.json();
        setSustainabilityScore(sustainabilityData["Sustainability Score"]);
        setTotalCost(sustainabilityData["Total Costs ($)"]);

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
        `http://127.0.0.1:5000/${id}/sustainability`,
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
      {buildingData ? (
        <>
          <h1 className="text-3xl font-bold">{buildingData["Building Name"]}</h1>
          <p className="text-gray-600">{buildingData.Description}</p>
          <p className="text-gray-600">Location: {buildingData.Location}</p>
        </>
      ) : (
        <p>Loading building data...</p>
      )}

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
                        setSliders({ ...sliders, [key]: value as number })
                      }
                      min={0}
                      max={
                        key === "renewable"
                          ? 100
                          : 2000
                      }
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
            ${totalCost?.toFixed(2)}
          </p>

          {simulated && (
            <p className="text-sm text-red-500 mt-4">Simulated Data</p>
          )}
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
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleDateString()
                }
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
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleDateString()
                }
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
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleDateString()
                }
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
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleDateString()
                }
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
                tickFormatter={(tick) =>
                  new Date(tick).toLocaleDateString()
                }
              />
              <YAxis dataKey="y" name="Occupancy (People)" />
              <Tooltip />
              <Scatter data={occupancyTrends} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BuildingPage;
