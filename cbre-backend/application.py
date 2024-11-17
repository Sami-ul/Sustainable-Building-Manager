from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

data_path = 'Building_Efficiency_Dataset.csv'
df = pd.read_csv(data_path)

df['Date'] = pd.to_datetime(df['Date'])

ENERGY_COST_PER_KWH = 0.13
WATER_COST_PER_GALLON = 0.005
CARBON_OFFSET_COST_PER_KG = 0.02

WEIGHTS = {
    "Energy Score": 5,
    "Water Score": 2,
    "Carbon Score": 3,
}

@app.route('/<int:building_id>/sustainability', methods=['POST'])
def calculate_sustainability(building_id):
    filtered_data = df[df['Building ID'] == building_id]
    if filtered_data.empty:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    data = request.json
    if not data:
        return jsonify({"error": "Missing input data"}), 400

    energy_consumption = data.get("Energy Consumption (kWh)", 0)
    water_usage = data.get("Water Usage (Gallons)", 0)
    carbon_emissions = data.get("Carbon Emissions (kg CO2)", 0)

    energy_cost_per_kwh = ENERGY_COST_PER_KWH
    water_cost_per_gallon = WATER_COST_PER_GALLON
    carbon_offset_cost_per_kg = CARBON_OFFSET_COST_PER_KG

    energy_cost = energy_consumption * energy_cost_per_kwh
    water_cost = water_usage * water_cost_per_gallon
    carbon_offset_cost = carbon_emissions * carbon_offset_cost_per_kg
    total_costs = energy_cost + water_cost + carbon_offset_cost

    metrics = ["Energy Consumption (kWh)", "Carbon Emissions (kg CO2)", "Water Usage (Gallons)"]
    thresholds = {}
    for metric in metrics:
        mean = df[metric].mean()
        std_dev = df[metric].std()
        thresholds[metric] = {
            "low": mean + std_dev,
            "medium": mean + 2 * std_dev,
            "high": mean + 3 * std_dev,
        }

    def normalize(value, metric):
        medium_threshold = thresholds[metric]["medium"]
        if medium_threshold == 0:
            return 100
        score = max(0, 100 - (value / medium_threshold) * 100)
        return round(score, 2)

    energy_score = normalize(energy_consumption, "Energy Consumption (kWh)")
    water_score = normalize(water_usage, "Water Usage (Gallons)")
    carbon_score = normalize(carbon_emissions, "Carbon Emissions (kg CO2)")

    weights = WEIGHTS
    sustainability_score = (
        (energy_score * weights["Energy Score"] +
         water_score * weights["Water Score"] +
         carbon_score * weights["Carbon Score"]) /
        sum(weights.values())
    )

    def categorize_anomaly(value, metric):
        if value > thresholds[metric]["high"]:
            return "High"
        elif value > thresholds[metric]["medium"]:
            return "Medium"
        elif value > thresholds[metric]["low"]:
            return "Low"
        else:
            return "Normal"

    anomalies = {}
    for metric in metrics:
        anomalies[f"{metric} Anomaly"] = categorize_anomaly(data.get(metric, 0), metric)

    recommendations = []
    if anomalies["Energy Consumption (kWh) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Install energy-efficient lighting and appliances.")
    if anomalies["Carbon Emissions (kg CO2) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Invest in carbon offset programs or renewable energy sources.")
    if anomalies["Water Usage (Gallons) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Implement water-saving fixtures and regular maintenance.")
    if sustainability_score < 50:
        recommendations.append("Conduct a full sustainability audit for better insights.")

    response = {
        "Energy Cost ($)": round(energy_cost, 2),
        "Water Cost ($)": round(water_cost, 2),
        "Carbon Offset Cost ($)": round(carbon_offset_cost, 2),
        "Total Costs ($)": round(total_costs, 2),
        "Energy Score": round(energy_score, 2),
        "Water Score": round(water_score, 2),
        "Carbon Score": round(carbon_score, 2),
        "Sustainability Score": round(sustainability_score, 2),
        "Anomalies": anomalies,
        "Recommendations": "; ".join(recommendations) if recommendations else "No immediate actions required."
    }
    return jsonify(response)

