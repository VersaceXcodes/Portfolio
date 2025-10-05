import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

// Import all Zod schemas for validation
import {
  userSchema, createUserInputSchema, updateUserInputSchema, searchUserInputSchema,
  skillSchema, createSkillInputSchema, updateSkillInputSchema, searchSkillInputSchema,
  projectSchema, createProjectInputSchema, updateProjectInputSchema, searchProjectInputSchema,
  projectImageSchema, createProjectImageInputSchema, updateProjectImageInputSchema, searchProjectImageInputSchema,
  experienceSchema, createExperienceInputSchema, updateExperienceInputSchema, searchExperienceInputSchema,
  educationSchema, createEducationInputSchema, updateEducationInputSchema, searchEducationInputSchema,
  certificationSchema, createCertificationInputSchema, updateCertificationInputSchema, searchCertificationInputSchema,
  blogPostSchema, createBlogPostInputSchema, updateBlogPostInputSchema, searchBlogPostInputSchema,
  contactMessageSchema, createContactMessageInputSchema, updateContactMessageInputSchema, searchContactMessageInputSchema,
  resumeDownloadSchema, createResumeDownloadInputSchema, updateResumeDownloadInputSchema, searchResumeDownloadInputSchema,
  siteSettingSchema, createSiteSettingInputSchema, updateSiteSettingInputSchema, searchSiteSettingInputSchema,
  testimonialSchema, createTestimonialInputSchema, updateTestimonialInputSchema, searchTestimonialInputSchema,
  socialMediaLinkSchema, createSocialMediaLinkInputSchema, updateSocialMediaLinkInputSchema, searchSocialMediaLinkInputSchema,
  pageVisitSchema, createPageVisitInputSchema, updatePageVisitInputSchema, searchPageVisitInputSchema,
  sectionVisitSchema, createSectionVisitInputSchema, updateSectionVisitInputSchema, searchSectionVisitInputSchema,
  mediaAssetSchema, createMediaAssetInputSchema, updateMediaAssetInputSchema, searchMediaAssetInputSchema
} from './schema.ts';

dotenv.config();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
Error response utility function to maintain consistent error formatting across all endpoints.
Creates standardized error responses with timestamps and optional error details for debugging.
*/
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

// Database connection setup exactly as specified
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

