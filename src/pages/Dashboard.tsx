import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, BarChart3, Sun, Home, AlertTriangle, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuthStore();
  const [circuit1, setCircuit1] = useState(true);
  const [circuit2, setCircuit2] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    solarProduction: 4.2,
    totalConsumption: 3.8,
    circuit1Consumption: 1.2,
    circuit2Consumption: 0.8,
    gridImport: 0,
    batteryLevel: 85
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        solarProduction: Math.max(0, prev.solarProduction + (Math.random() - 0.5) * 0.5),
        totalConsumption: Math.max(0, prev.totalConsumption + (Math.random() - 0.5) * 0.3),
        circuit1Consumption: circuit1 ? Math.max(0, prev.circuit1Consumption + (Math.random() - 0.5) * 0.2) : 0,
        circuit2Consumption: circuit2 ? Math.max(0, prev.circuit2Consumption + (Math.random() - 0.5) * 0.2) : 0,
        gridImport: Math.max(0, prev.gridImport + (Math.random() - 0.5) * 0.2),
        batteryLevel: Math.min(100, Math.max(0, prev.batteryLevel + (Math.random() - 0.5) * 2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [circuit1, circuit2]);

  // Sample data for mini chart
  const miniChartData = [
    { time: '12:00', solar: 3.8, load: 2.1 },
    { time: '13:00', solar: 4.1, load: 2.5 },
    { time: '14:00', solar: 4.5, load: 2.8 },
    { time: '15:00', solar: 4.2, load: 3.2 },
    { time: '16:00', solar: 3.9, load: 3.8 },
    { time: '17:00', solar: 3.2, load: 4.1 },
  ];

  const toggleCircuit = (circuitNumber: number) => {
    if (circuitNumber === 1) {
      setCircuit1(!circuit1);
      console.log(`Circuit 1 ${!circuit1 ? 'ON' : 'OFF'}`);
    } else {
      setCircuit2(!circuit2);
      console.log(`Circuit 2 ${!circuit2 ? 'ON' : 'OFF'}`);
    }
  };


  

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="h-6 w-6 text-emerald-400" />
              <Activity className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-bold text-white">Energy Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/charts">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Charts
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              Online
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Solar Production</CardTitle>
              <Sun className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{realTimeData.solarProduction.toFixed(1)} kW</div>
              <p className="text-xs text-emerald-400">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Consumption</CardTitle>
              <Home className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{realTimeData.totalConsumption.toFixed(1)} kW</div>
              <p className="text-xs text-slate-400">Normal usage</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Grid Import</CardTitle>
              <Zap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{realTimeData.gridImport.toFixed(1)} kW</div>
              <p className="text-xs text-green-400">Minimal import</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Battery Level</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{realTimeData.batteryLevel.toFixed(0)}%</div>
              <p className="text-xs text-green-400">Charging</p>
            </CardContent>
          </Card>
        </div>

        {/* Circuit Controls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Circuit Control</CardTitle>
            <CardDescription className="text-slate-400">
              Monitor and control individual circuits remotely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Circuit 1 */}
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Circuit 1 - Kitchen</h3>
                  <p className="text-sm text-slate-400">
                    {realTimeData.circuit1Consumption.toFixed(1)} kW • {circuit1 ? 'Online' : 'Offline'}
                  </p>
                  {!circuit1 && (
                    <div className="flex items-center text-orange-400 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Circuit disabled
                    </div>
                  )}
                </div>
                <Switch
                  checked={circuit1}
                  onCheckedChange={() => toggleCircuit(1)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              {/* Circuit 2 */}
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Circuit 2 - Garage</h3>
                  <p className="text-sm text-slate-400">
                    {realTimeData.circuit2Consumption.toFixed(1)} kW • {circuit2 ? 'Online' : 'Offline'}
                  </p>
                  {!circuit2 && (
                    <div className="flex items-center text-orange-400 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Circuit disabled
                    </div>
                  )}
                </div>
                <Switch
                  checked={circuit2}
                  onCheckedChange={() => toggleCircuit(2)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Today's Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Solar production vs consumption (last 6 hours)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={miniChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="solar" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Solar (kW)"
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Load (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
