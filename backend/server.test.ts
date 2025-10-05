import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, pool } from './server.ts';
import { 
  createUserInputSchema,
  createProjectInputSchema,
  createSkillInputSchema,
  createContactMessageInputSchema,
  createResumeDownloadInputSchema,
  createBlogPostInputSchema,
  createExperienceInputSchema,
  createEducationInputSchema,
  createCertificationInputSchema
} from '../DB/zodschemas.ts';

// Mock database pool
jest.mock('./server.ts', () => {
  const actual = jest.requireActual('./server.ts');
  return {
    ...actual,
    pool: {
      query: jest.fn()
    }
  };
});

describe('Devfolio API Tests', () => {
  const mockUser = {
    user_id: 'user_123',
    email: 'test@example.com',
    password_hash: 'password123',
    name: 'Test User',
    professional_title: 'Developer',
    tagline: 'Building amazing apps',
    bio: 'I am a developer',
    profile_image_url: 'https://example.com/image.jpg',
    phone_number: '+1234567890',
    location: 'San Francisco',
    github_url: 'https://github.com/test',
    linkedin_url: 'https://linkedin.com/in/test',
    twitter_url: 'https://twitter.com/test',
    website_url: 'https://test.dev',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const mockProject = {
    project_id: 'proj_123',
    user_id: 'user_123',
    title: 'Test Project',
    description: 'A test project',
    project_type: 'Web App',
    role_in_project: 'Developer',
    problem_statement: 'Problem to solve',
    solution_approach: 'Solution approach',
    technical_challenges: 'Technical challenges',
    technologies_used: 'React, Node.js',
    live_demo_url: 'https://demo.example.com',
    github_repo_url: 'https://github.com/test/project',
    app_store_url: null,
    play_store_url: null,
    case_study_url: null,
    is_featured: true,
    status: 'Completed',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const mockSkill = {
    skill_id: 'skill_123',
    user_id: 'user_123',
    category: 'Frontend',
    name: 'React',
    proficiency_level: 90,
    description: 'Building UIs with React',
    icon_name: 'react-icon',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const generateToken = (userId) => {
    return jwt.sign({ userId }, 'test-secret', { expiresIn: '1h' });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Authentication Tests
  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'newuser@example.com',
          password_hash: 'newpassword123',
          name: 'New User'
        };

        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Check if user exists
        pool.query.mockResolvedValueOnce({ rows: [{ ...mockUser, ...userData, user_id: 'new_user_id' }] }); // Insert user

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.name).toBe(userData.name);
        expect(response.body.token).toBeDefined();
      });

      it('should return 400 for invalid input', async () => {
        const invalidData = {
          email: 'invalid-email',
          password_hash: 'short',
          name: ''
        };

        await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);
      });

      it('should return 400 when email already exists', async () => {
        const userData = {
          email: 'existing@example.com',
          password_hash: 'password123',
          name: 'Existing User'
        };

        // Mock that user already exists
        pool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login user successfully with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        pool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(loginData.email);
        expect(response.body.token).toBeDefined();
      });

      it('should return 401 for invalid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);
      });

      it('should return 400 for missing credentials', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' })
          .expect(400);
      });
    });
  });

  // User Tests
  describe('Users', () => {
    describe('GET /api/users/{user_id}', () => {
      it('should retrieve user profile successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

        const response = await request(app)
          .get(`/api/users/${mockUser.user_id}`)
          .expect(200);

        expect(response.body).toEqual(mockUser);
      });

      it('should return 404 for non-existent user', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await request(app)
          .get('/api/users/nonexistent')
          .expect(404);
      });
    });

    describe('PATCH /api/users/{user_id}', () => {
      it('should update user profile successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          name: 'Updated Name',
          professional_title: 'Senior Developer'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockUser, ...updateData }] });

        const response = await request(app)
          .patch(`/api/users/${mockUser.user_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.professional_title).toBe(updateData.professional_title);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .patch(`/api/users/${mockUser.user_id}`)
          .send({ name: 'Updated Name' })
          .expect(401);
      });

      it('should return 404 for non-existent user', async () => {
        const token = generateToken('nonexistent');
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await request(app)
          .patch('/api/users/nonexistent')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated Name' })
          .expect(404);
      });
    });

    describe('GET /api/users', () => {
      it('should search users successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

        const response = await request(app)
          .get('/api/users?query=Test')
          .expect(200);

        expect(response.body.users).toHaveLength(1);
        expect(response.body.users[0].name).toBe(mockUser.name);
      });
    });
  });

  // Projects Tests
  describe('Projects', () => {
    describe('POST /api/projects', () => {
      it('should create a new project with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const projectData = {
          user_id: mockUser.user_id,
          title: 'New Project',
          description: 'A new project description',
          is_featured: false
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockProject, ...projectData, project_id: 'new_proj_id' }] });

        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${token}`)
          .send(projectData)
          .expect(201);

        expect(response.body.title).toBe(projectData.title);
        expect(response.body.description).toBe(projectData.description);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/projects')
          .send({ title: 'New Project', description: 'Description' })
          .expect(401);
      });

      it('should return 400 for invalid input', async () => {
        const token = generateToken(mockUser.user_id);
        const invalidData = {
          title: '', // Required field
          description: 'Description'
        };

        await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${token}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/projects', () => {
      it('should search projects successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockProject], rowCount: 1 });

        const response = await request(app)
          .get('/api/projects?query=Test')
          .expect(200);

        expect(response.body.projects).toHaveLength(1);
        expect(response.body.projects[0].title).toBe(mockProject.title);
      });
    });

    describe('GET /api/projects/{project_id}', () => {
      it('should retrieve project details successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockProject], rowCount: 1 });

        const response = await request(app)
          .get(`/api/projects/${mockProject.project_id}`)
          .expect(200);

        expect(response.body.project_id).toBe(mockProject.project_id);
        expect(response.body.title).toBe(mockProject.title);
      });

      it('should return 404 for non-existent project', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await request(app)
          .get('/api/projects/nonexistent')
          .expect(404);
      });
    });

    describe('PATCH /api/projects/{project_id}', () => {
      it('should update project successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          title: 'Updated Project Title',
          description: 'Updated description'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockProject, ...updateData }] });

        const response = await request(app)
          .patch(`/api/projects/${mockProject.project_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.description).toBe(updateData.description);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .patch(`/api/projects/${mockProject.project_id}`)
          .send({ title: 'Updated Title' })
          .expect(401);
      });
    });

    describe('DELETE /api/projects/{project_id}', () => {
      it('should delete project successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/projects/${mockProject.project_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/projects/${mockProject.project_id}`)
          .expect(401);
      });

      it('should return 404 for non-existent project', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 0 });

        await request(app)
          .delete('/api/projects/nonexistent')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });
    });
  });

  // Project Images Tests
  describe('Project Images', () => {
    const mockImage = {
      image_id: 'img_123',
      project_id: 'proj_123',
      image_url: 'https://example.com/image.jpg',
      alt_text: 'Test image',
      caption: 'Test caption',
      display_order: 1,
      created_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/projects/{project_id}/images', () => {
      it('should add image to project with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const imageData = {
          project_id: mockProject.project_id,
          image_url: 'https://example.com/new-image.jpg',
          alt_text: 'New image'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockImage, ...imageData, image_id: 'new_img_id' }] });

        const response = await request(app)
          .post(`/api/projects/${mockProject.project_id}/images`)
          .set('Authorization', `Bearer ${token}`)
          .send(imageData)
          .expect(201);

        expect(response.body.image_url).toBe(imageData.image_url);
        expect(response.body.alt_text).toBe(imageData.alt_text);
      });
    });

    describe('GET /api/projects/{project_id}/images', () => {
      it('should retrieve project images successfully', async () => {
        pool.query.mockResolvedValueOnce({ 
          rows: [mockImage], 
          rowCount: 1 
        });

        const response = await request(app)
          .get(`/api/projects/${mockProject.project_id}/images`)
          .expect(200);

        expect(response.body.images).toHaveLength(1);
        expect(response.body.images[0].image_url).toBe(mockImage.image_url);
      });
    });
  });

  // Skills Tests
  describe('Skills', () => {
    describe('POST /api/skills', () => {
      it('should create a new skill with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const skillData = {
          user_id: mockUser.user_id,
          category: 'Backend',
          name: 'Node.js',
          proficiency_level: 85
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockSkill, ...skillData, skill_id: 'new_skill_id' }] });

        const response = await request(app)
          .post('/api/skills')
          .set('Authorization', `Bearer ${token}`)
          .send(skillData)
          .expect(201);

        expect(response.body.name).toBe(skillData.name);
        expect(response.body.category).toBe(skillData.category);
        expect(response.body.proficiency_level).toBe(skillData.proficiency_level);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/skills')
          .send({ name: 'Node.js', category: 'Backend' })
          .expect(401);
      });
    });

    describe('GET /api/skills', () => {
      it('should search skills successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockSkill], rowCount: 1 });

        const response = await request(app)
          .get('/api/skills?category=Frontend')
          .expect(200);

        expect(response.body.skills).toHaveLength(1);
        expect(response.body.skills[0].name).toBe(mockSkill.name);
      });
    });

    describe('PATCH /api/skills/{skill_id}', () => {
      it('should update skill successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          name: 'Updated Skill Name',
          proficiency_level: 95
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockSkill, ...updateData }] });

        const response = await request(app)
          .patch(`/api/skills/${mockSkill.skill_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.proficiency_level).toBe(updateData.proficiency_level);
      });
    });

    describe('DELETE /api/skills/{skill_id}', () => {
      it('should delete skill successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/skills/${mockSkill.skill_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/skills/${mockSkill.skill_id}`)
          .expect(401);
      });
    });
  });

  // Contact Messages Tests
  describe('Contact Messages', () => {
    const mockMessage = {
      message_id: 'msg_123',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Project Inquiry',
      message: 'I would like to discuss a project',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
      created_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/contact-messages', () => {
      it('should submit contact message successfully', async () => {
        const messageData = {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Project Inquiry',
          message: 'I would like to discuss a project'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockMessage, ...messageData, message_id: 'new_msg_id' }] });

        const response = await request(app)
          .post('/api/contact-messages')
          .send(messageData)
          .expect(201);

        expect(response.body.name).toBe(messageData.name);
        expect(response.body.email).toBe(messageData.email);
        expect(response.body.message).toBe(messageData.message);
      });

      it('should return 400 for invalid input', async () => {
        const invalidData = {
          name: '', // Required
          email: 'invalid-email',
          message: '' // Required
        };

        await request(app)
          .post('/api/contact-messages')
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/contact-messages', () => {
      it('should retrieve contact messages with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rows: [mockMessage], rowCount: 1 });

        const response = await request(app)
          .get('/api/contact-messages')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.messages).toHaveLength(1);
        expect(response.body.messages[0].name).toBe(mockMessage.name);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .get('/api/contact-messages')
          .expect(401);
      });
    });
  });

  // Resume Downloads Tests
  describe('Resume Downloads', () => {
    const mockResume = {
      download_id: 'dl_123',
      user_id: 'user_123',
      download_url: 'https://example.com/resume.pdf',
      file_size_bytes: 102400,
      created_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/resume-downloads', () => {
      it('should create resume download entry with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const resumeData = {
          user_id: mockUser.user_id,
          download_url: 'https://example.com/new-resume.pdf',
          file_size_bytes: 204800
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockResume, ...resumeData, download_id: 'new_dl_id' }] });

        const response = await request(app)
          .post('/api/resume-downloads')
          .set('Authorization', `Bearer ${token}`)
          .send(resumeData)
          .expect(201);

        expect(response.body.download_url).toBe(resumeData.download_url);
        expect(response.body.file_size_bytes).toBe(resumeData.file_size_bytes);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/resume-downloads')
          .send({ download_url: 'https://example.com/resume.pdf' })
          .expect(401);
      });
    });

    describe('GET /api/resume-downloads', () => {
      it('should search resume downloads successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockResume], rowCount: 1 });

        const response = await request(app)
          .get('/api/resume-downloads')
          .expect(200);

        expect(response.body.downloads).toHaveLength(1);
        expect(response.body.downloads[0].download_url).toBe(mockResume.download_url);
      });
    });
  });

  // Blog Posts Tests
  describe('Blog Posts', () => {
    const mockPost = {
      post_id: 'post_123',
      user_id: 'user_123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'A test blog post excerpt',
      content: 'This is the full content of the blog post',
      published_at: '2023-01-01T00:00:00Z',
      is_published: true,
      read_time_minutes: 5,
      tags: 'test, blog',
      meta_title: 'Test Blog Post',
      meta_description: 'A test blog post',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/blog-posts', () => {
      it('should create a new blog post with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const postData = {
          user_id: mockUser.user_id,
          title: 'New Blog Post',
          slug: 'new-blog-post',
          content: 'Content of the new blog post',
          is_published: false
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockPost, ...postData, post_id: 'new_post_id' }] });

        const response = await request(app)
          .post('/api/blog-posts')
          .set('Authorization', `Bearer ${token}`)
          .send(postData)
          .expect(201);

        expect(response.body.title).toBe(postData.title);
        expect(response.body.slug).toBe(postData.slug);
        expect(response.body.content).toBe(postData.content);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/blog-posts')
          .send({ title: 'New Post', content: 'Content' })
          .expect(401);
      });
    });

    describe('GET /api/blog-posts', () => {
      it('should search blog posts successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockPost], rowCount: 1 });

        const response = await request(app)
          .get('/api/blog-posts?is_published=true')
          .expect(200);

        expect(response.body.posts).toHaveLength(1);
        expect(response.body.posts[0].title).toBe(mockPost.title);
      });
    });

    describe('GET /api/blog-posts/{post_id}', () => {
      it('should retrieve blog post successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockPost], rowCount: 1 });

        const response = await request(app)
          .get(`/api/blog-posts/${mockPost.post_id}`)
          .expect(200);

        expect(response.body.post_id).toBe(mockPost.post_id);
        expect(response.body.title).toBe(mockPost.title);
      });

      it('should return 404 for non-existent blog post', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        await request(app)
          .get('/api/blog-posts/nonexistent')
          .expect(404);
      });
    });

    describe('PATCH /api/blog-posts/{post_id}', () => {
      it('should update blog post successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          title: 'Updated Blog Post Title',
          content: 'Updated content'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockPost, ...updateData }] });

        const response = await request(app)
          .patch(`/api/blog-posts/${mockPost.post_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.content).toBe(updateData.content);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .patch(`/api/blog-posts/${mockPost.post_id}`)
          .send({ title: 'Updated Title' })
          .expect(401);
      });
    });

    describe('DELETE /api/blog-posts/{post_id}', () => {
      it('should delete blog post successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/blog-posts/${mockPost.post_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/blog-posts/${mockPost.post_id}`)
          .expect(401);
      });
    });
  });

  // Experiences Tests
  describe('Experiences', () => {
    const mockExperience = {
      experience_id: 'exp_123',
      user_id: 'user_123',
      company_name: 'Tech Corp',
      company_logo_url: 'https://example.com/logo.png',
      job_title: 'Software Engineer',
      start_date: '2020-01-01',
      end_date: '2022-12-31',
      is_current: false,
      location: 'San Francisco',
      description: 'Worked on various projects',
      technologies_used: 'React, Node.js',
      achievements: 'Achieved 25% performance improvement',
      company_website_url: 'https://techcorp.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/experiences', () => {
      it('should create a new experience with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const experienceData = {
          user_id: mockUser.user_id,
          company_name: 'New Company',
          job_title: 'Senior Developer',
          start_date: '2023-01-01',
          is_current: true
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockExperience, ...experienceData, experience_id: 'new_exp_id' }] });

        const response = await request(app)
          .post('/api/experiences')
          .set('Authorization', `Bearer ${token}`)
          .send(experienceData)
          .expect(201);

        expect(response.body.company_name).toBe(experienceData.company_name);
        expect(response.body.job_title).toBe(experienceData.job_title);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/experiences')
          .send({ company_name: 'Company', job_title: 'Developer' })
          .expect(401);
      });
    });

    describe('GET /api/experiences', () => {
      it('should search experiences successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockExperience], rowCount: 1 });

        const response = await request(app)
          .get('/api/experiences?company_name=Tech')
          .expect(200);

        expect(response.body.experiences).toHaveLength(1);
        expect(response.body.experiences[0].company_name).toBe(mockExperience.company_name);
      });
    });

    describe('PATCH /api/experiences/{experience_id}', () => {
      it('should update experience successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          job_title: 'Lead Developer',
          achievements: 'Managed team of 5 developers'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockExperience, ...updateData }] });

        const response = await request(app)
          .patch(`/api/experiences/${mockExperience.experience_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.job_title).toBe(updateData.job_title);
        expect(response.body.achievements).toBe(updateData.achievements);
      });
    });

    describe('DELETE /api/experiences/{experience_id}', () => {
      it('should delete experience successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/experiences/${mockExperience.experience_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/experiences/${mockExperience.experience_id}`)
          .expect(401);
      });
    });
  });

  // Educations Tests
  describe('Educations', () => {
    const mockEducation = {
      education_id: 'edu_123',
      user_id: 'user_123',
      institution_name: 'University of Tech',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science',
      start_date: '2015-09-01',
      end_date: '2019-05-30',
      grade: '3.8 GPA',
      description: 'Focused on software engineering',
      institution_website_url: 'https://university.edu',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/educations', () => {
      it('should create a new education entry with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const educationData = {
          user_id: mockUser.user_id,
          institution_name: 'New University',
          degree: 'Master of Science',
          field_of_study: 'Data Science',
          start_date: '2020-09-01'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockEducation, ...educationData, education_id: 'new_edu_id' }] });

        const response = await request(app)
          .post('/api/educations')
          .set('Authorization', `Bearer ${token}`)
          .send(educationData)
          .expect(201);

        expect(response.body.institution_name).toBe(educationData.institution_name);
        expect(response.body.degree).toBe(educationData.degree);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/educations')
          .send({ institution_name: 'University', degree: 'Bachelor' })
          .expect(401);
      });
    });

    describe('GET /api/educations', () => {
      it('should search educations successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockEducation], rowCount: 1 });

        const response = await request(app)
          .get('/api/educations?institution_name=University')
          .expect(200);

        expect(response.body.educations).toHaveLength(1);
        expect(response.body.educations[0].institution_name).toBe(mockEducation.institution_name);
      });
    });

    describe('PATCH /api/educations/{education_id}', () => {
      it('should update education entry successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          degree: 'Master of Science',
          grade: '3.9 GPA'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockEducation, ...updateData }] });

        const response = await request(app)
          .patch(`/api/educations/${mockEducation.education_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.degree).toBe(updateData.degree);
        expect(response.body.grade).toBe(updateData.grade);
      });
    });

    describe('DELETE /api/educations/{education_id}', () => {
      it('should delete education entry successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/educations/${mockEducation.education_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/educations/${mockEducation.education_id}`)
          .expect(401);
      });
    });
  });

  // Certifications Tests
  describe('Certifications', () => {
    const mockCertification = {
      certification_id: 'cert_123',
      user_id: 'user_123',
      name: 'AWS Certified Developer',
      issuing_organization: 'Amazon Web Services',
      issue_date: '2022-01-01',
      expiration_date: '2025-01-01',
      credential_id: 'AWS123456',
      credential_url: 'https://aws.com/credential',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/certifications', () => {
      it('should create a new certification with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const certificationData = {
          user_id: mockUser.user_id,
          name: 'Google Cloud Professional',
          issuing_organization: 'Google Cloud',
          issue_date: '2023-01-01'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockCertification, ...certificationData, certification_id: 'new_cert_id' }] });

        const response = await request(app)
          .post('/api/certifications')
          .set('Authorization', `Bearer ${token}`)
          .send(certificationData)
          .expect(201);

        expect(response.body.name).toBe(certificationData.name);
        expect(response.body.issuing_organization).toBe(certificationData.issuing_organization);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/certifications')
          .send({ name: 'Certification', issuing_organization: 'Organization' })
          .expect(401);
      });
    });

    describe('GET /api/certifications', () => {
      it('should search certifications successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockCertification], rowCount: 1 });

        const response = await request(app)
          .get('/api/certifications?issuing_organization=AWS')
          .expect(200);

        expect(response.body.certifications).toHaveLength(1);
        expect(response.body.certifications[0].name).toBe(mockCertification.name);
      });
    });

    describe('PATCH /api/certifications/{certification_id}', () => {
      it('should update certification successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const updateData = {
          credential_id: 'NEW789012',
          credential_url: 'https://new-credential.com'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockCertification, ...updateData }] });

        const response = await request(app)
          .patch(`/api/certifications/${mockCertification.certification_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.credential_id).toBe(updateData.credential_id);
        expect(response.body.credential_url).toBe(updateData.credential_url);
      });
    });

    describe('DELETE /api/certifications/{certification_id}', () => {
      it('should delete certification successfully with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await request(app)
          .delete(`/api/certifications/${mockCertification.certification_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .delete(`/api/certifications/${mockCertification.certification_id}`)
          .expect(401);
      });
    });
  });

  // Testimonials Tests
  describe('Testimonials', () => {
    const mockTestimonial = {
      testimonial_id: 'test_123',
      user_id: 'user_123',
      client_name: 'Jane Smith',
      client_position: 'CTO',
      company_name: 'Tech Startup',
      content: 'Great work delivered on time',
      rating: 5,
      client_photo_url: 'https://example.com/photo.jpg',
      project_reference: 'proj_123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/testimonials', () => {
      it('should create a new testimonial with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const testimonialData = {
          user_id: mockUser.user_id,
          client_name: 'John Doe',
          content: 'Excellent service',
          rating: 4
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockTestimonial, ...testimonialData, testimonial_id: 'new_test_id' }] });

        const response = await request(app)
          .post('/api/testimonials')
          .set('Authorization', `Bearer ${token}`)
          .send(testimonialData)
          .expect(201);

        expect(response.body.client_name).toBe(testimonialData.client_name);
        expect(response.body.content).toBe(testimonialData.content);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/testimonials')
          .send({ client_name: 'Client', content: 'Testimonial' })
          .expect(401);
      });
    });

    describe('GET /api/testimonials', () => {
      it('should search testimonials successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockTestimonial], rowCount: 1 });

        const response = await request(app)
          .get('/api/testimonials?min_rating=4')
          .expect(200);

        expect(response.body.testimonials).toHaveLength(1);
        expect(response.body.testimonials[0].rating).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // Social Media Links Tests
  describe('Social Media Links', () => {
    const mockLink = {
      link_id: 'sm_123',
      user_id: 'user_123',
      platform: 'GitHub',
      url: 'https://github.com/testuser',
      display_order: 1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    describe('POST /api/social-media-links', () => {
      it('should create a new social media link with valid token', async () => {
        const token = generateToken(mockUser.user_id);
        const linkData = {
          user_id: mockUser.user_id,
          platform: 'LinkedIn',
          url: 'https://linkedin.com/in/testuser'
        };

        pool.query.mockResolvedValueOnce({ rows: [{ ...mockLink, ...linkData, link_id: 'new_link_id' }] });

        const response = await request(app)
          .post('/api/social-media-links')
          .set('Authorization', `Bearer ${token}`)
          .send(linkData)
          .expect(201);

        expect(response.body.platform).toBe(linkData.platform);
        expect(response.body.url).toBe(linkData.url);
      });

      it('should return 401 without valid token', async () => {
        await request(app)
          .post('/api/social-media-links')
          .send({ platform: 'Twitter', url: 'https://twitter.com/user' })
          .expect(401);
      });
    });

    describe('GET /api/social-media-links', () => {
      it('should search social media links successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [mockLink], rowCount: 1 });

        const response = await request(app)
          .get('/api/social-media-links?platform=GitHub')
          .expect(200);

        expect(response.body.links).toHaveLength(1);
        expect(response.body.links[0].platform).toBe(mockLink.platform);
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await request(app)
        .get('/api/users/test')
        .expect(500);
    });

    it('should handle invalid JWT tokens', async () => {
      await request(app)
        .patch('/api/users/test')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should validate request payloads', async () => {
      const token = generateToken(mockUser.user_id);
      
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });
});