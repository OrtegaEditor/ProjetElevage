import {
    User,
    Farm,
    PoultryHouse,
    Sensor,
    Alert,
    Flock,
    Treatment,
    Vaccination,
    Sale,
    Client,
    StockItem,
    Disease,
    AutomationRule,
    Band,
    Event,
    StockMovement,
    Task,
    Supplier,
    Weighing,
    Espece
} from "../types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Takam BERTIN (Admin)",
    email: "admin@aviculture.fr",
    password : "admin123",
    role: "admin",
    farms: ["farm-1"],
    telephone: "64655353",
    active: true,
  },
  {
    id: "2",
    name: "Tagne Pierre ",
    email: "agent@aviculture.fr",
    password : "agent123",
    role: "agent",
    farms: ["farm-1"],
    telephone: "64655353",
    active : true,
  },
  {
    id: "3",
    name: "Dr. Pierre Dubois",
    email: "vet@aviculture.fr",
    role: "veterinarian",
    password : "vet123",
    farms: ["farm-1"],
    active : true,
    telephone: "64655353",
    

  },
  {
    id: "4",
    name: "Geh Sophie ",
    email: "commercial@aviculture.fr",
    role: "commercial",
    password : "com123",
    farms: ["farm-1"],
    active : true,
    telephone:"64655353",


  },
];

export const mockBands: Band[] = [

  {
    id: "band-1",
    name : "Arrivage de poulets de chair",
    farmId: "farm-1",
    especeId: "broiler",
    quantity: 10000,
    createdDate: "2024-04-01",
    fournisseur: "Couvoirs du Cameroun",
    prixUnitaire: 450,
    status: "active",
    notes: "Lot de poussins d'un jour, bonne qualité",
  },

  {
    id: "band-2",
    name : "Arrivage de poulets de canards",
    farmId: "farm-1",
    especeId: "duck",
    quantity: 8000,
    createdDate: "2024-01-15",
    fournisseur: "Avicam Bafoussam",
    prixUnitaire: 500,
    status: "active",
    notes: "Poulettes 18 semaines",
  },

  {
    id: "band-3",
    name : "Arrivage de poulets de dindes",
    farmId: "farm-1",
    especeId: "turkey",
    quantity: 5000,
    createdDate: "2024-02-10",
    fournisseur: "Couvoirs du Cameroun",
    prixUnitaire: 800,
    status: "active",
  },

  {
    id: "band-4",
    name : "Arrivage de poulets d'oies",
    farmId: "farm-1",
    especeId: "goose",
    quantity: 3000,
    createdDate: "2024-03-05",
    fournisseur: "Élevage Nkoudem",
    prixUnitaire: 600,
    status: "active",
  },

];

export const mockFarms: Farm[] = [

  {
    id: "farm-1",
    name: "Poulailler Principal Bayangam",
    address: "Bayangam, Région Ouest, Cameroun",
    type: ["broiler","turkey"],
    description: "Poulailler principal de l'exploitation avicole",
    createdAt: "2022-01-15",
    totalCapacity: 26000,
    managerId: "1",
    active : true,
 },
   {
    id: "farm-2",
    name: "Poulailler de Mbouda",
    address: "Bamboutos, Région Ouest, Cameroun",
    type: ["layer","duck"],
    description: "Poulailler specialise dans la production des pondeuse et canard",
    createdAt: "2022-01-15",
    totalCapacity: 26000,
    managerId: "1",
    active : true,
 },

  {

    id: "farm-3",
    name: "Poulailler Secondaire Bafoussam",
    address: "Bafoussam, Région Ouest, Cameroun",
    type: ["layer","broiler"],
    description: "Poulailler secondaire spécialisé pondeuses",
    createdAt: "2023-06-10",
    totalCapacity: 12000,
    managerId: "1",
    active : true,
  },

];

