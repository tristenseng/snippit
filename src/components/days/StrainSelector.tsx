'use client'

interface StrainSelectorProps {
  strains: { id: string; name: string }[]
  selectedStrainId: string | null
  onChange: (id: string) => void
}

export function StrainSelector({ strains, selectedStrainId, onChange }: StrainSelectorProps) {
  return (
    <div className="space-y-1">
      <label htmlFor="strain-selector" className="block text-sm font-medium text-gray-700">
        Select Strain
      </label>
      <select
        id="strain-selector"
        value={selectedStrainId ?? ''}
        onChange={e => onChange(e.target.value)}
        className="text-base sm:text-sm border border-gray-300 rounded-md px-3 py-2 min-h-[44px] w-full focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white"
      >
        <option value="" disabled>
          Choose a strain...
        </option>
        {strains.map(strain => (
          <option key={strain.id} value={strain.id}>
            {strain.name}
          </option>
        ))}
      </select>
    </div>
  )
}
