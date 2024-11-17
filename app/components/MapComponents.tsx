"use client";

import React, { useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation"; 
import { MAPTILER_API_KEY } from "../config";

interface Building {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

const MapComponent: React.FC<{ buildings: Building[] }> = ({ buildings }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    if (map.current) return; 
    maptilersdk.config.apiKey = MAPTILER_API_KEY;

    const usaBounds: [number, number, number, number] = [-125.0, 24.0, -66.9, 49.0];


    map.current = new maptilersdk.Map({
      container: mapContainer.current!,
      style: maptilersdk.MapStyle.STREETS,
      bounds: usaBounds, 
      fitBoundsOptions: { padding: 50 }, 
    });

    buildings.forEach((building) => {
      const marker = new maptilersdk.Marker({ color: "#FF0000" })
        .setLngLat([building.lng, building.lat])
        .setPopup(
          new maptilersdk.Popup().setHTML(
            `<strong>${building.name}</strong><br>Lat: ${building.lat}<br>Lng: ${building.lng}`
          )
        ) 
        .addTo(map.current!);

      marker.getElement().addEventListener("click", () => {
        router.push(`/buildings/${building.id}`);
      });
    });
  }, [buildings, router]);

  return (
    <Box sx={{ height: "100vh", width: "100%" }}>
      <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
    </Box>
  );
};

export default MapComponent;
