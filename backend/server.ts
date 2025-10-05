import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

// Import Zod schemas
import {
  userSchema, createUserInputSchema, updateUserInputSchema, searchUserInputSchema,
  socialMediaLinkSchema, createSocialMediaLinkInputSchema, updateSocialMediaLinkInputSchema, searchSocialMediaLinkInputSchema,
  skillSchema, createSkillInputSchema, updateSkillInputSchema, searchSkillInputSchema,
  projectSchema, createProjectInputSchema, updateProjectInputSchema, searchProjectInputSchema,
  projectScreenshotSchema, createProjectScreenshotInputSchema, updateProjectScreenshotInputSchema, searchProjectScreenshotInputSchema,
  experienceSchema, createExperienceInputSchema, updateExperienceInputSchema, searchExperienceInputSchema,
  educationSchema, createEducationInputSchema, updateEducationInputSchema, searchEducationInputSchema,
  keyFactSchema, createKeyFactInputSchema, updateKeyFactInputSchema, searchKeyFactInputSchema,
  resumeDownloadSchema, createResumeDownloadInputSchema, updateResumeDownloadInputSchema, searchResumeDownloadInputSchema,
  contactMessageSchema, createContactMessageInputSchema, updateContactMessageInputSchema, searchContactMessageInputSchema,
  appSettingSchema, createAppSettingInputSchema, updateAppSettingInputSchema, searchAppSettingInputSchema,
  navigationPreferenceSchema, createNavigationPreferenceInputSchema, updateNavigationPreferenceInputSchema, searchNavigationPreferenceInputSchema
} from './schema.ts';

dotenv.config();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error response utility
interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  details?: any;
  timestamp: string;
}

function createErrorResponse(
  message: string,
  error?: any,
  errorCode?: string
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    response.error_code = errorCode;
  }

  if (error) {
    response.details = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return response;
}

