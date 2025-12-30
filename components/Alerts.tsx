
import React, { useState, useMemo } from 'react';
import { Wine, AlertRule } from '../types';
import { 
  ArrowUpRight, ArrowDownRight, Ghost, 
  Settings, Plus, Trash2, ShieldAlert, CheckCircle, Save
} from 'lucide-react';

interface AlertsProps {
  wines: Wine[];
  setWines: React.Dispatch<React.SetStateAction<Wine[]>>;
  alertRules: AlertRule[];
  setAlertRules: React.Dispatch<React.SetStateAction<AlertRule[]>>;
}

const Alerts: React.FC<AlertsProps> = ({ wines, setWines, alertRules, setAlertRules }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    field: 'quantity',
    operator: 'less',
    color: '#8B4513'
  });

  const stockOut = wines.filter(w => w.quantity === 0);
  const lowStock = wines.filter(w => w.quantity > 0 && w.quantity <= w.minStock);
  const overStock = wines.filter(w => w.quantity >= w.maxStock);

  const customAlerts = useMemo(() => {
    const alerts: Array<{ wine: Wine; rule: AlertRule }> = [];
    wines.forEach(wine => {
      alertRules.forEach(rule => {
        const wineValue = wine[rule.field];
        let triggered = false;

        if (rule.operator === 'less') triggered = Number(wineValue) < Number(rule.value);
        if (rule.operator === 'greater') triggered = Number(wineValue) > Number(rule.value);
        if (rule.operator === 'equal') triggered = String(wineValue).toLowerCase() === String(rule.value).toLowerCase();
        if (rule.operator === 'contains') triggered = String(wineValue).toLowerCase().includes(String(rule.value).toLowerCase());

        if (triggered) {
          alerts.push({ wine, rule });
        }
      });
    });
    return alerts;
  }, [wines, alertRules]);

  const handleAddRule = () => {
    if (!newRule.name || !newRule.value || !newRule.message) {
      alert("Veuillez remplir tous les champs de la règle.");
      return;
    }
    const rule: AlertRule = {
      ...newRule as AlertRule,
      id: Date.now().toString()
    };
    setAlertRules([...alertRules, rule]);
    setNewRule({ field: 'quantity', operator: 'less', color: '#8B4513' });
  };

  const removeRule = (id: string) => {
    setAlertRules(alertRules.filter(r => r.id !== id));
  };

  const updateWineThreshold = (id: string, field: 'minStock' | 'maxStock', val: number) => {
    setWines(prev => prev.map(w => w.id === id ? { ...w, [field]: val } : w));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif wine-primary">Système d'Alertes</h2>
          <p className="text-gray-500">Gérez vos seuils et notifications personnalisées</p>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all ${
            showConfig ? 'bg-wine-primary text-white' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Settings size={20} />
          <span>Configuration</span>
        </button>
      </div>

      {showConfig && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* BULK STOCK CONFIG */}
          <div className="bg-white rounded-2xl shadow-sm border border-wine-bronze/30 overflow-hidden">
            <div className="p-6 bg-wine-bronze/10 border-b border-wine-bronze/20 flex items-center gap-2">
              <Save size={20} className="wine-primary" />
              <h3 className="text-xl font-serif font-bold wine-primary">Configuration Rapide Seuils</h3>
            </div>
            <div className="p-4 overflow-x-auto max-h-[400px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <th className="pb-3">Vin</th>
                    <th className="pb-3 px-2">Min (Alerte)</th>
                    <th className="pb-3 px-2">Max (Capacité)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {wines.map(wine => (
                    <tr key={wine.id}>
                      <td className="py-3 font-medium text-gray-700 max-w-[150px] truncate">{wine.name}</td>
                      <td className="py-2 px-2">
                        <input 
                          type="number" 
                          className="w-16 p-1 border rounded focus:ring-1 focus:ring-wine-bronze text-center"
                          value={wine.minStock}
                          onChange={(e) => updateWineThreshold(wine.id, 'minStock', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input 
                          type="number" 
                          className="w-16 p-1 border rounded focus:ring-1 focus:ring-wine-bronze text-center"
                          value={wine.maxStock}
                          onChange={(e) => updateWineThreshold(wine.id, 'maxStock', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CUSTOM RULE CREATION */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 bg-gray-50 border-b flex items-center gap-2">
              <Plus size={20} className="wine-bronze" />
              <h3 className="text-xl font-serif font-bold">Nouvelle Règle d'Alerte</h3>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Nom Règle</label>
                  <input className="w-full p-2 border rounded-lg" placeholder="Ex: Vins Premium" value={newRule.name || ''} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Champ</label>
                  <select className="w-full p-2 border rounded-lg" value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value as any})}>
                    <option value="quantity">Quantité</option>
                    <option value="region">Région</option>
                    <option value="type">Type</option>
                    <option value="sellPrice">Prix Vente</option>
                    <option value="vintage">Millésime</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Opérateur</label>
                  <select className="w-full p-2 border rounded-lg" value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value as any})}>
                    <option value="less">Inférieur à</option>
                    <option value="greater">Supérieur à</option>
                    <option value="equal">Égal à</option>
                    <option value="contains">Contient</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valeur</label>
                  <input className="w-full p-2 border rounded-lg" value={newRule.value || ''} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Message d'alerte</label>
                <input className="w-full p-2 border rounded-lg" placeholder="Message à afficher..." value={newRule.message || ''} onChange={e => setNewRule({...newRule, message: e.target.value})} />
              </div>
              <button onClick={handleAddRule} className="w-full py-3 bg-wine-bronze text-white font-bold rounded-xl hover:bg-[#c49464] transition-all">
                Ajouter la règle
              </button>
            </div>
            
            {/* LIST OF RULES */}
            <div className="border-t bg-gray-50 max-h-[200px] overflow-auto">
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Règles actives</p>
                {alertRules.length === 0 ? (
                  <p className="text-sm text-gray-400 italic p-2">Aucune règle personnalisée.</p>
                ) : (
                  alertRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between bg-white p-3 rounded-lg border text-sm group">
                      <div>
                        <span className="font-bold">{rule.name}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-xs text-gray-500">{rule.field} {rule.operator} {rule.value}</span>
                      </div>
                      <button onClick={() => removeRule(rule.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CUSTOM ALERTS */}
        {customAlerts.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border-l-4 border-wine-bronze overflow-hidden">
             <div className="bg-wine-bronze/10 p-6 border-b border-wine-bronze/20 flex items-center gap-3">
              <ShieldAlert className="wine-primary" size={24} />
              <h3 className="text-xl font-serif font-bold wine-primary">Alertes Personnalisées</h3>
              <span className="ml-auto bg-wine-primary text-white text-xs font-bold px-2 py-1 rounded-full">{customAlerts.length}</span>
            </div>
            <div className="divide-y">
              {customAlerts.map(({ wine, rule }, idx) => (
                <div key={`${wine.id}-${rule.id}-${idx}`} className="p-4 flex items-center justify-between hover:bg-orange-50/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-wine-bronze text-white">{rule.name}</span>
                      <h4 className="font-bold text-gray-800">{wine.name}</h4>
                    </div>
                    <p className="text-sm text-wine-primary font-medium mt-1 italic">{rule.message}</p>
                    <p className="text-[10px] text-gray-400">{wine.region} • {wine.producer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Valeur actuelle</p>
                    <p className="font-bold text-gray-700">{wine[rule.field]} <span className="text-[10px] text-gray-400">{typeof wine[rule.field] === 'number' ? 'unités' : ''}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ruptures de Stock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
            <Ghost className="text-red-600" size={24} />
            <h3 className="text-xl font-serif font-bold text-red-800">Ruptures de Stock</h3>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{stockOut.length}</span>
          </div>
          <div className="p-0">
            {stockOut.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <CheckCircle className="text-green-500" size={40} />
                <p className="text-gray-400">Aucune rupture de stock.</p>
              </div>
            ) : (
              <div className="divide-y">
                {stockOut.map(wine => (
                  <AlertItem key={wine.id} wine={wine} badge="Rupture" badgeColor="bg-red-100 text-red-700" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stocks Faibles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-50 p-6 border-b border-orange-100 flex items-center gap-3">
            <ArrowDownRight className="text-orange-600" size={24} />
            <h3 className="text-xl font-serif font-bold text-orange-800">Stocks Faibles (Min)</h3>
            <span className="ml-auto bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">{lowStock.length}</span>
          </div>
          <div className="p-0">
            {lowStock.length === 0 ? (
              <div className="p-10 text-center text-gray-400">Tout est sous contrôle.</div>
            ) : (
              <div className="divide-y">
                {lowStock.map(wine => (
                  <AlertItem key={wine.id} wine={wine} badge={`Stock: ${wine.quantity}`} badgeColor="bg-orange-100 text-orange-700" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Surstockage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-center gap-3">
            <ArrowUpRight className="text-blue-600" size={24} />
            <h3 className="text-xl font-serif font-bold text-blue-800">Surstockage (Max)</h3>
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{overStock.length}</span>
          </div>
          <div className="p-0">
            {overStock.length === 0 ? (
              <p className="p-10 text-center text-gray-400">Capacités optimales.</p>
            ) : (
              <div className="divide-y">
                {overStock.map(wine => (
                  <AlertItem key={wine.id} wine={wine} badge={`Max: ${wine.maxStock}`} badgeColor="bg-blue-100 text-blue-700" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertItem: React.FC<{ wine: Wine; badge: string; badgeColor: string }> = ({ wine, badge, badgeColor }) => (
  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
    <div>
      <h4 className="font-bold text-gray-800">{wine.name}</h4>
      <p className="text-xs text-gray-400">{wine.appellation} • {wine.producer}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${badgeColor}`}>
        {badge}
      </span>
      <div className="text-right hidden sm:block">
        <p className="text-xs text-gray-400">Emplacement</p>
        <p className="text-sm font-medium text-gray-600">{wine.location || 'N/A'}</p>
      </div>
    </div>
  </div>
);

export default Alerts;
