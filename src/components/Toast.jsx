import { useEffect } from 'react'

const Toast = ({ toast }) => {
  useEffect(() => {
    const element = document.getElementById('toast-notification')
    if (toast.show) {
      element.classList.add('show')
    } else {
      element.classList.remove('show')
    }
  }, [toast.show])

  return (
    <div 
      id="toast-notification" 
      className="toast"
      style={{ 
        background: toast.isError ? 'var(--accent-red)' : 'var(--accent-green)' 
      }}
    >
      {toast.message}
    </div>
  )
}

export default Toast
