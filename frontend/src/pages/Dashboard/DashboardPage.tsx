export default function FarmConnectDashboard() {
  const production = [
    { month: 'Jan', production: 2400, mortality: 35 },
    { month: 'Feb', production: 2550, mortality: 40 },
    { month: 'Mar', production: 2650, mortality: 42 },
    { month: 'Apr', production: 2800, mortality: 38 },
    { month: 'May', production: 2950, mortality: 45 },
  ];

  const monitoring = [
    { time: '00h', temperature: 21 },
    { time: '04h', temperature: 20.5 },
    { time: '08h', temperature: 22 },
    { time: '12h', temperature: 23.5 },
    { time: '16h', temperature: 24 },
    { time: '20h', temperature: 22.8 },
  ];

  const alerts = [
    {
      title: 'Critical Temperature - Building B',
      description:
        'The temperature exceeds the maximum threshold (26.8°C) in maternity room 3.',
      time: '08/05/2026 19:00:42',
      level: 'critical',
    },
    {
      title: 'High CO₂ Level - Building A',
      description:
        'CO₂ concentration at 1850 ppm in room 2 (threshold: 1500 ppm).',
      time: '08/05/2026 18:30:42',
      level: 'warning',
    },
    {
      title: 'Low Humidity - Building C',
      description:
        'Humidity at 45% in room 1 (recommended minimum: 50%).',
      time: '08/05/2026 17:15:42',
      level: 'warning',
    },
    {
      title: 'Mortality Detected - Batch P2024-03',
      description: '2 animals reported dead this morning.',
      time: '08/05/2026 16:15:42',
      level: 'info',
    },
  ];

  const sensors = [
    { name: 'Temperature Bldg. A - Room 1', value: '22.5 °C', status: 'online' },
    { name: 'Humidity Bldg. A - Room 1', value: '68 %', status: 'online' },
    { name: 'CO₂ Bldg. A - Room 2', value: '1850 ppm', status: 'warning' },
    { name: 'Temperature Bldg. B - Room 3', value: '26.8 °C', status: 'error' },
    { name: 'Humidity Bldg. C - Room 1', value: '45 %', status: 'warning' },
  ];

  const menu = [
    'Dashboard',
    'Users',
    'Farms',
    'Buildings',
    'IoT Monitoring',
    'Alerts',
    'Batch Management',
    'Sales',
    'Inventory',
    'Analytics',
    'Settings',
  ];

  const statusStyles = {
    online: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    critical: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const iconMap = {
    Dashboard: '📊',
    Users: '👥',
    Farms: '🚜',
    Buildings: '🏢',
    'IoT Monitoring': '🌡️',
    Alerts: '⚠️',
    'Batch Management': '🐄',
    Sales: '🛒',
    Inventory: '📦',
    Analytics: '📈',
    Settings: '⚙️',
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 p-6 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center text-2xl">
                🌿
              </div>
              <div>
                <h1 className="text-3xl font-bold">FarmConnect</h1>
                <p className="text-sm text-gray-500">IoT Platform</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item, index) => (
              <button
                key={item}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                  index === 0
                    ? 'bg-green-600 text-white shadow'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>{iconMap[item]}</span>
                <span className="font-medium">{item}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full max-w-xl px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex items-center gap-4 ml-6">
              <button className="relative text-2xl">🔔</button>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  J
                </div>
                <div>
                  <div className="font-semibold">Jean Dupont</div>
                  <div className="text-sm text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Top Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <Card title="Production & Mortality (Last 5 Months)">
              <div className="h-72 flex items-end gap-6 px-6 pb-6">
                {production.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full max-w-12 h-56 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-lg"
                        style={{ height: `${(item.production / 3000) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="IoT Monitoring - Last 24 Hours">
              <div className="h-72 p-6">
                <div className="relative h-full rounded-xl bg-orange-50 border border-orange-100 overflow-hidden">
                  <svg viewBox="0 0 600 240" className="w-full h-full">
                    <polyline
                      fill="rgba(251, 146, 60, 0.25)"
                      stroke="none"
                      points="0,80 120,85 240,70 360,55 480,50 600,65 600,240 0,240"
                    />
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4"
                      points="0,80 120,85 240,70 360,55 480,50 600,65"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card title="Active Alerts">
                <div className="space-y-4 p-6">
                  {alerts.map((alert) => (
                    <div
                      key={alert.title}
                      className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-semibold text-lg">{alert.title}</h4>
                          <p className="text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-sm text-gray-400 mt-2">{alert.time}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[alert.level]}`}
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
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-sm">{sensor.name}</h4>
                        <p className="text-gray-500 mt-1">{sensor.value}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[sensor.status]}`}
                      >
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
