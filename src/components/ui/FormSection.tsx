import React from 'react'

interface FormSectionProps {
  legend: string
  children: React.ReactNode
}

export function FormSection({ legend, children }: FormSectionProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-700 mb-2">
        {legend}
      </legend>
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  )
}
