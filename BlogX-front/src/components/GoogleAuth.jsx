import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const GoogleAuth = ({ type = 'login', onSuccess, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    console.log('Google Client ID available:', !!clientId)
    
    if (!clientId) {
      setError('Google Client ID not configured')
      return
    }

    const handleGoogleResponse = async (response) => {
      try {
        console.log('Google response received:', response)
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
        const res = await fetch(`${API_BASE_URL}/users/google-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
            type: type
          }),
        })

        const data = await res.json()
        console.log('Backend response:', data)

        if (res.ok) {
          localStorage.setItem('token', data.token)
          if (onSuccess) {
            onSuccess(data)
          } else {
            navigate(data.role === 'admin' ? '/admin' : '/')
          }
        } else {
          throw new Error(data.message || 'Authentication failed')
        }
      } catch (error) {
        console.error('Google auth error:', error)
        const errorMsg = error.message || 'Authentication failed'
        setError(errorMsg)
        if (onError) onError(errorMsg)
      }
    }

    const initGoogle = () => {
      console.log('Checking for Google API...', !!window.google)
      if (window.google?.accounts?.id) {
        console.log('Initializing Google Sign-In...')
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
          })
          console.log('Google Identity Services initialized successfully')
          setIsLoaded(true)
        } catch (err) {
          console.error('Error during Google initialization:', err)
          setError('Failed to initialize Google Sign-In')
        }
      } else {
        console.log('Google API not ready, retrying...')
        setTimeout(initGoogle, 100)
      }
    }

    // Add a delay to ensure the component has mounted
    setTimeout(initGoogle, 300)
  }, [type, onSuccess, onError, navigate])

  // Render Google button when component is loaded and container is available
  useEffect(() => {
    if (isLoaded && containerRef.current && window.google?.accounts?.id) {
      console.log('Container found:', !!containerRef.current)
      try {
        console.log('Rendering Google button...')
        containerRef.current.innerHTML = '' // Clear any existing content
        
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: type === 'login' ? 'signin_with' : 'signup_with',
        })
        console.log('Google button rendered successfully')
      } catch (err) {
        console.error('Error rendering Google button:', err)
        setError('Failed to render Google Sign-In button')
      }
    }
  }, [isLoaded, type])

  if (error) {
    return (
      <div className="p-3 border border-red-300 rounded-lg bg-red-50 text-red-700 text-sm text-center">
        {error}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
        <span className="text-gray-600 text-sm">Loading Google Sign-In...</span>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center min-h-[44px]"
    ></div>
  )
}

export default GoogleAuth