// Database setup
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(morgan('combined'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create storage directory if it doesn't exist
const storagePath = path.join(__dirname, 'storage');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

/*
  Authentication middleware for protected routes
  Verifies JWT token and loads user data into req.user
*/
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_MISSING'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const client = await pool.connect();
    const result = await client.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(401).json(createErrorResponse('Invalid token', null, 'AUTH_TOKEN_INVALID'));
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

// AUTH ENDPOINTS

/*
  POST /api/auth/register
  Registers a new user account with email, password, and name
  Returns user object and JWT token for immediate authentication
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json(createErrorResponse('All fields are required', null, 'MISSING_REQUIRED_FIELDS'));
    }

    if (password.length < 6) {
      return res.status(400).json(createErrorResponse('Password must be at least 6 characters long', null, 'PASSWORD_TOO_SHORT'));
    }

    const client = await pool.connect();
    
    // Check if user exists
    const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(409).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
    }

    // Create user (NO HASHING - store password directly for development)
    const user_id = `usr_${uuidv4().replace(/-/g, '').substring(0, 10)}`;
    const now = new Date().toISOString();
    
    const result = await client.query(
      'INSERT INTO users (user_id, email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, name, created_at, updated_at',
      [user_id, email.toLowerCase().trim(), password, name.trim(), now, now]
    );
    client.release();

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/auth/login
  Authenticates user with email and password
  Returns user object and JWT token on successful login
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_REQUIRED_FIELDS'));
    }

    const client = await pool.connect();
    
    // Find user (NO HASHING - direct password comparison for development)
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    client.release();
    
    if (result.rows.length === 0) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    const user = result.rows[0];

    // Check password (direct comparison for development)
    const is_valid_password = password === user.password_hash;
    if (!is_valid_password) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// USER ENDPOINTS

/*
  GET /api/users/:user_id
  Retrieves a complete user profile including all related data
  Returns user with nested arrays for social links, skills, projects, etc.
*/
app.get('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const client = await pool.connect();

    // Get user data
    const userResult = await client.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }

    const user = userResult.rows[0];
    
    // Get all related data
    const [socialLinks, skills, projects, experiences, education, keyFacts] = await Promise.all([
      client.query('SELECT * FROM social_media_links WHERE user_id = $1 ORDER BY display_order ASC', [user_id]),
      client.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY display_order ASC', [user_id]),
      client.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY display_order ASC', [user_id]),
      client.query('SELECT * FROM experiences WHERE user_id = $1 ORDER BY display_order ASC', [user_id]),
      client.query('SELECT * FROM education WHERE user_id = $1 ORDER BY display_order ASC', [user_id]),
      client.query('SELECT * FROM key_facts WHERE user_id = $1 ORDER BY display_order ASC', [user_id])
    ]);

    client.release();

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;

    res.json({
      user: safeUser,
      social_links: socialLinks.rows,
      skills: skills.rows,
      projects: projects.rows,
      experiences: experiences.rows,
      education: education.rows,
      key_facts: keyFacts.rows
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id
  Updates user profile information
  Validates input data and updates only provided fields
*/
app.patch('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Validate input using Zod schema
    const validationResult = updateUserInputSchema.safeParse({ user_id, ...req.body });
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'user_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date().toISOString());
    updateValues.push(user_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex + 1} RETURNING user_id, email, name, tagline, bio_text, header_image_url, avatar_url, video_embed_url, created_at, updated_at`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/search
  Searches users with optional filtering and pagination
  Supports sorting by various fields and text-based query search
*/
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = searchUserInputSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { query, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT user_id, email, name, tagline, bio_text, header_image_url, avatar_url, created_at, updated_at FROM users';
    const queryParams = [];
    let paramIndex = 1;

    // Add search functionality
    if (query) {
      sqlQuery += ` WHERE (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex})`;
      queryParams.push(`%${query}%`);
      paramIndex++;
    }

    // Add sorting
    sqlQuery += ` ORDER BY ${sort_by} ${sort_order}`;
    
    // Add pagination
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// SOCIAL MEDIA LINKS ENDPOINTS

/*
  GET /api/users/:user_id/social-media-links
  Retrieves all social media links for a user with optional platform filtering
*/
app.get('/api/users/:user_id/social-media-links', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchSocialMediaLinkInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { platform, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM social_media_links WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (platform) {
      sqlQuery += ` AND platform = $${paramIndex}`;
      queryParams.push(platform);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get social media links error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/social-media-links
  Creates a new social media link for a user
*/
app.post('/api/users/:user_id/social-media-links', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createSocialMediaLinkInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { link_id, platform, url, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO social_media_links (link_id, user_id, platform, url, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [link_id, user_id, platform, url, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/social-media-links/:link_id
  Retrieves a specific social media link by ID
*/
app.get('/api/users/:user_id/social-media-links/:link_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, link_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM social_media_links WHERE user_id = $1 AND link_id = $2', [user_id, link_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Social media link not found', null, 'LINK_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/social-media-links/:link_id
  Updates a specific social media link
*/
app.patch('/api/users/:user_id/social-media-links/:link_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, link_id } = req.params;
    const validationResult = updateSocialMediaLinkInputSchema.safeParse({ link_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'link_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, link_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE social_media_links SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND link_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Social media link not found', null, 'LINK_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/social-media-links/:link_id
  Deletes a specific social media link
*/
app.delete('/api/users/:user_id/social-media-links/:link_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, link_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM social_media_links WHERE user_id = $1 AND link_id = $2', [user_id, link_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Social media link not found', null, 'LINK_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// SKILLS ENDPOINTS

/*
  GET /api/users/:user_id/skills
  Retrieves all skills for a user with optional filtering by category and proficiency
*/
app.get('/api/users/:user_id/skills', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchSkillInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { category, proficiency_level, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM skills WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (category) {
      sqlQuery += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (proficiency_level) {
      sqlQuery += ` AND proficiency_level = $${paramIndex}`;
      queryParams.push(proficiency_level);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/skills
  Creates a new skill for a user
*/
app.post('/api/users/:user_id/skills', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createSkillInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { skill_id, name, category, proficiency_level, icon_url, description, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO skills (skill_id, user_id, name, category, proficiency_level, icon_url, description, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [skill_id, user_id, name, category, proficiency_level, icon_url, description, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/skills/:skill_id
  Retrieves a specific skill by ID
*/
app.get('/api/users/:user_id/skills/:skill_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, skill_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM skills WHERE user_id = $1 AND skill_id = $2', [user_id, skill_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Skill not found', null, 'SKILL_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/skills/:skill_id
  Updates a specific skill
*/
app.patch('/api/users/:user_id/skills/:skill_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, skill_id } = req.params;
    const validationResult = updateSkillInputSchema.safeParse({ skill_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'skill_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, skill_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE skills SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND skill_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Skill not found', null, 'SKILL_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/skills/:skill_id
  Deletes a specific skill
*/
app.delete('/api/users/:user_id/skills/:skill_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, skill_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM skills WHERE user_id = $1 AND skill_id = $2', [user_id, skill_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Skill not found', null, 'SKILL_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// PROJECT ENDPOINTS

/*
  GET /api/users/:user_id/projects
  Retrieves all projects for a user with optional title filtering
*/
app.get('/api/users/:user_id/projects', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchProjectInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { title, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM projects WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (title) {
      sqlQuery += ` AND title ILIKE $${paramIndex}`;
      queryParams.push(`%${title}%`);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/projects
  Creates a new project for a user
*/
app.post('/api/users/:user_id/projects', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createProjectInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { project_id, title, short_description, description, thumbnail_url, project_url, source_code_url, tech_stack, display_order } = validationResult.data;
    const now = new Date().toISOString();

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO projects (project_id, user_id, title, short_description, description, thumbnail_url, project_url, source_code_url, tech_stack, display_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [project_id, user_id, title, short_description, description, thumbnail_url, project_url, source_code_url, tech_stack, display_order, now, now]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/projects/:project_id
  Retrieves a specific project by ID
*/
app.get('/api/users/:user_id/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, project_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM projects WHERE user_id = $1 AND project_id = $2', [user_id, project_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/projects/:project_id
  Updates a specific project
*/
app.patch('/api/users/:user_id/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, project_id } = req.params;
    const validationResult = updateProjectInputSchema.safeParse({ project_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'project_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date().toISOString());
    paramIndex++;

    updateValues.push(user_id, project_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND project_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/projects/:project_id
  Deletes a specific project and its associated screenshots
*/
app.delete('/api/users/:user_id/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, project_id } = req.params;

    const client = await pool.connect();
    
    // Delete associated screenshots first
    await client.query('DELETE FROM project_screenshots WHERE project_id = $1', [project_id]);
    
    // Delete the project
    const result = await client.query('DELETE FROM projects WHERE user_id = $1 AND project_id = $2', [user_id, project_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// PROJECT SCREENSHOTS ENDPOINTS

/*
  GET /api/projects/:project_id/screenshots
  Retrieves all screenshots for a specific project
*/
app.get('/api/projects/:project_id/screenshots', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const validationResult = searchProjectScreenshotInputSchema.safeParse({ project_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { limit, offset, sort_by, sort_order } = validationResult.data;
    
    const sqlQuery = `SELECT * FROM project_screenshots WHERE project_id = $1 ORDER BY ${sort_by} ${sort_order} LIMIT $2 OFFSET $3`;

    const client = await pool.connect();
    const result = await client.query(sqlQuery, [project_id, limit, offset]);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get project screenshots error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/projects/:project_id/screenshots
  Creates a new screenshot for a project
*/
app.post('/api/projects/:project_id/screenshots', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const validationResult = createProjectScreenshotInputSchema.safeParse({ project_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { screenshot_id, image_url, caption, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO project_screenshots (screenshot_id, project_id, image_url, caption, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [screenshot_id, project_id, image_url, caption, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create screenshot error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/projects/:project_id/screenshots/:screenshot_id
  Retrieves a specific screenshot by ID
*/
app.get('/api/projects/:project_id/screenshots/:screenshot_id', authenticateToken, async (req, res) => {
  try {
    const { project_id, screenshot_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM project_screenshots WHERE project_id = $1 AND screenshot_id = $2', [project_id, screenshot_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Screenshot not found', null, 'SCREENSHOT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get screenshot error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/projects/:project_id/screenshots/:screenshot_id
  Updates a specific screenshot
*/
app.patch('/api/projects/:project_id/screenshots/:screenshot_id', authenticateToken, async (req, res) => {
  try {
    const { project_id, screenshot_id } = req.params;
    const validationResult = updateProjectScreenshotInputSchema.safeParse({ screenshot_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'screenshot_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(project_id, screenshot_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE project_screenshots SET ${updateFields.join(', ')} WHERE project_id = $${paramIndex} AND screenshot_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Screenshot not found', null, 'SCREENSHOT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update screenshot error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/projects/:project_id/screenshots/:screenshot_id
  Deletes a specific screenshot
*/
app.delete('/api/projects/:project_id/screenshots/:screenshot_id', authenticateToken, async (req, res) => {
  try {
    const { project_id, screenshot_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM project_screenshots WHERE project_id = $1 AND screenshot_id = $2', [project_id, screenshot_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Screenshot not found', null, 'SCREENSHOT_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete screenshot error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// EXPERIENCE ENDPOINTS

/*
  GET /api/users/:user_id/experiences
  Retrieves all work experiences for a user with optional filtering
*/
app.get('/api/users/:user_id/experiences', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchExperienceInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { company_name, is_current, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM experiences WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (company_name) {
      sqlQuery += ` AND company_name ILIKE $${paramIndex}`;
      queryParams.push(`%${company_name}%`);
      paramIndex++;
    }

    if (is_current !== undefined) {
      sqlQuery += ` AND is_current = $${paramIndex}`;
      queryParams.push(is_current);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/experiences
  Creates a new work experience for a user
*/
app.post('/api/users/:user_id/experiences', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createExperienceInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { experience_id, role_title, company_name, company_logo_url, start_date, end_date, is_current, location, description, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO experiences (experience_id, user_id, role_title, company_name, company_logo_url, start_date, end_date, is_current, location, description, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [experience_id, user_id, role_title, company_name, company_logo_url, start_date, end_date, is_current, location, description, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/experiences/:experience_id
  Retrieves a specific experience by ID
*/
app.get('/api/users/:user_id/experiences/:experience_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, experience_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM experiences WHERE user_id = $1 AND experience_id = $2', [user_id, experience_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Experience not found', null, 'EXPERIENCE_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/experiences/:experience_id
  Updates a specific experience
*/
app.patch('/api/users/:user_id/experiences/:experience_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, experience_id } = req.params;
    const validationResult = updateExperienceInputSchema.safeParse({ experience_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'experience_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, experience_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE experiences SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND experience_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Experience not found', null, 'EXPERIENCE_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/experiences/:experience_id
  Deletes a specific experience
*/
app.delete('/api/users/:user_id/experiences/:experience_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, experience_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM experiences WHERE user_id = $1 AND experience_id = $2', [user_id, experience_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Experience not found', null, 'EXPERIENCE_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// EDUCATION ENDPOINTS

/*
  GET /api/users/:user_id/education
  Retrieves all education entries for a user with optional filtering
*/
app.get('/api/users/:user_id/education', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchEducationInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { institution_name, degree, is_current, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM education WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (institution_name) {
      sqlQuery += ` AND institution_name ILIKE $${paramIndex}`;
      queryParams.push(`%${institution_name}%`);
      paramIndex++;
    }

    if (degree) {
      sqlQuery += ` AND degree ILIKE $${paramIndex}`;
      queryParams.push(`%${degree}%`);
      paramIndex++;
    }

    if (is_current !== undefined) {
      sqlQuery += ` AND is_current = $${paramIndex}`;
      queryParams.push(is_current);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/education
  Creates a new education entry for a user
*/
app.post('/api/users/:user_id/education', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createEducationInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { education_id, institution_name, degree, institution_logo_url, start_date, end_date, is_current, location, description, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO education (education_id, user_id, institution_name, degree, institution_logo_url, start_date, end_date, is_current, location, description, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [education_id, user_id, institution_name, degree, institution_logo_url, start_date, end_date, is_current, location, description, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/education/:education_id
  Retrieves a specific education entry by ID
*/
app.get('/api/users/:user_id/education/:education_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, education_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM education WHERE user_id = $1 AND education_id = $2', [user_id, education_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Education entry not found', null, 'EDUCATION_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/education/:education_id
  Updates a specific education entry
*/
app.patch('/api/users/:user_id/education/:education_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, education_id } = req.params;
    const validationResult = updateEducationInputSchema.safeParse({ education_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'education_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, education_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE education SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND education_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Education entry not found', null, 'EDUCATION_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/education/:education_id
  Deletes a specific education entry
*/
app.delete('/api/users/:user_id/education/:education_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, education_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM education WHERE user_id = $1 AND education_id = $2', [user_id, education_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Education entry not found', null, 'EDUCATION_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// KEY FACTS ENDPOINTS

/*
  GET /api/users/:user_id/key-facts
  Retrieves all key facts for a user
*/
app.get('/api/users/:user_id/key-facts', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchKeyFactInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { limit, offset, sort_by, sort_order } = validationResult.data;
    
    const sqlQuery = `SELECT * FROM key_facts WHERE user_id = $1 ORDER BY ${sort_by} ${sort_order} LIMIT $2 OFFSET $3`;

    const client = await pool.connect();
    const result = await client.query(sqlQuery, [user_id, limit, offset]);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get key facts error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/key-facts
  Creates a new key fact for a user
*/
app.post('/api/users/:user_id/key-facts', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createKeyFactInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { fact_id, content, display_order } = validationResult.data;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO key_facts (fact_id, user_id, content, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [fact_id, user_id, content, display_order]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create key fact error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/key-facts/:fact_id
  Retrieves a specific key fact by ID
*/
app.get('/api/users/:user_id/key-facts/:fact_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, fact_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM key_facts WHERE user_id = $1 AND fact_id = $2', [user_id, fact_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Key fact not found', null, 'KEY_FACT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get key fact error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/key-facts/:fact_id
  Updates a specific key fact
*/
app.patch('/api/users/:user_id/key-facts/:fact_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, fact_id } = req.params;
    const validationResult = updateKeyFactInputSchema.safeParse({ fact_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'fact_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, fact_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE key_facts SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND fact_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Key fact not found', null, 'KEY_FACT_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update key fact error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/key-facts/:fact_id
  Deletes a specific key fact
*/
app.delete('/api/users/:user_id/key-facts/:fact_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, fact_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM key_facts WHERE user_id = $1 AND fact_id = $2', [user_id, fact_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Key fact not found', null, 'KEY_FACT_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete key fact error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// RESUME DOWNLOADS ENDPOINTS

/*
  @@need:external-api: PDF/Document generation service to create resume files in various formats (PDF, DOCX) from user portfolio data
*/
async function generate_resume_file({ user_id, file_format, user_data }) {
  // Mock resume generation - in production this would interface with a PDF generation service
  const mock_download_url = `https://storage.example.com/resumes/${user_id}_resume_${Date.now()}.${file_format}`;
  
  return {
    download_url: mock_download_url,
    file_size: 245760, // Mock file size in bytes
    generated_at: new Date().toISOString()
  };
}

/*
  GET /api/users/:user_id/resume-downloads
  Retrieves all resume download records for a user
*/
app.get('/api/users/:user_id/resume-downloads', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchResumeDownloadInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { file_format, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM resume_downloads WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (file_format) {
      sqlQuery += ` AND file_format = $${paramIndex}`;
      queryParams.push(file_format);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get resume downloads error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/resume-downloads
  Creates a new resume download record and generates the file
*/
app.post('/api/users/:user_id/resume-downloads', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createResumeDownloadInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { download_id, file_format } = validationResult.data;
    const now = new Date().toISOString();

    // Generate resume file (mock implementation)
    const file_data = await generate_resume_file({ user_id, file_format, user_data: {} });

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO resume_downloads (download_id, user_id, file_format, download_url, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [download_id, user_id, file_format, file_data.download_url, now]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/resume-downloads/:download_id
  Retrieves a specific resume download record by ID
*/
app.get('/api/users/:user_id/resume-downloads/:download_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, download_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM resume_downloads WHERE user_id = $1 AND download_id = $2', [user_id, download_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Resume download not found', null, 'DOWNLOAD_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/resume-downloads/:download_id
  Updates a specific resume download record
*/
app.patch('/api/users/:user_id/resume-downloads/:download_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, download_id } = req.params;
    const validationResult = updateResumeDownloadInputSchema.safeParse({ download_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'download_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, download_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE resume_downloads SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND download_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Resume download not found', null, 'DOWNLOAD_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/resume-downloads/:download_id
  Deletes a specific resume download record
*/
app.delete('/api/users/:user_id/resume-downloads/:download_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, download_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM resume_downloads WHERE user_id = $1 AND download_id = $2', [user_id, download_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Resume download not found', null, 'DOWNLOAD_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// CONTACT MESSAGES ENDPOINTS

/*
  GET /api/users/:user_id/contact-messages
  Retrieves all contact messages for a user with optional filtering
*/
app.get('/api/users/:user_id/contact-messages', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchContactMessageInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { sender_email, status, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM contact_messages WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (sender_email) {
      sqlQuery += ` AND sender_email = $${paramIndex}`;
      queryParams.push(sender_email);
      paramIndex++;
    }

    if (status) {
      sqlQuery += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/contact-messages
  Creates a new contact message from a visitor
*/
app.post('/api/users/:user_id/contact-messages', async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createContactMessageInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { message_id, sender_name, sender_email, sender_phone, message_content, status } = validationResult.data;
    const now = new Date().toISOString();

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO contact_messages (message_id, user_id, sender_name, sender_email, sender_phone, message_content, sent_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [message_id, user_id, sender_name, sender_email, sender_phone, message_content, now, status || 'pending']
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/contact-messages/:message_id
  Retrieves a specific contact message by ID
*/
app.get('/api/users/:user_id/contact-messages/:message_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, message_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM contact_messages WHERE user_id = $1 AND message_id = $2', [user_id, message_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Contact message not found', null, 'MESSAGE_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/contact-messages/:message_id
  Updates a specific contact message (typically to mark as read)
*/
app.patch('/api/users/:user_id/contact-messages/:message_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, message_id } = req.params;
    const validationResult = updateContactMessageInputSchema.safeParse({ message_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'message_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    updateValues.push(user_id, message_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE contact_messages SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND message_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Contact message not found', null, 'MESSAGE_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/contact-messages/:message_id
  Deletes a specific contact message
*/
app.delete('/api/users/:user_id/contact-messages/:message_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, message_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM contact_messages WHERE user_id = $1 AND message_id = $2', [user_id, message_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Contact message not found', null, 'MESSAGE_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// APP SETTINGS ENDPOINTS

/*
  GET /api/users/:user_id/app-settings
  Retrieves all app settings for a user
*/
app.get('/api/users/:user_id/app-settings', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchAppSettingInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { theme_mode, limit, offset, sort_by, sort_order } = validationResult.data;
    
    let sqlQuery = 'SELECT * FROM app_settings WHERE user_id = $1';
    const queryParams = [user_id];
    let paramIndex = 2;

    if (theme_mode) {
      sqlQuery += ` AND theme_mode = $${paramIndex}`;
      queryParams.push(theme_mode);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const client = await pool.connect();
    const result = await client.query(sqlQuery, queryParams);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get app settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/app-settings
  Creates new app settings for a user
*/
app.post('/api/users/:user_id/app-settings', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createAppSettingInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { setting_id, theme_mode, font_scale, hidden_sections } = validationResult.data;
    const now = new Date().toISOString();

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO app_settings (setting_id, user_id, theme_mode, font_scale, hidden_sections, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [setting_id, user_id, theme_mode, font_scale, hidden_sections, now]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create app settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/app-settings/:setting_id
  Retrieves specific app settings by ID
*/
app.get('/api/users/:user_id/app-settings/:setting_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, setting_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM app_settings WHERE user_id = $1 AND setting_id = $2', [user_id, setting_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('App settings not found', null, 'SETTINGS_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get app settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/app-settings/:setting_id
  Updates specific app settings
*/
app.patch('/api/users/:user_id/app-settings/:setting_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, setting_id } = req.params;
    const validationResult = updateAppSettingInputSchema.safeParse({ setting_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'setting_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date().toISOString());
    paramIndex++;

    updateValues.push(user_id, setting_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE app_settings SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND setting_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('App settings not found', null, 'SETTINGS_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update app settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/app-settings/:setting_id
  Deletes specific app settings
*/
app.delete('/api/users/:user_id/app-settings/:setting_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, setting_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM app_settings WHERE user_id = $1 AND setting_id = $2', [user_id, setting_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('App settings not found', null, 'SETTINGS_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete app settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// NAVIGATION PREFERENCES ENDPOINTS

/*
  GET /api/users/:user_id/navigation-preferences
  Retrieves all navigation preferences for a user
*/
app.get('/api/users/:user_id/navigation-preferences', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = searchNavigationPreferenceInputSchema.safeParse({ user_id, ...req.query });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { limit, offset, sort_by, sort_order } = validationResult.data;
    
    const sqlQuery = `SELECT * FROM navigation_preferences WHERE user_id = $1 ORDER BY ${sort_by} ${sort_order} LIMIT $2 OFFSET $3`;

    const client = await pool.connect();
    const result = await client.query(sqlQuery, [user_id, limit, offset]);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get navigation preferences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  POST /api/users/:user_id/navigation-preferences
  Creates new navigation preferences for a user
*/
app.post('/api/users/:user_id/navigation-preferences', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validationResult = createNavigationPreferenceInputSchema.safeParse({ user_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const { preference_id, hidden_tabs } = validationResult.data;
    const now = new Date().toISOString();

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO navigation_preferences (preference_id, user_id, hidden_tabs, updated_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [preference_id, user_id, hidden_tabs, now]
    );
    client.release();

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create navigation preferences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  GET /api/users/:user_id/navigation-preferences/:preference_id
  Retrieves specific navigation preferences by ID
*/
app.get('/api/users/:user_id/navigation-preferences/:preference_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, preference_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM navigation_preferences WHERE user_id = $1 AND preference_id = $2', [user_id, preference_id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Navigation preferences not found', null, 'PREFERENCES_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get navigation preferences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  PATCH /api/users/:user_id/navigation-preferences/:preference_id
  Updates specific navigation preferences
*/
app.patch('/api/users/:user_id/navigation-preferences/:preference_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, preference_id } = req.params;
    const validationResult = updateNavigationPreferenceInputSchema.safeParse({ preference_id, ...req.body });
    
    if (!validationResult.success) {
      return res.status(400).json(createErrorResponse('Invalid input data', validationResult.error, 'VALIDATION_ERROR'));
    }

    const updateData = validationResult.data;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'preference_id' && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date().toISOString());
    paramIndex++;

    updateValues.push(user_id, preference_id);

    const client = await pool.connect();
    const result = await client.query(
      `UPDATE navigation_preferences SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex} AND preference_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Navigation preferences not found', null, 'PREFERENCES_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update navigation preferences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  DELETE /api/users/:user_id/navigation-preferences/:preference_id
  Deletes specific navigation preferences
*/
app.delete('/api/users/:user_id/navigation-preferences/:preference_id', authenticateToken, async (req, res) => {
  try {
    const { user_id, preference_id } = req.params;

    const client = await pool.connect();
    const result = await client.query('DELETE FROM navigation_preferences WHERE user_id = $1 AND preference_id = $2', [user_id, preference_id]);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json(createErrorResponse('Navigation preferences not found', null, 'PREFERENCES_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete navigation preferences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA catch-all: serve index.html for non-API routes only
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});