export const mockPoultryHouses: PoultryHouse[] = [

  {

    id: "house-1",
    name: "Salle A - Poulets de chair",
    farmId: "farm-1",
    capacity: 10000,
    currentOccupancy: 9850,
    poultryType: "broiler",
    hasAutomation: true,
    ventilationStatus: "auto",
    lightingStatus: "auto",
    heatingStatus: "auto",
    active: true,
    description: "Salle principale poulets de chair",

  },

  {

    id: "house-2",
    name: "Salle B - Poules pondeuses",
    farmId: "farm-1",
    capacity: 8000,
    currentOccupancy: 7890,
    poultryType: "layer",
    hasAutomation: true,
    ventilationStatus: "auto",
    lightingStatus: "auto",
    heatingStatus: "manual",
    active: true,
    description: "Salle pondeuses haute densité",

  },

  {

    id: "house-3",
    name: "Salle C - Dindes",
    farmId: "farm-1",
    capacity: 5000,
    currentOccupancy: 4920,
    poultryType: "turkey",
    hasAutomation: true,
    ventilationStatus: "auto",
    lightingStatus: "manual",
    heatingStatus: "auto",
    active: true,

  },

  {

    id: "house-4",
    name: "Salle D - Canards",
    farmId: "farm-1",
    capacity: 3000,
    currentOccupancy: 2850,
    poultryType: "duck",
    hasAutomation: false,
    ventilationStatus: "manual",
    lightingStatus: "manual",
    heatingStatus: "off",
    active: true,

  },

   {
    id: "house-5",
    name: "Salle E - Pondeuses",
    farmId: "farm-2",
    capacity: 12000,
    currentOccupancy: 10500,
    poultryType: "layer",
    hasAutomation: true,
    ventilationStatus: "auto",
    lightingStatus: "auto",
    heatingStatus: "auto",
    active: true,
    description: "Grande salle pondeuses farm-2",

    },

];

export const mockEspece: Espece[] = [{
  id : "broiler",
  name : "Poules pondeuses",
  averageCycle : 45,
},
{
  id : "turkey",
  name : "Dindes",
  averageCycle : 45,
},
{ 
  id : "goose",
  name : "Oies",
  averageCycle : 45,
},
{  
  id : "layer",
  name : "Poules pondeuses",
  averageCycle : 45,
},
{  
  id : "duck",
  name : "Canards",
  averageCycle : 45,
},
]
export const mockSensors: Sensor[] = [
    {
    id: "sensor-1",
    name: "Température Salle A ",
    type: "temperature",
    poultryHouseId: "house-1",
    value: 22.5,
    unit: "°C",
    status: "online",
    lastUpdate: new Date().toISOString(),
    minValue: 18,
    maxValue: 24,
    },
    {
    id: "sensor-2",
    name: "Humidité Salle A ",
    type: "light",
    poultryHouseId: "house-1",
    value: 62,
    unit: "%",
    status: "online",
    lastUpdate: new Date().toISOString(),
    minValue: 50,
    maxValue: 70,
    },
    {
    id: "sensor-3",
    name: "NH3 Salle A  ",
    type: "temperature",
    poultryHouseId: "house-1",
    value: 18,
    unit: "ppm",
    status: "warning",
    lastUpdate: new Date().toISOString(),
    minValue: 17,
    maxValue: 20,
    },
    {
    id: "sensor-4",
    name: "Luminosité Salle B",
    type: "light",
    poultryHouseId: "house-2",
    value: 45,
    unit: "lux",
    status: "online",
    lastUpdate: new Date().toISOString(),
    minValue: 20,
    maxValue: 60,
    },
    {
    id: "sensor-5",
    name: "Température Salle B",
    type: "temperature",
    poultryHouseId: "house-2",
    value: 26.8,
    unit: "°C",
    status: "error",
    lastUpdate: new Date().toISOString(),
    maxValue: 20,
    minValue: 25,
    },
    {
    id: "sensor-6",
    name: "NH3 Salle C",
    type: "Ammoniac",
    poultryHouseId: "house-3",
    value: 2100,
    unit: "ppm",
    status: "warning",
    lastUpdate: new Date().toISOString(),
    maxValue: 20,
    minValue: 25,
    },
];

