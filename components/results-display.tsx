"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"

interface ResultsDisplayProps {
  results: {
    grossYearlySalary: number
    effectiveTaxRate: number
    totalIncomeTax: number
    federalTax: number
    provincialTax: number
    ontarioSurtax: number
    totalEI: number
    totalCPP: number
    totalCPP2: number
    yearlyNetPay: number
    province: string
  }
  frequency: string
}

export function ResultsDisplay({ results, frequency }: ResultsDisplayProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [results])

  const getFrequencyMultiplier = () => {
    switch (frequency) {
      case "Monthly":
        return 12
      case "Semi-Monthly":
        return 24
      case "Bi-Weekly":
        return 26
      case "Weekly":
        return 52
      default:
        return 1
    }
  }

  const multiplier = getFrequencyMultiplier()
  const frequencyLabel = frequency === "Annually" ? "Annual" : frequency

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Card className="shadow-lg border-red-100 overflow-hidden">
        <div className="bg-red-600 py-3 px-6">
          <h3 className="text-xl font-semibold text-white">Your Results</h3>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h4 className="text-lg font-semibold text-gray-800">Required Gross Salary</h4>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">{frequencyLabel} Gross Salary:</span>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(results.grossYearlySalary / multiplier)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Annual Gross Salary:</span>
                <span className="font-semibold">{formatCurrency(results.grossYearlySalary)}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="text-lg font-semibold text-gray-800">Deductions</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Income Tax:</span>
                <span>{formatCurrency(results.totalIncomeTax)}</span>
              </div>
              {results.federalTax > 0 && (
                <div className="flex justify-between items-center pl-4 text-sm">
                  <span className="text-gray-600">Federal Tax:</span>
                  <span>{formatCurrency(results.federalTax)}</span>
                </div>
              )}
              {results.provincialTax > 0 && (
                <div className="flex justify-between items-center pl-4 text-sm">
                  <span className="text-gray-600">{results.province} Tax:</span>
                  <span>{formatCurrency(results.provincialTax - results.ontarioSurtax)}</span>
                </div>
              )}
              {results.ontarioSurtax > 0 && (
                <div className="flex justify-between items-center pl-4 text-sm">
                  <span className="text-gray-600">Ontario Surtax:</span>
                  <span>{formatCurrency(results.ontarioSurtax)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">EI Contribution:</span>
                <span>{formatCurrency(results.totalEI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CPP Contribution:</span>
                <span>{formatCurrency(results.totalCPP)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CPP2 Contribution:</span>
                <span>{formatCurrency(results.totalCPP2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-gray-600">Total Deductions:</span>
                <span className="font-semibold">
                  {formatCurrency(results.totalIncomeTax + results.totalEI + results.totalCPP + results.totalCPP2)}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="text-lg font-semibold text-gray-800">Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Effective Tax Rate:</span>
                <span>{(results.effectiveTaxRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Annual Net Pay:</span>
                <span>{formatCurrency(results.yearlyNetPay)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-gray-600">{frequencyLabel} Net Pay:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(results.yearlyNetPay / multiplier)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-500 italic">
            Note: These calculations are estimates. Your actual tax situation may vary. Please consult a tax
            professional.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
