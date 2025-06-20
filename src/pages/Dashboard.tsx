import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, BarChart3, Sun, Home, AlertTriangle, LogOut, Loader2, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/auth.store.ts';
import useCircuitStore, { CircuitState } from '../store/control.store.ts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Circuit store integration
  const {
    currentState,
    currentState1,
    loading: circuitLoading,
    error: circuitError,
    lastUpdated,
    updateCircuitState,
    updateCircuitState1,
    getCurrentState,
    getCurrentState1,
    getCircuitHistory,
    clearError
  } = useCircuitStore();

  // Local state for other data (can be moved to separate stores later)
  const [realTimeData, setRealTimeData] = useState({
    solarProduction: 4.2,
    totalConsumption: 3.8,
    circuit1Consumption: 1.2,
    circuit2Consumption: 0.8,
    gridImport: 0,
    batteryLevel: 85
  });

  // Initialize circuit data on component mount
  useEffect(() => {
    const initializeCircuitData = async () => {
      try {
        await Promise.all([
          getCurrentState(),
          getCurrentState1(),
          getCircuitHistory()
        ]);
      } catch (error) {
        console.error('Failed to initialize circuit data:', error);
        toast.error('Failed to load circuit data');
      }
    };

    initializeCircuitData();
  }, [getCurrentState, getCurrentState1, getCircuitHistory]);

  // Handle circuit errors
  useEffect(() => {
    if (circuitError) {
      toast.error(circuitError);
      clearError();
    }
  }, [circuitError, clearError]);

  // Simulate real-time data updates (excluding circuit state)
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        solarProduction: Math.max(0, prev.solarProduction + (Math.random() - 0.5) * 0.5),
        totalConsumption: Math.max(0, prev.totalConsumption + (Math.random() - 0.5) * 0.3),
        // Circuit consumption based on current states from store
        circuit1Consumption: currentState === "1" ? Math.max(0, prev.circuit1Consumption + (Math.random() - 0.5) * 0.2) : 0,
        circuit2Consumption: currentState1 === "1" ? Math.max(0, prev.circuit2Consumption + (Math.random() - 0.5) * 0.2) : 0,
        gridImport: Math.max(0, prev.gridImport + (Math.random() - 0.5) * 0.2),
        batteryLevel: Math.min(100, Math.max(0, prev.batteryLevel + (Math.random() - 0.5) * 2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentState, currentState1]);

  // Sample data for mini chart
  const miniChartData = [
    { time: '12:00', solar: 3.8, load: 2.1 },
    { time: '13:00', solar: 4.1, load: 2.5 },
    { time: '14:00', solar: 4.5, load: 2.8 },
    { time: '15:00', solar: 4.2, load: 3.2 },
    { time: '16:00', solar: 3.9, load: 3.8 },
    { time: '17:00', solar: 3.2, load: 4.1 },
  ];

  // Toggle circuit state using the store
  const toggleMainCircuit = async (newState: CircuitState) => {
    try {
      await updateCircuitState(newState);
      toast.success(`Main Circuit ${newState === "1" ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle main circuit:', error);
      // Error toast is handled by the useEffect above
    }
  };

  // Toggle circuit state1 using the store
  const toggleSecondaryCircuit = async (newState: CircuitState) => {
    try {
      await updateCircuitState1(newState);
      toast.success(`Secondary Circuit ${newState === "1" ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle secondary circuit:', error);
      // Error toast is handled by the useEffect above
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

  // Helper functions to determine circuit status
  const isMainCircuitOn = currentState === "1";
  const isSecondaryCircuitOn = currentState1 === "1";

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile-Optimized Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
              <Activity className="h-2 w-2 sm:h-3 sm:w-3 text-blue-400 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Energy Monitor</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link to="/charts">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Charts
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              Logout
            </Button>
            <Badge variant="outline" className="border-emerald-500 text-emerald-400 text-xs">
              Online
            </Badge>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400 text-xs">
              Online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:bg-slate-700 p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pb-3 border-t border-slate-700 pt-3">
            <div className="flex flex-col space-y-2">
              <Link to="/charts" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Charts
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Real-time Stats - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Solar Production</CardTitle>
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{realTimeData.solarProduction.toFixed(1)} kW</div>
              <p className="text-xs text-emerald-400">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Total Consumption</CardTitle>
              <Home className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{realTimeData.totalConsumption.toFixed(1)} kW</div>
              <p className="text-xs text-slate-400">Normal usage</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Grid Import</CardTitle>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{realTimeData.gridImport.toFixed(1)} kW</div>
              <p className="text-xs text-green-400">Minimal import</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Battery Level</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{realTimeData.batteryLevel.toFixed(0)}%</div>
              <p className="text-xs text-green-400">Charging</p>
            </CardContent>
          </Card>
        </div>

        {/* Circuit Controls - Mobile Optimized */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-white text-lg sm:text-xl">Circuit Control</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Monitor and control circuits remotely
                </CardDescription>
              </div>
              {lastUpdated && (
                <p className="text-xs text-slate-400">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Main Circuit Control - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-700 rounded-lg space-y-3 sm:space-y-0">
                <div className="space-y-1 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Main Circuit (Kitchen)</h3>
                  <p className="text-sm text-slate-400">
                    {realTimeData.circuit1Consumption.toFixed(1)} kW • {isMainCircuitOn ? 'Online' : 'Offline'}
                  </p>
                  {!isMainCircuitOn && (
                    <div className="flex items-center text-orange-400 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Circuit disabled
                    </div>
                  )}
                  {currentState === null && (
                    <div className="flex items-center text-yellow-400 text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Loading state...
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span className="text-sm text-slate-300 sm:hidden">
                    {isMainCircuitOn ? 'ON' : 'OFF'}
                  </span>
                  {circuitLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  <Switch
                    checked={isMainCircuitOn}
                    onCheckedChange={(checked) => toggleMainCircuit(checked ? "1" : "0")}
                    disabled={circuitLoading || currentState === null}
                    className="data-[state=checked]:bg-emerald-500 scale-110 sm:scale-100"
                  />
                </div>
              </div>

              {/* Secondary Circuit Control - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-700 rounded-lg space-y-3 sm:space-y-0">
                <div className="space-y-1 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Secondary Circuit (Garage)</h3>
                  <p className="text-sm text-slate-400">
                    {realTimeData.circuit2Consumption.toFixed(1)} kW • {isSecondaryCircuitOn ? 'Online' : 'Offline'}
                  </p>
                  {!isSecondaryCircuitOn && (
                    <div className="flex items-center text-orange-400 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Circuit disabled
                    </div>
                  )}
                  {currentState1 === null && (
                    <div className="flex items-center text-yellow-400 text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Loading state...
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span className="text-sm text-slate-300 sm:hidden">
                    {isSecondaryCircuitOn ? 'ON' : 'OFF'}
                  </span>
                  {circuitLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  <Switch
                    checked={isSecondaryCircuitOn}
                    onCheckedChange={(checked) => toggleSecondaryCircuit(checked ? "1" : "0")}
                    disabled={circuitLoading || currentState1 === null}
                    className="data-[state=checked]:bg-emerald-500 scale-110 sm:scale-100"
                  />
                </div>
              </div>

              {/* Circuit Status Overview - Mobile Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div className={`p-3 sm:p-4 rounded-lg border ${isMainCircuitOn ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-md font-medium text-white">Kitchen Circuit Status</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Power: {realTimeData.circuit1Consumption.toFixed(1)} kW
                    </p>
                    <div className={`flex items-center text-xs ${isMainCircuitOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${isMainCircuitOn ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                      {isMainCircuitOn ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className={`p-3 sm:p-4 rounded-lg border ${isSecondaryCircuitOn ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-md font-medium text-white">Garage Circuit Status</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Power: {realTimeData.circuit2Consumption.toFixed(1)} kW
                    </p>
                    <div className={`flex items-center text-xs ${isSecondaryCircuitOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${isSecondaryCircuitOn ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                      {isSecondaryCircuitOn ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Circuit Consumption */}
              <div className="p-3 sm:p-4 bg-slate-600 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-md font-medium text-white">Total Circuit Consumption</h4>
                    <p className="text-xs sm:text-sm text-slate-400">Combined power usage from all circuits</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {(realTimeData.circuit1Consumption + realTimeData.circuit2Consumption).toFixed(1)} kW
                    </div>
                    <p className="text-xs text-slate-400">
                      {(isMainCircuitOn ? 1 : 0) + (isSecondaryCircuitOn ? 1 : 0)} of 2 circuits active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini Chart - Mobile Optimized */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white text-lg sm:text-xl">Today's Overview</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Solar production vs consumption (last 6 hours)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={miniChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="solar" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Solar (kW)"
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="load" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Load (kW)"
                  dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
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
