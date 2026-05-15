import React from "react";
import { Button } from "../../components/common/button";

import "./FarmsPage.css";

interface Farm {
  id: number;
  name: string;
  address: string;
  type: "porcin" | "avicole";
  buildings: number;
  animals: number;
  sensors: number;
}

const farms: Farm[] = [
  {
    id: 1,
    name: "Élevage du Val Vert",
    address: "123 Rue de la Ferme, 35000 Rennes",
    type: "porcin",
    buildings: 5,
    animals: 2450,
    sensors: 12,
  },
  {
    id: 2,
    name: "Ferme des Collines",
    address: "456 Route de Campagne, 44000 Nantes",
    type: "avicole",
    buildings: 3,
    animals: 15000,
    sensors: 12,
  },
];

const FarmsPage: React.FC = () => {
  const totalFarms = farms.length;
  const totalBuildings = farms.reduce((acc, f) => acc + f.buildings, 0);
  const totalAnimals = farms.reduce((acc, f) => acc + f.animals, 0);

  return (
    <div className="farms-container">
      <div className="header-row">
        <h2>Gestion des fermes</h2>
        <button className="btn-primary">+ Nouvelle ferme</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Total fermes</div>
          <div className="value">{totalFarms}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total bâtiments</div>
          <div className="value">{totalBuildings}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total animaux</div>
          <div className="value">{totalAnimals.toLocaleString()}</div>
        </div>
      </div>

      <div className="farm-cards">
        {farms.map((farm) => (
          <div key={farm.id} className="farm-card">
            <div className="farm-header">
              <h3>{farm.name}</h3>
              <span
                className={`badge ${
                  farm.type === "porcin" ? "badge-green" : "badge-blue"
                }`}
              >
                {farm.type === "porcin" ? "Élevage porcin" : "Élevage avicole"}
              </span>
            </div>
            <p className="address">{farm.address}</p>

            <div className="farm-stats">
              <div>
                <div className="label">Bâtiments</div>
                <div className="value">{farm.buildings}</div>
              </div>
              <div>
                <div className="label">Animaux</div>
                <div className="value highlight">{farm.animals.toLocaleString()}</div>
              </div>
              <div>
                <div className="label">Capteurs</div>
                <div className="value">{farm.sensors}</div>
              </div>
            </div>

            <div className="farm-actions">
              <button className="btn-outline">Modifier</button>
              <button className="btn-outline">IoT</button>
              <button className="btn-primary">Voir détails</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmsPage;
