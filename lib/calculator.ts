import {
  federalTaxBrackets,
  provincialTaxBrackets,
  federalBasicPersonalAmount,
  provincialBasicPersonalAmount,
} from "./constants"

interface CalculationParams {
  netPay: number
  frequency: string
  province: string
  eiEnabled: boolean
  cppEnabled: boolean
  cpp2Enabled: boolean
}

// Update the calculateIncomeTax function to include Basic Personal Amount and Ontario Surtax
export function calculateIncomeTax(grossYearlySalary: number, province: string) {
  // Apply Basic Personal Amount deductions
  const federalTaxableIncome = Math.max(0, grossYearlySalary - federalBasicPersonalAmount)
  const provincialTaxableIncome = Math.max(0, grossYearlySalary - provincialBasicPersonalAmount[province])

  // Calculate Federal Tax
  let federalTax = 0
  for (let i = 0; i < federalTaxBrackets.length; i++) {
    const currentBracket = federalTaxBrackets[i]
    const nextBracket = federalTaxBrackets[i + 1]

    if (!nextBracket) {
      // Last bracket
      federalTax += Math.max(0, (federalTaxableIncome - currentBracket.threshold) * currentBracket.rate)
      break
    }

    if (federalTaxableIncome > nextBracket.threshold) {
      federalTax += Math.max(0, (nextBracket.threshold - currentBracket.threshold) * currentBracket.rate)
    } else {
      federalTax += Math.max(0, (federalTaxableIncome - currentBracket.threshold) * currentBracket.rate)
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
      provincialTax += Math.max(0, (provincialTaxableIncome - currentBracket.threshold) * currentBracket.rate)
      break
    }

    if (provincialTaxableIncome > nextBracket.threshold) {
      provincialTax += Math.max(0, (nextBracket.threshold - currentBracket.threshold) * currentBracket.rate)
    } else {
      provincialTax += Math.max(0, (provincialTaxableIncome - currentBracket.threshold) * currentBracket.rate)
      break
    }
  }

  // Calculate Ontario Surtax if applicable
  let ontarioSurtax = 0
  if (province === "Ontario") {
    if (provincialTax > 7307) {
      ontarioSurtax = (provincialTax - 5710) * 0.2 + (provincialTax - 7307) * 0.36
    } else if (provincialTax > 5710) {
      ontarioSurtax = (provincialTax - 5710) * 0.2
    }
  }

  // Add Ontario Surtax to provincial tax if applicable
  if (province === "Ontario") {
    provincialTax += ontarioSurtax
  }

  const totalIncomeTax = federalTax + provincialTax
  const effectiveTaxRate = grossYearlySalary > 0 ? totalIncomeTax / grossYearlySalary : 0

  return {
    totalIncomeTax,
    effectiveTaxRate,
    federalTax,
    provincialTax,
    ontarioSurtax: province === "Ontario" ? ontarioSurtax : 0,
  }
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
  const { totalIncomeTax, effectiveTaxRate, federalTax, provincialTax, ontarioSurtax } = calculateIncomeTax(
    estimatedGross,
    province,
  )
  const totalEI = eiEnabled ? calculateEI(estimatedGross) : 0
  const totalCPP = cppEnabled ? calculateCPP(estimatedGross) : 0
  const totalCPP2 = cpp2Enabled ? calculateCPP2(estimatedGross) : 0

  return {
    grossYearlySalary: Math.round(estimatedGross),
    effectiveTaxRate,
    totalIncomeTax,
    federalTax,
    provincialTax,
    ontarioSurtax,
    totalEI,
    totalCPP,
    totalCPP2,
    yearlyNetPay,
    province,
  }
}