export const mockAlerts: Alert[] = [
{
    id: "1",
    type: "temperature",
    status: "resolved_auto",
    title: "Température élevée",
    message: "Température salle A au-dessus du seuil (32°C)",
    idPoultryHouse: "PH1",
    poultryHouseId: "PH1",
    farmId: "F1",
    createdAt: "2026-05-14T08:10:00Z",
    resolvedAt: "2026-05-14T08:15:00Z",
},

{
    id: "2",
    type: "light",
    status: "resolved_auto",
    title: "Humidité anormale",
    message: "Humidité salle B trop basse (35%)",
    idPoultryHouse: "PH2",
    poultryHouseId: "PH2",
    farmId: "F1",
    createdAt: "2026-05-14T09:00:00Z",
    resolvedAt: "2026-05-14T09:05:00Z",
},

{
    id: "3",
    type: "ammoniac",
    status: "active",
    title: "Taux d’ammoniac élevé",
    message: "Concentration NH3 critique détectée dans bâtiment C",
    idPoultryHouse: "PH3",
    poultryHouseId: "PH3",
    farmId: "F1",
    createdAt: "2026-05-14T10:20:00Z",
},

{
    id: "4",
    type: "temperature",
    status: "ignored",
    title: "Baisse de température",
    message: "Température en dessous du seuil (18°C)",
    idPoultryHouse: "PH1",
    poultryHouseId: "PH1",
    farmId: "F1",
    createdAt: "2026-05-14T11:00:00Z",
},
];
export const mockFlocks: Flock[] = [
    {
        id: "flock-1",
        name: "PL2026-03",
        bandId: "band-1",
        farmId: "farm-1",
        poultryHouseId: "house-1",
        poultryType: "broiler",
        quantity: 9850,
        startDate: "2026-04-01",
        status: "active",
        cycle: 45,
        averageWeight: 1.85,
        mortality: 150, // Mortalité normale (~1.5%)
        age: 35,
    },
    {
        id: "flock-2",
        name: "PL2026-02",
        bandId: "band-2",
        farmId: "farm-1",
        poultryHouseId: "house-2",
        poultryType: "layer",
        cycle: 45,
        quantity: 7890,
        startDate: "2026-01-15",
        status: "active",
        averageWeight: 1.65,
        mortality: 410, // Provoquera l'état "critical" dans le calcul (>3%)
        age: 112,
    },
    {
        id: "flock-3",
        name: "PL2026-01",
        bandId: "band-3",
        farmId: "farm-1",
        cycle: 50,
        poultryHouseId: "house-3",
        poultryType: "turkey",
        quantity: 4920,
        startDate: "2026-02-10",
        status: "active",
        averageWeight: 8.5,
        mortality: 80, // Provoquera l'état "warning"
        age: 84,
    },
    // NOUVEAU CAS : Lot sain et terminé (permet de tester l'historique pur)
    {
        id: "flock-4",
        name: "PL2025-08",
        bandId: "band-4",
        farmId: "farm-1",
        cycle: 42,
        poultryHouseId: "house-1",
        poultryType: "duck",
        quantity: 3000,
        startDate: "2025-11-01",
        status: "active",
        averageWeight: 2.10,
        mortality: 45,
        age: 42,
    }
];

export const mockDiseases: Disease[] = [
    {
        id: "disease-1",
        name: "Maladie de Newcastle",
        type: "viral",
        symptoms: ["Dépression", "Détresse respiratoire", "Diarrhée verdâtre", "Troubles nerveux"],
        severity: "high",
    },
    {
        id: "disease-2",
        name: "Bronchite infectieuse",
        type: "viral",
        symptoms: ["Toux", "Éternuements", "Écoulement nasal", "Chute de ponte"],
        severity: "medium",
    },
    {
        id: "disease-3",
        name: "Coccidiose",
        type: "parasitic",
        symptoms: ["Diarrhée sanguinolente", "Léthargie", "Perte d'appétit"],
        severity: "medium",
    },
    {
        id: "disease-4",
        name: "Grippe aviaire",
        type: "viral",
        symptoms: ["Mortalité élevée", "Détresse respiratoire", "Chute de ponte brutale"],
        severity: "high",
    },
    // NOUVEAU CAS : Pathologie bactérienne pour enrichir le graphique
    {
        id: "disease-5",
        name: "Colibacillose",
        type: "bacterial",
        symptoms: ["Anorexie", "Mortalité tardive", "Péricardite"],
        severity: "medium",
    }
];

