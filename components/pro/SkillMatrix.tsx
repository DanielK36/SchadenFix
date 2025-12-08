"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

interface Trade {
  id: string
  name: string
  description: string
  coveredInternally: boolean
}

interface SkillMatrixProps {
  trades: Trade[]
  onToggle: (tradeId: string, covered: boolean) => void
}

export function SkillMatrix({ trades, onToggle }: SkillMatrixProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-900">Skill-Matrix</h3>
        <p className="text-sm text-slate-500 mt-1">
          Definiere, welche Gewerke du intern abdeckst
        </p>
      </div>
      <div className="divide-y divide-slate-200">
        {trades.map((trade) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{trade.name}</h4>
                <p className="text-xs text-slate-500">{trade.description}</p>
                <div className="mt-2">
                  {trade.coveredInternally ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Intern abgedeckt</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      <span>Externe Vermittlung (FixPortal)</span>
                    </span>
                  )}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={trade.coveredInternally}
                  onChange={(e) => onToggle(trade.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D4AF37] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </label>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

