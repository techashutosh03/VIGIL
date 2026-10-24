"use client";
import { useRef, useState } from "react";
import { apiPost } from "@/lib/api";

export default function VoiceCoPilot() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const recognitionRef = useRef<any>(null);

  function startListening() {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      const result = await apiPost(
        "/api/v1/copilot/query",
        { query: text },
        { answer: "I found 3 overlapping complaints linked to this institution across RB and PGRC." }
      );
      setAnswer(result.answer);
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(result.answer);
        speechSynthesis.speak(utter);
      }
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col items-center gap-3">
      <button
        onClick={startListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
          listening ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
        }`}
        aria-label="Ask VIGIL via voice"
      >
        🎙️
      </button>
      <p className="text-xs text-slate-500">{listening ? "Listening…" : "Tap to ask VIGIL"}</p>
      {transcript && <p className="text-sm text-slate-300">“{transcript}”</p>}
      {answer && <p className="text-sm text-teal-300 text-center">{answer}</p>}
    </div>
  );
}
