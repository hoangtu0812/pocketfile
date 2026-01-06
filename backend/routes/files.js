const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (max 100MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  }
});

// Get all projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/projects', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all files
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.*,
        p.name as project_name,
        u.username as uploaded_by_username
      FROM files f
      LEFT JOIN projects p ON f.project_id = p.id
      LEFT JOIN users u ON f.uploaded_by = u.id
      ORDER BY f.upload_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.*,
        p.name as project_name,
        u.username as uploaded_by_username
      FROM files f
      LEFT JOIN projects p ON f.project_id = p.id
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), [
  body('project_id').optional().isInt().withMessage('Project ID must be an integer'),
  body('version').trim().notEmpty().withMessage('Version is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { project_id, version } = req.body;
    const filePath = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size;

    const result = await pool.query(
      `INSERT INTO files (filename, original_filename, file_path, file_size, project_id, version, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.file.filename, req.file.originalname, filePath, fileSize, project_id || null, version, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Get file info
    const fileResult = await pool.query('SELECT file_path FROM files WHERE id = $1', [fileId]);
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', fileResult.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate QR code for file download
router.get('/:id/qrcode', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileResult = await pool.query('SELECT file_path FROM files WHERE id = $1', [fileId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const baseUrl = req.protocol + '://' + req.get('host');
    const downloadUrl = `${baseUrl}${fileResult.rows[0].file_path}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);
    res.json({ qrCode: qrCodeDataUrl, downloadUrl });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

