import { IncomeCalculator } from "@/components/income-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">2025 Canadian Reverse Income Calculator</h1>
          <p className="text-gray-600">Find out what gross salary you need to achieve your desired net pay in Canada</p>
        </header>
        <IncomeCalculator />
      </div>
    </main>
  )
}
