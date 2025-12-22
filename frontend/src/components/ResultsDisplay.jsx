import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Pill, 
  Home, 
  ThumbsUp, 
  ThumbsDown, 
  Phone, 
  UserRound,
  RefreshCcw,
  Shield,
  Stethoscope,
  Apple,
  Info,
  Activity,
  FlaskConical,
  Timer,
  AlertCircle,
  Dumbbell,
  Brain,
  Heart,
  TrendingUp,
  MapPin,
  Navigation,
  ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../hooks/useTheme.jsx";
import { useState } from "react";

const triageLevelConfig = {
  emergency: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: AlertTriangle,
    label: "Emergency",
    description: "Seek immediate medical attention",
  },
  "urgent-visit": {
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: Clock,
    label: "Urgent Visit",
    description: "See a doctor within 24 hours",
  },
  "see-doctor": {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: UserRound,
    label: "See Doctor",
    description: "Schedule an appointment soon",
  },
  "self-care": {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: CheckCircle,
    label: "Self Care",
    description: "Can be managed at home",
  },
};

const ResultsDisplay = ({ result, onNewAnalysis }) => {
  const { isDark } = useTheme();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const triage = triageLevelConfig[result.triageLevel] || triageLevelConfig["see-doctor"];
  const TriageIcon = triage.icon;

  const openDoctorMap = (doctor) => {
    const searchQuery = encodeURIComponent(doctor.searchKeyword || `${doctor.specialization} near me`);
    window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Triage Level Card */}
      <Card className={cn("border-2", triage.border, triage.bg)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn("flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl", triage.bg)}>
              <TriageIcon className={cn("h-6 w-6 sm:h-8 sm:w-8", triage.color)} />
            </div>
            <div>
              <h2 className={cn("text-xl sm:text-2xl font-bold", triage.color)}>{triage.label}</h2>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm sm:text-base`}>{triage.description}</p>
            </div>
          </div>
          <p className={`mt-3 sm:mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm sm:text-base`}>{result.triageReason}</p>
        </CardContent>
      </Card>

      {/* Clinical Summary - Professional Medical Assessment */}
      {result.clinicalSummary && (
        <Card className={isDark ? 'border-slate-800 bg-gradient-to-br from-blue-900/20 to-slate-900/80' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Stethoscope className="h-5 w-5 text-blue-400" />
              Clinical Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {result.clinicalSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recovery Path Timeline */}
      {result.recoveryPath && result.recoveryPath.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Timer className="h-5 w-5 text-emerald-400" />
              Recovery Timeline
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Your path to recovery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.recoveryPath.map((phase, index) => (
                <div key={index} className="flex gap-4">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < result.recoveryPath.length - 1 && (
                      <div className={`w-0.5 h-16 mt-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {phase.step}
                    </h4>
                    <p className={`font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {phase.action}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {phase.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {result.triageLevel === "emergency" && result.recommendations?.emergencyContacts && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-red-400 text-base sm:text-lg">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              {result.recommendations.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 sm:gap-3 rounded-lg border border-red-500/20 ${isDark ? 'bg-slate-800/50' : 'bg-red-50'} p-3 sm:p-4`}
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} text-sm sm:text-base`}>{contact.service}</p>
                    <p className="text-base sm:text-lg font-bold text-red-400">{contact.number}</p>
                    <p className={`text-[10px] sm:text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{contact.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Specialization */}
      {result.recommendations?.doctorSpecialization && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <UserRound className="h-5 w-5 text-blue-400" />
              Recommended Specialist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-3">
              <UserRound className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-blue-400">{result.recommendations.doctorSpecialization}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Possible Conditions */}
      {result.possibleConditions?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Stethoscope className="h-5 w-5 text-cyan-400" />
              Possible Conditions
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-500' : 'text-slate-600'}>
              Based on your symptoms, these conditions may be relevant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.possibleConditions.map((condition, index) => (
                <div
                  key={index}
                  className={`rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} p-3`}
                >
                  {typeof condition === 'object' ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{condition.name}</span>
                        {condition.probability && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            condition.probability === "High" ? "bg-red-500/20 text-red-400" :
                            condition.probability === "Medium" ? "bg-amber-500/20 text-amber-400" :
                            "bg-slate-500/20 text-slate-400"
                          )}>
                            {condition.probability} probability
                          </span>
                        )}
                      </div>
                      {condition.explanation && (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{condition.explanation}</p>
                      )}
                    </>
                  ) : (
                    <span className={`${isDark ? 'text-white' : 'text-slate-900'}`}>{condition}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicines - Enhanced Display */}
      {result.recommendations?.medicines?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'} text-base sm:text-lg`}>
              <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Suggested OTC Medications
            </CardTitle>
            <CardDescription className={`${isDark ? 'text-slate-500' : 'text-slate-600'} text-xs sm:text-sm`}>
              Over-the-counter medications that may help (consult a pharmacist)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendations.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className={`rounded-xl border-2 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'} p-4`}
                >
                  {/* Medicine Name */}
                  <h4 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{medicine.name}</h4>
                  
                  {/* Dose */}
                  {medicine.dose && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Dose:</span> {medicine.dose}
                    </p>
                  )}
                  
                  {/* Notes/Description */}
                  {medicine.notes && (
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-3`}>{medicine.notes}</p>
                  )}

                  {/* Evidence Level */}
                  {medicine.evidenceLevel && (
                    <span className={cn(
                      "inline-block rounded-full px-3 py-1 text-xs font-medium",
                      medicine.evidenceLevel === "Strong" 
                        ? "bg-emerald-500/20 text-emerald-400"
                        : medicine.evidenceLevel === "Moderate"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-slate-500/20 text-slate-400"
                    )}>
                      {medicine.evidenceLevel} evidence
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Home Remedies - Enhanced */}
      {result.recommendations?.homeRemedies?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Home className="h-5 w-5 text-emerald-400" />
              Home Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.homeRemedies.map((remedy, index) => (
                <div key={index} className={`flex items-start gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'} rounded-lg ${isDark ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'} p-3`}>
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  {typeof remedy === 'object' ? (
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{remedy.remedy}</p>
                      {remedy.howTo && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}><span className="font-medium">How:</span> {remedy.howTo}</p>}
                      {remedy.frequency && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><span className="font-medium">Frequency:</span> {remedy.frequency}</p>}
                      {remedy.benefit && <p className={`text-sm text-emerald-500 mt-1`}>✓ {remedy.benefit}</p>}
                    </div>
                  ) : (
                    <span>{remedy}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Immediate Actions */}
      {result.recommendations?.immediateActions?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'} text-base sm:text-lg`}>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Immediate Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <ul className="space-y-2">
              {result.recommendations.immediateActions.map((item, index) => (
                <li key={index} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm sm:text-base`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold shrink-0">{index + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* What To Do / Not Do */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {result.recommendations?.whatToDo?.length > 0 && (
          <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'} text-base sm:text-lg`}>
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                What To Do
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ul className="space-y-2">
                {result.recommendations.whatToDo.map((item, index) => (
                  <li key={index} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm sm:text-base`}>
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {(result.recommendations?.whatNotToDo?.length > 0 || result.recommendations?.thingsToAvoid?.length > 0) && (
          <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'} text-base sm:text-lg`}>
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                Things to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ul className="space-y-2">
                {(result.recommendations.whatNotToDo || result.recommendations.thingsToAvoid || []).map((item, index) => (
                  <li key={index} className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm sm:text-base`}>
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 sm:mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning Signs */}
      {result.recommendations?.warningSignsToWatch?.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-amber-500 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Warning Signs to Watch
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-500' : 'text-slate-600'}>
              Seek immediate medical attention if you experience any of these
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <ul className="space-y-2">
              {result.recommendations.warningSignsToWatch.map((sign, index) => (
                <li key={index} className={`flex items-start gap-2 ${isDark ? 'text-amber-200' : 'text-amber-800'} text-sm sm:text-base`}>
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  {sign}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tests Recommended */}
      {result.recommendations?.testsRecommended?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FlaskConical className="h-5 w-5 text-indigo-400" />
              Recommended Tests
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-500' : 'text-slate-600'}>
              Tests your doctor might recommend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.recommendations.testsRecommended.map((test, index) => (
                <span key={index} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-sm text-indigo-400">
                  {test}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dietary Advice - Enhanced */}
      {result.recommendations?.dietaryAdvice?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Apple className="h-5 w-5 text-green-400" />
              Dietary Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.dietaryAdvice.map((item, index) => (
                <div key={index} className={`flex items-start gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'} rounded-lg ${isDark ? 'bg-green-500/5 border border-green-500/20' : 'bg-green-50 border border-green-200'} p-3`}>
                  <Apple className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                  {typeof item === 'object' ? (
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.recommendation}</p>
                      {item.reason && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>{item.reason}</p>}
                    </div>
                  ) : (
                    <span>{item}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Routine */}
      {result.recommendations?.workoutRoutine?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Dumbbell className="h-5 w-5 text-purple-400" />
              Workout & Exercise Routine
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Physical activities to support your recovery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {result.recommendations.workoutRoutine.map((workout, index) => (
                <div key={index} className={`rounded-xl border p-4 ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{workout.exercise}</h4>
                      
                      <div className="space-y-1.5 text-sm">
                        {workout.sets && workout.reps && (
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-3.5 w-3.5 text-purple-400" />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              <span className="font-medium">Sets × Reps:</span> {workout.sets} × {workout.reps}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-purple-400" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <span className="font-medium">Duration:</span> {workout.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <span className="font-medium">Frequency:</span> {workout.frequency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-purple-400" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <span className="font-medium">Intensity:</span> {workout.intensity}
                          </span>
                        </div>
                      </div>

                      {workout.benefit && (
                        <div className={`mt-3 rounded-lg p-2 ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span className="font-medium text-purple-400">Benefit:</span> {workout.benefit}
                          </p>
                        </div>
                      )}

                      {workout.precautions && (
                        <div className={`mt-2 rounded-lg p-2 ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                          <p className={`text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {workout.precautions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meditation Practices */}
      {result.recommendations?.meditationPractices?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Brain className="h-5 w-5 text-cyan-400" />
              Meditation & Mindfulness
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Mental wellness practices for stress relief and healing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.recommendations.meditationPractices.map((practice, index) => (
                <div key={index} className={`rounded-xl border p-4 ${isDark ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                      <Brain className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{practice.technique}</h4>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          <Clock className="h-3.5 w-3.5 inline mr-1 text-cyan-400" />
                          {practice.duration}
                        </span>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          <Timer className="h-3.5 w-3.5 inline mr-1 text-cyan-400" />
                          {practice.timing}
                        </span>
                      </div>

                      {practice.steps && practice.steps.length > 0 && (
                        <div className={`mb-3 rounded-lg p-3 ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}>
                          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Steps:</p>
                          <ol className={`text-xs space-y-1 list-decimal list-inside ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {practice.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {practice.benefit && (
                        <div className={`rounded-lg p-2 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-100'}`}>
                          <p className={`text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                            <Heart className="h-3 w-3 inline mr-1" />
                            <span className="font-medium">Benefit:</span> {practice.benefit}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Modifications */}
      {result.recommendations?.lifestyleModifications?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Lifestyle Modifications
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Healthy habits to accelerate recovery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {result.recommendations.lifestyleModifications.map((mod, index) => (
                <div key={index} className={`rounded-lg border p-3 ${isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{mod.category}</p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{mod.advice}</p>
                      {mod.importance && (
                        <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <Info className="h-3 w-3 inline mr-1" />
                          {mod.importance}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Doctors with Map */}
      {result.recommendations?.recommendedDoctors?.length > 0 && (
        <Card className={isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Stethoscope className="h-5 w-5 text-blue-400" />
              Recommended Specialists
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Find qualified doctors near you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.recommendedDoctors.map((doctor, index) => (
                <div key={index} className={`rounded-xl border p-4 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                        <UserRound className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{doctor.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{doctor.specialization}</p>
                        {doctor.qualification && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{doctor.qualification}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => openDoctorMap(doctor)}
                      className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
                      size="sm"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Find on Map
                    </Button>
                  </div>
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-blue-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Navigation className="h-3 w-3 inline mr-1" />
                      Search nearby: {doctor.searchKeyword || doctor.specialization}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* General Search Button */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Button
                onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(result.recommendations.doctorSpecialization + ' near me')}`, '_blank')}
                variant="outline"
                className={`w-full ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Search All {result.recommendations.doctorSpecialization}s Near Me
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Recovery Time */}
      {result.expectedRecoveryTime && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Timer className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-blue-400 mb-1">Expected Recovery Time</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.expectedRecoveryTime}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Advice */}
      {result.followUpAdvice && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Clock className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-blue-400 mb-1">Follow-up Advice</p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.followUpAdvice}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Score */}
      {result.confidenceScore && (
        <div className={`flex items-center justify-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-600'} text-sm`}>
          <span>AI Confidence:</span>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-24 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'} overflow-hidden`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${result.confidenceScore * 100}%` }}
              />
            </div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{Math.round(result.confidenceScore * 100)}%</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {result.disclaimer || "This is an educational tool only and not medical advice. Always consult healthcare professionals."}
          </p>
        </CardContent>
      </Card>

      {/* New Analysis Button */}
      <Button
        onClick={onNewAnalysis}
        className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-sm sm:text-base"
      >
        <RefreshCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Start New Analysis
      </Button>
    </div>
  );
};

export default ResultsDisplay;
