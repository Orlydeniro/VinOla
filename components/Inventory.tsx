
import React, { useState } from 'react';
import { Search, Edit, Trash2, PlusCircle, X } from 'lucide-react';
import { Wine, WineType, Sale, TransactionType, UserRole } from '../types';

interface InventoryProps {
  wines: Wine[];
  setWines: React.Dispatch<React.SetStateAction<Wine[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  userRole: UserRole;
}

const Inventory: React.FC<InventoryProps> = ({ wines, setWines, setSales, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<WineType | 'All'>('All');

  // Form states
  const [formData, setFormData] = useState<Partial<Wine>>({
    name: '',
    type: 'Rouge',
    appellation: '',
    vintage: '',
    producer: '',
    region: '',
    quantity: 0,
    sellPrice: 0,
    minStock: 5,
    maxStock: 50,
    location: '',
    supplier: '',
  });

  const handleOpenModal = (wine?: Wine) => {
    if (wine) {
      setEditingWine(wine);
      setFormData(wine);
    } else {
      setEditingWine(null);
      setFormData({
        name: '',
        type: 'Rouge',
        appellation: '',
        vintage: '',
        producer: '',
        region: '',
        quantity: 0,
        sellPrice: 0,
        minStock: 5,
        maxStock: 50,
        location: '',
        supplier: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newWine: Wine = {
      ...(formData as Wine),
      id: editingWine ? editingWine.id : Date.now().toString(),
      dateAdded: editingWine ? editingWine.dateAdded : new Date().toISOString(),
      initialQuantity: editingWine ? editingWine.initialQuantity : (formData.quantity || 0),
    };

    if (editingWine) {
      setWines(prev => prev.map(w => w.id === editingWine.id ? newWine : w));
    } else {
      setWines(prev => [...prev, newWine]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (userRole !== 'Administrateur') {
      alert("Accès refusé. Seul un Administrateur peut supprimer des références.");
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce vin ?')) {
      setWines(prev => prev.filter(w => w.id !== id));
    }
  };

  const filteredWines = wines.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(search.toLowerCase()) || 
                          wine.appellation.toLowerCase().includes(search.toLowerCase()) ||
                          wine.producer.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || wine.type === filterType;
    return matchesSearch && matchesType;
  });

  const adjustStock = (wine: Wine, amount: number, type: TransactionType) => {
    const qty = Math.max(0, wine.quantity + amount);
    setWines(prev => prev.map(w => w.id === wine.id ? { ...w, quantity: qty } : w));
    
    // Record as transaction
    const transaction: Sale = {
      id: Date.now().toString(),
      wineId: wine.id,
      wineName: wine.name,
      wineType: wine.type,
      quantity: Math.abs(amount),
      price: wine.sellPrice,
      client: type === 'Vente' ? 'Comptoir' : 'Ajustement Inventaire',
      date: new Date().toISOString(),
      type: type,
      total: Math.abs(amount) * wine.sellPrice,
      sellerName: 'Ajustement Système'
    };
    setSales(prev => [...prev, transaction]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif wine-primary">Inventaire</h2>
          <p className="text-gray-500">Gérez vos références et vos stocks</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-wine-primary hover:bg-[#a0522d] text-white px-6 py-3 rounded-xl shadow-lg transition-all"
        >
          <PlusCircle size={20} />
          <span>Ajouter un Vin</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un vin, domaine, appellation..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#D4A574] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Rouge', 'Blanc', 'Rosé', 'Effervescent', 'Moelleux'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition-all ${
                filterType === type 
                ? 'bg-wine-bronze border-wine-bronze text-white shadow-md' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-wine-bronze'
              }`}
            >
              {type === 'All' ? 'Tous les vins' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWines.map((wine) => (
          <div key={wine.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-2 w-full" style={{ backgroundColor: wine.type === 'Rouge' ? '#8B0000' : wine.type === 'Blanc' ? '#F5F5DC' : wine.type === 'Rosé' ? '#FFC0CB' : '#D4A574' }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl font-serif text-gray-800">{wine.name}</h3>
                  <p className="text-sm text-gray-500">{wine.appellation} • {wine.vintage}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(wine)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                  {userRole === 'Administrateur' && (
                    <button onClick={() => handleDelete(wine.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-gray-400">Région</p>
                  <p className="font-medium text-gray-700">{wine.region}</p>
                </div>
                <div>
                  <p className="text-gray-400">Producteur</p>
                  <p className="font-medium text-gray-700 truncate">{wine.producer}</p>
                </div>
                <div>
                  <p className="text-gray-400">Emplacement</p>
                  <p className="font-medium text-gray-700">{wine.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Prix Vente</p>
                  <p className="font-bold wine-primary">{wine.sellPrice.toLocaleString()} FCFA</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Stock Actuel</p>
                  <p className={`text-2xl font-bold font-serif ${wine.quantity <= wine.minStock ? 'text-red-500' : 'text-gray-800'}`}>
                    {wine.quantity} <span className="text-xs font-sans text-gray-400">btls</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => adjustStock(wine, -1, 'Vente')}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:border-wine-bronze active:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => adjustStock(wine, 1, 'Vente')}
                    className="w-10 h-10 flex items-center justify-center bg-wine-bronze text-white rounded-lg hover:bg-[#c49464] active:scale-95 transition-all shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-wine-primary text-white">
              <h3 className="text-2xl font-serif">{editingWine ? 'Modifier' : 'Ajouter'} une référence</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Nom du Vin*</label>
                <input required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Type*</label>
                <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as WineType})}>
                  <option value="Rouge">Rouge</option>
                  <option value="Blanc">Blanc</option>
                  <option value="Rosé">Rosé</option>
                  <option value="Effervescent">Effervescent</option>
                  <option value="Moelleux">Moelleux</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Appellation*</label>
                <input required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.appellation} onChange={e => setFormData({...formData, appellation: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Millésime</label>
                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.vintage} onChange={e => setFormData({...formData, vintage: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Producteur/Domaine*</label>
                <input required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.producer} onChange={e => setFormData({...formData, producer: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Région</label>
                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Quantité Initiale*</label>
                <input required type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-600">Prix Vente (FCFA)*</label>
                <input required type="number" step="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: parseFloat(e.target.value) || 0})} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Stock Min (Alerte)</label>
                <input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Stock Max (Capacité)</label>
                <input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.maxStock} onChange={e => setFormData({...formData, maxStock: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Emplacement (Casier)</label>
                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-sm font-semibold text-gray-600">Fournisseur</label>
                <input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
              </div>

              <div className="md:col-span-3 pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="px-10 py-2 rounded-lg bg-wine-primary text-white hover:bg-[#a0522d] shadow-lg transition-all">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
