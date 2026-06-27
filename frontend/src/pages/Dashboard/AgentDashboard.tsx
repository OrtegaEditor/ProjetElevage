import { useState, useEffect } from "react";
import { KPICard } from "../../components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { Button } from "../../components/common/button";
import { 
  CheckCircle2, AlertTriangle, Activity, Droplet, Plus, Calendar, 
  RefreshCw, Pencil, Trash2, Check, X, Clock, MapPin, Users 
} from "lucide-react";
import { flocksAPI, tasksAPI, stockAPI, usersAPI, poultryHousesAPI } from "../../services/api";
import { TaskPlanningForm } from "../../components/forms/TaskPlanningForm";
import type { Flock, Task, StockItem, Farm, PoultryHouse } from "../../types";

interface TaskWithDetails extends Task {
  flockName?: string;
  poultryHouseName?: string;
  assignedToName?: string;
}

export function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [poultryHouses, setPoultryHouses] = useState<PoultryHouse[]>([]);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [criticalStock, setCriticalStock] = useState<StockItem[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("pending");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [flocksData, tasksData, stockData, farmsData, housesData] = await Promise.all([
        flocksAPI.getAll(),
        tasksAPI.getMyTasks(),
        stockAPI.getAll(),
        usersAPI.getMyAccessibleFarms?.() || Promise.resolve([]),
        poultryHousesAPI.getAll()
      ]);
      
      setFlocks(flocksData || []);
      setPoultryHouses(housesData || []);
      setFarms(farmsData || []);
      
      // Enrichir les tâches avec les noms
      const enrichedTasks = (tasksData || []).map((task: Task) => ({
        ...task,
        flockName: flocksData?.find((f: Flock) => f.id === task.flockId)?.name,
        poultryHouseName: housesData?.find((h: PoultryHouse) => h.id === task.poultryHouseId)?.name,
        assignedToName: "Moi"
      }));
      
      setTasks(enrichedTasks);
      
      // Stock critique
      const critical = (stockData || []).filter((s: StockItem) => 
        s.status === "critical" || s.status === "low"
      );
      setCriticalStock(critical);
      
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

const handleTaskComplete = async (taskId: string) => {
  console.log("=== TENTATIVE DE COMPLÉTION ===");
  console.log("taskId:", taskId);
  
  try {
    const result = await tasksAPI.complete(taskId);
    console.log("Résultat:", result);
    await fetchDashboardData();
  } catch (error) {
    console.error("Erreur détaillée:", error);
  }
};

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;
    
    try {
      await tasksAPI.delete(taskId);
      await fetchDashboardData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleTaskEdit = (task: TaskWithDetails) => {
    setSelectedTask(task);
    setOpenEditModal(true);
  };

  const handleTaskUpdate = async () => {
    await fetchDashboardData();
    setOpenEditModal(false);
    setSelectedTask(null);
  };

  const activeFlocks = flocks.filter((f) => f.status === "active");
  
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "pending") return t.status === "pending";
    if (filterStatus === "completed") return t.status === "completed";
    return true;
  });

  const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      feeding: "Alimentation",
      weighing: "Pesée",
      mortality: "Mortalité",
      egg_collection: "Collecte d'œufs",
      cleaning: "Nettoyage",
      vaccination: "Vaccination",
      ventilation: "Ventilation"
    };
    return labels[type] || type;
  };

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feeding: "bg-blue-100 text-blue-700",
      weighing: "bg-green-100 text-green-700",
      mortality: "bg-red-100 text-red-700",
      egg_collection: "bg-yellow-100 text-yellow-700",
      cleaning: "bg-gray-100 text-gray-700",
      vaccination: "bg-purple-100 text-purple-700",
      ventilation: "bg-cyan-100 text-cyan-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const isTaskOverdue = (time: string) => {
    return new Date(time) < new Date() && new Date(time).toDateString() === new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Tableau de bord Agent
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="primary" onClick={() => setOpenTaskModal(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Planifier
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Tâches en cours"
          value={`${pendingTasksCount}`}
          icon={<Clock className="w-6 h-6" />}
          variant="info"
        />
        <KPICard
          title="Tâches terminées"
          value={`${completedTasksCount}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="success"
        />
        <KPICard
          title="Lots actifs"
          value={activeFlocks.length}
          icon={<Activity className="w-6 h-6" />}
          variant="info"
        />
        <KPICard
          title="Stock critique"
          value={criticalStock.filter(s => s.status === "critical").length}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tâches du jour */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tâches du jour</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={filterStatus === "pending" ? "primary" : "outline"}
                  onClick={() => setFilterStatus("pending")}
                >
                  En cours ({pendingTasksCount})
                </Button>
                <Button 
                  size="sm" 
                  variant={filterStatus === "completed" ? "primary" : "outline"}
                  onClick={() => setFilterStatus("completed")}
                >
                  Terminées ({completedTasksCount})
                </Button>
                <Button 
                  size="sm" 
                  variant={filterStatus === "all" ? "primary" : "outline"}
                  onClick={() => setFilterStatus("all")}
                >
                  Toutes ({tasks.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune tâche {filterStatus === "pending" ? "en cours" : filterStatus === "completed" ? "terminée" : ""}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isOverdue = task.status === "pending" && isTaskOverdue(task.time);
                  return (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg transition-all ${
                        task.status === "completed"
                          ? "bg-green-50 border-green-200 opacity-75"
                          : isOverdue
                          ? "bg-red-50 border-red-200"
                          : "bg-white border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.status === "completed"}
                          onChange={() => handleTaskComplete(task.id)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          disabled={task.status === "completed"}
                        />
                        
                        {/* Contenu principal */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className={`font-semibold ${
                              task.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"
                            }`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.status === "completed" ? "success" : "warning"}>
                              {task.status === "completed" ? "Terminé" : "En cours"}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="danger">En retard</Badge>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                              {getTaskTypeLabel(task.type)}
                            </span>
                          </div>
                          
                          {/* Détails de la tâche */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>Lot: {task.flockName || "N/A"}</span>
                            </div>
                            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                              <HomeIcon className="w-4 h-4" />
                              <span>Salle: {task.poultryHouseName || "N/A"}</span>
                            </div> */}
                            {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Assigné à: {task.assignedToName || "Moi"}</span>
                            </div> */}
                          </div>
                          
                          {/* Date et heure */}
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
                              {task.time ? new Date(task.time).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : ""}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {task.status !== "completed" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskEdit(task)}
                              className="text-blue-600"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTaskDelete(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock critique */}
        <Card>
          <CardHeader>
            <CardTitle>Stock à surveiller</CardTitle>
          </CardHeader>
          <CardContent>
            {criticalStock.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Droplet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Stock normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalStock.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <Badge variant={item.status === "critical" ? "danger" : "warning"}>
                        {item.status === "critical" ? "Critique" : "Bas"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Stock: {item.quantity} {item.unit}
                      </span>
                      <span className="text-orange-700 font-medium">
                        Min: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lots actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Lots de volailles en cours</CardTitle>
        </CardHeader>
        <CardContent>
          {activeFlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun lot actif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeFlocks.map((lot) => (
                <div
                  key={lot.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{lot.name}</h4>
                      <p className="text-sm text-gray-600">
                        {lot.quantity} volailles • Poids: {lot.averageWeight}kg • Âge: {lot.age}j
                      </p>
                    </div>
                    <Badge variant="success">Actif</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Début: {new Date(lot.startDate).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="text-gray-600">Mortalité: {lot.total_mortality || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Création */}
      {openTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpenTaskModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <TaskPlanningForm
              onClose={() => setOpenTaskModal(false)}
              onSuccess={() => {
                setOpenTaskModal(false);
                fetchDashboardData();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {openEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpenEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <TaskPlanningForm
              initialData={{
                id: selectedTask.id,
                title: selectedTask.title,
                type: selectedTask.type,
                flockId: selectedTask.flockId,
                poultryHouseId: selectedTask.poultryHouseId,
                time: selectedTask.time
                // assignedTo: selectedTask.assignedTo
              }}
              onClose={() => setOpenEditModal(false)}
              onSuccess={handleTaskUpdate}
              isEditMode={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Composant HomeIcon pour la salle
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);