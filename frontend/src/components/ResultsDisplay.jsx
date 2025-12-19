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
  Info
} from "lucide-react";
import { cn } from "../lib/utils";

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
  const triage = triageLevelConfig[result.triageLevel] || triageLevelConfig["see-doctor"];
  const TriageIcon = triage.icon;

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
              <p className="text-slate-400 text-sm sm:text-base">{triage.description}</p>
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-slate-300 text-sm sm:text-base">{result.triageReason}</p>
        </CardContent>
      </Card>

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
                  className="flex items-center gap-2 sm:gap-3 rounded-lg border border-red-500/20 bg-slate-800/50 p-3 sm:p-4"
                >
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">{contact.service}</p>
                    <p className="text-base sm:text-lg font-bold text-red-400">{contact.number}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{contact.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Specialization */}
      {result.recommendations?.doctorSpecialization && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
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
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Stethoscope className="h-5 w-5 text-cyan-400" />
              Possible Conditions
            </CardTitle>
            <CardDescription className="text-slate-500">
              Based on your symptoms, these conditions may be relevant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.possibleConditions.map((condition, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-400"
                >
                  <Info className="h-3 w-3" />
                  {condition}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medicines */}
      {result.recommendations?.medicines?.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              Suggested OTC Medications
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Over-the-counter medications that may help (consult a pharmacist)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              {result.recommendations.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 sm:p-4"
                >
                  <p className="font-semibold text-white text-sm sm:text-base">{medicine.name}</p>
                  {medicine.dose && (
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-slate-500">Dose:</span> {medicine.dose}
                    </p>
                  )}
                  {medicine.notes && (
                    <p className="text-sm text-slate-400 mt-1">{medicine.notes}</p>
                  )}
                  {medicine.evidenceLevel && (
                    <span className={cn(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-xs",
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

      {/* Home Remedies */}
      {result.recommendations?.homeRemedies?.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Home className="h-5 w-5 text-emerald-400" />
              Home Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.homeRemedies.map((remedy, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                  {remedy}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* What To Do / Not Do */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {result.recommendations?.whatToDo?.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                What To Do
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ul className="space-y-2">
                {result.recommendations.whatToDo.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300 text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 sm:mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.recommendations?.whatNotToDo?.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                What Not To Do
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ul className="space-y-2">
                {result.recommendations.whatNotToDo.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300 text-sm sm:text-base">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 sm:mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dietary Advice */}
      {result.recommendations?.dietaryAdvice?.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Apple className="h-5 w-5 text-green-400" />
              Dietary Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.dietaryAdvice.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
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
              <p className="text-sm text-slate-300">{result.followUpAdvice}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Score */}
      {result.confidenceScore && (
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <span>AI Confidence:</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${result.confidenceScore * 100}%` }}
              />
            </div>
            <span className="text-slate-400">{Math.round(result.confidenceScore * 100)}%</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-400">
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
