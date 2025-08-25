import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalComments: 0
  })
  const [users, setUsers] = useState([])
  const [blogs, setBlogs] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }
    
    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [usersRes, blogsRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/blogs/admin/all')
      ])
      
      setUsers(usersRes.data)
      setBlogs(blogsRes.data)
      
      // Calculate stats
      setStats({
        totalUsers: usersRes.data.length,
        totalBlogs: blogsRes.data.length,
        totalComments: blogsRes.data.reduce((acc, blog) => acc + blog.comments.length, 0)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${userId}`)
        setUsers(users.filter(user => user._id !== userId))
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const toggleUserBlock = async (userId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block'
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await axios.patch(`/users/${userId}/${action}`)
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isBlocked: !isBlocked } : user
        ))
        alert(`User ${action}ed successfully`)
      } catch (error) {
        console.error(`Error ${action}ing user:`, error)
        alert(`Failed to ${action} user`)
      }
    }
  }

  const deleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/blogs/admin/${blogId}`)
        setBlogs(blogs.filter(blog => blog._id !== blogId))
        setStats(prev => ({ ...prev, totalBlogs: prev.totalBlogs - 1 }))
      } catch (error) {
        console.error('Error deleting blog:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1a6 6 0 003-5.197"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'blogs'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Blogs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <p className="text-gray-600">
                      Your platform has {stats.totalUsers} registered users who have created {stats.totalBlogs} blog posts
                      with a total of {stats.totalComments} comments.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        Manage Users
                      </button>
                      <button
                        onClick={() => setActiveTab('blogs')}
                        className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                      >
                        Manage Blogs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isBlocked 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {user.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => toggleUserBlock(user._id, user.isBlocked)}
                                    className={`${
                                      user.isBlocked 
                                        ? 'text-green-600 hover:text-green-900' 
                                        : 'text-orange-600 hover:text-orange-900'
                                    }`}
                                  >
                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'blogs' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blog Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Likes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blogs.map((blog) => (
                        <tr key={blog._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {blog.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{blog.author?.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{blog.category || 'Uncategorized'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{blog.likes?.length || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteBlog(blog._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
