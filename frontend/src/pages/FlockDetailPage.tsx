// frontend/src/pages/flocks/FlockDetailPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Scale, Egg, Apple, Heart, AlertTriangle,
  TrendingUp, DollarSign, Printer, Users, Clock, Tag, X
} from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { flocksAPI } from "../services/api";
import { WeighingTab } from "../components/specific/WeighingTab";
import { EggCollectionTab } from "../components/forms/eggCollectionForm";
import { FeedingTab } from "../components/specific/FeedingTab";
import { MortalityTab } from "../components/specific/MortalityTab";
import { QuarantineTab } from "../components/specific/QuarantineTab";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FlockDetail {
  id: string;
  name: string;
  quantity: number;
  cycle: number;
  age: number;
  startDate: string;
  status: string;
  averageWeight: number;
  farmName: string;
  poultryHouseName: string;
  farmId?: string;
  salePrice?: number;
  current_quantity?: number;
  total_mortality?: number;
}

interface WeighingData {
  id: string;
  date: string;
  averageWeight: number;
  sampleSize: number;
}

type ActiveModalType = 'weighing' | 'eggs' | 'feeding' | 'mortality' | 'quarantine' | null;

export function FlockDetailPage() {
  const navigate = useNavigate();
  const { flockId } = useParams();
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [flock, setFlock] = useState<FlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeighingData[]>([]);
  
  // États pour le modal de vente
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [saleLoading, setSaleLoading] = useState(false);

  useEffect(() => {
    if (flockId) fetchFlockDetail();
  }, [flockId]);

  const fetchFlockDetail = async () => {
    try {
      setLoading(true);
      const [flockData, weighingsData] = await Promise.all([
        flocksAPI.getById(flockId!),
        flocksAPI.getWeighings(flockId!)
      ]);
      setFlock(flockData);
      
      // Normaliser les données de pesée
      const normalizedWeighings = (weighingsData || []).map((w: any) => ({
        id: w.id,
        date: w.date || w.weighingDate || w.createdAt,
        averageWeight: w.averageWeight || w.avgWeight || 0,
        sampleSize: w.sampleSize || w.sample_size || 1
      })).sort((a: { date: string }, b: { date: string }) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setWeightHistory(normalizedWeighings);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!flock) return null;
    const currentLiving = flock.current_quantity || flock.quantity;
    const mortalityRate = ((flock.total_mortality || 0) / flock.quantity) * 100;
    const estimatedValue = currentLiving * flock.averageWeight * 1400;
    return { currentLiving, mortalityRate, estimatedValue, isMarkedForSale: flock.status === "ready_for_sale" };
  }, [flock]);

  // ✅ HANDLE WEIGHING - corrigé
  const handleWeighing = async (data: any) => {
    if (!flockId) {
      setError("Erreur: identifiant du lot manquant");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await flocksAPI.recordWeighing(flockId, {
        average_weight: data.averageWeight,
        sample_size: data.sampleSize,
      });
      setSuccess("Pesée enregistrée");
      setTimeout(() => setSuccess(null), 3000);
      fetchFlockDetail();
      setActiveModal(null);
    } catch (err: any) {
      console.error("Erreur pesée:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Erreur lors de l'enregistrement";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ HANDLE EGG COLLECTION - corrigé
  const handleEggCollection = async (data: any) => {
    if (!flockId) {
      setError("Erreur: identifiant du lot manquant");
      return;
    }
    
    console.log("Egg collection data:", data);
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await flocksAPI.recordEggCollection(flockId, {
        egg_count: data.eggCount,
        egg_size: data.eggSize,
        notes: data.notes,
        date: new Date().toISOString()
      });
      setSuccess("Collecte d'œufs enregistrée");
      setTimeout(() => setSuccess(null), 3000);
      setActiveModal(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ HANDLE FEEDING - CORRIGÉ avec stockItemId
const handleFeeding = async (data: { feedType: string; quantityKg: number; stockItemId: string }) => {
  if (!flockId) {
    setError("Erreur: identifiant du lot manquant");
    return;
  }
  
  console.log("Feeding data:", data);
  setActionLoading(true);
  setError(null);
  setSuccess(null);
  try {
    await flocksAPI.recordFeeding(flockId, {
      feed_type: data.feedType,
      quantity_kg: data.quantityKg,
      stock_item_id: data.stockItemId,
      date: new Date().toISOString()
    });
    setSuccess(`Alimentation enregistrée: ${data.quantityKg} kg de ${data.feedType}`);
    setTimeout(() => setSuccess(null), 3000);
    setActiveModal(null);
    fetchFlockDetail();
  } catch (err: any) {
    console.error("Erreur alimentation:", err);
    
    // Gestion d'erreur propre
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d.message).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(JSON.stringify(detail));
      }
    } else {
      setError("Erreur lors de l'enregistrement de l'alimentation");
    }
  } finally {
    setActionLoading(false);
  }
};

  // ✅ HANDLE MORTALITY - corrigé
  const handleMortality = async (data: any) => {
    if (!flockId) {
      setError("Erreur: identifiant du lot manquant");
      return;
    }
    
    console.log("Mortality data:", data);
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await flocksAPI.recordMortality(flockId, {
        quantity: data.quantity,
        cause: data.cause,
      });
      setSuccess("Mortalité enregistrée");
      setTimeout(() => setSuccess(null), 3000);
      fetchFlockDetail();
      setActiveModal(null);
    } catch (err: any) {
      console.error("Erreur mortalité:", err);
      setError(err.response?.data?.detail || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ HANDLE QUARANTINE - corrigé
  const handleQuarantine = async (data: any) => {
    if (!flockId) {
      setError("Erreur: identifiant du lot manquant");
      return;
    }
    
    console.log("Quarantine data:", data);
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await flocksAPI.splitFlock(flockId, {
        quantity: data.quantity,
        new_flock_name: data.newFlockName,
        is_quarantine: true,
        reason: data.reason
      });
      setSuccess("Lot de quarantaine créé");
      setTimeout(() => setSuccess(null), 3000);
      fetchFlockDetail();
      setActiveModal(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkForSale = async () => {
    if (!flockId) {
      setError("Erreur: identifiant du lot manquant");
      return;
    }
    
    if (salePrice <= 0) {
      setError("Veuillez entrer un prix valide");
      return;
    }
    
    setSaleLoading(true);
    setError(null);
    
    try {
      await flocksAPI.update(flockId, {
        status: "ready_for_sale",
        sale_price: salePrice
      });
      
      setSuccess(`Lot mis en vente au prix de ${salePrice.toLocaleString()} FCFA/sujet`);
      setTimeout(() => setSuccess(null), 3000);
      setSaleModalOpen(false);
      fetchFlockDetail();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la mise en vente");
    } finally {
      setSaleLoading(false);
    }
  };

  // ✅ Vérification avant d'ouvrir un modal
  const openModal = (modalType: ActiveModalType) => {
    if (!flockId) {
      setError("Erreur technique : identifiant du lot manquant");
      return;
    }
    setActiveModal(modalType);
  };

  if (loading) return <div className="flex justify-center items-center h-96">Chargement...</div>;
  if (error || !flock || !stats) return <div className="p-6 text-center text-red-600">{error || "Lot introuvable"}</div>;

  const suggestedPrice = Math.round(stats.estimatedValue / stats.currentLiving);

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="p-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{flock.name}</h1>
            <p className="text-sm text-gray-500">
              {flock.farmName} • {flock.poultryHouseName} • {flock.age} jours • {stats.currentLiving.toLocaleString()} sujets
            </p>
            {flock.status === "ready_for_sale" && flock.salePrice && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                En vente à {flock.salePrice.toLocaleString()} FCFA/sujet
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setSaleModalOpen(true)} className="bg-emerald-600">
          <Tag className="w-4 h-4 mr-2" />
          Mettre le lot en vente
        </Button>
      </div>

      {/* Navbar horizontale */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-5 divide-x divide-gray-200">
          <button
            onClick={() => openModal('weighing')}
            className={`py-3 flex flex-col items-center gap-1 transition-all ${
              activeModal === 'weighing' ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span className="text-xs font-medium">Pesée</span>
          </button>
          <button
            onClick={() => openModal('eggs')}
            className={`py-3 flex flex-col items-center gap-1 transition-all ${
              activeModal === 'eggs' ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Egg className="w-5 h-5" />
            <span className="text-xs font-medium">Collecte œufs</span>
          </button>
          <button
            onClick={() => openModal('feeding')}
            className={`py-3 flex flex-col items-center gap-1 transition-all ${
              activeModal === 'feeding' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Apple className="w-5 h-5" />
            <span className="text-xs font-medium">Alimentation</span>
          </button>
          <button
            onClick={() => openModal('mortality')}
            className={`py-3 flex flex-col items-center gap-1 transition-all ${
              activeModal === 'mortality' ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs font-medium">Mortalité</span>
          </button>
          <button
            onClick={() => openModal('quarantine')}
            className={`py-3 flex flex-col items-center gap-1 transition-all ${
              activeModal === 'quarantine' ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-medium">Quarantaine</span>
          </button>
        </div>

        {/* Panneaux modals incrustés - ✅ TOUS LES MODALS REÇOIVENT flockId */}
        <div className="p-5 border-t border-gray-200">
          {activeModal === 'weighing' && (
            <WeighingTab
              flockQuantity={stats.currentLiving}
              flockAge={flock.age}
              onSave={handleWeighing}
              onCancel={() => setActiveModal(null)}
              loading={actionLoading}
            />
          )}
          {activeModal === 'eggs' && (
            <EggCollectionTab
              flockId={flock.id}
              onSave={handleEggCollection}
              onCancel={() => setActiveModal(null)}
              loading={actionLoading}
            />
          )}
          {activeModal === 'feeding' && (
            <FeedingTab
              flockId={flock.id}
              flockName={flock.name}
              flockAge={flock.age}
              flockQuantity={stats.currentLiving}
              farmId={flock.farmId}
              onSave={handleFeeding}
              onCancel={() => setActiveModal(null)}
              loading={actionLoading}
            />
          )}
          {activeModal === 'mortality' && (
            <MortalityTab
              flockId={flock.id}
              flockQuantity={stats.currentLiving}
              onSave={handleMortality}
              onCancel={() => setActiveModal(null)}
              loading={actionLoading}
            />
          )}
          {activeModal === 'quarantine' && (
            <QuarantineTab
              flockName={flock.name}
              flockQuantity={stats.currentLiving}
              onSave={handleQuarantine}
              onCancel={() => setActiveModal(null)}
              loading={actionLoading}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      {success && <div className="bg-green-50 p-3 rounded-lg text-green-700">{success}</div>}
      {error && activeModal === null && !saleModalOpen && (
        <div className="bg-red-50 p-3 rounded-lg text-red-700">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Effectif</p>
            <h3 className="text-xl font-bold">{stats.currentLiving.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Poids moyen</p>
            <h3 className="text-xl font-bold">{flock.averageWeight} kg</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Mortalité</p>
            <h3 className="text-xl font-bold">{stats.mortalityRate.toFixed(1)}%</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Valeur estimée</p>
            <h3 className="text-xl font-bold text-emerald-700">
              {flock.salePrice 
                ? `${(stats.currentLiving * flock.salePrice).toLocaleString()} FCFA`
                : `${Math.round(stats.estimatedValue).toLocaleString()} FCFA`
              }
            </h3>
            {flock.salePrice && (
              <p className="text-xs text-gray-400">{flock.salePrice.toLocaleString()} FCFA/sujet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphique - VRAIES données de pesée */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du poids</CardTitle>
          <p className="text-xs text-gray-500">Pesées enregistrées</p>
        </CardHeader>
        <CardContent>
          {weightHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Scale className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune pesée enregistrée</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => openModal('weighing')}
              >
                Enregistrer une pesée
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  label={{ value: 'Date', position: 'bottom' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <YAxis label={{ value: 'Poids (kg)', angle: -90 }} />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                  formatter={(value) => [`${value} kg`, 'Poids']}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageWeight" 
                  stroke="#2E7D32" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Poids moyen"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de mise en vente */}
      {saleModalOpen && (
        <>
          <div className="fixed inset-0 backdrop-blur-xs z-40" onClick={() => setSaleModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Mettre le lot en vente</h3>
                <button onClick={() => setSaleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Lot: {flock.name}</p>
                  <p className="text-sm text-gray-600">{stats.currentLiving.toLocaleString()} sujets</p>
                  <p className="text-sm text-gray-600">Poids moyen: {flock.averageWeight} kg</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix unitaire de vente (FCFA/sujet)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={`Ex: ${suggestedPrice}`}
                    step="100"
                    min="500"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Prix suggéré: {suggestedPrice.toLocaleString()} FCFA/sujet
                  </p>
                </div>
                
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valeur totale estimée</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {(stats.currentLiving * (salePrice || suggestedPrice)).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSaleModalOpen(false)} 
                    className="flex-1"
                    disabled={saleLoading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleMarkForSale} 
                    disabled={saleLoading || salePrice <= 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saleLoading ? 'Traitement...' : 'Confirmer la vente'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}