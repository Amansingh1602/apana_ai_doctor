import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, consentApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useTheme } from "../hooks/useTheme.jsx";
import { Activity, FileText, Heart, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import ConsentForm from "../components/ConsentForm";
import SymptomForm from "../components/SymptomForm";
import SessionHistory from "../components/SessionHistory";
import { cn } from "../lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [hasConsent, setHasConsent] = useState(null);
  const [activeTab, setActiveTab] = useState("new");

  const tabs = [
    { id: "new", label: "Symptom Check", description: "New Assessment", Icon: Activity },
    { id: "history", label: "History", description: "Past Sessions", Icon: FileText },
  ];

  useEffect(() => {
    // Check auth
    if (!authApi.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    // Get user data
    const fetchUser = async () => {
      try {
        const response = await authApi.getMe();
        setUser(response.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        authApi.logout();
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkConsent();
    }
  }, [user]);

  const checkConsent = async () => {
    try {
      const response = await consentApi.check();
      setHasConsent(response.hasConsent);
    } catch (error) {
      console.error("Error checking consent:", error);
      setHasConsent(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleConsentGiven = () => {
    setHasConsent(true);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hasConsent === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const userInitials = user.fullName?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -left-40 -top-40 h-80 w-80 rounded-full ${isDark ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-blue-400/30 to-cyan-400/30'} blur-[100px]`} />
        <div className={`absolute -right-40 top-1/3 h-96 w-96 rounded-full ${isDark ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-r from-purple-400/30 to-pink-400/30'} blur-[120px]`} />
        <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'} bg-[size:64px_64px]`} />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-20 border-b ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg opacity-50" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Apna Doctor</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Health Companion</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* User Badge */}
              <div className={`hidden sm:flex items-center gap-2 rounded-full border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white/80'} px-4 py-2`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.fullName}</span>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className={`${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} hover:bg-red-500/20`}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          {hasConsent && (
            <div className="mt-3 sm:mt-4 flex gap-2">
              {tabs.map(({ id, label, description, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex flex-1 items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border p-2.5 sm:p-4 transition-all",
                      active
                        ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : isDark 
                          ? "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50"
                          : "border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white/80"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md sm:rounded-lg",
                        active
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                          : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-left">
                      <p className={cn("text-sm sm:text-base font-medium", active ? (isDark ? "text-white" : "text-blue-600") : (isDark ? "text-slate-300" : "text-slate-700"))}>
                        {label}
                      </p>
                      <p className={`hidden sm:block text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-8">
        {!hasConsent ? (
          <ConsentForm onConsentGiven={handleConsentGiven} />
        ) : activeTab === "new" ? (
          <SymptomForm />
        ) : (
          <SessionHistory />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