export const mockTreatments: Treatment[] = [
    // CAS 1 : Traitement EN COURS (endDate est dans le futur par rapport à mai 2026)
    {
        id: "treatment-1",
        flockId: "flock-1",
        veterinarianId: "3",
        diseaseId: "disease-3",
        medication: "Amprolium 20%",
        dosage: "125g/100L d'eau pendant 5 jours",
        startDate: "2026-05-20",
        animalsCount: 9500,
        endDate: "2026-05-25", // Actif !
        notes: "Traitement collectif suite à détection de coccidies à l'analyse fécale.",
    },
    // CAS 2 : Traitement EN COURS provoquant une alerte critique (sur flock-2)
    {
        id: "treatment-2",
        flockId: "flock-2",
        veterinarianId: "3",
        diseaseId: "disease-1",
        medication: "Tylosine Soluble",
        dosage: "500mg/L d'eau pendant 5 jours",
        startDate: "2026-05-21",
        animalsCount: 7500,
        endDate: "2026-05-26", // Actif !
        notes: "Forte suspicion clinique. Évolution sous surveillance stricte.",
    },
    // CAS 3 : NOUVEAU CAS - Traitement TERMINÉ (permet de valider qu'il n'apparaît plus en actif)
    {
        id: "treatment-3",
        flockId: "flock-3",
        veterinarianId: "3",
        diseaseId: "disease-2",
        medication: "Érythromycine",
        dosage: "200mg/L d'eau pendant 3 jours",
        startDate: "2026-04-10",
        animalsCount: 4900,
        endDate: "2026-04-13", // Terminé
        notes: "Guérison complète du lot constatée.",
    }
];

export const mockVaccinations: Vaccination[] = [
    // ─── CAS EN MAI 2026 (Mois en cours pour tester le visuel immédiat) ───
    {
        id: "vacc-1",
        flockId: "flock-1",
        vaccine: "Newcastle + Bronchite IB",
        diseaseId: "disease-1",
        administrationDate: "2026-05-02", // Début mai
        nextDueDate: "2026-05-16",         // Rappel milieu de mai (passé)
        method: "drinking_water",
        quantity: 10000,
        veterinarianId: "3",
        notes: "Vaccination de masse J+7 effectuée en début de cycle",
    },
    {
        id: "vacc-4",
        flockId: "flock-2",
        vaccine: "Rappel Gumboro J21",
        diseaseId: "disease-4",
        administrationDate: "2026-05-12",
        nextDueDate: "2026-05-26",         // Rappel à venir (Alerte orange active)
        method: "eye_drop",                // Test de la méthode Gouttes oculaires
        quantity: 7890,
        veterinarianId: "3",
        notes: "Inoculation oculaire individuelle",
    },
    {
        id: "vacc-5",
        flockId: "flock-3",
        vaccine: "Vaccin Choléra Aviaire",
        diseaseId: "disease-2",
        administrationDate: "2026-05-22", // Aujourd'hui ! (Affiche une puce verte)
        nextDueDate: "2026-06-22",         // Test du saut de mois automatique (Juin)
        method: "injection",               // Test de la méthode Injection
        quantity: 4920,
        veterinarianId: "3",
        notes: "Injection intramusculaire par équipe vétérinaire",
    },

    // ─── CAS HISTORIQUES (Pour tester le changement de mois vers le passé) ───
    {
        id: "vacc-2",
        flockId: "flock-2",
        vaccine: "Gumboro Initial",
        diseaseId: "disease-4",
        administrationDate: "2026-01-29",
        nextDueDate: "2026-02-12",
        method: "drinking_water",
        quantity: 8000,
        veterinarianId: "3",
    },
    {
        id: "vacc-3",
        flockId: "flock-3",
        vaccine: "Newcastle souche lentogène",
        diseaseId: "disease-1",
        administrationDate: "2026-02-24",
        method: "spray",
        quantity: 5000,
        veterinarianId: "3",
        notes: "Vaccination par pulvérisation J+14 en bâtiment fermé",
    }
];


export const mockClients: Client[] = [
    {
    id: "client-1",
    name: "Boucherie Moderne",
    type: "wholesaler",
    email: "contact@boucherie-moderne.fr",
    phone: "04 74 23 45 67",
    address: "15 Rue du Commerce, 01000 Bourg-en-Bresse",
    totalPurchases: 185000,
    },
    {
    id: "client-2",
    name: "Supermarché Central",
    type: "supermarket",
    email: "achats@supermarche-central.fr",
    phone: "04 74 98 76 54",
    address: "Zone Commerciale, 01000 Bourg-en-Bresse",
    totalPurchases: 420000,
    },
    {
    id: "client-3",
    name: "Restaurant Le Gourmet",
    type: "restaurant",
    email: "chef@legourmet.fr",
    phone: "04 74 56 78 90",
    address: "8 Place de la Liberté, 01000 Bourg-en-Bresse",
    totalPurchases: 68000,
    },
];

