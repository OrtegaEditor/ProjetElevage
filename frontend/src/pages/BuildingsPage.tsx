// BuildingsPage.jsx
import React from "react";
import "./buildings.css";

const buildings = [
  {
    id: 1,
    name: "Bâtiment A - Engraissement",
    farm: "Élevage du Val Vert",
    rooms: 4,
    capacity: 500,
    occupied: 487,
    status: "Plein",
  },
  {
    id: 2,
    name: "Bâtiment B - Maternité",
    farm: "Élevage du Val Vert",
    rooms: 6,
    capacity: 300,
    occupied: 289,
    status: "Plein",
  },
  {
    id: 3,
    name: "Bâtiment C - Post-sevrage",
    farm: "Élevage du Val Vert",
    rooms: 5,
    capacity: 400,
    occupied: 395,
    status: "Plein",
  },
];

export default function BuildingsPage() {
  const totalCapacity = buildings.reduce((a, b) => a + b.capacity, 0);
  const totalOccupied = buildings.reduce((a, b) => a + b.occupied, 0);
  const occupancyRate = (
    (totalOccupied / totalCapacity) *
    100
  ).toFixed(1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestion des bâtiments</h1>
          <p>Administration des bâtiments d'élevage</p>
        </div>

        <div className="header-actions">
          <select>
            <option>Toutes les fermes</option>
          </select>

          <button className="primary-btn">+ Nouveau bâtiment</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total bâtiments</span>
          <h2>3</h2>
        </div>

        <div className="stat-card">
          <span>Capacité totale</span>
          <h2>{totalCapacity}</h2>
        </div>

        <div className="stat-card">
          <span>Occupation actuelle</span>
          <h2>{totalOccupied}</h2>
        </div>

        <div className="stat-card">
          <span>Taux d'occupation</span>
          <h2>{occupancyRate}%</h2>
        </div>
      </div>

      <div className="buildings-grid">
        {buildings.map((building) => {
          const percentage = (
            (building.occupied / building.capacity) *
            100
          ).toFixed(1);

          return (
            <div className="building-card" key={building.id}>
              <div className="card-top">
                <div>
                  <h3>{building.name}</h3>
                  <p>{building.farm}</p>
                </div>

                <span className="badge">{building.status}</span>
              </div>

              <div className="info-grid">
                <div className="info-box">
                  <span>Salles</span>
                  <strong>{building.rooms}</strong>
                </div>

                <div className="info-box">
                  <span>Capacité</span>
                  <strong>{building.capacity}</strong>
                </div>
              </div>

              <div className="occupancy">
                <div className="occupancy-text">
                  <span>Occupation</span>
                  <strong>
                    {building.occupied} / {building.capacity}
                  </strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <small>{percentage}% occupé</small>
              </div>

              <div className="card-actions">
                <button className="details-btn">Voir détails</button>
                <button className="iot-btn">IoT</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}