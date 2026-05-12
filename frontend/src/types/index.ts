export type UserRole = "admin" | "agent" | "veterinarian" | "commercial";

export type PoultryType = "broiler" | "layer" | "turkey" | "duck" | "goose";

export interface User {
    id: string;
    fname: string;
    lname: string;
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
    localisation: string;
    type: PoultryType;
    description :String;
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
    type: "temperature" | "humidity" | "light";
    poultryHouseId: string;
    value: number;
    unit: string;
    status: "online" | "offline" | "warning" | "error";
    lastUpdate: string;
    minValue?: number;
    maxValue?: number;
}

export interface Alert {
    id: string;
    type: "critical" | "warning" | "info";
    title: string;
    message: string;
    idPoultryHouse: string;
    poultryHouseId?: string;
    resolved: boolean;
    createdAt: string;
    resolvedAt?: string;
}
export interface Band{
    id : String;
    farmId:string;
    especeId : string;
    quantity :number;
    createdDate: String;
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
    disease: string;
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
    disease: string;
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
