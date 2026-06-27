import { StatCard } from "../common/StatCard";
import { Home, Users, DollarSign, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalHouses: number;
  totalFlocks: number;
  totalAnimals: number;
  avgWeight: number;
}

export function StatsCards({ totalHouses, totalFlocks, totalAnimals, avgWeight }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Salles d'élevage" value={totalHouses} icon={<Home className="w-5 h-5" />} />
      <StatCard title="Lots actifs" value={totalFlocks} icon={<Users className="w-5 h-5" />} />
      <StatCard title="Animaux" value={totalAnimals.toLocaleString()} icon={<TrendingUp className="w-5 h-5" />} />
      <StatCard title="Poids moyen" value={`${avgWeight} kg`} icon={<DollarSign className="w-5 h-5" />} />
    </div>
  );
}