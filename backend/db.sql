-- Create tables
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    bio_text TEXT,
    header_image_url TEXT,
    avatar_url TEXT,
    video_embed_url TEXT,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL
);

CREATE TABLE social_media_links (
    link_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    platform VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE skills (
    skill_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    proficiency_level VARCHAR(255),
    icon_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE projects (
    project_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    thumbnail_url TEXT,
    project_url TEXT,
    source_code_url TEXT,
    tech_stack TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    updated_at VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE project_screenshots (
    screenshot_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE experiences (
    experience_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    start_date VARCHAR(255) NOT NULL,
    end_date VARCHAR(255),
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE education (
    education_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255),
    institution_logo_url TEXT,
    start_date VARCHAR(255) NOT NULL,
    end_date VARCHAR(255),
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    location VARCHAR(255),
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE key_facts (
    fact_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE resume_downloads (
    download_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_format VARCHAR(50) NOT NULL,
    download_url TEXT NOT NULL,
    created_at VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE contact_messages (
    message_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50),
    message_content TEXT NOT NULL,
    sent_at VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE app_settings (
    setting_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    theme_mode VARCHAR(50) DEFAULT 'light' NOT NULL,
    font_scale NUMERIC DEFAULT 1.0 NOT NULL,
    hidden_sections TEXT,
    updated_at VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE navigation_preferences (
    preference_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    hidden_tabs TEXT,
    updated_at VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Seed data
-- Users
INSERT INTO users (user_id, email, password_hash, name, tagline, bio_text, header_image_url, avatar_url, video_embed_url, created_at, updated_at) VALUES
('user_001', 'john.doe@example.com', 'password123', 'John Doe', 'Senior Full Stack Developer', 'I build scalable web applications with modern technologies.', 'https://picsum.photos/seed/johnheader/1200/400', 'https://picsum.photos/seed/johnavatar/200/200', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '2023-01-15T09:30:00Z', '2023-06-20T14:45:00Z'),
('user_002', 'jane.smith@example.com', 'password123', 'Jane Smith', 'UI/UX Designer & Frontend Developer', 'Passionate about creating beautiful and functional user experiences.', 'https://picsum.photos/seed/janeheader/1200/400', 'https://picsum.photos/seed/janeavatar/200/200', NULL, '2023-02-20T11:15:00Z', '2023-06-18T16:20:00Z'),
('user_003', 'mike.johnson@example.com', 'password123', 'Mike Johnson', 'DevOps Engineer', 'Specializing in cloud infrastructure and CI/CD pipelines.', 'https://picsum.photos/seed/mikeheader/1200/400', 'https://picsum.photos/seed/mikeavatar/200/200', NULL, '2023-03-10T13:45:00Z', '2023-06-19T10:30:00Z');

-- Social Media Links
INSERT INTO social_media_links (link_id, user_id, platform, url, display_order) VALUES
('link_001', 'user_001', 'github', 'https://github.com/johndoe', 1),
('link_002', 'user_001', 'linkedin', 'https://linkedin.com/in/johndoe', 2),
('link_003', 'user_001', 'twitter', 'https://twitter.com/johndoe', 3),
('link_004', 'user_002', 'dribbble', 'https://dribbble.com/janesmith', 1),
('link_005', 'user_002', 'behance', 'https://behance.net/janesmith', 2),
('link_006', 'user_003', 'github', 'https://github.com/mikejohnson', 1),
('link_007', 'user_003', 'linkedin', 'https://linkedin.com/in/mikejohnson', 2);

-- Skills
INSERT INTO skills (skill_id, user_id, name, category, proficiency_level, icon_url, description, display_order) VALUES
('skill_001', 'user_001', 'JavaScript', 'Frontend', 'Expert', 'https://picsum.photos/seed/jsicon/50/50', 'Proficient in modern JavaScript and ES6+ features', 1),
('skill_002', 'user_001', 'React', 'Frontend', 'Expert', 'https://picsum.photos/seed/reacticon/50/50', 'Building complex UIs with React and Redux', 2),
('skill_003', 'user_001', 'Node.js', 'Backend', 'Advanced', 'https://picsum.photos/seed/nodeicon/50/50', 'Creating RESTful APIs with Express.js', 3),
('skill_004', 'user_001', 'PostgreSQL', 'Database', 'Advanced', 'https://picsum.photos/seed/postgresicon/50/50', 'Database design and optimization', 4),
('skill_005', 'user_002', 'Figma', 'Design', 'Expert', 'https://picsum.photos/seed/figmaicon/50/50', 'UI/UX design and prototyping', 1),
('skill_006', 'user_002', 'CSS', 'Frontend', 'Expert', 'https://picsum.photos/seed/cssicon/50/50', 'Advanced CSS and responsive design', 2),
('skill_007', 'user_002', 'HTML', 'Frontend', 'Expert', 'https://picsum.photos/seed/htmlicon/50/50', 'Semantic HTML and accessibility', 3),
('skill_008', 'user_003', 'Docker', 'DevOps', 'Expert', 'https://picsum.photos/seed/dockericon/50/50', 'Containerization and orchestration', 1),
('skill_009', 'user_003', 'AWS', 'DevOps', 'Advanced', 'https://picsum.photos/seed/awsicon/50/50', 'Cloud infrastructure and services', 2),
('skill_010', 'user_003', 'Kubernetes', 'DevOps', 'Intermediate', 'https://picsum.photos/seed/k8sicon/50/50', 'Container orchestration', 3);

-- Projects
INSERT INTO projects (project_id, user_id, title, short_description, description, thumbnail_url, project_url, source_code_url, tech_stack, display_order, created_at, updated_at) VALUES
('proj_001', 'user_001', 'E-commerce Platform', 'Full-featured online shopping experience', 'A complete e-commerce solution with product catalog, shopping cart, and payment processing.', 'https://picsum.photos/seed/ecommerce/600/400', 'https://ecommerce.example.com', 'https://github.com/johndoe/ecommerce-platform', 'React, Node.js, PostgreSQL, Stripe', 1, '2023-04-01T10:00:00Z', '2023-05-15T14:30:00Z'),
('proj_002', 'user_001', 'Task Management App', 'Collaborative task and project management', 'A real-time collaborative application for teams to manage tasks and projects efficiently.', 'https://picsum.photos/seed/taskmanager/600/400', 'https://taskmanager.example.com', 'https://github.com/johndoe/task-manager', 'React, Socket.io, MongoDB, Express.js', 2, '2023-02-15T09:00:00Z', '2023-03-20T16:45:00Z'),
('proj_003', 'user_002', 'Health & Wellness Dashboard', 'Health tracking and analytics dashboard', 'A comprehensive dashboard for tracking health metrics and providing personalized insights.', 'https://picsum.photos/seed/healthdashboard/600/400', 'https://healthdash.example.com', 'https://github.com/janesmith/health-dashboard', 'Figma, React, D3.js, CSS', 1, '2023-03-10T11:30:00Z', '2023-04-25T13:20:00Z');

-- Project Screenshots
INSERT INTO project_screenshots (screenshot_id, project_id, image_url, caption, display_order) VALUES
('shot_001', 'proj_001', 'https://picsum.photos/seed/ecommerce1/800/600', 'Product catalog view', 1),
('shot_002', 'proj_001', 'https://picsum.photos/seed/ecommerce2/800/600', 'Shopping cart interface', 2),
('shot_003', 'proj_001', 'https://picsum.photos/seed/ecommerce3/800/600', 'Checkout process', 3),
('shot_004', 'proj_002', 'https://picsum.photos/seed/taskmanager1/800/600', 'Task board view', 1),
('shot_005', 'proj_002', 'https://picsum.photos/seed/taskmanager2/800/600', 'Team collaboration features', 2),
('shot_006', 'proj_003', 'https://picsum.photos/seed/healthdashboard1/800/600', 'Health metrics overview', 1),
('shot_007', 'proj_003', 'https://picsum.photos/seed/healthdashboard2/800/600', 'Personalized insights', 2);

-- Experiences
INSERT INTO experiences (experience_id, user_id, role_title, company_name, company_logo_url, start_date, end_date, is_current, location, description, display_order) VALUES
('exp_001', 'user_001', 'Senior Full Stack Developer', 'Tech Solutions Inc.', 'https://picsum.photos/seed/techsolutions/100/100', '2020-06-01', NULL, true, 'San Francisco, CA', 'Leading development of cloud-based applications using modern web technologies.', 1),
('exp_002', 'user_001', 'Frontend Developer', 'WebCraft LLC', 'https://picsum.photos/seed/webcraft/100/100', '2018-03-01', '2020-05-31', false, 'New York, NY', 'Developed responsive web applications using React and modern CSS frameworks.', 2),
('exp_003', 'user_002', 'UI/UX Designer', 'Creative Designs Co.', 'https://picsum.photos/seed/creativedesigns/100/100', '2019-01-15', NULL, true, 'Austin, TX', 'Creating user-centered designs for web and mobile applications.', 1),
('exp_004', 'user_003', 'DevOps Engineer', 'Cloud Systems Ltd.', 'https://picsum.photos/seed/cloudsystems/100/100', '2021-04-01', NULL, true, 'Seattle, WA', 'Managing cloud infrastructure and CI/CD pipelines for enterprise clients.', 1);

-- Education
INSERT INTO education (education_id, user_id, institution_name, degree, institution_logo_url, start_date, end_date, is_current, location, description, display_order) VALUES
('edu_001', 'user_001', 'Stanford University', 'M.S. Computer Science', 'https://picsum.photos/seed/stanford/100/100', '2016-09-01', '2018-06-15', false, 'Stanford, CA', 'Specialized in Artificial Intelligence and Machine Learning.', 1),
('edu_002', 'user_001', 'University of California', 'B.S. Software Engineering', 'https://picsum.photos/seed/uc/100/100', '2012-09-01', '2016-06-15', false, 'Berkeley, CA', 'Graduated with honors. Focus on web development and databases.', 2),
('edu_003', 'user_002', 'Rhode Island School of Design', 'B.F.A. Graphic Design', 'https://picsum.photos/seed/risd/100/100', '2014-09-01', '2018-05-20', false, 'Providence, RI', 'Specialized in User Interface and Interaction Design.', 1),
('edu_004', 'user_003', 'Massachusetts Institute of Technology', 'B.S. Computer Science', 'https://picsum.photos/seed/mit/100/100', '2013-09-01', '2017-06-10', false, 'Cambridge, MA', 'Focus on Distributed Systems and Network Security.', 1);

-- Key Facts
INSERT INTO key_facts (fact_id, user_id, content, display_order) VALUES
('fact_001', 'user_001', '10+ years of experience in web development', 1),
('fact_002', 'user_001', 'Led development of 20+ successful projects', 2),
('fact_003', 'user_001', 'Expert in modern JavaScript frameworks', 3),
('fact_004', 'user_002', 'Award-winning UI designer with 7+ years experience', 1),
('fact_005', 'user_002', 'Specialized in user research and usability testing', 2),
('fact_006', 'user_003', 'AWS Certified Solutions Architect', 1),
('fact_007', 'user_003', 'Expertise in containerization technologies', 2);

-- Resume Downloads
INSERT INTO resume_downloads (download_id, user_id, file_format, download_url, created_at) VALUES
('res_001', 'user_001', 'PDF', 'https://example.com/resumes/john_doe.pdf', '2023-06-01T10:30:00Z'),
('res_002', 'user_001', 'DOCX', 'https://example.com/resumes/john_doe.docx', '2023-06-01T10:30:00Z'),
('res_003', 'user_002', 'PDF', 'https://example.com/resumes/jane_smith.pdf', '2023-05-28T14:15:00Z');

-- Contact Messages
INSERT INTO contact_messages (message_id, user_id, sender_name, sender_email, sender_phone, message_content, sent_at, status) VALUES
('msg_001', 'user_001', 'Alice Johnson', 'alice@example.com', '+1234567890', 'I''d like to discuss a potential project collaboration. Are you available for a call next week?', '2023-06-10T09:15:00Z', 'pending'),
('msg_002', 'user_001', 'Bob Williams', 'bob@example.com', NULL, 'Impressive portfolio! I have a job opportunity that might interest you.', '2023-06-12T16:45:00Z', 'read'),
('msg_003', 'user_002', 'Carol Davis', 'carol@example.com', '+1987654321', 'Could you provide more details about your UX design process?', '2023-06-05T11:30:00Z', 'pending');

-- App Settings
INSERT INTO app_settings (setting_id, user_id, theme_mode, font_scale, hidden_sections, updated_at) VALUES
('sett_001', 'user_001', 'dark', 1.1, '["education"]', '2023-06-20T14:45:00Z'),
('sett_002', 'user_002', 'light', 1.0, NULL, '2023-06-18T16:20:00Z'),
('sett_003', 'user_003', 'dark', 1.2, '["key_facts"]', '2023-06-19T10:30:00Z');

-- Navigation Preferences
INSERT INTO navigation_preferences (preference_id, user_id, hidden_tabs, updated_at) VALUES
('nav_001', 'user_001', '["resume"]', '2023-06-20T14:45:00Z'),
('nav_002', 'user_002', NULL, '2023-06-18T16:20:00Z'),
('nav_003', 'user_003', '["contact"]', '2023-06-19T10:30:00Z');