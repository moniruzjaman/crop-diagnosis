import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useTTS – Bangla text-to-speech hook using the Web Speech API.
 * Tuned for a warm, friendly, teacher-like voice.
 *
 * Usage:
 *   const { speak, stop, speaking, isSupported, voicesReady } = useTTS();
 *   speak("ধানের ব্লাস্ট রোগ দেখা দিয়েছে");
 *
 * Options:
 *   speak(text, { lang, rate, pitch, volume, prependFriendly })
 */
export default function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef(null);

  // Pre-load voices so we can pick the best one
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) setVoicesReady(true);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);
    // Voices may load async on some browsers — retry
    const timer = setTimeout(loadVoices, 500);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
      clearTimeout(timer);
    };
  }, []);

  const speak = useCallback((text, opts = {}) => {
    if (!window.speechSynthesis) return;

    const {
      lang = "bn-BD",
      rate = 0.82, // slower for warmth & clarity — like a caring teacher
      pitch = 1.2, // higher, warmer tone — friendly & approachable
      volume = 1,
      prependFriendly = false,
    } = opts;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Optionally prepend a warm, friendly greeting
    let fullText = text;
    if (prependFriendly) {
      const greetings = [
        "বেশ, ভাই! এখন খুব সহজে শুনুন। ",
        "ঠিক আছে, কাকিমা! চোখ বন্ধ করে শুনুন। ",
        "চলুন দেখা যাক! খুব সুন্দর করে বুঝিয়ে বলছি। ",
        "আচ্ছা শুনুন, খুব সহজ করে বলছি! ",
        "বেশ, বন্ধু! মন দিয়ে শুনুন। ",
      ];
      fullText = greetings[Math.floor(Math.random() * greetings.length)] + text;
    }

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to find the best available voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Priority: Bengali female → Bengali any → Hindi female → Hindi any → default
      const bnFemale = voices.find(
        (v) => v.lang.startsWith("bn") && /female|woman|zira|tanvi|swara|lekha/i.test(v.name),
      );
      const bnAny = voices.find((v) => v.lang.startsWith("bn"));
      const hiFemale = voices.find((v) => v.lang.startsWith("hi") && /female|woman|zira|swara/i.test(v.name));
      const hiAny = voices.find((v) => v.lang.startsWith("hi"));
      const chosen = bnFemale || bnAny || hiFemale || hiAny || voices[0];
      if (chosen) utterance.voice = chosen;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  const isSupported = typeof window !== "undefined" && !!window.speechSynthesis;

  return { speak, stop, speaking, isSupported, voicesReady };
}
