import { useState, useEffect } from 'react'

const OutputContainer = ({ code, language, output }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const outputContainer = document.getElementById('output-container')

  useEffect(() => {
    const iframe = document.getElementById('output-frame')
    if (!iframe) return

    if (language === 'html') {
      iframe.srcdoc = code
    } else {
      const sanitizedOutput = output.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      iframe.srcdoc = `
        <html style="background-color:#1e1e2e;color:#c0caf5;">
          <head>
            <style>
              body { margin:0; padding:15px; font-family:'Roboto Mono',monospace; font-size:14px; }
              pre { margin:0; white-space:pre-wrap; word-wrap:break-word; }
            </style>
          </head>
          <body>
            <pre>${sanitizedOutput || 'Code executed with no output.'}</pre>
          </body>
        </html>
      `
    }
  }, [code, language, output])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      outputContainer.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Fullscreen failed:', err))
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="output-container" id="output-container">
      <div className="output-header">
        Live Preview / Output
        <button 
          id="fullscreen-btn" 
          title="Toggle Fullscreen"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
      <iframe id="output-frame" title="Live Preview / Output"></iframe>
    </div>
  )
}

export default OutputContainer