export const mockStock: StockItem[] = [
  // ─── CAS 1 : ÉTAT NORMAL (quantity > minThreshold) ───────────────────
  {
    id: "stock-1",
    name: "Aliment démarrage poulet",
    category: "feed",
    quantity: 4500,
    unit: "kg",
    minThreshold: 2000,
    status: "normal", // Inclus pour typage, mais écrasé visuellement par getStockStatus
    farmId: "farm-1",
    lastRestocked: "2026-05-01",
    expiryDate: "2026-11-01",
  },
  {
    id: "stock-2",
    name: "Vaccin New Castle (HB1)",
    category: "vaccine",
    quantity: 15,
    unit: "flacons",
    minThreshold: 10,
    status: "normal",
    farmId: "farm-1",
    lastRestocked: "2026-04-15",
    expiryDate: "2026-08-20",
  },

  // ─── CAS 2 : ÉTAT BAS (quantity <= minThreshold ET > minThreshold * 0.5)
  {
    id: "stock-3",
    name: "Aliment croissance dinde",
    category: "feed",
    quantity: 1200, // Inférieur ou égal à 1500 (Seuil), supérieur à 750 (Seuil * 0.5)
    unit: "kg",
    minThreshold: 1500,
    status: "low",
    farmId: "farm-1",
    lastRestocked: "2026-03-20",
    expiryDate: "2026-09-20",
  },
  {
    id: "stock-4",
    name: "Vitamines croissance liquide",
    category: "medication",
    quantity: 6, // Inférieur ou égal à 8, supérieur à 4
    unit: "litres",
    minThreshold: 8,
    status: "low",
    farmId: "farm-1",
    lastRestocked: "2026-02-10",
    expiryDate: "2027-02-10",
  },

  // ─── CAS 3 : ÉTAT CRITIQUE (quantity <= minThreshold * 0.5) ───────────
  // Note : Ces éléments feront apparaître l'encadré d'alerte rouge en haut
  {
    id: "stock-5",
    name: "Aliment finition poules pondeuses",
    category: "feed",
    quantity: 800, // Inférieur ou égal à 2000 * 0.5 (1000) -> Critique !
    unit: "kg",
    minThreshold: 2000,
    status: "critical",
    farmId: "farm-1",
    lastRestocked: "2026-01-05",
    expiryDate: "2026-07-05",
  },
  {
    id: "stock-6",
    name: "Antibiotique Large Spectre",
    category: "medication",
    quantity: 1, // Inférieur ou égal à 5 * 0.5 (2.5) -> Critique !
    unit: "boîtes",
    minThreshold: 5,
    status: "critical",
    farmId: "farm-1",
    lastRestocked: "2025-12-12",
    expiryDate: "2026-06-12",
  },

  // ─── CAS 4 : VALEURS MANQUANTES (Vérification des tirets "-" dans le tableau)
  {
    id: "stock-7",
    name: "Désinfectant surfaces élevage",
    category: "other", // Permet de tester le cas "default" du switch category label
    quantity: 50,
    unit: "litres",
    minThreshold: 20,
    status: "normal",
    farmId: "farm-1",
    lastRestocked: "2025-12-12", // Affichera "-" sous Dernier réappro.
    expiryDate: undefined,      // Affichera "-" sous Expiration
  }
];

export const mockAutomationRules: AutomationRule[] = [
    {
    id: "auto-1",
    poultryHouseId: "house-1",
    type: "ventilation",
    enabled: true,
    condition: "Si température > 24°C",
    action: "Activer ventilation vitesse 3",
    },
{
    id: "auto-2",
    poultryHouseId: "house-1",
    type: "lighting",
    enabled: true,
    condition: "Programme automatique",
    action: "16h lumière / 8h obscurité",
    schedule: {
    startTime: "05:00",
    endTime: "21:00",
    },
},
{
    id: "auto-3",
    poultryHouseId: "house-2",
    type: "heating",
    enabled: true,
    condition: "Si température < 20°C",
    action: "Activer chauffage radiant",
},
];

