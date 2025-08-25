import { useState } from 'react'

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...')

  const testConnection = async () => {
    try {
      const response = await fetch('/api/')
      if (response.ok) {
        setStatus('Connected successfully!')
      } else {
        setStatus(`Connection failed: ${response.status}`)
      }
    } catch (error) {
      setStatus(`Connection error: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '10px', background: '#24283b', margin: '10px', borderRadius: '5px' }}>
      <h3>Backend Connection Test</h3>
      <p>Status: {status}</p>
      <button onClick={testConnection}>Test Connection</button>
    </div>
  )
}

export default ConnectionTest
