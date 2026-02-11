"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessScreenProps {
  onReset?: () => void;
}

const CheckmarkIcon = () => {
  return (
    <motion.svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24"
    >
      {/* Kreis */}
      <motion.circle
        cx="48"
        cy="48"
        r="44"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-green-500"
      />
      {/* Checkmark */}
      <motion.path
        d="M28 48 L42 62 L68 36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="text-green-500"
      />
    </motion.svg>
  );
};

export const SuccessScreen = ({ onReset }: SuccessScreenProps) => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-4 pb-8">
      <div className="flex flex-col items-center justify-center space-y-6 flex-1">
        {/* Animiertes Checkmark-Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CheckmarkIcon />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-black text-stone-900 tracking-tighter">
            Alles erledigt.
          </h2>
          <p className="text-stone-500 font-medium">
            Wir haben Ihre Meldung erhalten.
          </p>
        </motion.div>

        {/* Kompakte Liste */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-full max-w-sm space-y-3 pt-2"
        >
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3 text-left">
              <Check className="w-4 h-4 text-stone-900 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span className="text-stone-700 font-medium text-sm">Wir rufen Sie innerhalb von 60 Minuten zurück.</span>
            </li>
            <li className="flex items-start gap-3 text-left">
              <Check className="w-4 h-4 text-stone-900 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span className="text-stone-700 font-medium text-sm">Sie erhalten eine Bestätigung per E-Mail.</span>
            </li>
            <li className="flex items-start gap-3 text-left">
              <Check className="w-4 h-4 text-stone-900 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span className="text-stone-700 font-medium text-sm">Ein Partner meldet sich bei Ihnen.</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Button am unteren Rand */}
      {onReset && (
        <motion.button
          onClick={onReset}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm px-8 py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors active:scale-95 shadow-lg mb-8"
        >
          Zurück zur Startseite
        </motion.button>
      )}
    </div>
  );
};
