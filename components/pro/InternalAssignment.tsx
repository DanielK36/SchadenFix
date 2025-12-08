"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, CheckCircle2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Employee {
  id: string
  name: string
  role?: string
  avatar?: string
}

interface InternalAssignmentProps {
  employees: Employee[]
  currentAssignment?: string | null
  onAssign: (employeeId: string) => Promise<void>
}

export function InternalAssignment({
  employees,
  currentAssignment,
  onAssign,
}: InternalAssignmentProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentAssignment || "")
  const [isAssigning, setIsAssigning] = useState(false)

  const handleAssign = async () => {
    if (!selectedEmployee) return
    setIsAssigning(true)
    try {
      await onAssign(selectedEmployee)
      // Success feedback is handled by parent
    } catch (error) {
      console.error("Error assigning employee:", error)
    } finally {
      setIsAssigning(false)
    }
  }

  const assignedEmployee = employees.find((emp) => emp.id === currentAssignment)

  return (
    <div className="space-y-3">

      {assignedEmployee ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <p className="text-xs text-green-700">Zugewiesen an</p>
              <p className="text-sm font-semibold text-green-800">{assignedEmployee.name}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Mitarbeiter wählen..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                  {employee.role && (
                    <span className="text-slate-400 ml-2">({employee.role})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssign}
            disabled={!selectedEmployee || isAssigning}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm"
            size="sm"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Wird zugewiesen...
              </>
            ) : (
              <>
                <User className="w-3 h-3 mr-2" />
                Zuweisen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

