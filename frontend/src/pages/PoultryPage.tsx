import { mockPoultryHouses } from "../data/mockData";
import { PoultryHouse } from "../types";

export default function PoultryHousesPage() {

  const totalCapacity = mockPoultryHouses.reduce(
    (sum, house) => sum + house.capacity,
    0
  );

  const totalOccupancy = mockPoultryHouses.reduce(
    (sum, house) => sum + house.currentOccupancy,
    0
  );

  const occupancyRate = (
    (totalOccupancy / totalCapacity) *
    100
  ).toFixed(1);

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Gestion des salles d’élevage
          </h1>

          <p className="text-gray-500">
            Administration des poultry houses
          </p>
        </div>

        <button className="bg-green-700 text-white px-4 py-2 rounded-lg">
          + Nouvelle salle
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Total salles
          </p>

          <h2 className="text-2xl font-bold">
            {mockPoultryHouses.length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Capacité totale
          </p>

          <h2 className="text-2xl font-bold">
            {totalCapacity}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Occupation actuelle
          </p>

          <h2 className="text-2xl font-bold">
            {totalOccupancy}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Taux d’occupation
          </p>

          <h2 className="text-2xl font-bold">
            {occupancyRate}%
          </h2>
        </div>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-3 gap-4">

        {mockPoultryHouses.map((house : PoultryHouse) => {

          const percentage = (
            (house.currentOccupancy / house.capacity) *
            100
          ).toFixed(1);

          return (
            <div
              key={house.id}
              className="bg-white border rounded-xl p-5 space-y-4"
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div>
                  <h3 className="font-semibold">
                    {house.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {house.poultryType}
                  </p>
                </div>

                {house.hasAutomation && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Automatisé
                  </span>
                )}
              </div>

              {/* INFOS */}
              <div className="grid grid-cols-2 gap-3">

                <div className="border rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    Capacité
                  </p>

                  <strong>{house.capacity}</strong>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="text-sm text-gray-500">
                    Occupation
                  </p>

                  <strong>{house.currentOccupancy}</strong>
                </div>
              </div>

              {/* PROGRESSION */}
              <div className="space-y-2">

                <div className="flex justify-between text-sm">
                  <span>Occupation</span>

                  <strong>{percentage}%</strong>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* IOT */}
              <div className="grid grid-cols-3 gap-2 text-xs">

                <div className="border rounded-lg p-2 text-center">
                  {house.ventilationStatus}
                </div>

                <div className="border rounded-lg p-2 text-center">
                  {house.lightingStatus}
                </div>

                <div className="border rounded-lg p-2 text-center">
                  {house.heatingStatus}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">

                <button className="border rounded-lg px-3 py-2 w-full">
                  Voir détails
                </button>

                <button className="bg-black text-white rounded-lg px-3 py-2">
                  IoT
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}