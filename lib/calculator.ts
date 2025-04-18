import { federalTaxBrackets, provincialTaxBrackets } from "./constants"

interface CalculationParams {
  netPay: number
  frequency: string
  province: string
  eiEnabled: boolean
  cppEnabled: boolean
  cpp2Enabled: boolean
}

// Function 1: Income Tax Calculation
export function calculateIncomeTax(grossYearlySalary: number, province: string) {
  // Calculate Federal Tax
  let federalTax = 0
  for (let i = 0; i < federalTaxBrackets.length; i++) {
    const currentBracket = federalTaxBrackets[i]
    const nextBracket = federalTaxBrackets[i + 1]

    if (!nextBracket) {
      // Last bracket
      federalTax += (grossYearlySalary - currentBracket.threshold) * currentBracket.rate
      break
    }

    if (grossYearlySalary > nextBracket.threshold) {
      federalTax += (nextBracket.threshold - currentBracket.threshold) * currentBracket.rate
    } else {
      federalTax += (grossYearlySalary - currentBracket.threshold) * currentBracket.rate
      break
    }
  }

  // Calculate Provincial Tax
  let provincialTax = 0
  const provinceBrackets = provincialTaxBrackets[province]

  for (let i = 0; i < provinceBrackets.length; i++) {
    const currentBracket = provinceBrackets[i]
    const nextBracket = provinceBrackets[i + 1]

    if (!nextBracket) {
      // Last bracket
      provincialTax += (grossYearlySalary - currentBracket.threshold) * currentBracket.rate
      break
    }

    if (grossYearlySalary > nextBracket.threshold) {
      provincialTax += (nextBracket.threshold - currentBracket.threshold) * currentBracket.rate
    } else {
      provincialTax += (grossYearlySalary - currentBracket.threshold) * currentBracket.rate
      break
    }
  }

  const totalIncomeTax = federalTax + provincialTax
  const effectiveTaxRate = totalIncomeTax / grossYearlySalary

  return { totalIncomeTax, effectiveTaxRate }
}

// Function 2: EI Deduction Calculation
export function calculateEI(grossYearlySalary: number) {
  return Math.min(0.0163 * grossYearlySalary, 1077)
}

// Function 3: CPP Deduction Calculation
export function calculateCPP(grossYearlySalary: number) {
  return Math.min(0.0595 * grossYearlySalary, 4034)
}

// Function 4: CPP2 Deduction Calculation
export function calculateCPP2(grossYearlySalary: number) {
  return Math.min(0.04 * grossYearlySalary, 396)
}

// Function 5: Gross Yearly Salary Calculation
export function calculateGrossYearlySalary(params: CalculationParams) {
  const { netPay, frequency, province, eiEnabled, cppEnabled, cpp2Enabled } = params

  // Convert net pay to yearly
  let yearlyNetPay = netPay
  switch (frequency) {
    case "Monthly":
      yearlyNetPay *= 12
      break
    case "Semi-Monthly":
      yearlyNetPay *= 24
      break
    case "Bi-Weekly":
      yearlyNetPay *= 26
      break
    case "Weekly":
      yearlyNetPay *= 52
      break
  }

  // Initial estimate
  let estimatedGross = yearlyNetPay / 0.65 // Rough estimate assuming 35% goes to deductions
  let netAfterDeductions = 0

  // Binary search to find the correct gross salary
  let lowerBound = yearlyNetPay // Minimum possible gross (if no deductions)
  let upperBound = yearlyNetPay * 3 // Maximum reasonable gross

  const PRECISION = 1 // $1 precision

  while (upperBound - lowerBound > PRECISION) {
    estimatedGross = (lowerBound + upperBound) / 2

    // Calculate deductions
    const { totalIncomeTax } = calculateIncomeTax(estimatedGross, province)
    const totalEI = eiEnabled ? calculateEI(estimatedGross) : 0
    const totalCPP = cppEnabled ? calculateCPP(estimatedGross) : 0
    const totalCPP2 = cpp2Enabled ? calculateCPP2(estimatedGross) : 0

    // Calculate net after deductions
    netAfterDeductions = estimatedGross - totalIncomeTax - totalEI - totalCPP - totalCPP2

    // Adjust bounds
    if (netAfterDeductions > yearlyNetPay) {
      upperBound = estimatedGross
    } else {
      lowerBound = estimatedGross
    }
  }

  // Final calculation with the converged gross salary
  const { totalIncomeTax, effectiveTaxRate } = calculateIncomeTax(estimatedGross, province)
  const totalEI = eiEnabled ? calculateEI(estimatedGross) : 0
  const totalCPP = cppEnabled ? calculateCPP(estimatedGross) : 0
  const totalCPP2 = cpp2Enabled ? calculateCPP2(estimatedGross) : 0

  return {
    grossYearlySalary: Math.round(estimatedGross),
    effectiveTaxRate,
    totalIncomeTax,
    totalEI,
    totalCPP,
    totalCPP2,
    yearlyNetPay,
  }
}
