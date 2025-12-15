import { useState } from "react";
import { symptomsApi } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { AlertCircle, Baby, HeartPulse, Loader2, ShieldCheck, EyeOff, Stethoscope, Sparkles, User, Users } from "lucide-react";
import { cn } from "../lib/utils";
import ResultsDisplay from "./ResultsDisplay";

const genderOptions = [
  { id: "male", label: "Male", icon: User },
  { id: "female", label: "Female", icon: User },
  { id: "other", label: "Other", icon: Users },
  { id: "prefer-not", label: "Prefer not to say", icon: EyeOff },
];

const pregnancyOptions = [
  { id: "pregnant", label: "I am pregnant", icon: Baby },
  { id: "maybe", label: "I might be pregnant", icon: HeartPulse },
  { id: "not", label: "I am not pregnant", icon: ShieldCheck },
  { id: "na", label: "Prefer not to say", icon: EyeOff },
];

const severityLevels = [
  { value: "mild", label: "Mild", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { value: "moderate", label: "Moderate", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  { value: "severe", label: "Severe", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  { value: "critical", label: "Critical", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
];

const SymptomForm = () => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [gender, setGender] = useState("");
  const [pregnancyStatus, setPregnancyStatus] = useState("not");
  
  const [formData, setFormData] = useState({
    symptomsText: "",
    onset: "",
    severity: "",
    duration: "",
    existingConditions: "",
    currentMedications: "",
    allergies: "",
    age: "",
    gender: "",
    isPregnant: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setFormData((prev) => ({ 
      ...prev, 
      gender: selectedGender,
      // Reset pregnancy status if not female
      isPregnant: selectedGender !== "female" ? false : prev.isPregnant
    }));
    // Reset pregnancy status if gender changes from female
    if (selectedGender !== "female") {
      setPregnancyStatus("not");
    }
  };

  const handlePregnancySelect = (status) => {
    setPregnancyStatus(status);
    setFormData((prev) => ({
      ...prev,
      isPregnant: status === "pregnant" || status === "maybe",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.symptomsText || formData.symptomsText.length < 10) {
      toast.error("Please describe your symptoms in at least 10 characters");
      return;
    }

    if (!formData.severity) {
      toast.error("Please select severity level");
      return;
    }

    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      toast.error("Please enter a valid age");
      return;
    }

    if (!gender) {
      toast.error("Please select your gender");
      return;
    }

    setLoading(true);

    try {
      const response = await symptomsApi.analyze({
        ...formData,
        age: parseInt(formData.age),
      });

      setAnalysisResult(response.session.analysisResult);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error(error.message || "Error analyzing symptoms");
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setFormData({
      symptomsText: "",
      onset: "",
      severity: "",
      duration: "",
      existingConditions: "",
      currentMedications: "",
      allergies: "",
      age: "",
      gender: "",
      isPregnant: false,
    });
    setGender("");
    setPregnancyStatus("not");
  };

  if (analysisResult) {
    return <ResultsDisplay result={analysisResult} onNewAnalysis={handleNewAnalysis} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl text-white">Symptom Analysis</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-400">
                Describe your symptoms for AI-powered health guidance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Main Symptoms */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Describe Your Symptoms <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="E.g., I have been experiencing headache for 2 days, along with mild fever and body ache..."
                value={formData.symptomsText}
                onChange={(e) => handleInputChange("symptomsText", e.target.value)}
                className="min-h-[120px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-slate-500">
                {formData.symptomsText.length}/10 characters minimum
              </p>
            </div>

            {/* Severity Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm sm:text-base">
                Severity Level <span className="text-red-400">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severityLevels.map(({ value, label, color, bg }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange("severity", value)}
                    className={cn(
                      "rounded-lg border p-2 sm:p-3 text-center transition-all text-sm sm:text-base",
                      formData.severity === value
                        ? `${bg} ${color}`
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Age <span className="text-red-400">*</span>
              </Label>
              <Input
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                min="1"
                max="120"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm sm:text-base">
                Gender <span className="text-red-400">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {genderOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleGenderSelect(id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border p-2 sm:p-3 transition-all",
                      gender === id
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-[10px] sm:text-xs text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pregnancy Status - Only shown for females */}
            {gender === "female" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-slate-300 flex items-center gap-2 text-sm sm:text-base">
                  <Baby className="h-4 w-4 text-pink-400" />
                  Pregnancy Status
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pregnancyOptions.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePregnancySelect(id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border p-2 sm:p-3 transition-all",
                        pregnancyStatus === id
                          ? "border-pink-500/50 bg-pink-500/10 text-pink-400"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-[10px] sm:text-xs text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration and Onset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm sm:text-base">When did it start?</Label>
                <Select 
                  value={formData.onset} 
                  onValueChange={(value) => handleInputChange("onset", value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select onset" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="few-days">Few days ago</SelectItem>
                    <SelectItem value="week">About a week</SelectItem>
                    <SelectItem value="weeks">Several weeks</SelectItem>
                    <SelectItem value="month">A month or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Duration</Label>
                <Select 
                  value={formData.duration} 
                  onValueChange={(value) => handleInputChange("duration", value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="hours">Few hours</SelectItem>
                    <SelectItem value="day">About a day</SelectItem>
                    <SelectItem value="days">Few days</SelectItem>
                    <SelectItem value="week">About a week</SelectItem>
                    <SelectItem value="weeks">Several weeks</SelectItem>
                    <SelectItem value="chronic">Ongoing/Chronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-3 sm:space-y-4 rounded-lg sm:rounded-xl border border-slate-700 bg-slate-800/30 p-3 sm:p-4">
              <h4 className="font-medium text-white flex items-center gap-2 text-sm sm:text-base">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                Medical History (Optional)
              </h4>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Existing Conditions</Label>
                <Input
                  placeholder="E.g., Diabetes, Hypertension, Asthma..."
                  value={formData.existingConditions}
                  onChange={(e) => handleInputChange("existingConditions", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Current Medications</Label>
                <Input
                  placeholder="E.g., Metformin 500mg, Amlodipine 5mg..."
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Allergies</Label>
                <Input
                  placeholder="E.g., Penicillin, Sulfa drugs, Peanuts..."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-base sm:text-lg font-semibold shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">Analyzing Symptoms...</span>
                  <span className="sm:hidden">Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Get AI Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomForm;
