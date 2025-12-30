
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wine, Sale } from '../types';
import { DollarSign, Package, RefreshCcw, Calendar } from 'lucide-react';

interface DashboardProps {
  wines: Wine[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ wines, sales }) => {
  const COLORS = ['#8B0000', '#D4A574', '#F5F5DC', '#FFC0CB', '#8B4513'];

  // 1. Data processing for Charts
  const typeDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    wines.forEach(w => {
      counts[w.type] = (counts[w.type] || 0) + w.quantity;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [wines]);

  const monthlyRevenueData = useMemo(() => {
    const revs: Record<string, number> = {};
    sales.filter(s => s.type === 'Vente').forEach(s => {
      const month = new Date(s.date).toLocaleString('fr-FR', { month: 'short' });
      revs[month] = (revs[month] || 0) + s.total;
    });
    return Object.entries(revs).map(([name, revenue]) => ({ name, revenue }));
  }, [sales]);

  // 2. KPIs Calculations
  const totalRevenue = sales.filter(s => s.type === 'Vente').reduce((acc, s) => acc + s.total, 0);
  const currentMonthSales = sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return s.type === 'Vente' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((acc, s) => acc + s.total, 0);
  
  const avgBasket = sales.filter(s => s.type === 'Vente').length > 0 
    ? totalRevenue / sales.filter(s => s.type === 'Vente').length 
    : 0;
  
  // 3. Rotation calculations
  const rotationStats = useMemo(() => {
    return wines.map(wine => {
      const soldQty = sales.filter(s => s.wineId === wine.id && s.type === 'Vente').reduce((acc, s) => acc + s.quantity, 0);
      const avgStock = (wine.initialQuantity + wine.quantity) / 2 || 1;
      const rotationRate = (soldQty / avgStock) * 100;
      const avgDays = rotationRate > 0 ? 365 / (rotationRate / 100) : 0;
      return {
        ...wine,
        soldQty,
        rotationRate,
        avgDays: Math.round(avgDays)
      };
    }).sort((a, b) => b.rotationRate - a.rotationRate).slice(0, 10);
  }, [wines, sales]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-serif wine-primary">Tableau de Bord</h2>
        <p className="text-gray-500">Analyses de performance de votre cave</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="CA Total" value={`${totalRevenue.toLocaleString()} FCFA`} icon={<DollarSign />} color="bg-green-100 text-green-700" />
        <KpiCard title="Ventes ce Mois" value={`${currentMonthSales.toLocaleString()} FCFA`} icon={<Calendar />} color="bg-blue-100 text-blue-700" />
        <KpiCard title="Panier Moyen" value={`${avgBasket.toLocaleString()} FCFA`} icon={<RefreshCcw />} color="bg-orange-100 text-orange-700" />
        <KpiCard title="Stock Total" value={`${wines.reduce((acc, w) => acc + w.quantity, 0)} btls`} icon={<Package />} color="bg-purple-100 text-purple-700" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 font-serif">Répartition par Type</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 font-serif">CA Mensuel</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
                <Bar dataKey="revenue" fill="#D4A574" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 font-serif">Taux de Rotation (Top 10)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4">Référence</th>
                <th className="py-4">Vendus</th>
                <th className="py-4">Rotation (%)</th>
                <th className="py-4">Durée Moy. Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rotationStats.map((stat) => (
                <tr key={stat.id}>
                  <td className="py-4">
                    <p className="font-bold">{stat.name}</p>
                    <p className="text-xs text-gray-400">{stat.appellation}</p>
                  </td>
                  <td className="py-4 font-medium">{stat.soldQty} btls</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-wine-bronze h-full" style={{ width: `${Math.min(stat.rotationRate, 100)}%` }}></div>
                      </div>
                      <span className="text-sm font-bold">{stat.rotationRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {stat.avgDays > 0 ? `${stat.avgDays} jours` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold font-serif text-gray-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
