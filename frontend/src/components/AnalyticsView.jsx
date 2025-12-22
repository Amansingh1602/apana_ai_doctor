import { useEffect, useState } from "react";
import { analyticsApi, symptomsApi } from "../lib/api";
import { Activity, Heart, TrendingUp, AlertTriangle, Trash2, ArrowUpRight } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const AnalyticsView = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [loading]);

  const fetchAnalytics = async () => {
    try {
      const result = await analyticsApi.getDashboard();
      setData(result);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      setData(prev => ({
        ...prev,
        recentActivity: prev.recentActivity.filter(item => item._id !== id)
      }));
      
      await symptomsApi.deleteSession(id);
      toast.success("Activity deleted");
      fetchAnalytics();
    } catch (error) {
      toast.error("Failed to delete activity");
      fetchAnalytics();
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-100 dark:bg-red-900/10 dark:border-red-800">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, charts, recentActivity } = data;

  const getSvgPath = (points, height, width) => {
    if (!points.length) return "";
    
    const maxX = 100;
    const maxY = 4;
    
    const dataPoints = points.map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * maxX;
      const y = height - ((p.severityLevel / maxY) * height);
      return [x, y];
    });

    const controlPoint = (current, previous, next, reverse) => {
      const p = previous || current;
      const n = next || current;
      const smoothing = 0.2;
      const o = {
        x: n[0] - p[0],
        y: n[1] - p[1]
      };
      const angle = Math.atan2(o.y, o.x) + (reverse ? Math.PI : 0);
      const length = Math.sqrt(Math.pow(o.x, 2) + Math.pow(o.y, 2)) * smoothing;
      return [
        current[0] + Math.cos(angle) * length,
        current[1] + Math.sin(angle) * length
      ];
    };

    const pathCommand = (point, i, a) => {
      const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
      const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
      return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    };

    const d = dataPoints.reduce((acc, point, i, a) => 
      i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${pathCommand(point, i, a)}`
    , "");

    return { d, dataPoints };
  };

  const renderSmoothChart = () => {
    if (!charts?.severityTrend?.length) return <p className="text-gray-500 text-center py-8">No data available for trends</p>;

    const height = 100;
    const { d } = getSvgPath(charts.severityTrend, height, 100);
    const fillPath = `${d} L 100,${height} L 0,${height} Z`;

    return (
      <div className="relative h-[200px] w-full mt-2 group">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {[25, 50, 75].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" />
          ))}

          <path d={fillPath} fill="url(#gradientDetails)" />
          <path d={d} fill="none" stroke="#3b82f6" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          
          {charts.severityTrend.map((p, i) => {
            const x = (i / (charts.severityTrend.length - 1 || 1)) * 100;
            const y = height - ((p.severityLevel / 4) * height);
            return (
              <g key={i} className="group/point">
                <circle 
                  cx={`${x}%`} 
                  cy={y} 
                  r="6" 
                  className="fill-white dark:fill-slate-900 stroke-blue-500 stroke-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  vectorEffect="non-scaling-stroke"
                />
                <text 
                  x={`${x}%`} 
                  y={y - 15} 
                  textAnchor="middle" 
                  className="text-[8px] fill-slate-500 dark:fill-slate-300 opacity-0 group-hover/point:opacity-100 pointer-events-none font-bold"
                >
                  {p.severityLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const healthOffset = circumference - (summary.healthScore / 100) * circumference;
  
  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark?'text-white':'text-slate-900'}`}>Health Overview</h2>
        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Last 30 Days
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Health Score */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-lg border",
          isDark 
            ? "bg-slate-900/50 border-slate-800 hover:bg-slate-900" 
            : "bg-white border-slate-200 hover:border-blue-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Health Score</h3>
            </div>
            <div className={`p-2 rounded-xl bg-opacity-10 ${getHealthColor(summary.healthScore).replace('text-', 'bg-')} `}>
              <Heart className={`h-5 w-5 ${getHealthColor(summary.healthScore)}`} />
            </div>
          </div>
          
          <div className="flex items-end gap-4">
            <div className="relative h-20 w-20">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className={`text-slate-100 dark:text-slate-800`} />
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={healthOffset}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${getHealthColor(summary.healthScore)}`} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${isDark?'text-white':'text-slate-900'}`}>{summary.healthScore}</span>
              </div>
            </div>
            <div className="pb-2">
              <p className={`text-xs font-medium ${isDark?'text-slate-300':'text-slate-600'}`}>
                {summary.healthScore >= 80 ? 'Excellent' : summary.healthScore >= 50 ? 'Average' : 'Needs Attention'}
              </p>
              <p className="text-[10px] text-slate-400">Based on analysis</p>
            </div>
          </div>
        </div>

        {/* Card 2: Total Activity */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-lg border group",
          isDark 
            ? "bg-slate-900/50 border-slate-800 hover:bg-slate-900" 
            : "bg-white border-slate-200 hover:border-purple-200"
        )}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-24 w-24 -mr-4 -mt-4 text-blue-500" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Checkups</h3>
              <div className={`mt-2 text-4xl font-bold ${isDark?'text-white':'text-slate-900'}`}>
                {summary.totalAnalyses}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-green-500 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>Lifetime Usage</span>
            </div>
          </div>
        </div>

        {/* Card 3: Common Status */}
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-lg border",
          isDark 
            ? "bg-slate-900/50 border-slate-800 hover:bg-slate-900" 
            : "bg-white border-slate-200 hover:border-pink-200"
        )}>
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Frequent Condition</h3>
              <div className={`mt-3 text-2xl font-bold capitalize bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500`}>
                {charts?.triageDistribution ? Object.entries(charts.triageDistribution).sort((a,b) => b[1]-a[1])[0]?.[0]?.replace('-', ' ') || 'N/A' : 'N/A'}
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[70%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Section */}
        <div className={cn(
          "rounded-3xl p-6 border shadow-sm",
          isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-bold ${isDark?'text-white':'text-slate-900'}`}>Severity Trends</h3>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          {renderSmoothChart()}
          <p className="text-center text-xs text-slate-400 mt-4">Visual representation of symptom severity over your last 10 checkups.</p>
        </div>

        {/* Recent Activity Section */}
        <div className={cn(
          "rounded-3xl p-6 border shadow-sm flex flex-col",
          isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-bold ${isDark?'text-white':'text-slate-900'}`}>Recent History</h3>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[150px]">
                <Activity className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((session) => (
                <div key={session._id} className={cn(
                  "group flex items-center gap-4 p-3 rounded-2xl transition-all",
                  isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                )}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    session.severity === 'mild' ? 'bg-green-100 text-green-600' :
                    session.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <Activity className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark?'text-white':'text-slate-800'}`}>
                      {session.symptomsText}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{format(new Date(session.createdAt), 'MMM d, h:mm a')}</span>
                      <span>•</span>
                      <span className="capitalize">{session.analysisResult?.triageLevel?.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleDelete(session._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                    title="Delete Record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
