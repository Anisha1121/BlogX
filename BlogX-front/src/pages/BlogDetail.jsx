import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import MarkdownPreview from '@uiw/react-markdown-preview'
import axios from 'axios'
import toast from 'react-hot-toast'

const BlogDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/blogs/${id}`)
      setBlog(response.data)
    } catch {
      toast.error('Blog not found')
      navigate('/blogs')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchBlog()
  }, [fetchBlog])

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like blogs')
      return
    }

    setLikeLoading(true)
    try {
      const isLiked = blog.likes.includes(user._id)
      const endpoint = isLiked ? `/blogs/${id}/unlike` : `/blogs/${id}/like`
      
      await axios.post(endpoint)
      
      // Update local state
      setBlog(prev => ({
        ...prev,
        likes: isLiked 
          ? prev.likes.filter(likeId => likeId !== user._id)
          : [...prev.likes, user._id]
      }))

      toast.success(isLiked ? 'Blog unliked' : 'Blog liked!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update like')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setCommentLoading(true)
    try {
      const response = await axios.post(`/blogs/${id}/comments`, {
        text: newComment
      })

      // Update local state
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, {
          ...response.data,
          user: { _id: user._id, username: user.username }
        }]
      }))

      setNewComment('')
      toast.success('Comment added successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteBlog = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/blogs/${id}`)
        toast.success('Blog deleted successfully')
        navigate('/blogs')
      } catch {
        toast.error('Failed to delete blog')
      }
    }
  }

  const canEditDelete = user && (user._id === blog?.author._id || user.role === 'admin')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Blog not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          )}

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">{blog.author?.username || 'Anonymous'}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                
                {canEditDelete && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-blog/${blog._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDeleteBlog}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.category && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {blog.category}
                  </span>
                )}
                {blog.tags && blog.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8" data-color-mode="light">
              <MarkdownPreview
                source={blog.content}
                style={{ backgroundColor: 'transparent' }}
                data-color-mode="light"
              />
            </div>

            {/* Like and Share Section */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      blog.likes.includes(user?._id)
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <svg 
                      className={`w-5 h-5 ${blog.likes.includes(user?._id) ? 'fill-current' : ''}`} 
                      fill={blog.likes.includes(user?._id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span>{blog.likes.length} {blog.likes.length === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span>{blog.comments.length} {blog.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Comments</h3>
              
              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleComment} className="mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={commentLoading || !newComment.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {commentLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                      Login
                    </Link>
                    {' '}to join the conversation
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {blog.comments.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  blog.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {comment.user?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.user?.username || 'Anonymous'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
