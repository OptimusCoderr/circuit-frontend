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

  // Local state for system monitoring
  const [systemData, setSystemData] = useState({
    systemStatus: 'operational',
    networkLatency: 12,
    uptime: 96.8,
    temperature: 24.5
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

  // Simulate system monitoring updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemData(prev => ({
        systemStatus: Math.random() > 0.1 ? 'operational' : 'warning',
        networkLatency: Math.max(5, prev.networkLatency + (Math.random() - 0.5) * 4),
        uptime: Math.min(100, Math.max(90, prev.uptime + (Math.random() - 0.5) * 0.5)),
        temperature: Math.max(15, Math.min(35, prev.temperature + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sample data for system monitoring chart
  const systemChartData = [
    { time: '12:00', uptime: 98.5, latency: 8 },
    { time: '13:00', uptime: 97.8, latency: 12 },
    { time: '14:00', uptime: 98.2, latency: 10 },
    { time: '15:00', uptime: 96.9, latency: 15 },
    { time: '16:00', uptime: 97.5, latency: 11 },
    { time: '17:00', uptime: 96.8, latency: 13 },
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
            <h1 className="text-lg sm:text-xl font-bold text-white">Circuit Monitor</h1>
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
        {/* System Status Cards - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">System Status</CardTitle>
              <Activity className={`h-3 w-3 sm:h-4 sm:w-4 ${systemData.systemStatus === 'operational' ? 'text-emerald-400' : 'text-yellow-400'}`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white capitalize">{systemData.systemStatus}</div>
              <p className={`text-xs ${systemData.systemStatus === 'operational' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                All systems running
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Network Latency</CardTitle>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{systemData.networkLatency.toFixed(0)} ms</div>
              <p className={`text-xs ${systemData.networkLatency < 20 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {systemData.networkLatency < 20 ? 'Excellent' : 'Good'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">System Uptime</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{systemData.uptime.toFixed(1)}%</div>
              <p className="text-xs text-emerald-400">High availability</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Temperature</CardTitle>
              <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-white">{systemData.temperature.toFixed(1)}°C</div>
              <p className={`text-xs ${systemData.temperature < 30 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {systemData.temperature < 30 ? 'Normal' : 'Warm'}
              </p>
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
                    Status: {isMainCircuitOn ? 'Online' : 'Offline'}
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
                    Status: {isSecondaryCircuitOn ? 'Online' : 'Offline'}
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
                      Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
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
                      Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
                    </p>
                    <div className={`flex items-center text-xs ${isSecondaryCircuitOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${isSecondaryCircuitOn ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                      {isSecondaryCircuitOn ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Circuit Activity Summary */}
              <div className="p-3 sm:p-4 bg-slate-600 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-md font-medium text-white">Circuit Activity Summary</h4>
                    <p className="text-xs sm:text-sm text-slate-400">Overall circuit monitoring status</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {(isMainCircuitOn ? 1 : 0) + (isSecondaryCircuitOn ? 1 : 0)} / 2
                    </div>
                    <p className="text-xs text-slate-400">
                      Circuits currently active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring Chart - Mobile Optimized */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-white text-lg sm:text-xl">System Performance</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              System uptime and network latency monitoring (last 6 hours)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={systemChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                  dataKey="uptime" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Uptime (%)"
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Latency (ms)"
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
