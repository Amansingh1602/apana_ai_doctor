import { useState } from 'react';
import { uploadApi } from '../lib/api';
import { Upload, FileText, Loader2, CheckCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'sonner';

const LabReportAnalyzer = () => {
  const { isDark } = useTheme();
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadApi.uploadReport(file);
      setReport(res.report);
      toast.success("File uploaded. Starting analysis...");
      analyzeReport(res.report._id);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const analyzeReport = async (id) => {
    setAnalyzing(true);
    try {
      const res = await uploadApi.analyze(id);
      setAnalysis(res.aiAnalysis);
      toast.success("Analysis Complete!");
    } catch (error) {
      toast.error("AI Analysis Failed");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'low': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'normal': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center space-y-2">
         <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
           <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">AI Lab Report Analyzer</span>
         </h2>
         <p className="text-slate-500">Upload your blood test or lab report. Our AI will explain it instantly.</p>
      </div>

      {/* Upload Section */}
      {!analysis && (
        <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-colors ${
           isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-slate-50'
        }`}>
           <input 
             type="file" 
             id="report-upload" 
             className="hidden" 
             accept="image/*,application/pdf"
             onChange={handleFileChange}
           />
           
           {!file ? (
             <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                   <Upload className="h-8 w-8" />
                </div>
                <div>
                   <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Click to upload or drag and drop</p>
                   <p className="text-sm text-slate-500">PDF, JPG or PNG (Max 5MB)</p>
                </div>
             </label>
           ) : (
             <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                   <FileText className="h-8 w-8" />
                </div>
                <p className="font-medium">{file.name}</p>
                <Button onClick={handleUpload} disabled={loading} size="lg" className="min-w-[150px]">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {analyzing ? 'Analyzing...' : 'Uploading...'}</>
                  ) : (
                    'Analyze Report'
                  )}
                </Button>
                <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:underline">Remove</button>
             </div>
           )}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
           {/* Summary Card */}
           <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-start gap-4">
                 <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Info className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg mb-2">AI Summary</h3>
                    <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {analysis.summary}
                    </p>
                 </div>
              </div>
           </div>

           {/* Findings Table */}
           <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className={`p-4 border-b font-semibold ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 Detailed Findings
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className={`${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                      <tr>
                         <th className="p-4 font-medium">Test Name</th>
                         <th className="p-4 font-medium">Value</th>
                         <th className="p-4 font-medium">Status</th>
                         <th className="p-4 font-medium">Meaning</th>
                      </tr>
                   </thead>
                   <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                      {analysis.findings?.map((item, idx) => (
                        <tr key={idx} className={isDark ? 'bg-slate-900/50' : 'bg-white'}>
                           <td className="p-4 font-bold">{item.test}</td>
                           <td className="p-4">{item.value}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                 {item.status}
                              </span>
                           </td>
                           <td className={`p-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.meaning}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>

           {/* Recommendations */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100'}`}>
               <h3 className="font-bold text-lg mb-4 text-emerald-600 dark:text-emerald-400">Recommendations</h3>
               <ul className="space-y-3">
                  {analysis.recommendations?.map((rec, idx) => (
                     <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{rec}</span>
                     </li>
                  ))}
               </ul>
            </div>
            
            <div className="text-center pt-4">
               <Button variant="outline" onClick={() => { setFile(null); setAnalysis(null); setReport(null); }}>
                  Analyze Another Report
               </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LabReportAnalyzer;
