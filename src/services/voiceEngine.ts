import type { SupportedLanguage } from '../types/orca';

export class VoiceEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  public static speak(text: string, lang: SupportedLanguage = 'en', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<SupportedLanguage, string> = {
      en: 'en-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      hi: 'hi-IN',
      gu: 'gu-IN',
      bn: 'bn-IN'
    };

    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static startListening(
    lang: SupportedLanguage = 'en',
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition not supported on this browser.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      const langMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        hi: 'hi-IN',
        gu: 'gu-IN',
        bn: 'bn-IN'
      };

      this.recognition.lang = langMap[lang] || 'en-IN';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        if (onError) onError(event.error);
      };

      this.recognition.start();
      return true;
    } catch (err) {
      if (onError) onError(err);
      return false;
    }
  }

  public static stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
