export type UserRole = "admin" | "agent" | "veterinarian" | "commercial";

export type PoultryType = "broiler" | "layer" | "turkey" | "duck" | "goose";

export type TaskStatus = "pending" | "completed";

export type TaskType ="feeding"| "weighing"| "ventilation"| "mortality"| "egg_collection"| "cleaning"| "vaccination";

export type EventType ="egg_collection"| "mortality"| "feeding"| "weighing" | "vaccination";

export type AlertStatus ="active"| "resolved_auto"|"resolved_manual"| "ignored";

export type StockStatus = "normal" | "low" | "critical";

export interface User {
    id: string;
    name: string;
    password : string;
    email: string;
    role: UserRole;
    avatar?: string;
    telephone: string;
    active: boolean;
    farmId: string[];
}

export interface Farm {
    id: string;
    name: string;
    address: string;
    poultry_types: PoultryType[];
    description: string;
    totalCapacity?: number;
    managerId?: string;
    createdAt: string;
    active: boolean;
}

export interface PoultryHouse {//Salle d'elevages
    id: string;
    name: string;
    farmId: string;
    capacity: number;
    currentOccupancy: number;
    poultryType: PoultryType;
    hasAutomation: boolean;
    ventilationStatus: "auto" | "manual" | "off";// clime
    lightingStatus: "auto" | "manual" | "off"; //lumiere
    heatingStatus: "auto" | "manual" | "off";  //Chauffage
    active?: boolean;         // salle active ou désaffectée
    description?: string;     // notes sur la salle
}

export interface Espece{
    id: PoultryType;
    name :string ;
    averageCycle : Number;
}

export interface Sensor {
    id: string;
    name: string;
    type: "temperature" | "light" | "Ammoniac";
    poultryHouseId: string;
    value: number;
    unit: string;
    calibrationOffset?: number;
    status: "online" | "offline" | "warning" | "error";
    lastUpdate: string;
    minValue?: number;
    maxValue?: number;
}
export interface Feeding{
    id : string;
    flockId: string;
    quantity:number;
}
 
export interface EggCollecting {
  id: string;
  flockId: string;
  poultryHouseId: string;
  eggCount: number;
  eggSize: 'small' | 'medium' | 'large';
  notes?: string;
  collectionDate: string;
}

export interface Mortality{
    id : string;
    flockId: string;
    poutryHouseId : string;
    quantity : number;
    cause : string;
}
export interface Alert {
    id: string;
    type: "temperature" | "light" | "ammoniac";
    status : AlertStatus;
    title: string;
    message: string;
    idPoultryHouse: string;
    poultryHouseId?: string;
    farmId?: string;
    createdAt: string;
    resolvedAt?: string;
}
export interface Band {
    id: string;
    name : string;
    farmId: string;
    espece_id: string;        // type de volaille
    quantity: number;        // nombre total d'animaux à l'arrivée
    createdDate: string;     // date d'arrivée
    fournisseur?: string;    // d'où viennent les animaux
    prixUnitaire?: number;   // coût d'achat par animal
    notes?: string;
    status: "active" | "closed"; // bande encore en cours ou terminée
}
export interface Flock {  //Lots de volailles
    id: string;
    name: string;
    bandId: string;
    farmId: string;
    poultryHouseId: string;
    poultryType: PoultryType;
    quantity: number;
    cycle: number;
    farmName: string;  
    poultryHouseName: string;
    startDate: string;
    endDate?: string;
    status: "active"|"closed";
    averageWeight: number;
    mortality: Mortality[];
    bandName?: string;
    age: number;
}

export interface Disease {
    id: string;
    name: string;
    type: "viral" | "bacterial" | "parasitic" | "nutritional";
    symptoms: string[];
    severity: "low" | "medium" | "high";
}

export interface Treatment { //soins
    id: string;
    flockId: string;
    veterinarianId: string;
    diseaseId: string;
    animalsCount : number
    medication: string;
    dosage: string;
    startDate: string;
    endDate: string;
    notes: string;
}

