import { useEffect } from 'react'
import hljs from 'highlight.js'

const CodeContainer = ({ code, language, showToast }) => {
  useEffect(() => {
    // Re-highlight code whenever it changes
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block)
    })
  }, [code, language])

  const handleCopy = () => {
    if (!code) {
      showToast('Nothing to copy!', true)
      return
    }
    navigator.clipboard.writeText(code)
      .then(() => showToast('Code copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy: ', err)
        showToast('Failed to copy code!', true)
      })
  }

  const handleDownload = () => {
    if (!code) {
      showToast('Nothing to download!', true)
      return
    }
    
    const fileExtensionMap = {
      'html': 'html', 
      'css': 'css', 
      'javascript': 'js', 
      'python': 'py', 
      'java': 'java', 
      'cpp': 'cpp'
    }
    const fileExtension = fileExtensionMap[language] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stellar-code.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="code-container">
      <div className="code-header">
        <h2>Generated Code</h2>
        <div className="code-actions">
          <button id="copy-btn" onClick={handleCopy}>Copy</button>
          <button id="download-btn" onClick={handleDownload}>Download</button>
        </div>
      </div>
      <div id="code-display">
        <pre>
          <code className={`language-${language.toLowerCase()}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeContainer
