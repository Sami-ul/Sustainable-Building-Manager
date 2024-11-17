"use client";

import React, { useEffect, useState } from "react";
import { fetchEnergyVsOccupancyData } from "../api/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface HistogramData {
    range: string; 
    totalEnergy: number; 
    averageEnergy: number;
    count: number;
}

const OccupancyHistogram: React.FC<{ buildingId: number }> = ({ buildingId }) => {
    const [histogramData, setHistogramData] = useState<HistogramData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const apiData: {
                    range: string; 
                    totalEnergy: number; 
                    averageEnergy: number;
                    count: number;
                }[] =
                    await fetchEnergyVsOccupancyData(buildingId);

                const formattedData: HistogramData[] = apiData.map((item) => ({
                    range: item.range,
                    totalEnergy: item.totalEnergy,
                    averageEnergy: item.totalEnergy / (item.count || 1), 
                    count: item.count || 0, 
                }));

                setHistogramData(formattedData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [buildingId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h4 className="text-lg font-semibold">Energy Consumption by Occupancy Ranges</h4>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip
                        formatter={(value: any, name: string) =>
                            name === "totalEnergy"
                                ? [`${value} kWh`, "Total Energy"]
                                : [`${value}`, name]
                        }
                    />
                    <Bar dataKey="totalEnergy" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OccupancyHistogram;
