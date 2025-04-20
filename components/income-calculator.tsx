"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { MapleLeaf } from "./maple-leaf"
import { calculateGrossYearlySalary } from "@/lib/calculator"
import { ResultsDisplay } from "./results-display"
import { provinces, frequencies } from "@/lib/constants"

export function IncomeCalculator() {
  const [netPay, setNetPay] = useState<string>("")
  const [frequency, setFrequency] = useState<string>("Annually")
  const [province, setProvince] = useState<string>("Ontario")
  const [eiEnabled, setEiEnabled] = useState<boolean>(true)
  const [cppEnabled, setCppEnabled] = useState<boolean>(true)
  const [cpp2Enabled, setCpp2Enabled] = useState<boolean>(true)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const handleCalculate = () => {
    // Validate input
    if (!netPay || isNaN(Number(netPay)) || Number(netPay) <= 0) {
      setError("Please enter a valid net pay amount")
      return
    }

    setError("")
    setIsCalculating(true)

    // Simulate calculation delay for UX
    setTimeout(() => {
      try {
        const result = calculateGrossYearlySalary({
          netPay: Number(netPay),
          frequency,
          province,
          eiEnabled,
          cppEnabled,
          cpp2Enabled,
        })

        setResults(result)
      } catch (err) {
        setError("An error occurred during calculation")
        console.error(err)
      } finally {
        setIsCalculating(false)
      }
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg border-red-100">
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <MapleLeaf className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold">Calculate Your Target Salary</h2>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="netPay">Desired Net Pay</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="netPay"
                    type="number"
                    placeholder="Enter amount"
                    className="pl-8"
                    value={netPay}
                    onChange={(e) => setNetPay(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="province">Province/Territory</Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ei-toggle" className="cursor-pointer">
                    Employment Insurance (EI)
                  </Label>
                  <Switch id="ei-toggle" checked={eiEnabled} onCheckedChange={setEiEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cpp-toggle" className="cursor-pointer">
                    Canada Pension Plan (CPP)
                  </Label>
                  <Switch id="cpp-toggle" checked={cppEnabled} onCheckedChange={setCppEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cpp2-toggle" className="cursor-pointer">
                    CPP Enhancement (CPP2)
                  </Label>
                  <Switch id="cpp2-toggle" checked={cpp2Enabled} onCheckedChange={setCpp2Enabled} />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

              <Button onClick={handleCalculate} className="mt-4 bg-red-600 hover:bg-red-700" disabled={isCalculating}>
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  "Calculate Gross Salary"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && !isCalculating && <ResultsDisplay results={results} frequency={frequency} />}
    </div>
  )
}
