```postgresql
-- Create tables
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    professional_title VARCHAR(255),
    tagline VARCHAR(500),
    bio TEXT,
    profile_image_url VARCHAR(500),
    phone_number VARCHAR(50),
    location VARCHAR(255),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    website_url VARCHAR(500),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL
);

CREATE TABLE skills (
    skill_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    proficiency_level INTEGER,
    description TEXT,
    icon_name VARCHAR(100),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE projects (
    project_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    project_type VARCHAR(100),
    role_in_project VARCHAR(100),
    problem_statement TEXT,
    solution_approach TEXT,
    technical_challenges TEXT,
    technologies_used TEXT,
    live_demo_url VARCHAR(500),
    github_repo_url VARCHAR(500),
    app_store_url VARCHAR(500),
    play_store_url VARCHAR(500),
    case_study_url VARCHAR(500),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE project_images (
    image_id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    caption VARCHAR(500),
    display_order INTEGER,
    created_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE experiences (
    experience_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(500),
    job_title VARCHAR(255) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50),
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    location VARCHAR(255),
    description TEXT,
    technologies_used TEXT,
    achievements TEXT,
    company_website_url VARCHAR(500),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE educations (
    education_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50),
    grade VARCHAR(50),
    description TEXT,
    institution_website_url VARCHAR(500),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE certifications (
    certification_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    expiration_date VARCHAR(50),
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE blog_posts (
    post_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    published_at VARCHAR(50),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    read_time_minutes INTEGER,
    tags TEXT,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE contact_messages (
    message_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at VARCHAR(50) NOT NULL
);

CREATE TABLE resume_downloads (
    download_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    download_url VARCHAR(500) NOT NULL,
    file_size_bytes INTEGER,
    created_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE site_settings (
    setting_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    privacy_policy_content TEXT,
    terms_of_service_content TEXT,
    cookie_policy_content TEXT,
    seo_meta_title VARCHAR(255),
    seo_meta_description VARCHAR(500),
    google_analytics_id VARCHAR(100),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE testimonials (
    testimonial_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_position VARCHAR(255),
    company_name VARCHAR(255),
    content TEXT NOT NULL,
    rating INTEGER,
    client_photo_url VARCHAR(500),
    project_reference VARCHAR(255),
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (project_reference) REFERENCES projects(project_id)
);

CREATE TABLE social_media_links (
    link_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    display_order INTEGER,
    created_at VARCHAR(50) NOT NULL,
    updated_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE page_visits (
    visit_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    referrer VARCHAR(500),
    visited_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE section_visits (
    section_visit_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    visit_count INTEGER NOT NULL DEFAULT 1,
    last_visited_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE media_assets (
    asset_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    alt_text VARCHAR(255),
    uploaded_at VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Seed data
-- Users
INSERT INTO users (user_id, email, password_hash, name, professional_title, tagline, bio, profile_image_url, phone_number, location, github_url, linkedin_url, twitter_url, website_url, created_at, updated_at) VALUES
('user_001', 'john.doe@example.com', 'password123', 'John Doe', 'Senior Software Engineer', 'Building scalable web applications', 'I''m a passionate software engineer with over 10 years of experience in building web applications.', 'https://picsum.photos/seed/john/200/300', '+1234567890', 'San Francisco, CA', 'https://github.com/johndoe', 'https://linkedin.com/in/johndoe', 'https://twitter.com/johndoe', 'https://johndoe.dev', '2023-01-15T09:30:00Z', '2023-06-20T14:45:00Z'),
('user_002', 'jane.smith@example.com', 'admin123', 'Jane Smith', 'Product Designer', 'Creating beautiful and functional user experiences', 'I specialize in UI/UX design with a focus on creating intuitive user experiences.', 'https://picsum.photos/seed/jane/200/300', '+0987654321', 'New York, NY', 'https://github.com/janesmith', 'https://linkedin.com/in/janesmith', 'https://twitter.com/janesmith', 'https://janesmith.design', '2023-02-10T11:20:00Z', '2023-07-15T16:30:00Z');

-- Skills
INSERT INTO skills (skill_id, user_id, category, name, proficiency_level, description, icon_name, created_at, updated_at) VALUES
('skill_001', 'user_001', 'Frontend', 'React', 90, 'Building user interfaces with React', 'react-icon', '2023-01-20T10:00:00Z', '2023-01-20T10:00:00Z'),
('skill_002', 'user_001', 'Backend', 'Node.js', 85, 'Server-side development with Node.js', 'node-icon', '2023-01-20T10:05:00Z', '2023-01-20T10:05:00Z'),
('skill_003', 'user_001', 'Database', 'PostgreSQL', 80, 'Relational database management', 'postgres-icon', '2023-01-20T10:10:00Z', '2023-01-20T10:10:00Z'),
('skill_004', 'user_002', 'Design', 'Figma', 95, 'UI/UX design and prototyping', 'figma-icon', '2023-02-15T09:00:00Z', '2023-02-15T09:00:00Z'),
('skill_005', 'user_002', 'Design', 'Adobe XD', 75, 'Experience design tool', 'xd-icon', '2023-02-15T09:05:00Z', '2023-02-15T09:05:00Z');

-- Projects
INSERT INTO projects (project_id, user_id, title, description, project_type, role_in_project, problem_statement, solution_approach, technical_challenges, technologies_used, live_demo_url, github_repo_url, app_store_url, play_store_url, case_study_url, is_featured, status, created_at, updated_at) VALUES
('proj_001', 'user_001', 'E-commerce Platform', 'A full-featured e-commerce solution with payment processing and inventory management.', 'Web Application', 'Lead Developer', 'Businesses needed an all-in-one solution for online sales', 'Built a scalable platform using microservices architecture', 'Handling high-concurrency during peak sales periods', 'React, Node.js, PostgreSQL, Redis', 'https://ecommerce.example.com', 'https://github.com/johndoe/ecommerce-platform', NULL, NULL, NULL, TRUE, 'Completed', '2023-03-01T12:00:00Z', '2023-05-15T18:30:00Z'),
('proj_002', 'user_001', 'Task Management App', 'A productivity application for teams to manage tasks and collaborate effectively.', 'Mobile App', 'Full Stack Developer', 'Teams struggled with task tracking across different tools', 'Created unified platform with real-time updates', 'Ensuring data sync across multiple devices', 'React Native, GraphQL, MongoDB', NULL, 'https://github.com/johndoe/task-manager', 'https://apps.apple.com/app/id123456789', 'https://play.google.com/store/apps/details?id=com.taskmanager', NULL, FALSE, 'In Progress', '2023-04-10T14:00:00Z', '2023-06-25T20:15:00Z'),
('proj_003', 'user_002', 'Banking Dashboard UI', 'Modern dashboard interface for financial analytics and transaction monitoring.', 'UI Design', 'Lead Designer', 'Traditional banking interfaces were outdated and difficult to use', 'Redesigned with modern UX principles and data visualization', 'Balancing complex information with clean aesthetics', 'Figma, Adobe Illustrator', NULL, NULL, NULL, NULL, 'https://behance.net/gallery/12345/banking-dashboard', TRUE, 'Completed', '2023-03-15T11:00:00Z', '2023-04-20T16:45:00Z');

-- Project Images
INSERT INTO project_images (image_id, project_id, image_url, alt_text, caption, display_order, created_at) VALUES
('img_001', 'proj_001', 'https://picsum.photos/seed/ecommerce1/800/600', 'E-commerce homepage', 'Homepage showing featured products', 1, '2023-03-05T09:00:00Z'),
('img_002', 'proj_001', 'https://picsum.photos/seed/ecommerce2/800/600', 'Product detail page', 'Detailed view of product with reviews', 2, '2023-03-05T09:05:00Z'),
('img_003', 'proj_002', 'https://picsum.photos/seed/tasks1/800/600', 'Task list screen', 'Dashboard with tasks organized by priority', 1, '2023-04-15T10:00:00Z'),
('img_004', 'proj_003', 'https://picsum.photos/seed/dashboard1/800/600', 'Banking dashboard', 'Overview of financial metrics', 1, '2023-03-20T11:00:00Z'),
('img_005', 'proj_003', 'https://picsum.photos/seed/dashboard2/800/600', 'Transaction history', 'Detailed transaction history view', 2, '2023-03-20T11:05:00Z');

-- Experiences
INSERT INTO experiences (experience_id, user_id, company_name, company_logo_url, job_title, start_date, end_date, is_current, location, description, technologies_used, achievements, company_website_url, created_at, updated_at) VALUES
('exp_001', 'user_001', 'TechCorp Inc.', 'https://picsum.photos/seed/techcorp/100/100', 'Senior Software Engineer', '2020-01-15', '2023-06-30', FALSE, 'San Francisco, CA', 'Led development of multiple customer-facing applications and mentored junior developers.', 'React, Node.js, AWS, Docker', 'Reduced application load time by 40% through optimization techniques', 'https://techcorp.com', '2020-01-20T09:00:00Z', '2023-07-01T17:00:00Z'),
('exp_002', 'user_001', 'StartupXYZ', 'https://picsum.photos/seed/startupxyz/100/100', 'Software Engineer', '2018-03-10', '2019-12-31', FALSE, 'Remote', 'Worked on various features for the core product including authentication system and payment integration.', 'JavaScript, PHP, MySQL', 'Integrated third-party payment gateway reducing checkout abandonment by 25%', 'https://startupxyz.com', '2018-03-15T10:00:00Z', '2020-01-05T09:00:00Z'),
('exp_003', 'user_002', 'DesignStudio Ltd.', 'https://picsum.photos/seed/designstudio/100/100', 'Lead Product Designer', '2021-06-01', NULL, TRUE, 'New York, NY', 'Responsible for overall design direction and leading a team of UI/UX designers.', 'Figma, Sketch, Adobe Creative Suite', 'Redesigned company flagship product improving user satisfaction score by 35%', 'https://designstudio.com', '2021-06-05T11:00:00Z', '2023-07-20T14:00:00Z');

-- Educations
INSERT INTO educations (education_id, user_id, institution_name, degree, field_of_study, start_date, end_date, grade, description, institution_website_url, created_at, updated_at) VALUES
('edu_001', 'user_001', 'University of Technology', 'Master of Science', 'Computer Science', '2016-09-01', '2018-05-30', '3.8 GPA', 'Focused on distributed systems and machine learning algorithms', 'https://university-tech.edu', '2016-09-05T08:00:00Z', '2018-06-01T12:00:00Z'),
('edu_002', 'user_001', 'State College', 'Bachelor of Science', 'Software Engineering', '2012-09-01', '2016-05-30', '3.7 GPA', 'Graduated with honors, specialized in web development', 'https://statecollege.edu', '2012-09-05T08:00:00Z', '2016-06-01T12:00:00Z'),
('edu_003', 'user_002', 'Design Academy', 'Bachelor of Arts', 'Graphic Design', '2015-09-01', '2019-05-30', '3.9 GPA', 'Specialized in digital product design and user experience', 'https://designacademy.edu', '2015-09-05T08:00:00Z', '2019-06-01T12:00:00Z');

-- Certifications
INSERT INTO certifications (certification_id, user_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, created_at, updated_at) VALUES
('cert_001', 'user_001', 'AWS Certified Solutions Architect', 'Amazon Web Services', '2022-03-15', '2025-03-15', 'AWS123456', 'https://aws-certifications.com/aws123456', '2022-03-20T10:00:00Z', '2022-03-20T10:00:00Z'),
('cert_002', 'user_001', 'Google Cloud Professional Developer', 'Google Cloud', '2021-11-10', '2023-11-10', 'GCP789012', 'https://google-cloud-certifications.com/gcp789012', '2021-11-15T11:00:00Z', '2021-11-15T11:00:00Z'),
('cert_003', 'user_002', 'UX Design Certification', 'Interaction Design Foundation', '2020-07-22', NULL, 'IDF345678', 'https://interaction-design.org/certificates/user123', '2020-07-25T09:00:00Z', '2020-07-25T09:00:00Z');

-- Blog Posts
INSERT INTO blog_posts (post_id, user_id, title, slug, excerpt, content, published_at, is_published, read_time_minutes, tags, meta_title, meta_description, created_at, updated_at) VALUES
('post_001', 'user_001', 'Understanding React Hooks', 'understanding-react-hooks', 'A deep dive into React Hooks and how they simplify state management', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...', '2023-05-10T08:00:00Z', TRUE, 8, 'React,JavaScript,Frontend', 'Understanding React Hooks - John Doe Blog', 'Learn about React Hooks and how to use them effectively in your projects', '2023-05-05T14:00:00Z', '2023-05-10T09:00:00Z'),
('post_002', 'user_001', 'Building Scalable Node.js Applications', 'building-scalable-nodejs-applications', 'Best practices for creating high-performance Node.js applications', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...', '2023-06-15T10:00:00Z', TRUE, 12, 'Node.js,Backend,Performance', 'Building Scalable Node.js Apps - John Doe Blog', 'Discover techniques for building high-performance Node.js applications', '2023-06-10T16:00:00Z', '2023-06-15T11:00:00Z'),
('post_003', 'user_002', 'Design Systems Best Practices', 'design-systems-best-practices', 'How to create and maintain effective design systems', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur...', NULL, FALSE, 10, 'Design,Systems,UI', NULL, NULL, '2023-07-01T11:00:00Z', '2023-07-01T11:00:00Z');

-- Contact Messages
INSERT INTO contact_messages (message_id, name, email, subject, message, ip_address, user_agent, created_at) VALUES
('msg_001', 'Alice Johnson', 'alice@example.com', 'Project Inquiry', 'Hello, I''d like to discuss a potential project collaboration.', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2023-06-01T15:30:00Z'),
('msg_002', 'Bob Williams', 'bob@example.com', 'Speaking Engagement', 'Would you be interested in speaking at our upcoming tech conference?', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2023-06-15T11:20:00Z');

-- Resume Downloads
INSERT INTO resume_downloads (download_id, user_id, download_url, file_size_bytes, created_at) VALUES
('dl_001', 'user_001', 'https://portfolio.example.com/resumes/john_doe_resume.pdf', 102400, '2023-05-20T09:15:00Z'),
('dl_002', 'user_002', 'https://portfolio.example.com/resumes/jane_smith_resume.pdf', 98700, '2023-06-25T14:30:00Z');

-- Site Settings
INSERT INTO site_settings (setting_id, user_id, privacy_policy_content, terms_of_service_content, cookie_policy_content, seo_meta_title, seo_meta_description, google_analytics_id, created_at, updated_at) VALUES
('set_001', 'user_001', 'Privacy policy content goes here...', 'Terms of service content goes here...', 'Cookie policy content goes here...', 'John Doe - Portfolio', 'Professional portfolio of John Doe, Senior Software Engineer', 'UA-12345678-1', '2023-01-15T10:00:00Z', '2023-06-20T15:00:00Z'),
('set_002', 'user_002', 'Privacy policy content goes here...', 'Terms of service content goes here...', 'Cookie policy content goes here...', 'Jane Smith - Designer Portfolio', 'Portfolio of Jane Smith, Product Designer specializing in UI/UX', 'UA-87654321-1', '2023-02-10T12:00:00Z', '2023-07-15T17:00:00Z');

-- Testimonials
INSERT INTO testimonials (testimonial_id, user_id, client_name, client_position, company_name, content, rating, client_photo_url, project_reference, created_at, updated_at) VALUES
('test_001', 'user_001', 'Sarah Thompson', 'CTO', 'TechStart Inc.', 'John delivered exceptional work on our e-commerce platform. His technical expertise and problem-solving abilities were crucial to our project success.', 5, 'https://picsum.photos/seed/sarah/100/100', 'proj_001', '2023-06-01T13:00:00Z', '2023-06-01T13:00:00Z'),
('test_002', 'user_002', 'Michael Chen', 'Product Manager', 'FinTech Corp', 'Jane transformed our user experience completely. Her attention to detail and innovative approach resulted in a 40% increase in user engagement.', 5, 'https://picsum.photos/seed/michael/100/100', 'proj_003', '2023-05-15T14:30:00Z', '2023-05-15T14:30:00Z');

-- Social Media Links
INSERT INTO social_media_links (link_id, user_id, platform, url, display_order, created_at, updated_at) VALUES
('sm_001', 'user_001', 'GitHub', 'https://github.com/johndoe', 1, '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
('sm_002', 'user_001', 'LinkedIn', 'https://linkedin.com/in/johndoe', 2, '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
('sm_003', 'user_001', 'Twitter', 'https://twitter.com/johndoe', 3, '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
('sm_004', 'user_002', 'Behance', 'https://behance.net/janesmith', 1, '2023-02-10T12:00:00Z', '2023-02-10T12:00:00Z'),
('sm_005', 'user_002', 'Dribbble', 'https://dribbble.com/janesmith', 2, '2023-02-10T12:00:00Z', '2023-02-10T12:00:00Z');

-- Page Visits
INSERT INTO page_visits (visit_id, user_id, page_path, ip_address, user_agent, referrer, visited_at) VALUES
('visit_001', NULL, '/', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',