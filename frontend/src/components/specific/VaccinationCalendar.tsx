import { useState } from "react";
import { Badge } from "../common/badge";
import { mockVaccinations, mockFlocks } from "../../data/mockData";
import { Syringe, CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface VaccinationCalendarProps {
open: boolean;
onClose: () => void;
}

// 1. Définition explicite du type d'événement pour corriger les erreurs de type 2322 et 2367
interface CalendarEvent {
id: string;
dateString: string;
title: string;
flock: string;
type: "done" | "upcoming";
}

export function VaccinationCalendar({ open, onClose }: VaccinationCalendarProps) {
if (!open) return null;

// ─── ÉTATS NAVIGATION CALENDRIER ────────────────────────────────────
const [currentDate, setCurrentDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const monthsList = [
"Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
"Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décesmbre"
];

// ─── EXTRACTION DYNAMIQUE DES ÉVÉNEMENTS AVEC TYPAGE STRICT ─────────
const calendarEvents: CalendarEvent[] = mockVaccinations.flatMap((v) => {
const flockName = mockFlocks.find((f) => f.id === v.flockId)?.name ?? "Lot inconnu";
const events: CalendarEvent[] = [
    {
    id: `admin-${v.id}`,
    dateString: v.administrationDate,
    title: `Effectuée : ${v.vaccine}`,
    flock: flockName,
    type: "done",
    }
];
if (v.nextDueDate) {
    events.push({
    id: `due-${v.id}`,
    dateString: v.nextDueDate,
    title: `Rappel prévu : ${v.vaccine}`,
    flock: flockName,
    type: "upcoming",
    });
}
return events;
});

// ─── LOGIQUE DE GÉNÉRATION DE LA GRILLE MENSUELLE ───────────────────
const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

const daysGrid: (number | null)[] = [];
for (let i = 0; i < startOffset; i++) {
daysGrid.push(null);
}
for (let i = 1; i <= daysInMonth; i++) {
daysGrid.push(i);
}

// ─── NAVIGATIONS HANDLERS ───────────────────────────────────────────
const handlePrevMonth = () => {
setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
};

const handleNextMonth = () => {
setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
};

const getEventsForDate = (year: number, month: number, day: number) => {
const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
return calendarEvents.filter(e => e.dateString === dateStr);
};

const selectedDateEvents = selectedDate 
? getEventsForDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
: [];

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
    <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden">
    
    {/* BANDEAU EN-TÊTE MODAL */}
    <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Planning & Suivi Médical Tactile</h2>
        </div>
        {/* Correction Accessibilité : Ajout de title et aria-label */}
        <button 
        onClick={onClose} 
        title="Fermer le calendrier"
        aria-label="Fermer"
        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
        >
        <X className="w-5 h-5" />
        </button>
    </div>

    {/* CONTENU PRINCIPAL BI-ZONE */}
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ZONE GAUCHE : CALENDRIER */}
        <div className="flex-1 p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
        
        {/* NAVIGATION DU MOIS / ANNÉE */}
        <div className="flex items-center justify-between mb-6 bg-gray-50 p-2 rounded-xl border">
            {/* Correction Accessibilité : Ajout de title et aria-label */}
            <button 
            onClick={handlePrevMonth} 
            title="Mois précédent"
            aria-label="Mois précédent"
            className="p-2 hover:bg-white rounded-lg border transition-all shadow-sm"
            >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <span className="font-bold text-gray-800 text-lg">
            {monthsList[currentMonth]} {currentYear}
            </span>
            {/* Correction Accessibilité : Ajout de title et aria-label */}
            <button 
            onClick={handleNextMonth} 
            title="Mois suivant"
            aria-label="Mois suivant"
            className="p-2 hover:bg-white rounded-lg border transition-all shadow-sm"
            >
            <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
        </div>

        {/* GRILLE : JOURS DE LA SEMAINE */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">
            <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
        </div>

        {/* GRILLE : COMPARTIMENTS NUMÉRIQUES */}
        {/* Correction Tailwind : min-h-[280px] remplacé par sa classe canonique min-h-70 */}
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-70">
            {daysGrid.map((day, index) => {
            if (day === null) {
                return <div key={`empty-${index}`} className="bg-gray-50/50 rounded-xl" />;
            }

            const dayEvents = getEventsForDate(currentYear, currentMonth, day);
            const isSelected = selectedDate && 
                                selectedDate.getDate() === day && 
                                selectedDate.getMonth() === currentMonth && 
                                selectedDate.getFullYear() === currentYear;

            return (
                <button
                key={`day-${day}`}
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                className={`group relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all hover:scale-105 ${
                    isSelected 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                    : "bg-white border-gray-100 text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                }`}
                >
                <span className="text-sm font-bold">{day}</span>

                <div className="flex gap-1 justify-center mt-1 h-1.5 w-full">
                    {dayEvents.map((ev) => (
                    <span 
                        key={ev.id} 
                        className={`w-1.5 h-1.5 rounded-full ${
                        isSelected 
                            ? "bg-white" 
                            : ev.type === "upcoming" ? "bg-orange-500" : "bg-green-500"
                        }`} 
                    />
                    ))}
                </div>
                </button>
            );
            })}
        </div>
        </div>

        {/* ZONE DROITE : FIL D'INFORMATION */}
        <div className="w-full md:w-80 bg-gray-50/50 p-6 flex flex-col overflow-y-auto">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center justify-between">
            <span>Événements du jour</span>
            {selectedDate && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                {selectedDate.toLocaleDateString("fr-FR")}
            </span>
            )}
        </h3>

        <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedDateEvents.map((event) => {
            const isUpcoming = event.type === "upcoming";
            return (
                <div 
                key={event.id} 
                className="p-3 bg-white rounded-xl border shadow-sm border-gray-100 transition-all hover:shadow-md"
                >
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isUpcoming ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                    <Syringe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                    {/* Correction Tailwind : break-words remplacé par wrap-break-word */}
                    <p className="font-semibold text-sm text-gray-900 wrap-break-word">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Lot: <span className="text-gray-800 font-medium">{event.flock}</span></p>
                    </div>
                </div>
                </div>
            );
            })}
            {selectedDateEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm italic">
                Aucune vaccination enregistrée pour cette date.
            </div>
            )}
        </div>
        </div>

    </div>
    </div>
</div>
);
}
