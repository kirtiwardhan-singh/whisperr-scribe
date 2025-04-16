
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define the SpeechRecognition interface to fix type errors
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Define the SpeechRecognition event interfaces
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Define the SpeechRecognition constructor
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface LanguageOption {
  value: string;
  label: string;
  description: string;
}

export const SpeechRecognitionComponent = () => {
  const [text, setText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const { toast } = useToast();

  // Language options
  const languageOptions: LanguageOption[] = [
    { value: "en-US", label: "English (US)", description: "Standard American English" },
    { value: "hi-IN", label: "Hindi (India)", description: "Standard Hindi" },
    { value: "en-IN", label: "English (India)", description: "Indian English" },
  ];

  // SpeechRecognition setup
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }
    
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = selectedLanguage;
    
    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setText(transcript);
    };
    
    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast({
        title: "Error",
        description: `Speech recognition error: ${event.error}`,
        variant: "destructive"
      });
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    // Cleanup
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.log("Speech recognition already stopped");
        }
      }
    };
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      toast({
        title: "Stopped Listening",
        description: "Speech recognition has been turned off."
      });
    } else {
      setText("");
      recognition.lang = selectedLanguage;
      recognition.start();
      toast({
        title: "Listening",
        description: `Speak now in ${languageOptions.find(lang => lang.value === selectedLanguage)?.label || selectedLanguage}. Your words will be transcribed.`
      });
    }
    
    setIsListening(!isListening);
  };

  const speakText = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    if (text.trim() === "") {
      toast({
        title: "No Text to Speak",
        description: "Please enter or record some text first.",
        variant: "destructive"
      });
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech Synthesis Error",
        description: "There was an error speaking the text.",
        variant: "destructive"
      });
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      toast({
        title: "Language Changed",
        description: `Speech recognition language changed to ${languageOptions.find(lang => lang.value === value)?.label || value}.`,
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl glass-container">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-lg dark:bg-[#403E43]">
            <h3 className="text-lg font-medium">Select Language</h3>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center my-6">
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={`rounded-full h-24 w-24 dark:bg-[#403E43] ${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"
              } relative group`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-10 w-10 text-white" />
                  <span className="absolute -inset-4 rounded-full border-2 border-red-400 opacity-75 group-hover:opacity-100 animate-pulse-ring"></span>
                </>
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </Button>
          </div>
          
          <Textarea
            placeholder={`Your ${selectedLanguage === "hi-IN" ? "Hindi" : selectedLanguage === "en-IN" ? "Hinglish" : "English"} speech will appear here...`}
            className="min-h-[200px] text-lg"
            value={text}
            onChange={handleTextChange}
          />
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isListening ? 
                `Listening in ${languageOptions.find(lang => lang.value === selectedLanguage)?.label || selectedLanguage}...` : 
                "Click the microphone to start"}
            </div>
            
            <Button
              onClick={speakText}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>Speak Text</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
