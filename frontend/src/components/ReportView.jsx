import { useEffect, useState } from "react";
import { symptomsApi, reportsApi } from "../lib/api";
import { FileText, Download, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";

const ReportView = () => {
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await symptomsApi.getHistory(1, 20);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (sessionId) => {
    try {
      setDownloadingId(sessionId);
      await reportsApi.downloadStream(sessionId);
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download report");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className={`text-2xl font-bold ${isDark?'text-white':'text-slate-900'}`}>Medical Reports</h2>
           <p className="text-sm text-slate-500">Download professional PDF reports for your consultations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sessions.length === 0 ? (
           <div className={`text-center py-12 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No reports available generated yet.</p>
           </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className={cn(
               "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all hover:shadow-md",
               isDark ? "bg-slate-900/50 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:border-blue-200"
            )}>
               <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      session.severity === 'mild' ? 'bg-green-100 text-green-600' :
                      session.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                      session.severity === 'severe' ? 'bg-orange-100 text-orange-600' :
                      'bg-red-100 text-red-600'
                  }`}>
                      <FileText className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className={`font-semibold ${isDark?'text-white':'text-slate-900'}`}>
                          {session.analysisResult?.triageLevel?.toUpperCase().replace('-', ' ') || 'Report'}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-md">{session.symptomsText}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             {format(new Date(session.createdAt), 'PPP')}
                          </div>
                           <div className="flex items-center gap-1">
                             <Activity className="h-3 w-3" />
                             <span className="capitalize">{session.severity}</span>
                          </div>
                      </div>
                  </div>
               </div>

               <Button 
                  onClick={() => handleDownload(session._id)}
                  disabled={downloadingId === session._id}
                  className={cn(
                      "min-w-[140px]",
                      isDark ? "bg-slate-800 hover:bg-slate-700 text-white" : ""
                  )}
               >
                  {downloadingId === session._id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                  ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                  )}
               </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportView;
