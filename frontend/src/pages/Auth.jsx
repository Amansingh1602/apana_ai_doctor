import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useTheme } from "../hooks/useTheme.jsx";
import { toast } from "sonner";
import { Loader2, Heart, Mail, Lock, User, ArrowLeft, Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (!isLogin && !formData.fullName) {
        toast.error("Please enter your full name");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (isLogin) {
        await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        await authApi.register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'} p-4`}>
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-40 top-0 h-96 w-96 rounded-full ${isDark ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-blue-400/30 to-cyan-400/30'} blur-[120px] animate-pulse`} />
        <div className={`absolute -right-40 bottom-0 h-96 w-96 rounded-full ${isDark ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-r from-purple-400/30 to-pink-400/30'} blur-[120px] animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]'} bg-[size:64px_64px]`} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`absolute top-4 sm:top-6 left-4 sm:left-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </Button>

      <Card className={`relative w-full max-w-md mx-4 sm:mx-0 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'} backdrop-blur-xl shadow-2xl`}>
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl" />
        
        <div className="relative">
          <CardHeader className="space-y-1 text-center pb-2 px-4 sm:px-6">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-60" />
                <div className="relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>
            
            <CardTitle className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              {isLogin
                ? "Enter your credentials to access your health assistant"
                : "Sign up to start using your AI health assistant"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 px-4 sm:px-6">
            {/* Toggle Buttons */}
            <div className={`mb-4 sm:mb-6 flex rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} p-1`}>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  isLogin
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  !isLogin
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'} focus:border-blue-500 focus:ring-blue-500/20`}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'} focus:border-blue-500 focus:ring-blue-500/20`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'} focus:border-blue-500 focus:ring-blue-500/20`}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-base font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
