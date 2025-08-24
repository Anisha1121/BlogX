const express = require('express');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { protect, admin } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Create blog
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { 
          folder: 'blogs',
          resource_type: 'auto'
        });
        imageUrl = result.secure_url;
        
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Clean up temporary file even if upload failed
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Image upload failed', error: cloudinaryError.message });
      }
    }
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      image: imageUrl,
      author: req.user._id,
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',') : [],
    });
    
    // Populate author info before returning
    await blog.populate('author', 'username email');
    res.status(201).json(blog);
  } catch (err) {
    console.error('Blog creation error:', err);
    // Clean up temporary file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
});

// Get all blogs (with search/filter)
router.get('/', async (req, res) => {
  const { keyword, category, tag } = req.query;
  let query = {};
  if (keyword) query.title = { $regex: keyword, $options: 'i' };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  try {
    const blogs = await Blog.find(query).populate('author', 'username').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    
    const blog = await Blog.findById(req.params.id).populate('author', 'username').populate({ path: 'comments', populate: { path: 'user', select: 'username' } });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update blog
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'blogs' });
      blog.image = result.secure_url;
    }
    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.category = req.body.category || blog.category;
    blog.tags = req.body.tags ? req.body.tags.split(',') : blog.tags;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete blog
router.delete('/:id', protect, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like blog
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already liked' });
    }
    blog.likes.push(req.user._id);
    await blog.save();
    res.json({ likes: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unlike blog
router.post('/:id/unlike', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
    await blog.save();
    res.json({ likes: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const comment = await Comment.create({
      blog: blog._id,
      user: req.user._id,
      text: req.body.text,
    });
    blog.comments.push(comment._id);
    await blog.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete comment (author or admin)
router.delete('/:blogId/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    await Blog.findByIdAndUpdate(req.params.blogId, { $pull: { comments: req.params.commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get blogs by user (profile)
router.get('/user/:userId', async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all blogs
router.get('/admin/all', protect, admin, async (req, res) => {
  const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
  res.json(blogs);
});

// Admin: delete any blog
router.delete('/admin/:id', protect, admin, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Blog deleted by admin' });
});

module.exports = router;
