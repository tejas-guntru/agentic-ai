import { useState, useRef } from 'react'
import useCodeGeneration from '../hooks/useCodeGeneration'

const ChatContainer = ({ setCode, setOutput, language, setLanguage, showToast }) => {
  const [chatHistory, setChatHistory] = useState([
    { type: 'info', message: 'Welcome! Enter a prompt to generate code, or upload a file for analysis.' }
  ])
  const [prompt, setPrompt] = useState('')
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null)
  const fileInputRef = useRef(null)
  
  const { generateCode, isGenerating } = useCodeGeneration(
    setCode, 
    setOutput, 
    setChatHistory, 
    showToast
  )

  const addLog = (message, type = 'info') => {
    setChatHistory(prev => [
      ...prev, 
      { type, message, timestamp: new Date() }
    ])
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const statusElement = document.getElementById('file-status')
    if (statusElement) statusElement.textContent = 'Uploading...'

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Server error during upload.')

      const result = await response.json()
      setUploadedFileInfo({ 
        id: result.file_id, 
        name: result.filename, 
        preview: result.preview, 
        content: result.content 
      })
      
      if (statusElement) statusElement.textContent = `File: ${result.filename}`
      showToast('File uploaded successfully!')
      addLog(`Uploaded file: ${result.filename}`, 'info')
    } catch (error) {
      if (statusElement) statusElement.textContent = 'Upload failed.'
      showToast(error.message, true)
      setUploadedFileInfo(null)
      
      // More specific error handling
      if (error.message.includes('Failed to fetch')) {
        addLog('Backend server might not be running', 'error')
      }
    } finally {
      e.target.value = ''
    }
  }

  const handleGenerate = () => {
    if (!prompt.trim()) {
      addLog("Prompt cannot be empty.", "error")
      return
    }

    setChatHistory(prev => [
      ...prev, 
      { type: 'info', message: `Request for language: <strong>${language}</strong>` },
      { type: 'info', message: `Prompt: "${prompt}"` }
    ])

    if (uploadedFileInfo) {
      addLog(`Using file: <strong>${uploadedFileInfo.name}</strong>`, 'info')
    }

    generateCode(prompt, language, uploadedFileInfo)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="chat-container">
      <div id="chat-history">
        {chatHistory.map((log, index) => (
          <p key={index} className={`log-entry ${log.type}`}>
            <strong>[{log.type.toUpperCase()}]:</strong> 
            <span dangerouslySetInnerHTML={{ __html: log.message.replace(/\n/g, '<br>') }} />
          </p>
        ))}
      </div>
      <div className="chat-prompt">
        <div id="prompt-container">
          <div className="file-upload-container">
            <input 
              type="file" 
              id="file-input" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              hidden 
            />
            <button 
              id="upload-btn" 
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File
            </button>
            <span id="file-status">
              {uploadedFileInfo ? `File: ${uploadedFileInfo.name}` : 'No file selected.'}
            </span>
          </div>
          <textarea 
            id="prompt-input" 
            rows="2" 
            placeholder="e.g., Create a bar chart from the uploaded CSV"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
        </div>
        <div className="controls-container">
          <select 
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isGenerating}
          >
            <option value="html">HTML</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button 
            id="generate-btn" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? '...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
