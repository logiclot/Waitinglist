"use client";

import { useEffect, useRef, useState } from "react";

/* ── Morse code alphabet ───────────────────────────────────────────── */

const MORSE: Record<string, string> = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",   E: ".",
  F: "..-.",  G: "--.",   H: "....",  I: "..",    J: ".---",
  K: "-.-",   L: ".-..",  M: "--",    N: "-.",    O: "---",
  P: ".--.",  Q: "--.-",  R: ".-.",   S: "...",   T: "-",
  U: "..-",   V: "...-",  W: ".--",   X: "-..-",  Y: "-.--",
  Z: "--..",
  "!": "-.-.--",
};

const DOT_MS = 120;
const DASH_MS = DOT_MS * 3;
const SYMBOL_GAP = DOT_MS;
const LETTER_GAP = DOT_MS * 3;
const WORD_GAP = DOT_MS * 7;

type MorseStep = { on: boolean; ms: number };

function textToMorseSteps(text: string): MorseStep[] {
  const steps: MorseStep[] = [];
  const words = text.toUpperCase().split(/\s+/);

  for (let wi = 0; wi < words.length; wi++) {
    const letters = words[wi].split("");

    for (let li = 0; li < letters.length; li++) {
      const code = MORSE[letters[li]];
      if (!code) continue;

      for (let si = 0; si < code.length; si++) {
        steps.push({ on: true, ms: code[si] === "." ? DOT_MS : DASH_MS });
        if (si < code.length - 1) {
          steps.push({ on: false, ms: SYMBOL_GAP });
        }
      }

      if (li < letters.length - 1) {
        steps.push({ on: false, ms: LETTER_GAP });
      }
    }

    if (wi < words.length - 1) {
      steps.push({ on: false, ms: WORD_GAP });
    }
  }

  // End-of-message pause before looping
  steps.push({ on: false, ms: 2000 });
  return steps;
}

const DEFAULT_STEPS = textToMorseSteps("Hi! Lets automate your business");

/**
 * Hook that pulses a boolean on/off following Morse-code timing.
 * Returns `{ on, cycleCount }` where `on` is whether the "light" is currently lit
 * and `cycleCount` increments after each full message loop.
 */
export function useMorseCode(message?: string) {
  const steps = message ? textToMorseSteps(message) : DEFAULT_STEPS;
  const [on, setOn] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const stepsRef = useRef(steps);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    function tick() {
      const step = stepsRef.current[idxRef.current];
      setOn(step.on);
      idxRef.current = (idxRef.current + 1) % stepsRef.current.length;
      if (idxRef.current === 0) {
        setCycleCount((c) => c + 1);
      }
      timerRef.current = setTimeout(tick, step.ms);
    }
    tick();
    return () => clearTimeout(timerRef.current);
  }, []);

  return { on, cycleCount };
}
