import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Import Zustand store
import useEnergyDataStore from '../store/energydata.store';

const Charts = () => {
  const {
    flattenedReadings,
    loading,
    error,
    fetchFlattenedReadings,
    fetchAggregatedData,
    clearError
  } = useEnergyDataStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [aggregatedData, setAggregatedData] = useState<any>({
    hourly: [],
    daily: [],
    weekly: []
  });

  // Fetch data on mount
  useEffect(() => {
    fetchFlattenedReadings();
    const loadAggregated = async () => {
      try {
        const hourly = await fetchAggregatedData({ groupBy: 'hour' });
        const daily = await fetchAggregatedData({ groupBy: 'day' });
        const weekly = await fetchAggregatedData({ groupBy: 'week' });
        setAggregatedData({ hourly, daily, weekly });
      } catch (err) {
        console.error('Failed to fetch aggregated data:', err);
      }
    };
    loadAggregated();
  }, [fetchFlattenedReadings, fetchAggregatedData]);

  // Process data for charting
  const processedData = useMemo(() => {
    if (!flattenedReadings.length) return null;

    // Hourly Data (power grouped by hour)
    const hourlyData = flattenedReadings
      .filter((reading) => new Date(reading.timestamp).toISOString().split('T')[0] === selectedDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .reduce((acc, reading) => {
        const hour = new Date(reading.timestamp).getHours();
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const existing = acc.find((item) => item.time === time);

        if (existing) {
          existing.count++;
          existing.solar = ((existing.solar * (existing.count - 1)) + (reading.power > 0 ? reading.power : 0)) / existing.count;
          existing.load = ((existing.load * (existing.count - 1)) + Math.abs(reading.power)) / existing.count;
        } else {
          acc.push({ time, solar: reading.power > 0 ? reading.power : 0, load: Math.abs(reading.power), count: 1 });
        }
        return acc;
      }, []);

    // Minute-by-minute Data for the selected day
    const minuteData = flattenedReadings
      .filter((reading) => new Date(reading.timestamp).toISOString().split('T')[0] === selectedDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .reduce((acc, reading) => {
        const date = new Date(reading.timestamp);
        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        const existing = acc.find((item) => item.time === time);

        if (existing) {
          existing.count++;
          existing.acVoltage = ((existing.acVoltage * (existing.count - 1)) + reading.ACvoltage) / existing.count;
          existing.acCurrent = ((existing.acCurrent * (existing.count - 1)) + reading.ACcurrent) / existing.count;
          existing.acCurrentScaled = ((existing.acCurrentScaled * (existing.count - 1)) + (reading.ACcurrent * 10)) / existing.count;
        } else {
          acc.push({ time, acVoltage: reading.ACvoltage, acCurrent: reading.ACcurrent, acCurrentScaled: reading.ACcurrent * 10, count: 1 });
        }
        return acc;
      }, []);

    // Daily Data (averaged over multiple days)
    const dailyData = flattenedReadings
      .reduce((acc, reading) => {
        const date = new Date(reading.timestamp);
        const day = date.toISOString().split('T')[0];
        const existing = acc.find((item) => item.day === day);

        if (existing) {
          existing.count++;
          existing.solar = ((existing.solar * (existing.count - 1)) + (reading.power > 0 ? reading.power : 0)) / existing.count;
          existing.load = ((existing.load * (existing.count - 1)) + Math.abs(reading.power)) / existing.count;
          existing.acVoltage = ((existing.acVoltage * (existing.count - 1)) + reading.ACvoltage) / existing.count;
          existing.acCurrent = ((existing.acCurrent * (existing.count - 1)) + reading.ACcurrent) / existing.count;
          existing.acCurrentScaled = ((existing.acCurrentScaled * (existing.count - 1)) + (reading.ACcurrent * 100)) / existing.count;
        } else {
          acc.push({
            day,
            dayLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            solar: reading.power > 0 ? reading.power : 0,
            load: Math.abs(reading.power),
            acVoltage: reading.ACvoltage,
            acCurrent: reading.ACcurrent,
            acCurrentScaled: reading.ACcurrent * 100,
            count: 1
          });
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-14);

    // Weekly Data
    const weeklyData = aggregatedData.daily?.length
      ? aggregatedData.daily.slice(0, 7).map((item, index) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index % 7],
          solar: Number((item.avgPower || 0).toFixed(1)),
          consumption: Number((item.avgPower || 0).toFixed(1))
        }))
      : [];

    // Circuit Data
    const circuitData = flattenedReadings
      .reduce((acc, reading) => {
        const name = typeof reading.circuit === 'object' ? reading.circuit?.name : `Circuit ${reading.circuit || 'Unknown'}`;
        const power = reading.power || 0;
        const existing = acc.find((item) => item.name === name);

        if (existing) {
          existing.total += power;
          existing.count += 1;
        } else {
          acc.push({ name, total: power, count: 1 });
        }
        return acc;
      }, [])
      .map((item) => ({
        name: item.name,
        value: Number((Math.abs(item.total / item.count)).toFixed(2)),
        consumption: Number((Math.abs(item.total / item.count)).toFixed(2))
      }));

    // Performance Data
    const performanceData = flattenedReadings
      .reduce((acc, reading) => {
        const date = new Date(reading.timestamp);
        const month = date.toLocaleString('default', { month: 'short' });
        const existing = acc.find((item) => item.month === month);

        if (existing) {
          existing.totalReadings += 1;
          existing.activeReadings += (reading.status === 'active' ? 1 : 0);
          existing.totalPower += Math.abs(reading.power || 0);
        } else {
          acc.push({
            month,
            totalReadings: 1,
            activeReadings: (reading.status === 'active' ? 1 : 0),
            totalPower: Math.abs(reading.power || 0),
          });
        }
        return acc;
      }, [])
      .map((item) => ({
        month: item.month,
        efficiency: Number((item.totalPower / item.totalReadings).toFixed(1)),
        uptime: Number(((item.activeReadings / item.totalReadings) * 100).toFixed(1)),
        avgEnergy: Number((item.totalPower / item.totalReadings).toFixed(2))
      }));

    return { hourlyData, minuteData, dailyData, weeklyData, circuitData, performanceData };
  }, [flattenedReadings, aggregatedData, selectedDate]);

  const handleExport = () => {
    const exportData = { flattenedReadings, aggregatedData, selectedDate, exportDate: new Date().toISOString() };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `energy-data-${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const startDate = new Date(newDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    fetchFlattenedReadings({ startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  };

  const formatMinuteTooltip = (value, name, props) => {
    if (name === 'AC Current (A × 10)') {
      return [`${(props.payload.acCurrent).toFixed(3)} A`, 'AC Current (Actual)'];
    }
    return [`${value.toFixed(2)} V`, name];
  };

  const formatDailyTooltip = (value, name, props) => {
    if (name === 'AC Current (A × 100)') {
      return [`${(props.payload.acCurrent).toFixed(3)} A`, 'AC Current (Actual)'];
    }
    return [`${value.toFixed(2)} ${name.includes('Voltage') ? 'V' : 'W'}`, name.replace('Avg ', '')];
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Error</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={() => { clearError(); fetchFlattenedReadings(); }}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
  if (!processedData || !processedData.hourlyData.length) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
        <CardContent className="p-6 text-center">
          <h3 className="text-white text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-400 mb-4">Start collecting energy data to see analytics.</p>
          <Button onClick={fetchFlattenedReadings}>Refresh</Button>
        </CardContent>
      </Card>
    </div>
  );

  const { hourlyData, minuteData, dailyData, weeklyData, circuitData, performanceData } = processedData;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-white">Energy Analytics</h1>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white whitespace-nowrap"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6">
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700 grid grid-cols-3 sm:grid-cols-5 w-full h-auto p-1">
            <TabsTrigger value="hourly" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white">Hourly</TabsTrigger>
            <TabsTrigger value="daily" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white">Weekly</TabsTrigger>
            <TabsTrigger value="circuits" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white">Circuits</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white">Performance</TabsTrigger>
          </TabsList>

          <div className="mt-4 sm:mt-6">
            <TabsContent value="hourly">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Hourly Power Flow ({selectedDate})</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Solar production and load consumption</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} interval="preserveStartEnd"/>
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="solar" fill="#10b981" name="Solar (W)" />
                        <Bar dataKey="load" fill="#3b82f6" name="Load (W)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Minute AC V/A ({selectedDate})</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Current scaled 10x for visibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={minuteData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 8 }} interval={29}/>
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip formatter={formatMinuteTooltip} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="acVoltage" fill="#ef4444" name="AC Voltage (V)" />
                        <Bar dataKey="acCurrentScaled" fill="#06b6d4" name="AC Current (A × 10)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="daily">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Daily Power Trends</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Average power flow over the last 14 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="dayLabel" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60}/>
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip formatter={formatDailyTooltip} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="solar" fill="#10b981" name="Avg Solar (W)" />
                        <Bar dataKey="load" fill="#3b82f6" name="Avg Load (W)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Daily AC V/A Trends</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Avg AC parameters over 14 days (Current scaled 100x)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="dayLabel" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60}/>
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip formatter={formatDailyTooltip} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="acVoltage" fill="#ef4444" name="Avg AC Voltage (V)" />
                        <Bar dataKey="acCurrentScaled" fill="#06b6d4" name="AC Current (A × 100)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="weekly">
               <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white text-base">Weekly Energy Summary</CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">Average power and consumption over the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="solar" fill="#10b981" name="Avg Power (kW)" />
                      <Bar dataKey="consumption" fill="#3b82f6" name="Avg Consumption (kW)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="circuits">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                 <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Power Distribution by Circuit</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Average power consumption by circuit (Horizontal)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={circuitData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Bar dataKey="value" fill="#10b981" name="Power (kW)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-white text-base">Circuit Consumption Comparison</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">Individual circuit monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={circuitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="consumption" fill="#3b82f6" name="Consumption (kW)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
               <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white text-base">System Performance Metrics</CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">Efficiency and uptime over recent months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="efficiency" fill="#10b981" name="Avg Power (kW)" />
                      <Bar dataKey="uptime" fill="#3b82f6" name="System Uptime (%)" />
                      <Bar dataKey="avgEnergy" fill="#f59e0b" name="Avg Energy/Reading (kW)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Charts;
