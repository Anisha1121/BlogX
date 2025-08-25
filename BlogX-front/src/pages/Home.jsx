import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleStartWriting = () => {
    if (user) {
      navigate('/create-blog')
    } else {
      navigate('/login')
    }
  }

  const handleExploreStories = () => {
    navigate('/blogs')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Your ideas.
              </span>
              <br />
              <span className="text-gray-800">Your platform.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              A distraction-free editor, powerful discovery, and a community that reads.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleStartWriting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Writing
              </button>
              <button 
                onClick={handleExploreStories}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-purple-600 hover:text-purple-600 transition-all duration-200"
              >
                Explore Stories
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-blue-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-pink-200 rounded-full opacity-60 animate-pulse delay-500"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why BlogX?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to share your thoughts with the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rich Text Editor</h3>
            <p className="text-gray-600 leading-relaxed">
              Create beautiful, formatted content with our intuitive editor. Add images, links, and styling with ease.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Engaged Community</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with readers through comments and likes. Build a following and engage with other writers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Discovery</h3>
            <p className="text-gray-600 leading-relaxed">
              Find content that matters to you with powerful search and filtering by categories and tags.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to share your story?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of writers who are already sharing their ideas on BlogX
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold">BlogX</span>
          </div>
          <p className="text-gray-400">
            &copy; 2025 BlogX. Built with React, Node.js, and MongoDB.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
