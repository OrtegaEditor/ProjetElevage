export type UserRole = "admin" | "agent" | "veterinarian" | "commercial";

export type PoultryType = "broiler" | "layer" | "turkey" | "duck" | "goose";

export type TaskStatus = "pending" | "completed";

export type TaskType ="feeding"| "weighing"| "ventilation"| "mortality"| "egg_collection"| "cleaning"| "vaccination";

export type EventType ="egg_collection"| "mortality"| "feeding"| "weighing" | "vaccination";

export type AlertStatus ="active"| "resolved_auto"|"resolved_manual"| "ignored";

export interface User {
    id: string;
    name: string;
    password : string;
    email: string;
    role: UserRole;
    avatar?: string;
    telephone: string;
    active: boolean;
    farms: string[];
}

export interface Farm {  //Ferme d'elevages
    id: string;
    name: string;
    address: string;
    type: PoultryType;
    description: string;
    createdAt: string;
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
export interface Band{
    id: string;
    farmId: string;
    especeId: string;
    quantity: number;
    createdDate: string;
}
export interface Flock {  //Lots de volailles
    id: string;
    name: string;
    bandId: string;
    farmId: string;
    poultryHouseId: string;
    poultryType: PoultryType;
    quantity: number;
    startDate: string;
    endDate?: string;
    status: "active"|"closed";
    averageWeight: number;
    mortality: number;
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

export interface StockItem {
    id: string;
    name: string;
    category: "feed" | "vaccine" | "medication" | "equipment" | "other";
    quantity: number;
    unit: string;
    minThreshold: number;
    farmId: string;
    lastRestocked: string;
    expiryDate?: string;
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
    agentId: string;
    date: string;
    weights: number[];       // poids individuels
    averageWeight: number;   // calculé
    minWeight: number;       // calculé
    maxWeight: number;       // calculé
    stdDeviation: number;    // calculé
    notes?: string;
}