export interface Vaccination {
    id: string;
    flockId: string;
    vaccine: string;
    diseaseId: string;
    administrationDate: string;
    nextDueDate?: string;
    method: "drinking_water" | "injection" | "spray" | "eye_drop";
    quantity: number;
    veterinarianId: string;
    notes?: string;
}

export interface Sale {
    id: string;
    clientId: string;
    flockId: string;
    quantity: number;
    pricePerKg: number;
    totalWeight: number;
    totalAmount: number;
    date: string;
    invoiceNumber: string;
    status: "pending" | "paid" | "overdue";
}

export interface Client {
    id: string;
    name: string;
    type: "restaurant" | "supermarket" | "wholesaler" | "individual";
    email: string;
    phone: string;
    address: string;
    totalPurchases: number;
}

export interface AutomationRule {
    id: string;
    poultryHouseId: string;
    type: "ventilation" | "lighting" | "heating";
    enabled: boolean;
    condition: string;
    action: string;
    schedule?: {
    startTime: string;
    endTime: string;
};
}
    export interface Task {
    id: string;
    type: TaskType;
    title: string;
    flockId: string;
    poultryHouseId: string;
    time: string;
    status: TaskStatus;
    }
export interface Event {
    id: string;
    type: EventType;
    flockId: string;
    poultryHouseId: string;
    createdAt: string;
    createdBy: string;
    notes?: string;
}

export interface Weighing {
    id: string;
    flockId: string;
    averageWeight: number;
    sampleSize: number;
    weights: number[];
    minWeight: number;
    maxWeight: number;
    stdDeviation: number;
    date: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// export interface Sale {
//     id: string;
//     clientId: string;
//     flockId: string;
//     quantity: number;
//     pricePerKg: number;
//     totalWeight: number;
//     totalAmount: number;
//     date: string;
//     invoiceNumber: string;
//     status: "pending" | "paid" | "overdue";
// }

// frontend/src/types/index.ts

export interface StockItem {
  id: string;
  name: string;
  category: "vaccine" | "medication" | "equipment" | "other";
  quantity: number;
  unit: string;
  minThreshold: number;
  feedSubType?: "starter" | "grower" | "finisher";
  farmId: string;
  supplierId?: string;
  supplierName?: string;
  status: "normal" | "low" | "critical";
  lastRestocked: string;
  expiryDate?: string;
  unitPrice?: number;
  notes?: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: "entry" | "exit" | "adjustment" | "transfer";
  quantity: number;
  unit: string;
  date: string;
  referenceId?: string;
  referenceName?: string;
  operatorId: string;
  operatorName: string;
  comment?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  company?: string;
  supplied_categories?: string[];  
  suppliedCategories?: string[];   
  notes?: string;
  active: boolean;
  farm_ids?: string[];  
  farmIds?: string[];   
  created_at?: string;
  updated_at?: string;
}

export interface FlockData {
    id: string;
    name: string;
    quantity: number;
    age: number;
    averageWeight: number;
    poultryHouseId: string;
}
    

export interface WeighingData {
  averageWeight: number;
  sampleSize: number;
  stdDeviation: number;
  confidenceLevel: '5' | '10' | '15';
}

export interface QuarantineData {
    quantity: number;
    newFlockName: string;
    reason: string;
}

export interface TabConfig {
    id: 'feeding' | 'weighing' | 'mortality' | 'quarantine';
    label: string;
    icon: any;
    color: string;
}
export interface FeedingData {
  feedType: 'starter' | 'grower' | 'finisher';
  quantityKg: number;
}

export interface MortalityData {
  quantity: number;
  cause: string;
}

export interface QuarantineData {
  quantity: number;
  reason: string;
  newFlockName: string;
}

export interface FarmWithDetails {
  id: string;
  name: string;
  address: string;
  poultryHouses: any[];
  activeFlocks: any[];
  totalAnimals: number;
  occupancyRate: number;
  avgWeight: number;
  growthData: { date: string; weight: number }[];
}

export interface RecentEvent {
  id: string;
  farmId: string;
  farmName: string;
  type: "arrival" | "treatment" | "vaccination" | "stock_entry" | "stock_exit" | "house_created";
  title: string;
  description: string;
  quantity?: number;
  date: string;
}

