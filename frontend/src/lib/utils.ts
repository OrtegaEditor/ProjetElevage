import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    });
}

export function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    });
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
}).format(amount);
}
