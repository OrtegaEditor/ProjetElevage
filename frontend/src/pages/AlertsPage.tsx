// IoTMonitoringPage.jsx
import React from "react";
import "./iot-monitoring.css";

const sensors = [
  {
    title: "Température Bât. A - Salle 1",
    value: "22.5 °C",
    min: "18 °C",
    max: "24 °C",
    status: "online",
    type: "success",
  },
  {
    title: "Humidité Bât. A - Salle 1",
    value: "68 %",
    min: "50 %",
    max: "80 %",
    status: "online",
    type: "success",
  },
  {
    title: "CO2 Bât. A - Salle 2",
    value: "1850 ppm",
    min: "-",
    max: "1500 ppm",
    status: "warning",
    type: "warning",
  },
  {
    title: "Température Bât. B - Salle 3",
    value: "26.8 °C",
    min: "20 °C",
    max: "25 °C",
    status: "error",
    type: "danger",
  },
  {
    title: "Humidité Bât. C - Salle 1",
    value: "45 %",
    min: "50 %",
    max: "80 %",
    status: "warning",
    type: "warning",
  },
];

export default function IoTMonitoringPage() {
  return (
    <div className="iot-page">
      <div className="iot-header">
        <div>
          <h1>Monitoring IoT Temps Réel</h1>
          <p>Supervision des capteurs et conditions d'élevage</p>
        </div>

        <div className="iot-actions">
          <select>
            <option>Tous les bâtiments</option>
          </select>

          <button>Actualiser</button>
        </div>
      </div>

      <div className="iot-stats">
        <div className="iot-stat-card">
          <span>Température moyenne</span>
          <h2>22.8°C</h2>
          <small>Normal</small>
        </div>

        <div className="iot-stat-card">
          <span>Humidité moyenne</span>
          <h2>61%</h2>
          <small>Normal</small>
        </div>

        <div className="iot-stat-card">
          <span>CO2 moyen</span>
          <h2>1450 ppm</h2>
          <small className="warning-text">Surveillé</small>
        </div>
      </div>

      <div className="chart-card">
        <h3>Évolution temps réel - Dernière heure</h3>

        <div className="fake-chart">
          <div className="line purple" />
        </div>
      </div>

      <div className="sensors-section">
        <h3>État des capteurs (5)</h3>

        <div className="sensor-grid">
          {sensors.map((sensor, index) => (
            <div className={`sensor-card ${sensor.type}`} key={index}>
              <div className="sensor-top">
                <span className={`status ${sensor.type}`}>
                  {sensor.status}
                </span>
              </div>

              <h4>{sensor.title}</h4>

              <h2>{sensor.value}</h2>

              <p>Seuil min: {sensor.min}</p>
              <p>Seuil max: {sensor.max}</p>

              <small>Dernière mise à jour : 19:15:42</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}