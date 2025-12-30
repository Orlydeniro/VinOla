
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wine as WineIcon, ShoppingCart, Bell, Menu, X, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Wine, Sale, AlertRule, UserRole } from './types';
import Inventory from './components/Inventory';
import SalesTracking from './components/SalesTracking';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';

type Page = 'inventory' | 'sales' | 'dashboard' | 'alerts';

const INITIAL_WINES: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux',
    type: 'Rouge',
    appellation: 'Margaux',
    vintage: '2015',
    producer: 'Château Margaux',
    region: 'Bordeaux',
    quantity: 24,
    sellPrice: 450000,
    minStock: 6,
    maxStock: 48,
    location: 'Cave A1',
    supplier: 'Grands Crus Direct',
    dateAdded: new Date().toISOString(),
    initialQuantity: 24
  },
  {
    id: '2',
    name: 'Cloudy Bay Sauvignon Blanc',
    type: 'Blanc',
    appellation: 'Marlborough',
    vintage: '2022',
    producer: 'Cloudy Bay',
    region: 'Nouvelle-Zélande',
    quantity: 60,
    sellPrice: 25000,
    minStock: 12,
    maxStock: 120,
    location: 'Rayon Frais 1',
    supplier: 'LVMH',
    dateAdded: new Date().toISOString(),
    initialQuantity: 60
  },
  {
    id: '3',
    name: 'Whispering Angel',
    type: 'Rosé',
    appellation: 'Côtes de Provence',
    vintage: '2023',
    producer: 'Caves d\'Esclans',
    region: 'Provence',
    quantity: 120,
    sellPrice: 18000,
    minStock: 24,
    maxStock: 240,
    location: 'Terrasse B',
    supplier: 'Provence Wines',
    dateAdded: new Date().toISOString(),
    initialQuantity: 120
  },
  {
    id: '4',
    name: 'Dom Pérignon Vintage',
    type: 'Effervescent',
    appellation: 'Champagne',
    vintage: '2012',
    producer: 'Moët & Chandon',
    region: 'Champagne',
    quantity: 12,
    sellPrice: 165000,
    minStock: 3,
    maxStock: 24,
    location: 'Vitrine Luxe',
    supplier: 'MH France',
    dateAdded: new Date().toISOString(),
    initialQuantity: 12
  }
];

const App: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('inventory');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Session management
  const [userRole, setUserRole] = useState<UserRole>('Administrateur');
  const [userName, setUserName] = useState<string>('Jean Admin');

  // Initial load from LocalStorage
  useEffect(() => {
    const storedWines = localStorage.getItem('vinstock_wines');
    const storedSales = localStorage.getItem('vinstock_sales');
    const storedRules = localStorage.getItem('vinstock_rules');
    
    if (storedWines && JSON.parse(storedWines).length > 0) {
      setWines(JSON.parse(storedWines));
    } else {
      setWines(INITIAL_WINES);
    }
    
    if (storedSales) setSales(JSON.parse(storedSales));
    if (storedRules) setAlertRules(JSON.parse(storedRules));
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (wines.length > 0) {
      localStorage.setItem('vinstock_wines', JSON.stringify(wines));
    }
  }, [wines]);

  useEffect(() => {
    localStorage.setItem('vinstock_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('vinstock_rules', JSON.stringify(alertRules));
  }, [alertRules]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const switchRole = () => {
    if (userRole === 'Administrateur') {
      setUserRole('Vendeur');
      setUserName('Mamadou Vendeur');
    } else {
      setUserRole('Administrateur');
      setUserName('Jean Admin');
    }
  };

  const navItems = [
    { id: 'inventory', label: 'Stock', icon: WineIcon },
    { id: 'sales', label: 'Ventes', icon: ShoppingCart },
    { id: 'dashboard', label: 'Analyse', icon: LayoutDashboard },
    { id: 'alerts', label: 'Alertes', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-[#fcfaf7]">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#8B4513] text-white transition-transform duration-300 transform z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 font-serif">
            <WineIcon className="text-[#D4A574]" />
            VinStock Pro
          </h1>
          <p className="text-xs text-[#D4A574] mt-1 uppercase tracking-widest">Maître de Chai</p>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id as Page);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id 
                ? 'bg-[#D4A574] text-white shadow-lg' 
                : 'hover:bg-[#a0522d] text-gray-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-6">
          <div className="p-4 rounded-xl bg-[#a0522d] border border-[#D4A574]/30">
            <p className="text-xs text-gray-300">Total Bouteilles</p>
            <p className="text-xl font-bold font-serif">{wines.reduce((acc, w) => acc + w.quantity, 0)}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-gray-600" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border">
              <ShieldCheck size={16} className={userRole === 'Administrateur' ? 'text-green-600' : 'text-blue-600'} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{userRole}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={switchRole}
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-wine-primary transition-colors"
            >
              <RefreshCcw size={16} />
              Changer de session
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none">Utilisateur</p>
                <p className="text-sm font-bold text-gray-800">{userName}</p>
              </div>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-105 ${userRole === 'Administrateur' ? 'bg-[#8B4513]' : 'bg-[#D4A574]'}`}
                onClick={switchRole}
                title="Cliquer pour changer de session"
              >
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 overflow-auto flex-1">
          {currentPage === 'inventory' && (
            <Inventory wines={wines} setWines={setWines} setSales={setSales} userRole={userRole} />
          )}
          {currentPage === 'sales' && (
            <SalesTracking 
              sales={sales} 
              wines={wines} 
              setWines={setWines} 
              setSales={setSales} 
              userRole={userRole}
              userName={userName}
            />
          )}
          {currentPage === 'dashboard' && (
            <Dashboard wines={wines} sales={sales} />
          )}
          {currentPage === 'alerts' && (
            <Alerts wines={wines} setWines={setWines} alertRules={alertRules} setAlertRules={setAlertRules} />
          )}
        </div>
      </main>
    </div>
  );
};

// Re-import missing icon
import { RefreshCcw } from 'lucide-react';

export default App;
