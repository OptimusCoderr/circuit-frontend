import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Charts from "./pages/Charts";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/auth.store";
import { useEffect } from "react";
import { LoaderPinwheel } from "lucide-react";



const App = () => {
  const { user, checkAuth, isCheckingAuth } = useAuthStore();
  console.log("Is checking auth:", isCheckingAuth);


  // Optional: call checkAuth on mount
  useEffect(() => {
		checkAuth();
	}, [checkAuth]);

  if (isCheckingAuth) {<LoaderPinwheel/>};

  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={ <Home />} />
            <Route path="/login" element={!user ? <Login/> : <Navigate to='/dashboard' />} />
            <Route path="/signup" element={!user ? <Signup/> : <Navigate to='/dashboard'/>} />
            <Route path="/dashboard" element={user ? <Dashboard/> : <Navigate to='/login'/>} />
            <Route path="/charts" element={user ? <Charts/> : <Navigate to='/login'/>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster/>
        </>
  );
};

export default App;