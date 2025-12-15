import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useTheme } from "../hooks/useTheme.jsx";
import { Heart, Activity, FileText, Shield, Zap, Sparkles, ArrowRight, Star, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const features = [
    {
      icon: Activity,
      title: "AI Symptom Analysis",
      description: "Advanced AI-powered analysis of your symptoms for quick triage guidance.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Medical History",
      description: "Track and manage your symptom history for better health insights.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Smart Triage",
      description: "Get instant color-coded urgency levels with actionable recommendations.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { value: "99%", label: "Accuracy", icon: CheckCircle },
    { value: "10K+", label: "Users", icon: Users },
    { value: "24/7", label: "Available", icon: Clock },
    { value: "100+", label: "Conditions", icon: Activity },
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-40 -top-40 h-80 w-80 rounded-full ${isDark ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30' : 'bg-gradient-to-r from-blue-400/40 to-cyan-400/40'} blur-[100px] animate-pulse`} />
        <div className={`absolute -right-40 top-20 h-96 w-96 rounded-full ${isDark ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30' : 'bg-gradient-to-r from-purple-400/40 to-pink-400/40'} blur-[120px] animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute bottom-20 left-1/3 h-72 w-72 rounded-full ${isDark ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20' : 'bg-gradient-to-r from-emerald-400/30 to-teal-400/30'} blur-[100px] animate-pulse`} style={{ animationDelay: '0.5s' }} />
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]'} bg-[size:64px_64px]`} />
      </div>

      {/* Navigation */}
      <header className="relative z-20">
        <nav className="mx-auto mt-4 sm:mt-6 flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 blur-lg opacity-60" />
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="hidden xs:block">
              <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Apna Doctor</p>
              <p className={`text-sm sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Health Companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className={`hidden sm:flex ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 text-sm sm:text-base px-3 sm:px-4"
              onClick={() => navigate("/auth")}
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className={`mb-6 sm:mb-8 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border ${isDark ? 'border-slate-700 bg-slate-800/50 text-slate-300' : 'border-slate-200 bg-white/80 text-slate-600'} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm backdrop-blur-sm`}>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            <span className="hidden sm:inline">AI-Powered Health Intelligence</span>
            <span className="sm:hidden">AI Health Intelligence</span>
            <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">New</span>
          </div>

          {/* Main Heading */}
          <h1 className={`mx-auto max-w-4xl text-3xl sm:text-5xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'} md:text-7xl`}>
            Your Personal
            <span className="relative mx-1 sm:mx-3 inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                AI Doctor
              </span>
              <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-emerald-400/20 blur-lg" />
            </span>
            Companion
          </h1>

          <p className={`mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg px-2 ${isDark ? 'text-slate-400' : 'text-slate-600'} md:text-xl`}>
            Experience next-generation health guidance. Get instant symptom analysis, 
            smart triage recommendations, and personalized care insights powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row px-2">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 shadow-2xl shadow-blue-500/30"
              onClick={() => navigate("/auth")}
            >
              <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Symptom Check
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`w-full sm:w-auto ${isDark ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800' : 'border-slate-300 bg-white/50 text-slate-700 hover:text-slate-900 hover:bg-slate-100'} text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14`}
              onClick={() => navigate("/auth")}
            >
              <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-20 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4 px-2">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="relative group">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className={`relative rounded-xl sm:rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'} p-4 sm:p-6 backdrop-blur-sm transition-all ${isDark ? 'group-hover:border-slate-700' : 'group-hover:border-slate-300'}`}>
                  <Icon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mb-2 sm:mb-3" />
                  <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                  <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center px-2">
            <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} md:text-4xl`}>
              Powerful Features for Your Health
            </h2>
            <p className={`mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Advanced AI technology meets healthcare to provide you with the best possible guidance.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, gradient }) => (
              <Card
                key={title}
                className={`group relative overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'} backdrop-blur-sm transition-all duration-300 ${isDark ? 'hover:border-slate-700 hover:bg-slate-800/50' : 'hover:border-slate-300 hover:bg-white'} hover:scale-[1.02]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader>
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 sm:mt-28">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} md:text-4xl`}>
              How It Works
            </h2>
            <p className={`mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Get health guidance in three simple steps
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Describe Symptoms", desc: "Enter your symptoms and health details" },
              { step: "02", title: "AI Analysis", desc: "Our AI analyzes and evaluates your condition" },
              { step: "03", title: "Get Guidance", desc: "Receive personalized recommendations" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xl sm:text-2xl font-bold text-white">
                  {step}
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="mt-12 sm:mt-20">
          <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
            <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 md:flex-row md:items-center">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-500">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-amber-500">⚠️ Important Safety Notice</h3>
                <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  This is an <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>educational demonstration tool only</strong>.
                  It is not a substitute for professional medical advice, diagnosis, or treatment.
                  In case of emergency, contact your local emergency services immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'} py-6 sm:py-8 backdrop-blur-sm`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Apna Doctor</span>
            </div>
            <p className={`text-xs sm:text-sm text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              © 2025 Apna Doctor — Built with MERN Stack · AI-Powered Health Guidance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
