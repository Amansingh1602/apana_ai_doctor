import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, consentApi, notificationApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useTheme } from "../hooks/useTheme.jsx";
import { Activity, FileText, Heart, LogOut, User, Bell, Check, X, Trash2, TrendingUp, MapPin, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import ConsentForm from "../components/ConsentForm";
import SymptomForm from "../components/SymptomForm";
import SessionHistory from "../components/SessionHistory";
import AccountView from "../components/AccountView";
import AnalyticsView from "../components/AnalyticsView";
import ReportView from "../components/ReportView";
import DoctorFinder from "../components/DoctorFinder";
import LabReportAnalyzer from "../components/LabReportAnalyzer";
import ChatWidget from "../components/ChatWidget";
import { cn } from "../lib/utils";
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [hasConsent, setHasConsent] = useState(null);
  const [activeTab, setActiveTab] = useState("new");
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const tabs = [
    { id: "new", label: "Symptom Check", description: "New Assessment", Icon: Activity },
    { id: "history", label: "History", description: "Past Sessions", Icon: FileText },
    { id: "analytics", label: "Analytics", description: "Health Trends", Icon: TrendingUp },
    { id: "reports", label: "Reports", description: "Download PDFs", Icon: FileText },
    { id: "lab-analyzer", label: "Lab Analysis", description: "Analyze Reports", Icon: FlaskConical },
    { id: "doctors", label: "Doctors", description: "Find Specialists", Icon: MapPin },
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
    
    // Fetch notifications
    loadNotifications();
    // Poll for notifications every 60s
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);

  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      checkConsent();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!authApi.isAuthenticated()) return;
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
       console.error("Error loading notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Error marking read");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      loadNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.delete(id);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error) {
      toast.error('Error deleting notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationApi.deleteAll();
      toast.success('All notifications deleted');
      loadNotifications();
    } catch (error) {
      toast.error('Error deleting notifications');
    }
  };

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
            <div 
              className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105" 
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
            >
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
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                 <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full transition-colors ${showNotifications ? (isDark ? 'bg-slate-800' : 'bg-slate-200') : 'hover:bg-slate-800/50'}`}
                 >
                   <Bell className={`h-5 w-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                   {unreadCount > 0 && (
                     <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                       {unreadCount > 9 ? '9+' : unreadCount}
                     </span>
                   )}
                 </button>

                 {/* Notification Dropdown */}
                 {showNotifications && (
                   <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                     <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                       <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                       <div className="flex items-center gap-2">
                         {unreadCount > 0 && (
                           <button onClick={markAllRead} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                             Mark all read
                           </button>
                         )}
                         {notifications.length > 0 && (
                           <button 
                             onClick={deleteAllNotifications} 
                             className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                             title="Delete all notifications"
                           >
                             <Trash2 className="h-3 w-3" />
                             Clear all
                           </button>
                         )}
                       </div>
                     </div>
                     <div className="max-h-[400px] overflow-y-auto">
                       {notifications.length > 0 ? (
                         notifications.map(notif => (
                           <div 
                             key={notif._id} 
                             className={`p-4 border-b last:border-0 hover:bg-opacity-50 transition-colors ${
                               notif.read 
                                 ? (isDark ? 'bg-transparent border-slate-800' : 'bg-white border-slate-100') 
                                 : (isDark ? 'bg-blue-500/10 border-slate-800' : 'bg-blue-50 border-slate-100')
                             }`}
                           >
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{notif.title}</p>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {!notif.read && (
                                        <button 
                                          onClick={() => markAsRead(notif._id)} 
                                          title="Mark as read"
                                          className="hover:bg-slate-700 rounded p-0.5"
                                        >
                                          <Check className="h-3.5 w-3.5 text-slate-400 hover:text-blue-500" />
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => deleteNotification(notif._id)} 
                                        title="Delete notification"
                                        className="hover:bg-slate-700 rounded p-0.5"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</p>
                                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</p>
                                </div>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center">
                           <Bell className={`h-8 w-8 mx-auto mb-2 opacity-20 ${isDark ? 'text-white' : 'text-black'}`} />
                           <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No notifications yet</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
              </div>

              {/* User Badge */}
              <button 
                onClick={() => setActiveTab("account")}
                className={`hidden sm:flex items-center gap-2 rounded-full border transition-colors ${isDark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' : 'border-slate-200 bg-white/80 hover:bg-white'} px-4 py-2`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.fullName}</span>
              </button>

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
            <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {tabs.map(({ id, label, description, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex flex-1 items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border p-2.5 sm:p-4 transition-all min-w-[140px] sm:min-w-0",
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
        ) : activeTab === "history" ? (
          <SessionHistory />
        ) : activeTab === "analytics" ? (
          <AnalyticsView />
        ) : activeTab === "reports" ? (
          <ReportView />
        ) : activeTab === "lab-analyzer" ? (
          <LabReportAnalyzer />
        ) : activeTab === "doctors" ? (
          <DoctorFinder />
        ) : (
          <AccountView user={user} />
        )}
      </main>

      {/* Persistent AI Chatbot */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
