import { useState, useEffect } from "react";
import { Button } from "../common/button";
import axios from "axios";

interface Farm { id: string; name: string; }
interface InviteCollaboratorFormProps { onClose: () => void; onSubmit: () => void; }

export function InviteCollaboratorForm({ onClose, onSubmit }: InviteCollaboratorFormProps) {
  const [formData, setFormData] = useState({
    name: "", email: "", telephone: "", role: "agent", farmId: ""
  });
  
  const [myFarms, setMyFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFarms, setLoadingFarms] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/v1/users/my-farms", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        setMyFarms(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, farmId: data[0].id }));
      } catch (err) { console.error("Erreur fermes :", err); } 
      finally { setLoadingFarms(false); }
    };
    fetchFarms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/auth/invite", 
        { ...formData, farm_id: formData.farmId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      onSubmit();
      onClose();
    } catch (err) { alert("Erreur lors de l'invitation"); } 
    finally { setLoading(false); }
  };

  if (loadingFarms) return <div className="p-4 text-center text-sm">Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Inviter un collaborateur</h2>

      {[
        { name: "name", label: "Nom complet", type: "text", placeholder: "Ex: Jean Dupont" },
        { name: "email", label: "Email", type: "email", placeholder: "jean@exemple.com" },
        { name: "telephone", label: "Téléphone", type: "tel", placeholder: "+237..." }
      ].map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <input
            name={field.name} type={field.type} required
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:ring-2 focus:ring-green-600 outline-none"
            placeholder={field.placeholder} value={formData[field.name as keyof typeof formData]} onChange={handleChange}
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ferme assignée</label>
        <select title="ferme" name="farmId" required value={formData.farmId} onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-2.5 outline-none">
          {myFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
        <select title="rôle" name="role" value={formData.role} onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 p-2.5 outline-none">
          <option value="admin">Administrateur</option>
          <option value="agent">Agent d'élevage</option>
          <option value="veterinarian">Vétérinaire</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full">Annuler</Button>
        <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white">
          {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
        </Button>
      </div>
    </form>
  );
}