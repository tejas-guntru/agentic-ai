import { useState } from 'react'

const useCodeGeneration = (setCode, setOutput, setChatHistory, showToast) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const addLog = (message, type = 'info') => {
    setChatHistory(prev => [
      ...prev, 
      { type, message, timestamp: new Date() }
    ])
  }

  const generateCode = async (prompt, language, uploadedFileInfo) => {
    setIsGenerating(true)
    
    try {
      const isPost = !!uploadedFileInfo
      const url = isPost 
        ? `/generate`
        : `/generate?prompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(language)}`
      
      const options = isPost ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, uploaded_file_info: uploadedFileInfo })
      } : {}

      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop()

        for (const part of parts) {
          let eventType = 'message'
          let eventData = ''
          const lines = part.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7)
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6)
            }
          }

          if (eventData) {
            try {
              const data = JSON.parse(eventData)
              
              if (eventType === 'status') {
                addLog(data.message, 'info')
              } else if (eventType === 'final_code') {
                addLog("Successfully generated and verified code!", "success")
                setCode(data.code)
                setOutput(data.output || '')
              } else if (eventType === 'error') {
                addLog(data.message, 'error')
              }
            } catch (e) {
              console.error('Error parsing event data:', e)
            }
          }
        }
      }
    } catch (error) {
      addLog(`Connection error: ${error.message}`, 'error')
      if (error.message.includes('Failed to fetch')) {
        addLog('Please make sure the backend server is running on port 5000', 'error')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return { generateCode, isGenerating }
}

export default useCodeGeneration
