
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity, BarChart3, Shield, Smartphone, Cloud } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track energy consumption and solar production in real-time across all circuits"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Historical data visualization and performance metrics with detailed charts"
    },
    {
      icon: Shield,
      title: "Remote Control",
      description: "Safely control individual circuits remotely with authentication and safety checks"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your energy dashboard from anywhere with our responsive mobile interface"
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Secure cloud-based data storage with automated reports and alerts"
    },
    {
      icon: Zap,
      title: "Smart Integration",
      description: "RF module integration for seamless communication with your energy systems"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Zap className="h-8 w-8 text-emerald-400" />
            <Activity className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold text-white">Energy Monitor</span>
        </div>
        <div className="space-x-4">
          <Button variant="ghost" asChild className="text-slate-300 hover:text-white">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Monitor & Control Your
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> Energy</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time energy monitoring, solar production tracking, and remote circuit control. 
            Take complete control of your energy consumption with our advanced IoT platform.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg px-8 py-6">
              <Link to="/signup">Start Monitoring</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6">
              <Link to="/login">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Energy Management
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to monitor, analyze, and control your energy systems
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg">
                      <feature.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">System Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-emerald-400">Real-time</div>
              <div className="text-slate-300">Circuit Monitoring</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-400">2+</div>
              <div className="text-slate-300">Controllable Circuits</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">24/7</div>
              <div className="text-slate-300">Cloud Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Monitoring?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join the future of energy management with our comprehensive monitoring platform
          </p>
          <Button size="lg" asChild className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg px-8 py-6">
            <Link to="/signup">Get Started Today</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="relative">
              <Zap className="h-6 w-6 text-emerald-400" />
              <Activity className="h-3 w-3 text-blue-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-lg font-semibold text-white">Energy Monitor</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2024 Energy Monitor. Advanced IoT Energy Management Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