export const mockTasks: Task[] = [
{
    id: "1",
    type: "weighing",
    title: "Pesée du lot",
    flockId :"flock-2",
    poultryHouseId: "Bât. C",
    time: "09:00",
    status: "pending",
},

{
    id: "2",
    type: "feeding",
    title: "Contrôle alimentation",
    flockId :"flock-1",
    poultryHouseId: "Bât. C",
    time: "11:00",
    status: "completed",
},

{
    id: "3",
    type: "ventilation",
    title: "installer ventilation",
    flockId :"flock-2",
    poultryHouseId: "Bât. B",
    time: "14:00",
    status: "pending",
},

{
    id: "4",
    type: "mortality",
    title: "Rapport mortalité du jour",
    flockId :"flock-2" ,
    poultryHouseId: "Bât. A",
    time: "17:00",
    status: "pending",
},
];

export const mockWeighings: Weighing[] = [
{
    id: "weigh-1",
    flockId: "flock-1",
    agentId: "2",
    date: "2024-04-15",
    weights: [1.2, 1.3, 1.25, 1.4, 1.1, 1.35, 1.28, 1.32, 1.18, 1.27],
    averageWeight: 1.27,
    minWeight: 1.1,
    maxWeight: 1.4,
    stdDeviation: 0.08,
    notes: "Pesée semaine 2"
  },
  {
    id: "weigh-2",
    flockId: "flock-1",
    agentId: "2",
    date: "2024-04-22",
    weights: [1.6, 1.7, 1.65, 1.8, 1.55, 1.72, 1.68, 1.75, 1.58, 1.63],
    averageWeight: 1.67,
    minWeight: 1.55,
    maxWeight: 1.80,
    stdDeviation: 0.08,
    notes: "Pesée semaine 3"
  },
  {
    id: "weigh-3",
    flockId: "flock-1",
    agentId: "2",
    date: "2024-04-29",
    weights: [1.9, 2.0, 1.95, 2.1, 1.85, 1.98, 2.02, 1.92, 1.88, 1.97],
    averageWeight: 1.96,
    minWeight: 1.85,
    maxWeight: 2.10,
    stdDeviation: 0.08,
  },
  {
    id: "weigh-4",
    flockId: "flock-2",
    agentId: "2",
    date: "2024-04-10",
    weights: [1.4, 1.5, 1.45, 1.6, 1.35, 1.52, 1.48, 1.55, 1.38, 1.43],
    averageWeight: 1.47,
    minWeight: 1.35,
    maxWeight: 1.60,
    stdDeviation: 0.08,
  },
  {
    id: "weigh-5",
    flockId: "flock-2",
    agentId: "2",
    date: "2024-04-20",
    weights: [1.7, 1.8, 1.75, 1.9, 1.65, 1.82, 1.78, 1.85, 1.68, 1.73],
    averageWeight: 1.77,
    minWeight: 1.65,
    maxWeight: 1.90,
    stdDeviation: 0.08,
  },
];


export const mockSales: Sale[] = [
  {
    id: "sale-1",
    clientId: "client-2",
    flockId: "flock-1",
    quantity: 5000,
    pricePerKg: 3.2,
    totalWeight: 9250,
    totalAmount: 29600,
    date: "2024-05-05",
    invoiceNumber: "INV-2024-0042",
    status: "paid",
  },
  {
    id: "sale-2",
    clientId: "client-1",
    flockId: "flock-1",
    quantity: 2000,
    pricePerKg: 3.5,
    totalWeight: 3700,
    totalAmount: 12950,
    date: "2024-05-08",
    invoiceNumber: "INV-2024-0043",
    status: "pending",
  },
    {
    id: "sale-3",
    clientId: "client-3",
    flockId: "flock-1",
    quantity: 5000,
    pricePerKg: 3.2,
    totalWeight: 9250,
    totalAmount: 29600,
    date: "2024-05-05",
    invoiceNumber: "INV-2024-0042",
    status: "paid",
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "supplier-1",
    name: "Couvoirs du Cameroun",
    email: "contact@couvoirs.cm",
    phone: "677000111",
    address: "Douala, Cameroun",
    company: "Couvoirs du Cameroun SARL",
    suppliedCategories: ["feed"],
    farmIds: ["farm-1", "farm-2"],
    createdAt: "2026-05-22",
    active: true,
  },

  {
    id: "supplier-2",
    name: "Vet Pharma Afrique",
    email: "support@vetpharma.cm",
    phone: "699112233",
    address: "Yaoundé, Cameroun",
    company: "Vet Pharma Afrique",
    suppliedCategories: ["vaccine", "medication"],
    farmIds: ["farm-1"],
    createdAt: "2026-05-22",
    active: true,
  },

  {
    id: "supplier-3",
    name: "AgroCAM",
    phone: "656428832",
    suppliedCategories: ["band"],
    farmIds: ["farm-1"],
    createdAt: "2026-05-22",
    active: true,
  },
    {
    id: "supplier-4",
    name: "Agro Equipements",
    phone: "655778899",
    suppliedCategories: ["equipment"],
    farmIds: ["farm-2"],
    createdAt: "2026-05-22",
    active: true,
  },
];