// Middleware setup
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/*
JWT Authentication middleware for protecting routes that require user authentication.
Validates bearer tokens and attaches user information to the request object.
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
    try {
      const result = await client.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
      
      if (result.rows.length === 0) {
        return res.status(401).json(createErrorResponse('Invalid token', null, 'AUTH_USER_NOT_FOUND'));
      }

      req.user = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

/*
User registration endpoint - creates a new user account with basic validation.
Stores password directly without hashing for development ease.
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    const validatedData = createUserInputSchema.parse(req.body);
    const { email, password_hash: password, name } = validatedData;

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
      }

      // Create new user
      const user_id = uuidv4();
      const now = new Date().toISOString();
      
      const result = await client.query(
        `INSERT INTO users (user_id, email, password_hash, name, professional_title, tagline, bio, 
         profile_image_url, phone_number, location, github_url, linkedin_url, twitter_url, website_url, 
         created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
         RETURNING user_id, email, name, professional_title, tagline, bio, profile_image_url, phone_number, 
         location, github_url, linkedin_url, twitter_url, website_url, created_at, updated_at`,
        [user_id, email.toLowerCase().trim(), password, name.trim(), 
         validatedData.professional_title, validatedData.tagline, validatedData.bio, 
         validatedData.profile_image_url, validatedData.phone_number, validatedData.location,
         validatedData.github_url, validatedData.linkedin_url, validatedData.twitter_url, 
         validatedData.website_url, now, now]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user,
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
User login endpoint - authenticates users and returns JWT token.
Uses direct password comparison without hashing for development.
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_REQUIRED_FIELDS'));
    }

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (result.rows.length === 0) {
        return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
      }

      const user = result.rows[0];

      // Direct password comparison for development
      if (password !== user.password_hash) {
        return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password_hash, ...userResponse } = user;

      res.json({
        user: userResponse,
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Get user profile endpoint - retrieves user information by user_id.
Public endpoint for displaying portfolio information.
*/
app.get('/api/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT user_id, email, name, professional_title, tagline, bio, profile_image_url, phone_number, location, github_url, linkedin_url, twitter_url, website_url, created_at, updated_at FROM users WHERE user_id = $1', 
        [user_id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update user profile endpoint - allows authenticated users to update their profile information.
Validates input data and updates only provided fields.
*/
app.patch('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const validatedData = updateUserInputSchema.parse({ ...req.body, user_id });

    // Check if user is updating their own profile
    if (req.user.user_id !== user_id) {
      return res.status(403).json(createErrorResponse('Cannot update other user profiles', null, 'FORBIDDEN'));
    }

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'user_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(user_id);

      const updateQuery = `
        UPDATE users SET ${updateFields.join(', ')} 
        WHERE user_id = $${paramCounter + 1} 
        RETURNING user_id, email, name, professional_title, tagline, bio, profile_image_url, 
        phone_number, location, github_url, linkedin_url, twitter_url, website_url, created_at, updated_at
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search users endpoint - allows searching users with pagination and sorting.
Supports text search across name and email fields.
*/
app.get('/api/users', async (req, res) => {
  try {
    const validatedQuery = searchUserInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      let whereClause = '';
      let queryParams = [];
      let paramCounter = 1;

      if (query) {
        whereClause = `WHERE (name ILIKE $${paramCounter} OR email ILIKE $${paramCounter})`;
        queryParams.push(`%${query}%`);
        paramCounter++;
      }

      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT user_id, email, name, professional_title, tagline, bio, profile_image_url, 
        phone_number, location, github_url, linkedin_url, twitter_url, website_url, created_at, updated_at 
        FROM users ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        users: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search users error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create skill endpoint - allows authenticated users to add new skills to their portfolio.
Validates skill data and creates database entry with generated ID and timestamps.
*/
app.post('/api/skills', authenticateToken, async (req, res) => {
  try {
    const validatedData = createSkillInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const skill_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO skills (skill_id, user_id, category, name, proficiency_level, description, icon_name, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING skill_id, user_id, category, name, proficiency_level, description, icon_name, created_at, updated_at`,
        [skill_id, validatedData.user_id, validatedData.category, validatedData.name, 
         validatedData.proficiency_level, validatedData.description, validatedData.icon_name, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search skills endpoint - retrieves skills with filtering by user, category, and text search.
Supports pagination and sorting for better performance with large datasets.
*/
app.get('/api/skills', async (req, res) => {
  try {
    const validatedQuery = searchSkillInputSchema.parse(req.query);
    const { query, user_id, category, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (query) {
        whereClauses.push(`(name ILIKE $${paramCounter} OR description ILIKE $${paramCounter})`);
        queryParams.push(`%${query}%`);
        paramCounter++;
      }

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (category) {
        whereClauses.push(`category = $${paramCounter}`);
        queryParams.push(category);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM skills ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT skill_id, user_id, category, name, proficiency_level, description, icon_name, created_at, updated_at 
        FROM skills ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        skills: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search skills error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update skill endpoint - allows authenticated users to modify existing skills.
Validates input and updates only the provided fields.
*/
app.patch('/api/skills/:skill_id', authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;
    const validatedData = updateSkillInputSchema.parse({ ...req.body, skill_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'skill_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(skill_id);

      const updateQuery = `
        UPDATE skills SET ${updateFields.join(', ')} 
        WHERE skill_id = $${paramCounter + 1} 
        RETURNING skill_id, user_id, category, name, proficiency_level, description, icon_name, created_at, updated_at
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Skill not found', null, 'SKILL_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete skill endpoint - removes a skill from the database.
Only authenticated users can delete their own skills.
*/
app.delete('/api/skills/:skill_id', authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM skills WHERE skill_id = $1', [skill_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Skill not found', null, 'SKILL_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create project endpoint - allows authenticated users to add new projects to their portfolio.
Validates project data and creates comprehensive project entries.
*/
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const validatedData = createProjectInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const project_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO projects (project_id, user_id, title, description, project_type, role_in_project, 
         problem_statement, solution_approach, technical_challenges, technologies_used, live_demo_url, 
         github_repo_url, app_store_url, play_store_url, case_study_url, is_featured, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
         RETURNING *`,
        [project_id, validatedData.user_id, validatedData.title, validatedData.description, 
         validatedData.project_type, validatedData.role_in_project, validatedData.problem_statement,
         validatedData.solution_approach, validatedData.technical_challenges, validatedData.technologies_used,
         validatedData.live_demo_url, validatedData.github_repo_url, validatedData.app_store_url,
         validatedData.play_store_url, validatedData.case_study_url, validatedData.is_featured,
         validatedData.status, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search projects endpoint - retrieves projects with comprehensive filtering and search capabilities.
Supports filtering by user, featured status, project status, and text search across title and description.
*/
app.get('/api/projects', async (req, res) => {
  try {
    const validatedQuery = searchProjectInputSchema.parse(req.query);
    const { query, user_id, is_featured, status, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (query) {
        whereClauses.push(`(title ILIKE $${paramCounter} OR description ILIKE $${paramCounter})`);
        queryParams.push(`%${query}%`);
        paramCounter++;
      }

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (is_featured !== undefined) {
        whereClauses.push(`is_featured = $${paramCounter}`);
        queryParams.push(is_featured);
        paramCounter++;
      }

      if (status) {
        whereClauses.push(`status = $${paramCounter}`);
        queryParams.push(status);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM projects ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM projects ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        projects: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search projects error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Get single project endpoint - retrieves detailed information for a specific project.
Public endpoint for displaying project details in portfolios.
*/
app.get('/api/projects/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM projects WHERE project_id = $1', [project_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update project endpoint - allows authenticated users to modify existing projects.
Comprehensive update functionality for all project fields.
*/
app.patch('/api/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const validatedData = updateProjectInputSchema.parse({ ...req.body, project_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'project_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(project_id);

      const updateQuery = `
        UPDATE projects SET ${updateFields.join(', ')} 
        WHERE project_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete project endpoint - removes a project and its associated images from the database.
Cascading delete to maintain data integrity.
*/
app.delete('/api/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;

    const client = await pool.connect();
    try {
      // Delete project images first (foreign key constraint)
      await client.query('DELETE FROM project_images WHERE project_id = $1', [project_id]);
      
      // Delete the project
      const result = await client.query('DELETE FROM projects WHERE project_id = $1', [project_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create project image endpoint - adds images to existing projects.
Supports multiple images per project with display ordering.
*/
app.post('/api/projects/:project_id/images', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const validatedData = createProjectImageInputSchema.parse({ ...req.body, project_id });

    const client = await pool.connect();
    try {
      // Verify project exists
      const projectCheck = await client.query('SELECT project_id FROM projects WHERE project_id = $1', [project_id]);
      if (projectCheck.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      const image_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO project_images (image_id, project_id, image_url, alt_text, caption, display_order, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [image_id, project_id, validatedData.image_url, validatedData.alt_text, 
         validatedData.caption, validatedData.display_order, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create project image error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Get project images endpoint - retrieves all images associated with a specific project.
Supports sorting by display order for proper image carousel functionality.
*/
app.get('/api/projects/:project_id/images', async (req, res) => {
  try {
    const { project_id } = req.params;
    const validatedQuery = searchProjectImageInputSchema.parse({ ...req.query, project_id });
    const { limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const countQuery = `SELECT COUNT(*) FROM project_images WHERE project_id = $1`;
      const countResult = await client.query(countQuery, [project_id]);
      const total = parseInt(countResult.rows[0].count);

      const selectQuery = `
        SELECT * FROM project_images 
        WHERE project_id = $1 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(selectQuery, [project_id, limit, offset]);

      res.json({
        images: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Get project images error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update project image endpoint - modifies existing project images.
Allows updating image URLs, alt text, captions, and display order.
*/
app.patch('/api/project-images/:image_id', authenticateToken, async (req, res) => {
  try {
    const { image_id } = req.params;
    const validatedData = updateProjectImageInputSchema.parse({ ...req.body, image_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'image_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(image_id);

      const updateQuery = `
        UPDATE project_images SET ${updateFields.join(', ')} 
        WHERE image_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project image not found', null, 'PROJECT_IMAGE_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update project image error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete project image endpoint - removes individual images from projects.
Maintains project integrity while allowing image management.
*/
app.delete('/api/project-images/:image_id', authenticateToken, async (req, res) => {
  try {
    const { image_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM project_images WHERE image_id = $1', [image_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Project image not found', null, 'PROJECT_IMAGE_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete project image error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create experience endpoint - adds professional experience entries to user portfolios.
Comprehensive work history management with company details and achievements.
*/
app.post('/api/experiences', authenticateToken, async (req, res) => {
  try {
    const validatedData = createExperienceInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const experience_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO experiences (experience_id, user_id, company_name, company_logo_url, job_title, 
         start_date, end_date, is_current, location, description, technologies_used, achievements, 
         company_website_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
         RETURNING *`,
        [experience_id, validatedData.user_id, validatedData.company_name, validatedData.company_logo_url,
         validatedData.job_title, validatedData.start_date, validatedData.end_date, validatedData.is_current,
         validatedData.location, validatedData.description, validatedData.technologies_used,
         validatedData.achievements, validatedData.company_website_url, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search experiences endpoint - retrieves professional experience with filtering capabilities.
Supports filtering by user, company, and current employment status.
*/
app.get('/api/experiences', async (req, res) => {
  try {
    const validatedQuery = searchExperienceInputSchema.parse(req.query);
    const { user_id, company_name, is_current, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (company_name) {
        whereClauses.push(`company_name ILIKE $${paramCounter}`);
        queryParams.push(`%${company_name}%`);
        paramCounter++;
      }

      if (is_current !== undefined) {
        whereClauses.push(`is_current = $${paramCounter}`);
        queryParams.push(is_current);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM experiences ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM experiences ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        experiences: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search experiences error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update experience endpoint - modifies existing experience entries.
Allows comprehensive updates to work history information.
*/
app.patch('/api/experiences/:experience_id', authenticateToken, async (req, res) => {
  try {
    const { experience_id } = req.params;
    const validatedData = updateExperienceInputSchema.parse({ ...req.body, experience_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'experience_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(experience_id);

      const updateQuery = `
        UPDATE experiences SET ${updateFields.join(', ')} 
        WHERE experience_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Experience not found', null, 'EXPERIENCE_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete experience endpoint - removes work experience entries.
Maintains portfolio integrity while allowing experience management.
*/
app.delete('/api/experiences/:experience_id', authenticateToken, async (req, res) => {
  try {
    const { experience_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM experiences WHERE experience_id = $1', [experience_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Experience not found', null, 'EXPERIENCE_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create education endpoint - adds educational background to user portfolios.
Comprehensive academic history management with institution details.
*/
app.post('/api/educations', authenticateToken, async (req, res) => {
  try {
    const validatedData = createEducationInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const education_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO educations (education_id, user_id, institution_name, degree, field_of_study, 
         start_date, end_date, grade, description, institution_website_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [education_id, validatedData.user_id, validatedData.institution_name, validatedData.degree,
         validatedData.field_of_study, validatedData.start_date, validatedData.end_date,
         validatedData.grade, validatedData.description, validatedData.institution_website_url, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search educations endpoint - retrieves educational background with filtering.
Supports searching by user, institution, and degree type.
*/
app.get('/api/educations', async (req, res) => {
  try {
    const validatedQuery = searchEducationInputSchema.parse(req.query);
    const { user_id, institution_name, degree, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (institution_name) {
        whereClauses.push(`institution_name ILIKE $${paramCounter}`);
        queryParams.push(`%${institution_name}%`);
        paramCounter++;
      }

      if (degree) {
        whereClauses.push(`degree ILIKE $${paramCounter}`);
        queryParams.push(`%${degree}%`);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM educations ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM educations ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        educations: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search educations error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update education endpoint - modifies existing education entries.
Comprehensive academic history update functionality.
*/
app.patch('/api/educations/:education_id', authenticateToken, async (req, res) => {
  try {
    const { education_id } = req.params;
    const validatedData = updateEducationInputSchema.parse({ ...req.body, education_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'education_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(education_id);

      const updateQuery = `
        UPDATE educations SET ${updateFields.join(', ')} 
        WHERE education_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Education not found', null, 'EDUCATION_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete education endpoint - removes educational entries from portfolios.
Maintains data integrity while allowing education management.
*/
app.delete('/api/educations/:education_id', authenticateToken, async (req, res) => {
  try {
    const { education_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM educations WHERE education_id = $1', [education_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Education not found', null, 'EDUCATION_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create certification endpoint - adds professional certifications to portfolios.
Comprehensive certification management with expiration tracking.
*/
app.post('/api/certifications', authenticateToken, async (req, res) => {
  try {
    const validatedData = createCertificationInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const certification_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO certifications (certification_id, user_id, name, issuing_organization, 
         issue_date, expiration_date, credential_id, credential_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [certification_id, validatedData.user_id, validatedData.name, validatedData.issuing_organization,
         validatedData.issue_date, validatedData.expiration_date, validatedData.credential_id,
         validatedData.credential_url, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create certification error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search certifications endpoint - retrieves certifications with expiration filtering.
Supports filtering by user, issuing organization, and expiration status.
*/
app.get('/api/certifications', async (req, res) => {
  try {
    const validatedQuery = searchCertificationInputSchema.parse(req.query);
    const { user_id, issuing_organization, has_expired, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (issuing_organization) {
        whereClauses.push(`issuing_organization ILIKE $${paramCounter}`);
        queryParams.push(`%${issuing_organization}%`);
        paramCounter++;
      }

      if (has_expired !== undefined) {
        if (has_expired) {
          whereClauses.push(`expiration_date IS NOT NULL AND expiration_date < NOW()`);
        } else {
          whereClauses.push(`(expiration_date IS NULL OR expiration_date >= NOW())`);
        }
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM certifications ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM certifications ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        certifications: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search certifications error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update certification endpoint - modifies existing certification entries.
Allows updating all certification details including expiration dates.
*/
app.patch('/api/certifications/:certification_id', authenticateToken, async (req, res) => {
  try {
    const { certification_id } = req.params;
    const validatedData = updateCertificationInputSchema.parse({ ...req.body, certification_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'certification_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(certification_id);

      const updateQuery = `
        UPDATE certifications SET ${updateFields.join(', ')} 
        WHERE certification_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Certification not found', null, 'CERTIFICATION_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update certification error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete certification endpoint - removes certification entries from portfolios.
Maintains portfolio integrity while allowing certification management.
*/
app.delete('/api/certifications/:certification_id', authenticateToken, async (req, res) => {
  try {
    const { certification_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM certifications WHERE certification_id = $1', [certification_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Certification not found', null, 'CERTIFICATION_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create blog post endpoint - adds blog posts to user portfolios.
Comprehensive content management with SEO metadata and publishing controls.
*/
app.post('/api/blog-posts', authenticateToken, async (req, res) => {
  try {
    const validatedData = createBlogPostInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const post_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO blog_posts (post_id, user_id, title, slug, excerpt, content, published_at, 
         is_published, read_time_minutes, tags, meta_title, meta_description, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [post_id, validatedData.user_id, validatedData.title, validatedData.slug, validatedData.excerpt,
         validatedData.content, validatedData.published_at, validatedData.is_published,
         validatedData.read_time_minutes, validatedData.tags, validatedData.meta_title,
         validatedData.meta_description, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search blog posts endpoint - retrieves blog posts with comprehensive filtering.
Supports content search, publication status filtering, and tag-based filtering.
*/
app.get('/api/blog-posts', async (req, res) => {
  try {
    const validatedQuery = searchBlogPostInputSchema.parse(req.query);
    const { query, user_id, is_published, tags, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (query) {
        whereClauses.push(`(title ILIKE $${paramCounter} OR content ILIKE $${paramCounter} OR excerpt ILIKE $${paramCounter})`);
        queryParams.push(`%${query}%`);
        paramCounter++;
      }

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (is_published !== undefined) {
        whereClauses.push(`is_published = $${paramCounter}`);
        queryParams.push(is_published);
        paramCounter++;
      }

      if (tags) {
        whereClauses.push(`tags ILIKE $${paramCounter}`);
        queryParams.push(`%${tags}%`);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM blog_posts ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM blog_posts ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        posts: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search blog posts error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Get single blog post endpoint - retrieves detailed information for a specific blog post.
Public endpoint for displaying blog content in portfolios.
*/
app.get('/api/blog-posts/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM blog_posts WHERE post_id = $1', [post_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update blog post endpoint - modifies existing blog posts.
Comprehensive content management with publication controls.
*/
app.patch('/api/blog-posts/:post_id', authenticateToken, async (req, res) => {
  try {
    const { post_id } = req.params;
    const validatedData = updateBlogPostInputSchema.parse({ ...req.body, post_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'post_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(post_id);

      const updateQuery = `
        UPDATE blog_posts SET ${updateFields.join(', ')} 
        WHERE post_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete blog post endpoint - removes blog posts from portfolios.
Maintains content integrity while allowing blog management.
*/
app.delete('/api/blog-posts/:post_id', authenticateToken, async (req, res) => {
  try {
    const { post_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM blog_posts WHERE post_id = $1', [post_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create contact message endpoint - handles contact form submissions from visitors.
Public endpoint with visitor tracking and spam protection considerations.
*/
app.post('/api/contact-messages', async (req, res) => {
  try {
    const visitorIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const validatedData = createContactMessageInputSchema.parse({
      ...req.body,
      ip_address: visitorIP,
      user_agent: userAgent
    });

    const client = await pool.connect();
    try {
      const message_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO contact_messages (message_id, name, email, subject, message, ip_address, user_agent, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [message_id, validatedData.name, validatedData.email, validatedData.subject, 
         validatedData.message, validatedData.ip_address, validatedData.user_agent, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search contact messages endpoint - retrieves contact messages for portfolio owners.
Protected endpoint for managing incoming contact form submissions.
*/
app.get('/api/contact-messages', authenticateToken, async (req, res) => {
  try {
    const validatedQuery = searchContactMessageInputSchema.parse(req.query);
    const { query, email, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (query) {
        whereClauses.push(`(name ILIKE $${paramCounter} OR message ILIKE $${paramCounter})`);
        queryParams.push(`%${query}%`);
        paramCounter++;
      }

      if (email) {
        whereClauses.push(`email ILIKE $${paramCounter}`);
        queryParams.push(`%${email}%`);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM contact_messages ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM contact_messages ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        messages: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search contact messages error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update contact message endpoint - allows modifying contact message status or notes.
Administrative function for managing contact form submissions.
*/
app.patch('/api/contact-messages/:message_id', authenticateToken, async (req, res) => {
  try {
    const { message_id } = req.params;
    const validatedData = updateContactMessageInputSchema.parse({ ...req.body, message_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'message_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(message_id);

      const updateQuery = `
        UPDATE contact_messages SET ${updateFields.join(', ')} 
        WHERE message_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Contact message not found', null, 'CONTACT_MESSAGE_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete contact message endpoint - removes contact messages from the system.
Administrative function for contact form management.
*/
app.delete('/api/contact-messages/:message_id', authenticateToken, async (req, res) => {
  try {
    const { message_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM contact_messages WHERE message_id = $1', [message_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Contact message not found', null, 'CONTACT_MESSAGE_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create resume download endpoint - manages resume files for portfolios.
Allows portfolio owners to upload and manage downloadable resume files.
*/
app.post('/api/resume-downloads', authenticateToken, async (req, res) => {
  try {
    const validatedData = createResumeDownloadInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const download_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO resume_downloads (download_id, user_id, download_url, file_size_bytes, created_at) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [download_id, validatedData.user_id, validatedData.download_url, validatedData.file_size_bytes, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search resume downloads endpoint - retrieves available resume files.
Supports filtering by user for portfolio-specific resume management.
*/
app.get('/api/resume-downloads', async (req, res) => {
  try {
    const validatedQuery = searchResumeDownloadInputSchema.parse(req.query);
    const { user_id, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM resume_downloads ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM resume_downloads ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        downloads: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search resume downloads error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update resume download endpoint - modifies existing resume entries.
Allows updating resume URLs and file metadata.
*/
app.patch('/api/resume-downloads/:download_id', authenticateToken, async (req, res) => {
  try {
    const { download_id } = req.params;
    const validatedData = updateResumeDownloadInputSchema.parse({ ...req.body, download_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'download_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(download_id);

      const updateQuery = `
        UPDATE resume_downloads SET ${updateFields.join(', ')} 
        WHERE download_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Resume download not found', null, 'RESUME_DOWNLOAD_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete resume download endpoint - removes resume entries from portfolios.
Allows portfolio owners to manage their downloadable resumes.
*/
app.delete('/api/resume-downloads/:download_id', authenticateToken, async (req, res) => {
  try {
    const { download_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM resume_downloads WHERE download_id = $1', [download_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Resume download not found', null, 'RESUME_DOWNLOAD_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete resume download error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create site settings endpoint - manages portfolio website configuration.
Comprehensive settings management for SEO, legal content, and analytics.
*/
app.post('/api/site-settings', authenticateToken, async (req, res) => {
  try {
    const validatedData = createSiteSettingInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const setting_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO site_settings (setting_id, user_id, privacy_policy_content, terms_of_service_content, 
         cookie_policy_content, seo_meta_title, seo_meta_description, google_analytics_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [setting_id, validatedData.user_id, validatedData.privacy_policy_content, validatedData.terms_of_service_content,
         validatedData.cookie_policy_content, validatedData.seo_meta_title, validatedData.seo_meta_description,
         validatedData.google_analytics_id, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create site settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search site settings endpoint - retrieves website configuration settings.
Supports filtering by user for multi-user portfolio platforms.
*/
app.get('/api/site-settings', async (req, res) => {
  try {
    const validatedQuery = searchSiteSettingInputSchema.parse(req.query);
    const { user_id, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM site_settings ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM site_settings ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        settings: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search site settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update site settings endpoint - modifies website configuration.
Comprehensive settings update for portfolio customization.
*/
app.patch('/api/site-settings/:setting_id', authenticateToken, async (req, res) => {
  try {
    const { setting_id } = req.params;
    const validatedData = updateSiteSettingInputSchema.parse({ ...req.body, setting_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'setting_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(setting_id);

      const updateQuery = `
        UPDATE site_settings SET ${updateFields.join(', ')} 
        WHERE setting_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Site settings not found', null, 'SITE_SETTINGS_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update site settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete site settings endpoint - removes website configuration.
Administrative function for settings management.
*/
app.delete('/api/site-settings/:setting_id', authenticateToken, async (req, res) => {
  try {
    const { setting_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM site_settings WHERE setting_id = $1', [setting_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Site settings not found', null, 'SITE_SETTINGS_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete site settings error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create testimonial endpoint - adds client testimonials to portfolios.
Comprehensive testimonial management with ratings and project references.
*/
app.post('/api/testimonials', authenticateToken, async (req, res) => {
  try {
    const validatedData = createTestimonialInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const testimonial_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO testimonials (testimonial_id, user_id, client_name, client_position, company_name, 
         content, rating, client_photo_url, project_reference, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [testimonial_id, validatedData.user_id, validatedData.client_name, validatedData.client_position,
         validatedData.company_name, validatedData.content, validatedData.rating, validatedData.client_photo_url,
         validatedData.project_reference, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search testimonials endpoint - retrieves client testimonials with filtering.
Supports filtering by user, project, company, and rating for social proof management.
*/
app.get('/api/testimonials', async (req, res) => {
  try {
    const validatedQuery = searchTestimonialInputSchema.parse(req.query);
    const { user_id, project_reference, company_name, min_rating, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (project_reference) {
        whereClauses.push(`project_reference = $${paramCounter}`);
        queryParams.push(project_reference);
        paramCounter++;
      }

      if (company_name) {
        whereClauses.push(`company_name ILIKE $${paramCounter}`);
        queryParams.push(`%${company_name}%`);
        paramCounter++;
      }

      if (min_rating) {
        whereClauses.push(`rating >= $${paramCounter}`);
        queryParams.push(min_rating);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM testimonials ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM testimonials ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        testimonials: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search testimonials error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update testimonial endpoint - modifies existing testimonial entries.
Comprehensive testimonial management for social proof optimization.
*/
app.patch('/api/testimonials/:testimonial_id', authenticateToken, async (req, res) => {
  try {
    const { testimonial_id } = req.params;
    const validatedData = updateTestimonialInputSchema.parse({ ...req.body, testimonial_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'testimonial_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(testimonial_id);

      const updateQuery = `
        UPDATE testimonials SET ${updateFields.join(', ')} 
        WHERE testimonial_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Testimonial not found', null, 'TESTIMONIAL_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete testimonial endpoint - removes testimonial entries from portfolios.
Maintains social proof integrity while allowing testimonial management.
*/
app.delete('/api/testimonials/:testimonial_id', authenticateToken, async (req, res) => {
  try {
    const { testimonial_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM testimonials WHERE testimonial_id = $1', [testimonial_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Testimonial not found', null, 'TESTIMONIAL_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create social media link endpoint - manages social media presence in portfolios.
Supports multiple platforms with display ordering for consistent presentation.
*/
app.post('/api/social-media-links', authenticateToken, async (req, res) => {
  try {
    const validatedData = createSocialMediaLinkInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const link_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO social_media_links (link_id, user_id, platform, url, display_order, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [link_id, validatedData.user_id, validatedData.platform, validatedData.url, 
         validatedData.display_order, now, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search social media links endpoint - retrieves social media links with platform filtering.
Supports ordering for consistent social media presentation in portfolios.
*/
app.get('/api/social-media-links', async (req, res) => {
  try {
    const validatedQuery = searchSocialMediaLinkInputSchema.parse(req.query);
    const { user_id, platform, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (platform) {
        whereClauses.push(`platform = $${paramCounter}`);
        queryParams.push(platform);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM social_media_links ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM social_media_links ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        links: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search social media links error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update social media link endpoint - modifies existing social media links.
Allows updating URLs, platforms, and display ordering.
*/
app.patch('/api/social-media-links/:link_id', authenticateToken, async (req, res) => {
  try {
    const { link_id } = req.params;
    const validatedData = updateSocialMediaLinkInputSchema.parse({ ...req.body, link_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'link_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      updateFields.push(`updated_at = $${paramCounter}`);
      values.push(new Date().toISOString());
      values.push(link_id);

      const updateQuery = `
        UPDATE social_media_links SET ${updateFields.join(', ')} 
        WHERE link_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Social media link not found', null, 'SOCIAL_MEDIA_LINK_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete social media link endpoint - removes social media links from portfolios.
Maintains social media presence integrity while allowing link management.
*/
app.delete('/api/social-media-links/:link_id', authenticateToken, async (req, res) => {
  try {
    const { link_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM social_media_links WHERE link_id = $1', [link_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Social media link not found', null, 'SOCIAL_MEDIA_LINK_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete social media link error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create page visit endpoint - tracks visitor analytics for portfolio pages.
Public endpoint for recording page visits with visitor metadata.
*/
app.post('/api/page-visits', async (req, res) => {
  try {
    const visitorIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'];
    
    const validatedData = createPageVisitInputSchema.parse({
      ...req.body,
      ip_address: visitorIP,
      user_agent: userAgent,
      referrer: referrer
    });

    const client = await pool.connect();
    try {
      const visit_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO page_visits (visit_id, user_id, page_path, ip_address, user_agent, referrer, visited_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [visit_id, validatedData.user_id, validatedData.page_path, validatedData.ip_address, 
         validatedData.user_agent, validatedData.referrer, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create page visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search page visits endpoint - retrieves analytics data for portfolio owners.
Protected endpoint with date filtering for analytics dashboards.
*/
app.get('/api/page-visits', authenticateToken, async (req, res) => {
  try {
    const validatedQuery = searchPageVisitInputSchema.parse(req.query);
    const { user_id, page_path, date_from, date_to, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (page_path) {
        whereClauses.push(`page_path = $${paramCounter}`);
        queryParams.push(page_path);
        paramCounter++;
      }

      if (date_from) {
        whereClauses.push(`visited_at >= $${paramCounter}`);
        queryParams.push(date_from);
        paramCounter++;
      }

      if (date_to) {
        whereClauses.push(`visited_at <= $${paramCounter}`);
        queryParams.push(date_to);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM page_visits ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM page_visits ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        visits: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search page visits error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update page visit endpoint - modifies existing page visit records.
Administrative function for analytics data management.
*/
app.patch('/api/page-visits/:visit_id', authenticateToken, async (req, res) => {
  try {
    const { visit_id } = req.params;
    const validatedData = updatePageVisitInputSchema.parse({ ...req.body, visit_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'visit_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(visit_id);

      const updateQuery = `
        UPDATE page_visits SET ${updateFields.join(', ')} 
        WHERE visit_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Page visit not found', null, 'PAGE_VISIT_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update page visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete page visit endpoint - removes analytics records.
Administrative function for data management and privacy compliance.
*/
app.delete('/api/page-visits/:visit_id', authenticateToken, async (req, res) => {
  try {
    const { visit_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM page_visits WHERE visit_id = $1', [visit_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Page visit not found', null, 'PAGE_VISIT_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete page visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create section visit endpoint - tracks specific section interactions within pages.
Public endpoint for detailed analytics on portfolio section engagement.
*/
app.post('/api/section-visits', async (req, res) => {
  try {
    const validatedData = createSectionVisitInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const section_visit_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO section_visits (section_visit_id, user_id, page_path, section_name, visit_count, last_visited_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [section_visit_id, validatedData.user_id, validatedData.page_path, validatedData.section_name, 
         validatedData.visit_count, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create section visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search section visits endpoint - retrieves section-level analytics data.
Protected endpoint for detailed engagement analysis.
*/
app.get('/api/section-visits', authenticateToken, async (req, res) => {
  try {
    const validatedQuery = searchSectionVisitInputSchema.parse(req.query);
    const { user_id, page_path, section_name, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (page_path) {
        whereClauses.push(`page_path = $${paramCounter}`);
        queryParams.push(page_path);
        paramCounter++;
      }

      if (section_name) {
        whereClauses.push(`section_name = $${paramCounter}`);
        queryParams.push(section_name);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM section_visits ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM section_visits ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        visits: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search section visits error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update section visit endpoint - modifies section visit analytics.
Allows updating visit counts and timestamps for accurate analytics.
*/
app.patch('/api/section-visits/:section_visit_id', authenticateToken, async (req, res) => {
  try {
    const { section_visit_id } = req.params;
    const validatedData = updateSectionVisitInputSchema.parse({ ...req.body, section_visit_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'section_visit_id' && value !== undefined) {
          if (key === 'visit_count') {
            updateFields.push(`${key} = $${paramCounter}`);
            updateFields.push(`last_visited_at = $${paramCounter + 1}`);
            values.push(value);
            values.push(new Date().toISOString());
            paramCounter += 2;
          } else {
            updateFields.push(`${key} = $${paramCounter}`);
            values.push(value);
            paramCounter++;
          }
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(section_visit_id);

      const updateQuery = `
        UPDATE section_visits SET ${updateFields.join(', ')} 
        WHERE section_visit_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Section visit not found', null, 'SECTION_VISIT_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update section visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete section visit endpoint - removes section analytics records.
Administrative function for analytics data management.
*/
app.delete('/api/section-visits/:section_visit_id', authenticateToken, async (req, res) => {
  try {
    const { section_visit_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM section_visits WHERE section_visit_id = $1', [section_visit_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Section visit not found', null, 'SECTION_VISIT_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete section visit error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Create media asset endpoint - manages file uploads and media assets for portfolios.
Comprehensive media management with metadata tracking.
*/
app.post('/api/media-assets', authenticateToken, async (req, res) => {
  try {
    const validatedData = createMediaAssetInputSchema.parse(req.body);

    const client = await pool.connect();
    try {
      const asset_id = uuidv4();
      const now = new Date().toISOString();

      const result = await client.query(
        `INSERT INTO media_assets (asset_id, user_id, filename, url, content_type, file_size_bytes, alt_text, uploaded_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [asset_id, validatedData.user_id, validatedData.filename, validatedData.url, validatedData.content_type,
         validatedData.file_size_bytes, validatedData.alt_text, now]
      );

      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Create media asset error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Search media assets endpoint - retrieves uploaded media files with filtering.
Supports filtering by user, content type, and filename for media library management.
*/
app.get('/api/media-assets', async (req, res) => {
  try {
    const validatedQuery = searchMediaAssetInputSchema.parse(req.query);
    const { user_id, content_type, filename, limit, offset, sort_by, sort_order } = validatedQuery;

    const client = await pool.connect();
    try {
      const whereClauses = [];
      const queryParams = [];
      let paramCounter = 1;

      if (user_id) {
        whereClauses.push(`user_id = $${paramCounter}`);
        queryParams.push(user_id);
        paramCounter++;
      }

      if (content_type) {
        whereClauses.push(`content_type = $${paramCounter}`);
        queryParams.push(content_type);
        paramCounter++;
      }

      if (filename) {
        whereClauses.push(`filename ILIKE $${paramCounter}`);
        queryParams.push(`%${filename}%`);
        paramCounter++;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM media_assets ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      queryParams.push(limit, offset);
      const selectQuery = `
        SELECT * FROM media_assets ${whereClause} 
        ORDER BY ${sort_by} ${sort_order} 
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const result = await client.query(selectQuery, queryParams);

      res.json({
        assets: result.rows,
        total
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Search media assets error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Update media asset endpoint - modifies existing media asset metadata.
Allows updating filenames, URLs, alt text, and other media properties.
*/
app.patch('/api/media-assets/:asset_id', authenticateToken, async (req, res) => {
  try {
    const { asset_id } = req.params;
    const validatedData = updateMediaAssetInputSchema.parse({ ...req.body, asset_id });

    const client = await pool.connect();
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCounter = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (key !== 'asset_id' && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          values.push(value);
          paramCounter++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      values.push(asset_id);

      const updateQuery = `
        UPDATE media_assets SET ${updateFields.join(', ')} 
        WHERE asset_id = $${paramCounter + 1} 
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Media asset not found', null, 'MEDIA_ASSET_NOT_FOUND'));
      }

      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Validation error', error.errors, 'VALIDATION_ERROR'));
    }
    console.error('Update media asset error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
Delete media asset endpoint - removes media files from portfolios.
Maintains media library integrity while allowing asset management.
*/
app.delete('/api/media-assets/:asset_id', authenticateToken, async (req, res) => {
  try {
    const { asset_id } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM media_assets WHERE asset_id = $1', [asset_id]);

      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse('Media asset not found', null, 'MEDIA_ASSET_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete media asset error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create storage directory if it doesn't exist
const storageDir = path.join(__dirname, 'storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// SPA catch-all: serve index.html for non-API routes only
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});