import { useState, useEffect } from "react";
import { symptomsApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  ChevronRight, 
  Loader2,
  FileText,
  Calendar
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../hooks/useTheme.jsx";

const triageColors = {
  emergency: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  "urgent-visit": { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  "see-doctor": { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  "self-care": { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

const SessionHistory = () => {
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await symptomsApi.getHistory(1, 20);
      setSessions(response.sessions);
    } catch (error) {
      toast.error("Error fetching history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    
    try {
      await symptomsApi.deleteSession(id);
      setSessions(sessions.filter(s => s._id !== id));
      toast.success("Session deleted");
      if (selectedSession?._id === id) {
        setSelectedSession(null);
      }
    } catch (error) {
      toast.error("Error deleting session");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'} mb-4`}>
            <FileText className={isDark ? 'h-8 w-8 text-slate-500' : 'h-8 w-8 text-slate-400'} />
          </div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>No History Yet</h3>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2 max-w-md`}>
            Your symptom analysis history will appear here. Start a new symptom check to get AI-powered health guidance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Session List */}
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Past Sessions</h3>
        {sessions.map((session) => {
          const triage = triageColors[session.analysisResult?.triageLevel] || triageColors["see-doctor"];
          const isSelected = selectedSession?._id === session._id;

          return (
            <Card
              key={session._id}
              onClick={() => setSelectedSession(session)}
              className={cn(
                "cursor-pointer transition-all",
                isDark ? "border-slate-800 bg-slate-900/80 hover:bg-slate-800/80" : "border-slate-200 bg-white/90 hover:bg-slate-50",
                isSelected && "ring-2 ring-blue-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        triage.bg, triage.border, triage.color
                      )}>
                        {session.analysisResult?.triageLevel === "emergency" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {session.analysisResult?.triageLevel?.replace("-", " ") || "Analyzed"}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {session.severity}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} line-clamp-2`}>
                      {session.symptomsText}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(session._id, e)}
                      disabled={deletingId === session._id}
                      className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      {deletingId === session._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-blue-400" : isDark ? "text-slate-600" : "text-slate-400"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session Details */}
      <div className="lg:sticky lg:top-32">
        {selectedSession ? (
          <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : 'text-slate-900'}>Session Details</CardTitle>
              <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                {formatDate(selectedSession.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Symptoms</h4>
                <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedSession.symptomsText}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Severity</h4>
                  <p className={`${isDark ? 'text-slate-200' : 'text-slate-800'} capitalize`}>{selectedSession.severity}</p>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Age</h4>
                  <p className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedSession.age}</p>
                </div>
              </div>

              {selectedSession.analysisResult && (
                <>
                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Triage Level</h4>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
                      triageColors[selectedSession.analysisResult.triageLevel]?.bg,
                      triageColors[selectedSession.analysisResult.triageLevel]?.border,
                      triageColors[selectedSession.analysisResult.triageLevel]?.color
                    )}>
                      {selectedSession.analysisResult.triageLevel?.replace("-", " ")}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>AI Assessment</h4>
                    <p className={`${isDark ? 'text-slate-200' : 'text-slate-800'} text-sm`}>
                      {selectedSession.analysisResult.triageReason}
                    </p>
                  </div>

                  {selectedSession.analysisResult.recommendations?.doctorSpecialization && (
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>Recommended Specialist</h4>
                      <p className="text-blue-400 font-medium">
                        {selectedSession.analysisResult.recommendations.doctorSpecialization}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className={`h-12 w-12 ${isDark ? 'text-slate-600' : 'text-slate-400'} mb-4`} />
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Select a Session</h3>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2`}>
                Click on a session to view its details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
