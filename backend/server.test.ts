import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, pool } from './server.js'; // Adjust path as needed

// Mock data
const mockUser = {
  user_id: 'user_001',
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  tagline: 'Software Developer',
  bio_text: 'A passionate developer',
  header_image_url: 'https://example.com/header.jpg',
  avatar_url: 'https://example.com/avatar.jpg',
  video_embed_url: 'https://example.com/video',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockSkill = {
  skill_id: 'skill_001',
  user_id: 'user_001',
  name: 'JavaScript',
  category: 'Frontend',
  proficiency_level: 'Expert',
  icon_url: 'https://example.com/icon.png',
  description: 'Programming language',
  display_order: 1
};

const mockProject = {
  project_id: 'proj_001',
  user_id: 'user_001',
  title: 'Test Project',
  short_description: 'A test project',
  description: 'Detailed description',
  thumbnail_url: 'https://example.com/thumb.png',
  project_url: 'https://example.com/project',
  source_code_url: 'https://github.com/example/project',
  tech_stack: 'React, Node.js',
  display_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockExperience = {
  experience_id: 'exp_001',
  user_id: 'user_001',
  role_title: 'Developer',
  company_name: 'Test Company',
  company_logo_url: 'https://example.com/logo.png',
  start_date: '2020-01-01',
  end_date: '2022-01-01',
  is_current: false,
  location: 'New York',
  description: 'Worked on various projects',
  display_order: 1
};

// JWT Secret (should match server configuration)
const JWT_SECRET = 'test_secret';

describe('Portfolio API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create a test user and get auth token
    userId = mockUser.user_id;
    authToken = jwt.sign({ user_id: userId }, JWT_SECRET);
  });

  afterAll(async () => {
    // Clean up database connections
    await pool.end();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        })
        .expect(201);

      expect(response.body.user).toHaveProperty('user_id');
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body).toHaveProperty('token');
    });

    it('should not register a user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Duplicate User'
        })
        .expect(201);

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Duplicate User 2'
        })
        .expect(409);
    });

    it('should login an existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('user_id');
      expect(response.body.user.email).toBe('john.doe@example.com');
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should not login with non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
    });
  });

  describe('User Profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.user_id).toBe(userId);
      expect(response.body.user.email).toBe('john.doe@example.com');
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          tagline: 'Updated Tagline'
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.tagline).toBe('Updated Tagline');
    });

    it('should not update user profile without authentication', async () => {
      await request(app)
        .patch(`/api/users/${userId}`)
        .send({
          name: 'Unauthorized Update'
        })
        .expect(401);
    });
  });

  describe('Skills Management', () => {
    it('should create a new skill', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/skills`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockSkill)
        .expect(201);

      expect(response.body.skill_id).toBe(mockSkill.skill_id);
      expect(response.body.name).toBe(mockSkill.name);
    });

    it('should get all skills for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/skills`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should get a specific skill', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/skills/${mockSkill.skill_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.skill_id).toBe(mockSkill.skill_id);
      expect(response.body.name).toBe(mockSkill.name);
    });

    it('should update a skill', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/skills/${mockSkill.skill_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated JavaScript',
          proficiency_level: 'Master'
        })
        .expect(200);

      expect(response.body.name).toBe('Updated JavaScript');
      expect(response.body.proficiency_level).toBe('Master');
    });

    it('should delete a skill', async () => {
      await request(app)
        .delete(`/api/users/${userId}/skills/${mockSkill.skill_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Projects Management', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/projects`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockProject)
        .expect(201);

      expect(response.body.project_id).toBe(mockProject.project_id);
      expect(response.body.title).toBe(mockProject.title);
    });

    it('should get all projects for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/projects`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should get a specific project', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/projects/${mockProject.project_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.project_id).toBe(mockProject.project_id);
      expect(response.body.title).toBe(mockProject.title);
    });

    it('should update a project', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/projects/${mockProject.project_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Project Title',
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Project Title');
      expect(response.body.description).toBe('Updated description');
    });

    it('should delete a project', async () => {
      await request(app)
        .delete(`/api/users/${userId}/projects/${mockProject.project_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Experiences Management', () => {
    it('should create a new experience', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/experiences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockExperience)
        .expect(201);

      expect(response.body.experience_id).toBe(mockExperience.experience_id);
      expect(response.body.role_title).toBe(mockExperience.role_title);
    });

    it('should get all experiences for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/experiences`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update an experience', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/experiences/${mockExperience.experience_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role_title: 'Senior Developer',
          location: 'San Francisco'
        })
        .expect(200);

      expect(response.body.role_title).toBe('Senior Developer');
      expect(response.body.location).toBe('San Francisco');
    });

    it('should delete an experience', async () => {
      await request(app)
        .delete(`/api/users/${userId}/experiences/${mockExperience.experience_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Education Management', () => {
    const mockEducation = {
      education_id: 'edu_001',
      user_id: 'user_001',
      institution_name: 'Test University',
      degree: 'Computer Science',
      institution_logo_url: 'https://example.com/logo.png',
      start_date: '2016-09-01',
      end_date: '2020-06-15',
      is_current: false,
      location: 'Stanford, CA',
      description: 'Specialized in AI',
      display_order: 1
    };

    it('should create a new education entry', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/education`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockEducation)
        .expect(201);

      expect(response.body.education_id).toBe(mockEducation.education_id);
      expect(response.body.institution_name).toBe(mockEducation.institution_name);
    });

    it('should get all education entries for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/education`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update an education entry', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/education/${mockEducation.education_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          degree: 'Master of Science',
          description: 'Specialized in Machine Learning'
        })
        .expect(200);

      expect(response.body.degree).toBe('Master of Science');
      expect(response.body.description).toBe('Specialized in Machine Learning');
    });

    it('should delete an education entry', async () => {
      await request(app)
        .delete(`/api/users/${userId}/education/${mockEducation.education_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Social Media Links', () => {
    const mockSocialLink = {
      link_id: 'link_001',
      user_id: 'user_001',
      platform: 'github',
      url: 'https://github.com/testuser',
      display_order: 1
    };

    it('should create a new social media link', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/social-media-links`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockSocialLink)
        .expect(201);

      expect(response.body.link_id).toBe(mockSocialLink.link_id);
      expect(response.body.platform).toBe(mockSocialLink.platform);
    });

    it('should get all social media links for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/social-media-links`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a social media link', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/social-media-links/${mockSocialLink.link_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://github.com/updateduser',
          platform: 'linkedin'
        })
        .expect(200);

      expect(response.body.url).toBe('https://github.com/updateduser');
      expect(response.body.platform).toBe('linkedin');
    });

    it('should delete a social media link', async () => {
      await request(app)
        .delete(`/api/users/${userId}/social-media-links/${mockSocialLink.link_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Key Facts', () => {
    const mockKeyFact = {
      fact_id: 'fact_001',
      user_id: 'user_001',
      content: '10+ years of experience',
      display_order: 1
    };

    it('should create a new key fact', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/key-facts`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockKeyFact)
        .expect(201);

      expect(response.body.fact_id).toBe(mockKeyFact.fact_id);
      expect(response.body.content).toBe(mockKeyFact.content);
    });

    it('should get all key facts for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/key-facts`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a key fact', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/key-facts/${mockKeyFact.fact_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '15+ years of experience'
        })
        .expect(200);

      expect(response.body.content).toBe('15+ years of experience');
    });

    it('should delete a key fact', async () => {
      await request(app)
        .delete(`/api/users/${userId}/key-facts/${mockKeyFact.fact_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Resume Downloads', () => {
    const mockResumeDownload = {
      download_id: 'res_001',
      user_id: 'user_001',
      file_format: 'PDF',
      download_url: 'https://example.com/resume.pdf',
      created_at: new Date().toISOString()
    };

    it('should create a new resume download record', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/resume-downloads`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockResumeDownload)
        .expect(201);

      expect(response.body.download_id).toBe(mockResumeDownload.download_id);
      expect(response.body.file_format).toBe(mockResumeDownload.file_format);
    });

    it('should get all resume downloads for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/resume-downloads`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete a resume download record', async () => {
      await request(app)
        .delete(`/api/users/${userId}/resume-downloads/${mockResumeDownload.download_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Contact Messages', () => {
    const mockContactMessage = {
      message_id: 'msg_001',
      user_id: 'user_001',
      sender_name: 'John Smith',
      sender_email: 'john@example.com',
      sender_phone: '+1234567890',
      message_content: 'Hello, I am interested in your services',
      sent_at: new Date().toISOString(),
      status: 'pending'
    };

    it('should create a new contact message', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/contact-messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockContactMessage)
        .expect(201);

      expect(response.body.message_id).toBe(mockContactMessage.message_id);
      expect(response.body.sender_name).toBe(mockContactMessage.sender_name);
    });

    it('should get all contact messages for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/contact-messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a contact message', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/contact-messages/${mockContactMessage.message_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'read'
        })
        .expect(200);

      expect(response.body.status).toBe('read');
    });

    it('should delete a contact message', async () => {
      await request(app)
        .delete(`/api/users/${userId}/contact-messages/${mockContactMessage.message_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('App Settings', () => {
    const mockAppSetting = {
      setting_id: 'sett_001',
      user_id: 'user_001',
      theme_mode: 'dark',
      font_scale: 1.2,
      hidden_sections: '["education"]',
      updated_at: new Date().toISOString()
    };

    it('should create new app settings', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/app-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockAppSetting)
        .expect(201);

      expect(response.body.setting_id).toBe(mockAppSetting.setting_id);
      expect(response.body.theme_mode).toBe(mockAppSetting.theme_mode);
    });

    it('should get all app settings for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/app-settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update app settings', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/app-settings/${mockAppSetting.setting_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          theme_mode: 'light',
          font_scale: 1.0
        })
        .expect(200);

      expect(response.body.theme_mode).toBe('light');
      expect(response.body.font_scale).toBe(1.0);
    });

    it('should delete app settings', async () => {
      await request(app)
        .delete(`/api/users/${userId}/app-settings/${mockAppSetting.setting_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Navigation Preferences', () => {
    const mockNavPreference = {
      preference_id: 'nav_001',
      user_id: 'user_001',
      hidden_tabs: '["contact"]',
      updated_at: new Date().toISOString()
    };

    it('should create new navigation preferences', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/navigation-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockNavPreference)
        .expect(201);

      expect(response.body.preference_id).toBe(mockNavPreference.preference_id);
      expect(response.body.hidden_tabs).toBe(mockNavPreference.hidden_tabs);
    });

    it('should get all navigation preferences for a user', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}/navigation-preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update navigation preferences', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}/navigation-preferences/${mockNavPreference.preference_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hidden_tabs: '["resume", "contact"]'
        })
        .expect(200);

      expect(response.body.hidden_tabs).toBe('["resume", "contact"]');
    });

    it('should delete navigation preferences', async () => {
      await request(app)
        .delete(`/api/users/${userId}/navigation-preferences/${mockNavPreference.preference_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for requests without authentication', async () => {
      await request(app)
        .get(`/api/users/${userId}`)
        .expect(401);
    });

    it('should return 404 for non-existent resources', async () => {
      await request(app)
        .get(`/api/users/${userId}/skills/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid input', async () => {
      await request(app)
        .post(`/api/users/${userId}/skills`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          name: 'Test Skill'
        })
        .expect(400);
    });
  });
});