export const mockStockMovements: StockMovement[] = [
  // ─── CAS 1 : LES ENTRÉES (APPROVISIONNEMENTS) ───────────────────────
  {
    id: "mv-1",
    stockItemId: "stock-1",
    stockItemName: "Aliment démarrage poulet",
    type: "entry",
    quantity: 5000,
    unit: "kg",
    date: "2026-05-18T08:30:00Z",
    referenceName: "Fournisseur Sanders Africa",
    operator: "Takam BERTIN (Admin)", // Corrigé
    comment: "Livraison mensuelle par camion - Bon N°4402",
  },
  {
    id: "mv-2",
    stockItemId: "stock-2",
    stockItemName: "Vaccin New Castle (HB1)",
    type: "entry",
    quantity: 20,
    unit: "flacons",
    date: "2026-05-19T11:15:00Z",
    referenceName: "Centrale Vétérinaire de l'Ouest",
    operator:"Takam BERTIN (Admin)",// Corrigé
    comment: "Respect de la chaîne du froid vérifié à la réception",
  },

  // ─── CAS 2 : LES SORTIES (CONSOMMATION PAR LES SALLES / LOTS) ───────
  {
    id: "mv-3",
    stockItemId: "stock-1",
    stockItemName: "Aliment démarrage poulet",
    type: "exit",
    quantity: 250,
    unit: "kg",
    date: "2026-05-20T06:00:00Z",
    referenceId: "room-a1",
    referenceName: "Salle A1",
    operator: "Tagne Pierre (Agent)", // Corrigé
    comment: "Rationnement du matin - Lot #04 (Poussins)",
  },
  {
    id: "mv-4",
    stockItemId: "stock-1",
    stockItemName: "Aliment démarrage poulet",
    type: "exit",
    quantity: 250,
    unit: "kg",
    date: "2026-05-20T16:30:00Z",
    referenceId: "room-a1",
    referenceName: "Salle A1",
    operator: "Tagne Pierre (Agent)", // Corrigé
    comment: "Rationnement du soir - Lot #04 (Poussins)",
  },
  {
    id: "mv-5",
    stockItemId: "stock-6",
    stockItemName: "Antibiotique Large Spectre",
    type: "exit",
    quantity: 2,
    unit: "boîtes",
    date: "2026-05-21T09:00:00Z",
    referenceId: "room-b2",
    referenceName: "Salle B2 (Dindes)",
    operator: "Tagne Pierre (Agent)", // Corrigé
    comment: "Traitement collectif préventif (Symptômes respiratoires légers)",
  },

  // ─── CAS 3 : LES AJUSTEMENTS (PERTES, CORRECTIONS D'INVENTAIRE) ────
  {
    id: "mv-6",
    stockItemId: "stock-5",
    stockItemName: "Aliment finition poules pondeuses",
    type: "adjustment",
    quantity: -25,
    unit: "kg",
    date: "2026-05-21T14:00:00Z",
    operator: "Takam BERTIN (Admin)", 
    comment: "Sac déchiré par des rongeurs dans le magasin secondaire",
  },
  {
    id: "mv-7",
    stockItemId: "stock-3",
    stockItemName: "Aliment croissance dinde",
    type: "adjustment",
    quantity: 12,
    unit: "kg",
    date: "2026-05-22T10:00:00Z",
    operator: "Tagne Pierre (Agent)", // Corrigé
    comment: "Régularisation après inventaire physique de fin de semaine",
  }
];