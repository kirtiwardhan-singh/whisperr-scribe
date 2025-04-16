
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define the SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export const SpeechRecognitionComponent = () => {
  const [text, setText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const { toast } = useToast();

  // SpeechRecognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

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
    recognitionInstance.lang = 'en-US';
    
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
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

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
      recognition.start();
      toast({
        title: "Listening",
        description: "Speak now. Your words will be transcribed."
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
    utterance.lang = 'en-US';
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

  return (
    <Card className="w-full max-w-3xl glass-container">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center my-6">
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={`rounded-full h-24 w-24 ${
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
            placeholder="Your speech will appear here..."
            className="min-h-[200px] text-lg"
            value={text}
            onChange={handleTextChange}
          />
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isListening ? "Listening..." : "Click the microphone to start"}
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
