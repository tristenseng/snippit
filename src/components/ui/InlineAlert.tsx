interface InlineAlertProps {
  type: 'success' | 'error' | 'info'
  message: string
  onDismiss?: () => void
}

const alertClasses: Record<InlineAlertProps['type'], string> = {
  success: 'bg-green-50 border border-green-200 text-green-800 text-sm rounded-md px-4 py-3',
  error: 'bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3',
  info: 'bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md px-4 py-3',
}

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      className="ml-2 shrink-0 text-current opacity-70 hover:opacity-100"
      aria-label="Dismiss"
      type="button"
    >
      &times;
    </button>
  )
}

export function InlineAlert({ type, message, onDismiss }: InlineAlertProps) {
  if (type === 'error') {
    return (
      <div className={`flex items-start justify-between gap-2 ${alertClasses.error}`} role="alert">
        <span>{message}</span>
        {onDismiss && <DismissButton onDismiss={onDismiss} />}
      </div>
    )
  }

  return (
    <div className={`flex items-start justify-between gap-2 ${alertClasses[type]}`}>
      <span>{message}</span>
      {onDismiss && <DismissButton onDismiss={onDismiss} />}
    </div>
  )
}
