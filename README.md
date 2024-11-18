# Building Sustainability Dashboard

## Key Features
1. **Interactive Graphs**:
   - View trends for energy, water, and carbon usage.
   - Analyze HVAC usage and energy vs. occupancy patterns.

2. **Simulation Sliders**:
   - Adjust key metrics like energy consumption, water usage, and carbon emissions.
   - Simulate the impact of changes on sustainability scores and total costs.

3. **Sustainability Scores and Recommendations**:
   - Monitor scores for energy, water, and carbon performance.
   - Receive actionable recommendations based on anomalies.

4. **Building Details**:
   - Edit details like square footage, year built, and floors.

5. **Map View**:
   - Visualize all buildings and their sustainability scores on an interactive map.

---

## Screenshots

### 1. **Home Page**
- Overview of buildings with sustainability scores and an interactive map.
![image](https://github.com/user-attachments/assets/2ed4588b-7f02-4ee3-b9bb-0c3f7f4bc606)
![image](https://github.com/user-attachments/assets/41506162-46a5-45ee-8661-a9a0be8758bf)


### 2. **Building Detail Page (Metrics View)**
- Adjust sliders to simulate sustainability scenarios.
- View sustainability scores, costs, and recommendations.
![image](https://github.com/user-attachments/assets/4f11d2cd-0eb7-4990-b55f-198a02b8a6cb)
![image](https://github.com/user-attachments/assets/48606df9-d421-4237-820d-338938048595)
![image](https://github.com/user-attachments/assets/395a5238-efe3-4dbe-8b8f-9322694321ad)
Before simulation:
![image](https://github.com/user-attachments/assets/73354a08-cdcf-44f6-88f6-5ee21b42a9c3)
After simulation (lowering energy consumption):
![image](https://github.com/user-attachments/assets/15ac1349-e4b7-4899-a479-d86d8355cb3e)

### 3. **Building Detail Page (Graphs)**
- Explore detailed graphs for energy, water, carbon, and HVAC trends.
![image](https://github.com/user-attachments/assets/a3fd6557-afca-4650-902e-041d07167a45)
![image](https://github.com/user-attachments/assets/5c1525f6-1f47-40d7-b343-1a8dc9e015c1)

### 4. **Building Detail Page (Details View)**
- Edit building details such as address, square footage, and year built.
![image](https://github.com/user-attachments/assets/da40707a-7d68-4893-9b21-609b71279d40)

---

## Overview

The **Building Sustainability Dashboard** is a comprehensive application designed to monitor and optimize the energy, water, and carbon efficiency of buildings. It provides real-time trends, simulation tools, and actionable insights to enhance sustainability performance.

---

## Setup Instructions

### Prerequisites
- **Node.js** and **npm** for the frontend.
- **Python 3.8+** for the backend.
- **Flask** and its dependencies for the API.

### Installation

#### 1. Frontend
```bash
npm install
npm run dev
```
#### 2. Backend
```bash
pip install -r requirements.txt
python application.py
```
### Usage
Launch the backend API:
```bash
python application.py
```
Start the frontend:
```bash
npm run dev
```
Access the application in your browser at http://localhost:3000.

## Data Flow
### Frontend:
- Fetches building data from the backend API.
- Displays the sustainability scores, trends, and recommendations using interactive graphs and sliders.
- Simulates the effect of changes in building metrics.

### Backend:
- Processes sustainability scores and cost metrics.
- Fetches data trends from a CSV dataset.
- Categorizes anomalies and generates improvement recommendations.

### Technologies Used
#### Frontend:
- React
- Next.js
- Recharts
- Material-UI

  
#### Backend:
- Flask
- Pandas
- Flask-CORS

