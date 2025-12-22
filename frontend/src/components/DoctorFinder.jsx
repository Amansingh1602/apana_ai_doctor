import { useState, useEffect } from "react";
import { doctorApi, symptomsApi } from "../lib/api";
import { MapPin, Search, Stethoscope, Star, Phone, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "../hooks/useTheme";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const DoctorFinder = () => {
    const { isDark } = useTheme();
    const [city, setCity] = useState("Delhi");
    const [specialty, setSpecialty] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLastSession = async () => {
            try {
                const history = await symptomsApi.getHistory(1, 1);
                if (history.sessions && history.sessions.length > 0) {
                    const last = history.sessions[0];
                    if (last.analysisResult?.recommendations?.doctorSpecialization) {
                        setSpecialty(last.analysisResult.recommendations.doctorSpecialization);
                        handleSearch(city, last.analysisResult.recommendations.doctorSpecialization);
                    }
                }
            } catch (e) {
                console.error("Failed to pre-fill specialty");
            }
        };
        fetchLastSession();
    }, []);

    const handleSearch = async (searchCity, searchSpecialty) => {
        setLoading(true);
        try {
            const res = await doctorApi.search(searchCity || city, searchSpecialty || specialty);
            setDoctors(res.recommended || []);
            if (res.recommended?.length === 0) {
                toast("No specific matches found, showing nearest hospitals.");
            }
        } catch (error) {
            toast.error("Failed to find doctors");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col gap-2">
                 <h2 className={`text-2xl font-bold ${isDark?'text-white':'text-slate-900'}`}>Find a Specialist</h2>
                 <p className="text-sm text-slate-500">Locate the best doctors near you based on your analysis.</p>
             </div>

             {/* Search Bar */}
             <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="City (e.g. Delhi, Mumbai)" 
                        className="pl-9"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div className="relative flex-1">
                    <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                     <Input 
                        placeholder="Specialty (e.g. Cardiologist)" 
                        className="pl-9"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                    />
                </div>
                <Button onClick={() => handleSearch(city, specialty)} disabled={loading}>
                    {loading ? "Searching..." : (
                        <>
                            <Search className="mr-2 h-4 w-4" />
                            Find Doctors
                        </>
                    )}
                </Button>
             </div>

             {/* Results Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {doctors.map(doc => (
                     <div key={doc.id} className={cn(
                         "p-5 rounded-2xl border transition-all hover:shadow-lg group",
                         isDark ? "bg-slate-900/50 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:border-blue-200"
                     )}>
                         <div className="flex justify-between items-start">
                             <div className="flex flex-col">
                                 <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.name}</h3>
                                 <span className="text-blue-500 font-medium text-sm">{doc.specialty}</span>
                                 <span className="text-slate-500 text-xs mt-1">{doc.hospital}</span>
                             </div>
                             <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                                 <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                 <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{doc.rating}</span>
                             </div>
                         </div>

                         <div className="mt-4 space-y-2">
                             <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <MapPin className="h-4 w-4 text-slate-400" />
                                 <span>{doc.address}, {doc.city}</span>
                             </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <div className="h-4 w-4 flex items-center justify-center">
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-1 rounded">Exp</span>
                                 </div>
                                 <span>{doc.experience} Experience</span>
                             </div>
                         </div>

                         <div className="mt-5 flex gap-2">
                             <Button 
                                size="sm" 
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => window.location.href = `tel:${doc.contact}`}
                             >
                                 <Phone className="mr-2 h-4 w-4" />
                                 Call Now
                             </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.hospital + ' ' + doc.address + ' ' + doc.city)}`, '_blank')}
                             >
                                 <Navigation className="mr-2 h-4 w-4" />
                                 Directions
                             </Button>
                         </div>
                     </div>
                 ))}
                 
                 {!loading && doctors.length === 0 && (
                     <div className="col-span-full text-center py-10 text-slate-500">
                         Try searching for "Delhi" and "Cardiologist" to see results.
                     </div>
                 )}
             </div>
        </div>
    );
};

export default DoctorFinder;
