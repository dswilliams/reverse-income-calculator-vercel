import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Disclaimer() {
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <strong>Disclaimer:</strong> The results provided by this calculator are estimates only and may not reflect your
        actual tax situation. Tax laws and regulations change frequently and vary based on individual circumstances.
        Please consult a qualified tax professional for advice specific to your situation.
      </AlertDescription>
    </Alert>
  )
}