def get_filtered_data(building_id):
    filtered_data = df[df['Building ID'] == building_id]
    if filtered_data.empty:
        return None
    return filtered_data

@app.route('/graphs/energy_trends/<int:building_id>', methods=['GET'])
def energy_trends(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    energy_data = filtered_data[['Date', 'Energy Consumption (kWh)']].to_dict(orient='records')
    return jsonify(energy_data)

@app.route('/graphs/occupancy_trends/<int:building_id>', methods=['GET'])
def occupancy_trends(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    occupancy_data = filtered_data[['Date', 'Occupancy (People)']].to_dict(orient='records')
    return jsonify(occupancy_data)

@app.route('/graphs/carbon_emissions_trends/<int:building_id>', methods=['GET'])
def carbon_emissions_trends(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    carbon_emissions_data = filtered_data[['Date', 'Carbon Emissions (kg CO2)']].to_dict(orient='records')
    return jsonify(carbon_emissions_data)

@app.route('/graphs/hvac_usage_trends/<int:building_id>', methods=['GET'])
def hvac_usage_trends(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    hvac_usage_data = filtered_data[['Date', 'HVAC Usage (Hours)']].to_dict(orient='records')
    return jsonify(hvac_usage_data)

@app.route('/graphs/water_usage_trends/<int:building_id>', methods=['GET'])
def water_usage_trends(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    water_usage_data = filtered_data[['Date', 'Water Usage (Gallons)']].to_dict(orient='records')
    return jsonify(water_usage_data)

@app.route('/buildings/<int:building_id>/sustainability', methods=['GET'])
def calculate_sustainability_primary(building_id):
    filtered_data = df[df['Building ID'] == building_id]
    if filtered_data.empty:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    annual_data = filtered_data.agg({
        "Energy Consumption (kWh)": "mean",
        "Occupancy (People)": "mean",
        "Carbon Emissions (kg CO2)": "mean",
        "HVAC Usage (Hours)": "mean",
        "Renewable Energy Contribution (%)": "mean",
        "Water Usage (Gallons)": "mean"
    }).to_dict()

    energy_cost_per_kwh = 0.13
    water_cost_per_gallon = 0.005
    carbon_offset_cost_per_kg = 0.02
    revenue_per_occupant = 100

    annual_data['Energy Cost ($)'] = annual_data["Energy Consumption (kWh)"] * energy_cost_per_kwh
    annual_data['Water Cost ($)'] = annual_data["Water Usage (Gallons)"] * water_cost_per_gallon
    annual_data['Carbon Offset Cost ($)'] = annual_data["Carbon Emissions (kg CO2)"] * carbon_offset_cost_per_kg
    annual_data['Total Costs ($)'] = (annual_data['Energy Cost ($)'] +
                                      annual_data['Water Cost ($)'] +
                                      annual_data['Carbon Offset Cost ($)'])
    annual_data['Revenue ($)'] = annual_data["Occupancy (People)"] * revenue_per_occupant
    annual_data['Profit/Loss ($)'] = annual_data['Revenue ($)'] - annual_data['Total Costs ($)']

    metrics = ["Energy Consumption (kWh)", "Carbon Emissions (kg CO2)", "Water Usage (Gallons)"]
    thresholds = {}
    for metric in metrics:
        mean = df[metric].mean()
        std_dev = df[metric].std()
        thresholds[metric] = {
            "low": mean + std_dev,
            "medium": mean + 2 * std_dev,
            "high": mean + 3 * std_dev,
        }

    def normalize(value, metric):
        return 100 - (value / thresholds[metric]["medium"]) * 100

    annual_data["Energy Score"] = normalize(annual_data["Energy Consumption (kWh)"], "Energy Consumption (kWh)")
    annual_data["Water Score"] = normalize(annual_data["Water Usage (Gallons)"], "Water Usage (Gallons)")
    annual_data["Carbon Score"] = normalize(annual_data["Carbon Emissions (kg CO2)"], "Carbon Emissions (kg CO2)")

    weights = {"Energy Score": 5, "Water Score": 2, "Carbon Score": 3}
    annual_data["Sustainability Score"] = (
        (annual_data["Energy Score"] * weights["Energy Score"] +
         annual_data["Water Score"] * weights["Water Score"] +
         annual_data["Carbon Score"] * weights["Carbon Score"]) /
        sum(weights.values())
    )

    def categorize_anomaly(value, metric):
        if value > thresholds[metric]["high"]:
            return "High"
        elif value > thresholds[metric]["medium"]:
            return "Medium"
        elif value > thresholds[metric]["low"]:
            return "Low"
        else:
            return "Normal"

    for metric in metrics:
        annual_data[f"{metric} Anomaly"] = categorize_anomaly(annual_data[metric], metric)

    recommendations = []
    if annual_data["Energy Consumption (kWh) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Install energy-efficient lighting and appliances.")
    if annual_data["Carbon Emissions (kg CO2) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Invest in carbon offset programs or renewable energy sources.")
    if annual_data["Water Usage (Gallons) Anomaly"] in ["Medium", "High"]:
        recommendations.append("Implement water-saving fixtures and regular maintenance.")
    if annual_data["Sustainability Score"] < 50:
        recommendations.append("Conduct a full sustainability audit for better insights.")
    annual_data["Recommendations"] = "; ".join(recommendations) if recommendations else "No immediate actions required."

    return jsonify(annual_data)

@app.route('/graphs/energy_vs_occupancy/<int:building_id>', methods=['GET'])
def energy_vs_occupancy(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    max_occupancy = filtered_data["Occupancy (People)"].max()

    bucket_size = 10
    occupancy_ranges = [
        {"min": i, "max": min(i + bucket_size - 1, max_occupancy), "label": f"{i}-{min(i + bucket_size - 1, max_occupancy)}"}
        for i in range(0, max_occupancy + 1, bucket_size)
    ]

    histogram_data = [{"range": r["label"], "totalEnergy": 0, "count": 0} for r in occupancy_ranges]

    for _, row in filtered_data.iterrows():
        occupancy = row["Occupancy (People)"]
        energy = row["Energy Consumption (kWh)"]

        for bucket in histogram_data:
            bucket_range = next(
                (r for r in occupancy_ranges if r["label"] == bucket["range"]), None
            )
            if bucket_range and bucket_range["min"] <= occupancy <= bucket_range["max"]:
                bucket["totalEnergy"] += energy
                bucket["count"] += 1
                break

    for bucket in histogram_data:
        if bucket["count"] > 0:
            bucket["averageEnergy"] = bucket["totalEnergy"] / bucket["count"]
        else:
            bucket["averageEnergy"] = 0

    return jsonify(histogram_data)

@app.route('/buildings/<int:building_id>/average', methods=['GET'])
def get_building_average_data(building_id):
    filtered_data = get_filtered_data(building_id)
    if filtered_data is None:
        return jsonify({"error": f"No data found for Building ID {building_id}."}), 404

    average_data = filtered_data.agg({
        'Energy Consumption (kWh)': 'mean',
        'Occupancy (People)': 'mean',
        'Carbon Emissions (kg CO2)': 'mean',
        'HVAC Usage (Hours)': 'mean',
        'Renewable Energy Contribution (%)': 'mean',
        'Water Usage (Gallons)': 'mean'
    }).to_dict()

    building_info = filtered_data.iloc[0][['Building Name', 'Location', 'Description']].to_dict()
    response = {
        "Building ID": building_id,
        "Building Name": building_info['Building Name'],
        "Location": building_info['Location'],
        "Description": building_info['Description'],
        "Averages": {k: round(v, 2) for k, v in average_data.items()}
    }

    return jsonify(response)

@app.route('/buildings', methods=['GET'])
def get_all_buildings():
    building_summary = df.groupby('Building ID').first().reset_index()
    buildings = building_summary[[
        'Building ID', 'Building Name', 'Location', 'Latitude', 'Longitude', 'Description'
    ]].to_dict(orient='records')

    return jsonify(buildings)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
