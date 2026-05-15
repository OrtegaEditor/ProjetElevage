export default function DashboardPage() {
  const productionData = [
    { month: "Jan", value: 2400 },
    { month: "Feb", value: 2550 },
    { month: "Mar", value: 2650 },
    { month: "Apr", value: 2800 },
    { month: "May", value: 2950 },
  ];

  const alerts = [
    {
      title: "Critical Temperature - Building B",
      description:
        "The temperature exceeds the maximum threshold (26.8°C) in maternity room 3.",
      time: "08/05/2026 19:00:42",
      level: "critical",
    },
    {
      title: "High CO₂ Level - Building A",
      description:
        "CO₂ concentration at 1850 ppm in room 2 (threshold: 1500 ppm).",
      time: "08/05/2026 18:30:42",
      level: "warning",
    },
    {
      title: "Low Humidity - Building C",
      description:
        "Humidity at 45% in room 1 (recommended minimum: 50%).",
      time: "08/05/2026 17:15:42",
      level: "warning",
    },
    {
      title: "Mortality Detected - Batch P2024-03",
      description: "2 animals reported dead this morning.",
      time: "08/05/2026 16:15:42",
      level: "info",
    },
  ];

  const sensors = [
    {
      name: "Temperature Bldg. A - Room 1",
      value: "22.5 °C",
      status: "online",
    },
    {
      name: "Humidity Bldg. A - Room 1",
      value: "68 %",
      status: "online",
    },
    {
      name: "CO₂ Bldg. A - Room 2",
      value: "1850 ppm",
      status: "warning",
    },
    {
      name: "Temperature Bldg. B - Room 3",
      value: "26.8 °C",
      status: "error",
    },
    {
      name: "Humidity Bldg. C - Room 1",
      value: "45 %",
      status: "warning",
    },
  ];

  const badgeStyles: Record<string, string> = {
    online: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    critical: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 lg:p-8">
        {/* Top Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
          <Card title="Production & Mortality (Last 5 Months)">
            <div className="h-80 p-6">
              <div className="flex h-full items-end justify-between gap-4">
                {productionData.map((item) => (
                  <div
                    key={item.month}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="relative w-full max-w-16 h-64 rounded-lg bg-gray-100 overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-lg bg-red-500"
                        style={{
                          height: `${(item.value / 3000) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="IoT Monitoring - Last 24 Hours">
            <div className="h-80 p-6">
              <div className="h-full rounded-2xl border border-orange-100 bg-orange-50 overflow-hidden">
                <svg viewBox="0 0 600 240" className="w-full h-full">
                  <polyline
                    fill="rgba(251,146,60,0.25)"
                    points="0,90 120,95 240,75 360,60 480,55 600,70 600,240 0,240"
                  />
                  <polyline
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    points="0,90 120,95 240,75 360,60 480,55 600,70"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card title="Active Alerts">
              <div className="space-y-4 p-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.title}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {alert.description}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {alert.time}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          badgeStyles[alert.level]
                        }`}
                      >
                        {alert.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Sensor Status">
            <div className="space-y-3 p-6">
              {sensors.map((sensor) => (
                <div
                  key={sensor.name}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {sensor.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {sensor.value}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        badgeStyles[sensor.status]
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}