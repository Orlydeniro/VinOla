
import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, History, User, Trash2, PlusCircle, X, Info, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Sale, Wine, UserRole } from '../types';

interface SalesTrackingProps {
  sales: Sale[];
  wines: Wine[];
  setWines: React.Dispatch<React.SetStateAction<Wine[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  userRole: UserRole;
  userName: string;
}

const SalesTracking: React.FC<SalesTrackingProps> = ({ sales, wines, setWines, setSales, userRole, userName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleData, setSaleData] = useState({
    wineId: '',
    quantity: 1,
    price: 0,
    client: 'Comptoir',
    type: 'Vente' as const,
    date: new Date().toISOString().split('T')[0] // Default to today YYYY-MM-DD
  });

  const sortedSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'Vente': return 'bg-green-100 text-green-700';
      case 'Perte': return 'bg-red-100 text-red-700';
      case 'Casse': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const selectedWine = wines.find(w => w.id === saleData.wineId);

  const handleWineChange = (id: string) => {
    const wine = wines.find(w => w.id === id);
    if (wine) {
      setSaleData({
        ...saleData,
        wineId: id,
        price: wine.sellPrice,
        quantity: Math.min(saleData.quantity, wine.quantity > 0 ? wine.quantity : 1)
      });
    } else {
      setSaleData({ ...saleData, wineId: id });
    }
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWine) return;
    if (saleData.quantity > selectedWine.quantity) {
      alert("Stock insuffisant !");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      wineId: selectedWine.id,
      wineName: selectedWine.name,
      wineType: selectedWine.type,
      quantity: saleData.quantity,
      price: saleData.price,
      client: saleData.client,
      date: new Date(saleData.date).toISOString(),
      type: saleData.type,
      total: saleData.quantity * saleData.price,
      sellerName: userName
    };

    // Update wine stock
    setWines(prev => prev.map(w => 
      w.id === selectedWine.id 
        ? { ...w, quantity: w.quantity - saleData.quantity } 
        : w
    ));

    // Record sale
    setSales(prev => [...prev, newSale]);
    
    // Close modal
    setIsModalOpen(false);
    setSaleData({
      wineId: '',
      quantity: 1,
      price: 0,
      client: 'Comptoir',
      type: 'Vente',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteSale = (id: string) => {
    if (userRole !== 'Administrateur') {
      alert("Seul l'Administrateur peut supprimer des transactions.");
      return;
    }
    if (confirm("Voulez-vous vraiment supprimer cet enregistrement ? Note: le stock ne sera pas réincrémenté automatiquement.")) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
  };

  const exportToCSV = () => {
    if (sales.length === 0) {
      alert("Aucune vente à exporter.");
      return;
    }

    const headers = ["Date", "Vin", "Type Vin", "Quantite", "Prix Unitaire (FCFA)", "Total (FCFA)", "Client / Destination", "Type Flux", "Vendeur"];
    const csvContent = sales.map(s => [
      new Date(s.date).toLocaleDateString(),
      s.wineName.replace(/,/g, " "),
      s.wineType,
      s.quantity,
      s.price,
      s.total,
      s.client.replace(/,/g, " "),
      s.type,
      s.sellerName.replace(/,/g, " ")
    ].join(","));

    const blob = new Blob([[headers.join(","), ...csvContent].join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Ventes_VinStock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif wine-primary">Suivi des Flux</h2>
          <p className="text-gray-500">Historique des ventes et des mouvements de stock</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl shadow transition-all"
          >
            <Download size={20} />
            <span>Exporter en CSV</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-wine-bronze hover:bg-[#c49464] text-white px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            <PlusCircle size={20} />
            <span>Nouvelle Vente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <TrendingUp size={24} />
            <span className="font-bold">Total Ventes</span>
          </div>
          <p className="text-3xl font-serif font-bold text-gray-800">
            {sales.filter(s => s.type === 'Vente').reduce((acc, s) => acc + s.total, 0).toLocaleString()} FCFA
          </p>
          <p className="text-sm text-gray-400 mt-1">Depuis le début</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <ShoppingBag size={24} />
            <span className="font-bold">Volumes Vendus</span>
          </div>
          <p className="text-3xl font-serif font-bold text-gray-800">
            {sales.filter(s => s.type === 'Vente').reduce((acc, s) => acc + s.quantity, 0)} btls
          </p>
          <p className="text-sm text-gray-400 mt-1">Nombre d'unités</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Trash2 size={24} />
            <span className="font-bold">Total Pertes</span>
          </div>
          <p className="text-3xl font-serif font-bold text-gray-800">
            {sales.filter(s => s.type !== 'Vente').reduce((acc, s) => acc + s.total, 0).toLocaleString()} FCFA
          </p>
          <p className="text-sm text-gray-400 mt-1">Casse & Péremption</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center gap-2">
          <History size={20} className="wine-bronze" />
          <h3 className="text-xl font-serif font-bold">Derniers Mouvements</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Vin</th>
                <th className="px-6 py-4">Quantité</th>
                <th className="px-6 py-4">Vendeur</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Client / Cause</th>
                {userRole === 'Administrateur' && <th className="px-6 py-4">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedSales.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'Administrateur' ? 7 : 6} className="px-6 py-10 text-center text-gray-400">Aucun mouvement enregistré</td>
                </tr>
              ) : (
                sortedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{sale.wineName}</p>
                      <p className="text-xs text-gray-400">{sale.wineType} • <span className={`uppercase font-bold ${sale.type === 'Vente' ? 'text-green-600' : 'text-red-600'}`}>{sale.type}</span></p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {sale.quantity} btl{sale.quantity > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sale.sellerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-gray-800">
                      {sale.total.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {sale.type === 'Vente' ? <User size={14} className="text-gray-400" /> : <Trash2 size={14} className="text-gray-400" />}
                        {sale.client}
                      </div>
                    </td>
                    {userRole === 'Administrateur' && (
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer la transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SALE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-wine-primary text-white">
              <h3 className="text-2xl font-serif">Enregistrer une Vente</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleRecordSale} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Sélectionner un Vin*</label>
                  <select 
                    required 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none"
                    value={saleData.wineId}
                    onChange={(e) => handleWineChange(e.target.value)}
                  >
                    <option value="">-- Choisir une référence --</option>
                    {wines.filter(w => w.quantity > 0).map(wine => (
                      <option key={wine.id} value={wine.id}>
                        {wine.name} ({wine.vintage}) - Stock: {wine.quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">Date de vente*</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="date" 
                      required
                      className="w-full pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none text-sm"
                      value={saleData.date}
                      onChange={e => setSaleData({...saleData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">Type de flux*</label>
                  <select 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none text-sm"
                    value={saleData.type}
                    onChange={e => setSaleData({...saleData, type: e.target.value as any})}
                  >
                    <option value="Vente">Vente</option>
                    <option value="Perte">Perte</option>
                    <option value="Casse">Casse</option>
                    <option value="Péremption">Péremption</option>
                  </select>
                </div>
              </div>

              {selectedWine && (
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                  <Info size={18} className="text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p><strong>Emplacement:</strong> {selectedWine.location || 'N/A'}</p>
                    <p><strong>Stock dispo:</strong> {selectedWine.quantity} bouteilles</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">Quantité*</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    max={selectedWine?.quantity || 1}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                    value={saleData.quantity}
                    onChange={e => setSaleData({...saleData, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600">Prix Unitaire (FCFA)*</label>
                  <input 
                    required 
                    type="number" 
                    step="1" 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none font-bold" 
                    value={saleData.price}
                    onChange={e => setSaleData({...saleData, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-600">Client / Destination</label>
                <input 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-wine-bronze outline-none" 
                  placeholder="Ex: Comptoir, Jean Dupont, Restaurant..."
                  value={saleData.client}
                  onChange={e => setSaleData({...saleData, client: e.target.value})}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 font-bold uppercase">Session vendeur</span>
                  <span className="text-xs font-bold text-gray-600">{userName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Total de la transaction</span>
                  <span className="text-2xl font-bold font-serif wine-primary">
                    {(saleData.quantity * saleData.price).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-3 rounded-xl border hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedWine}
                  className={`flex-1 px-6 py-3 rounded-xl text-white shadow-lg transition-all font-bold ${
                    !selectedWine ? 'bg-gray-300 cursor-not-allowed' : 'bg-wine-primary hover:bg-[#a0522d]'
                  }`}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTracking;
