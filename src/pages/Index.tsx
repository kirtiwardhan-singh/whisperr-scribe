
import { ThemeToggle } from "@/components/theme-toggle";
import { SpeechRecognitionComponent } from "@/components/speech-recognition";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-500">
          Whisper<span className="text-foreground">Scribe</span>
        </h1>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Multilingual Speech-to-Text Generator</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Convert your speech into text instantly. Supports English, Hindi, and Hinglish (English-Hindi mix).
            Just select your language and start speaking.
          </p>
        </div>
        
        <SpeechRecognitionComponent />
      </main>
      
      <footer className="w-full max-w-3xl text-center text-sm text-muted-foreground py-4 mt-8">
        <p>© 2024 WhisperScribe. Multilingual Speech-to-Text and Text-to-Speech Generator.</p>
      </footer>
    </div>
  );
};

export default Index;
