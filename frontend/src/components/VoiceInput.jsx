import { useState, useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const VoiceInput = ({ onTranscript, isDark }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      if (transcript) {
        onTranscript(transcript.trim());
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error("Voice input error. Please try typing.");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
       toast.error("Voice input is not supported in this browser.");
       return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... Speak now.");
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleListening}
      className={`${
        isListening 
          ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' 
          : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {isListening ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Listening...
        </>
      ) : (
        <>
             <Mic className="mr-2 h-4 w-4" />
             Voice Input
        </>
      )}
    </Button>
  );
};

export default VoiceInput;
