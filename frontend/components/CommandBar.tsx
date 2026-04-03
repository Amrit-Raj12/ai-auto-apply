"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Send, Loader2, Play, Volume2, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Sound assets
const SOUNDS = {
  MIC_START: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  MIC_STOP: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  SEND: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  ERROR: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
};

export default function CommandBar() {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [response, setResponse] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  // Sound utility
  const playSFX = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(() => console.warn("Audio play blocked"));
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const transcriptRef = useRef("");

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setStatus("Stopped.");
      return;
    }

    // Step 1: Check browser support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Browser not supported.");
      return;
    }

    // Step 2: Request permission & play sound
    setStatus("Requesting microphone...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (err) {
      setStatus("Microphone permission denied.");
      return;
    }

    setCommand("");
    transcriptRef.current = "";
    playSFX(SOUNDS.MIC_START);

    // Step 3: Initialize recognition directly on click
    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => (result as any)[0].transcript)
        .join("");
      
      transcriptRef.current = transcript;
      setCommand(transcript);
      setStatus("Typing...");
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition Error:", event.error);
      setIsListening(false);
      setStatus(event.error === 'no-speech' ? "No speech detected." : `Error: ${event.error}`);
      playSFX(SOUNDS.ERROR);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus("Finished.");
      
      // AUTO-SEND LOGIC: If we have captured text, send it immediately
      if (transcriptRef.current.trim()) {
        console.log("Auto-sending transcript:", transcriptRef.current);
        handleSendCommand(transcriptRef.current);
        transcriptRef.current = ""; // Clear ref after sending
      }

      setTimeout(() => setStatus(""), 2000);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendCommand = async (text: string = command) => {
    if (!text.trim()) return;
    
    if (isListening) recognitionRef.current?.stop();

    playSFX(SOUNDS.SEND);
    setIsLoading(true);
    setStatus("Sending...");
    try {
      const res = await axios.post("http://localhost:8000/command", { command: text });
      setResponse(res.data);
      setCommand("");
      setStatus("Sent successfully.");
    } catch (error) {
      console.error("Command failed", error);
      setStatus("Send failed.");
      playSFX(SOUNDS.ERROR);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {isListening ? (
             <motion.div
               animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="relative"
             >
               <div className="absolute inset-0 bg-blue-500 blur-md rounded-full opacity-30 animate-ping" />
               <Volume2 className="w-5 h-5 text-blue-500" />
             </motion.div>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
          placeholder={isListening ? "Listening... Speak now" : 'Try "Apply latest 10 jobs" or click the mic...'}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-md text-white placeholder:text-slate-500 shadow-2xl"
        />
        <div className="absolute inset-y-2 right-2 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              isListening 
                ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {isListening ? (
              <div className="flex items-center space-x-1 px-1">
                <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
                <div className="w-1 h-5 bg-white rounded-full animate-[bounce_1s_infinite_150ms]" />
                <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_300ms]" />
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendCommand()}
            disabled={isLoading || !command.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-xl px-5 transition-all shadow-lg flex items-center space-x-2 group focus:outline-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline font-medium text-sm">Send</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Status Bar */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2 px-4 text-xs font-medium"
          >
            {status.includes("Error") || status.includes("denied") ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Info className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            )}
            <span className={status.includes("Error") ? "text-red-400" : "text-blue-400"}>{status}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-start space-x-4 backdrop-blur-sm shadow-xl"
          >
            <div className="p-2.5 bg-blue-600 rounded-lg shadow-inner">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-widest">System Response</h4>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <p className="text-slate-100 text-sm mt-1 leading-relaxed">
                {response.message || JSON.stringify(response)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


