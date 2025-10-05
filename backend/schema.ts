import { z } from 'zod';

// Users
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  professional_title: z.string().nullable(),
  tagline: z.string().nullable(),
  bio: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  phone_number: z.string().nullable(),
  location: z.string().nullable(),
  github_url: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  twitter_url: z.string().nullable(),
  website_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createUserInputSchema = z.object({
  email: z.string().email().max(255),
  password_hash: z.string().min(1),
  name: z.string().min(1).max(255),
  professional_title: z.string().max(255).nullable().optional(),
  tagline: z.string().max(500).nullable().optional(),
  bio: z.string().nullable().optional(),
  profile_image_url: z.string().max(500).nullable().optional(),
  phone_number: z.string().max(50).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  github_url: z.string().max(500).nullable().optional(),
  linkedin_url: z.string().max(500).nullable().optional(),
  twitter_url: z.string().max(500).nullable().optional(),
  website_url: z.string().max(500).nullable().optional()
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().max(255).optional(),
  password_hash: z.string().min(1).optional(),
  name: z.string().min(1).max(255).optional(),
  professional_title: z.string().max(255).nullable().optional(),
  tagline: z.string().max(500).nullable().optional(),
  bio: z.string().nullable().optional(),
  profile_image_url: z.string().max(500).nullable().optional(),
  phone_number: z.string().max(50).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  github_url: z.string().max(500).nullable().optional(),
  linkedin_url: z.string().max(500).nullable().optional(),
  twitter_url: z.string().max(500).nullable().optional(),
  website_url: z.string().max(500).nullable().optional()
});

export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['user_id', 'email', 'name', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;


// Skills
export const skillSchema = z.object({
  skill_id: z.string(),
  user_id: z.string(),
  category: z.string(),
  name: z.string(),
  proficiency_level: z.number().int().nullable(),
  description: z.string().nullable(),
  icon_name: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createSkillInputSchema = z.object({
  user_id: z.string(),
  category: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  proficiency_level: z.number().int().min(0).max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  icon_name: z.string().max(100).nullable().optional()
});

export const updateSkillInputSchema = z.object({
  skill_id: z.string(),
  user_id: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  proficiency_level: z.number().int().min(0).max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  icon_name: z.string().max(100).nullable().optional()
});

export const searchSkillInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['skill_id', 'category', 'name', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Skill = z.infer<typeof skillSchema>;
export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillInputSchema>;
export type SearchSkillInput = z.infer<typeof searchSkillInputSchema>;


// Projects
export const projectSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string(),
  project_type: z.string().nullable(),
  role_in_project: z.string().nullable(),
  problem_statement: z.string().nullable(),
  solution_approach: z.string().nullable(),
  technical_challenges: z.string().nullable(),
  technologies_used: z.string().nullable(),
  live_demo_url: z.string().nullable(),
  github_repo_url: z.string().nullable(),
  app_store_url: z.string().nullable(),
  play_store_url: z.string().nullable(),
  case_study_url: z.string().nullable(),
  is_featured: z.boolean(),
  status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProjectInputSchema = z.object({
  user_id: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  project_type: z.string().max(100).nullable().optional(),
  role_in_project: z.string().max(100).nullable().optional(),
  problem_statement: z.string().nullable().optional(),
  solution_approach: z.string().nullable().optional(),
  technical_challenges: z.string().nullable().optional(),
  technologies_used: z.string().nullable().optional(),
  live_demo_url: z.string().max(500).nullable().optional(),
  github_repo_url: z.string().max(500).nullable().optional(),
  app_store_url: z.string().max(500).nullable().optional(),
  play_store_url: z.string().max(500).nullable().optional(),
  case_study_url: z.string().max(500).nullable().optional(),
  is_featured: z.boolean().default(false),
  status: z.string().max(50).nullable().optional()
});

export const updateProjectInputSchema = z.object({
  project_id: z.string(),
  user_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  project_type: z.string().max(100).nullable().optional(),
  role_in_project: z.string().max(100).nullable().optional(),
  problem_statement: z.string().nullable().optional(),
  solution_approach: z.string().nullable().optional(),
  technical_challenges: z.string().nullable().optional(),
  technologies_used: z.string().nullable().optional(),
  live_demo_url: z.string().max(500).nullable().optional(),
  github_repo_url: z.string().max(500).nullable().optional(),
  app_store_url: z.string().max(500).nullable().optional(),
  play_store_url: z.string().max(500).nullable().optional(),
  case_study_url: z.string().max(500).nullable().optional(),
  is_featured: z.boolean().optional(),
  status: z.string().max(50).nullable().optional()
});

export const searchProjectInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  is_featured: z.boolean().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['project_id', 'title', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type SearchProjectInput = z.infer<typeof searchProjectInputSchema>;


// Project Images
export const projectImageSchema = z.object({
  image_id: z.string(),
  project_id: z.string(),
  image_url: z.string(),
  alt_text: z.string().nullable(),
  caption: z.string().nullable(),
  display_order: z.number().int().nullable(),
  created_at: z.string()
});

export const createProjectImageInputSchema = z.object({
  project_id: z.string(),
  image_url: z.string().url().max(500),
  alt_text: z.string().max(255).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  display_order: z.number().int().nullable().optional()
});

export const updateProjectImageInputSchema = z.object({
  image_id: z.string(),
  project_id: z.string().optional(),
  image_url: z.string().url().max(500).optional(),
  alt_text: z.string().max(255).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  display_order: z.number().int().nullable().optional()
});

export const searchProjectImageInputSchema = z.object({
  project_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['image_id', 'display_order', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type ProjectImage = z.infer<typeof projectImageSchema>;
export type CreateProjectImageInput = z.infer<typeof createProjectImageInputSchema>;
export type UpdateProjectImageInput = z.infer<typeof updateProjectImageInputSchema>;
export type SearchProjectImageInput = z.infer<typeof searchProjectImageInputSchema>;


// Experiences
export const experienceSchema = z.object({
  experience_id: z.string(),
  user_id: z.string(),
  company_name: z.string(),
  company_logo_url: z.string().nullable(),
  job_title: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_current: z.boolean(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  technologies_used: z.string().nullable(),
  achievements: z.string().nullable(),
  company_website_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createExperienceInputSchema = z.object({
  user_id: z.string(),
  company_name: z.string().min(1).max(255),
  company_logo_url: z.string().url().max(500).nullable().optional(),
  job_title: z.string().min(1).max(255),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  location: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  technologies_used: z.string().nullable().optional(),
  achievements: z.string().nullable().optional(),
  company_website_url: z.string().url().max(500).nullable().optional()
});

export const updateExperienceInputSchema = z.object({
  experience_id: z.string(),
  user_id: z.string().optional(),
  company_name: z.string().min(1).max(255).optional(),
  company_logo_url: z.string().url().max(500).nullable().optional(),
  job_title: z.string().min(1).max(255).optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional(),
  location: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  technologies_used: z.string().nullable().optional(),
  achievements: z.string().nullable().optional(),
  company_website_url: z.string().url().max(500).nullable().optional()
});

export const searchExperienceInputSchema = z.object({
  user_id: z.string().optional(),
  company_name: z.string().optional(),
  is_current: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['experience_id', 'start_date', 'company_name', 'created_at', 'updated_at']).default('start_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Experience = z.infer<typeof experienceSchema>;
export type CreateExperienceInput = z.infer<typeof createExperienceInputSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceInputSchema>;
export type SearchExperienceInput = z.infer<typeof searchExperienceInputSchema>;


// Educations
export const educationSchema = z.object({
  education_id: z.string(),
  user_id: z.string(),
  institution_name: z.string(),
  degree: z.string(),
  field_of_study: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  grade: z.string().nullable(),
  description: z.string().nullable(),
  institution_website_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createEducationInputSchema = z.object({
  user_id: z.string(),
  institution_name: z.string().min(1).max(255),
  degree: z.string().min(1).max(255),
  field_of_study: z.string().max(255).nullable().optional(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  grade: z.string().max(50).nullable().optional(),
  description: z.string().nullable().optional(),
  institution_website_url: z.string().url().max(500).nullable().optional()
});

export const updateEducationInputSchema = z.object({
  education_id: z.string(),
  user_id: z.string().optional(),
  institution_name: z.string().min(1).max(255).optional(),
  degree: z.string().min(1).max(255).optional(),
  field_of_study: z.string().max(255).nullable().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  grade: z.string().max(50).nullable().optional(),
  description: z.string().nullable().optional(),
  institution_website_url: z.string().url().max(500).nullable().optional()
});

export const searchEducationInputSchema = z.object({
  user_id: z.string().optional(),
  institution_name: z.string().optional(),
  degree: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['education_id', 'start_date', 'institution_name', 'created_at', 'updated_at']).default('start_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Education = z.infer<typeof educationSchema>;
export type CreateEducationInput = z.infer<typeof createEducationInputSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationInputSchema>;
export type SearchEducationInput = z.infer<typeof searchEducationInputSchema>;


// Certifications
export const certificationSchema = z.object({
  certification_id: z.string(),
  user_id: z.string(),
  name: z.string(),
  issuing_organization: z.string(),
  issue_date: z.string(),
  expiration_date: z.string().nullable(),
  credential_id: z.string().nullable(),
  credential_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createCertificationInputSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1).max(255),
  issuing_organization: z.string().min(1).max(255),
  issue_date: z.string(),
  expiration_date: z.string().nullable().optional(),
  credential_id: z.string().max(255).nullable().optional(),
  credential_url: z.string().url().max(500).nullable().optional()
});

export const updateCertificationInputSchema = z.object({
  certification_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  issuing_organization: z.string().min(1).max(255).optional(),
  issue_date: z.string().optional(),
  expiration_date: z.string().nullable().optional(),
  credential_id: z.string().max(255).nullable().optional(),
  credential_url: z.string().url().max(500).nullable().optional()
});

export const searchCertificationInputSchema = z.object({
  user_id: z.string().optional(),
  issuing_organization: z.string().optional(),
  has_expired: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['certification_id', 'issue_date', 'name', 'created_at', 'updated_at']).default('issue_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Certification = z.infer<typeof certificationSchema>;
export type CreateCertificationInput = z.infer<typeof createCertificationInputSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationInputSchema>;
export type SearchCertificationInput = z.infer<typeof searchCertificationInputSchema>;


// Blog Posts
export const blogPostSchema = z.object({
  post_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  published_at: z.string().nullable(),
  is_published: z.boolean(),
  read_time_minutes: z.number().int().nullable(),
  tags: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createBlogPostInputSchema = z.object({
  user_id: z.string(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1),
  published_at: z.string().nullable().optional(),
  is_published: z.boolean().default(false),
  read_time_minutes: z.number().int().positive().nullable().optional(),
  tags: z.string().nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional()
});

export const updateBlogPostInputSchema = z.object({
  post_id: z.string(),
  user_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  published_at: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  read_time_minutes: z.number().int().positive().nullable().optional(),
  tags: z.string().nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional()
});

export const searchBlogPostInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  is_published: z.boolean().optional(),
  tags: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['post_id', 'title', 'published_at', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;
export type SearchBlogPostInput = z.infer<typeof searchBlogPostInputSchema>;


// Contact Messages
export const contactMessageSchema = z.object({
  message_id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string().nullable(),
  message: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string()
});

export const createContactMessageInputSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  subject: z.string().max(255).nullable().optional(),
  message: z.string().min(1),
  ip_address: z.string().max(50).nullable().optional(),
  user_agent: z.string().nullable().optional()
});

export const updateContactMessageInputSchema = z.object({
  message_id: z.string(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  subject: z.string().max(255).nullable().optional(),
  message: z.string().min(1).optional(),
  ip_address: z.string().max(50).nullable().optional(),
  user_agent: z.string().nullable().optional()
});

export const searchContactMessageInputSchema = z.object({
  query: z.string().optional(),
  email: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['message_id', 'created_at', 'name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;
export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageInputSchema>;
export type SearchContactMessageInput = z.infer<typeof searchContactMessageInputSchema>;


// Resume Downloads
export const resumeDownloadSchema = z.object({
  download_id: z.string(),
  user_id: z.string(),
  download_url: z.string(),
  file_size_bytes: z.number().int().nullable(),
  created_at: z.string()
});

export const createResumeDownloadInputSchema = z.object({
  user_id: z.string(),
  download_url: z.string().url().max(500),
  file_size_bytes: z.number().int().positive().nullable().optional()
});

export const updateResumeDownloadInputSchema = z.object({
  download_id: z.string(),
  user_id: z.string().optional(),
  download_url: z.string().url().max(500).optional(),
  file_size_bytes: z.number().int().positive().nullable().optional()
});

export const searchResumeDownloadInputSchema = z.object({
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['download_id', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ResumeDownload = z.infer<typeof resumeDownloadSchema>;
export type CreateResumeDownloadInput = z.infer<typeof createResumeDownloadInputSchema>;
export type UpdateResumeDownloadInput = z.infer<typeof updateResumeDownloadInputSchema>;
export type SearchResumeDownloadInput = z.infer<typeof searchResumeDownloadInputSchema>;


// Site Settings
export const siteSettingSchema = z.object({
  setting_id: z.string(),
  user_id: z.string(),
  privacy_policy_content: z.string().nullable(),
  terms_of_service_content: z.string().nullable(),
  cookie_policy_content: z.string().nullable(),
  seo_meta_title: z.string().nullable(),
  seo_meta_description: z.string().nullable(),
  google_analytics_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createSiteSettingInputSchema = z.object({
  user_id: z.string(),
  privacy_policy_content: z.string().nullable().optional(),
  terms_of_service_content: z.string().nullable().optional(),
  cookie_policy_content: z.string().nullable().optional(),
  seo_meta_title: z.string().max(255).nullable().optional(),
  seo_meta_description: z.string().max(500).nullable().optional(),
  google_analytics_id: z.string().max(100).nullable().optional()
});

export const updateSiteSettingInputSchema = z.object({
  setting_id: z.string(),
  user_id: z.string().optional(),
  privacy_policy_content: z.string().nullable().optional(),
  terms_of_service_content: z.string().nullable().optional(),
  cookie_policy_content: z.string().nullable().optional(),
  seo_meta_title: z.string().max(255).nullable().optional(),
  seo_meta_description: z.string().max(500).nullable().optional(),
  google_analytics_id: z.string().max(100).nullable().optional()
});

export const searchSiteSettingInputSchema = z.object({
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['setting_id', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type SiteSetting = z.infer<typeof siteSettingSchema>;
export type CreateSiteSettingInput = z.infer<typeof createSiteSettingInputSchema>;
export type UpdateSiteSettingInput = z.infer<typeof updateSiteSettingInputSchema>;
export type SearchSiteSettingInput = z.infer<typeof searchSiteSettingInputSchema>;


// Testimonials
export const testimonialSchema = z.object({
  testimonial_id: z.string(),
  user_id: z.string(),
  client_name: z.string(),
  client_position: z.string().nullable(),
  company_name: z.string().nullable(),
  content: z.string(),
  rating: z.number().int().min(1).max(5).nullable(),
  client_photo_url: z.string().nullable(),
  project_reference: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createTestimonialInputSchema = z.object({
  user_id: z.string(),
  client_name: z.string().min(1).max(255),
  client_position: z.string().max(255).nullable().optional(),
  company_name: z.string().max(255).nullable().optional(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  client_photo_url: z.string().url().max(500).nullable().optional(),
  project_reference: z.string().nullable().optional()
});

export const updateTestimonialInputSchema = z.object({
  testimonial_id: z.string(),
  user_id: z.string().optional(),
  client_name: z.string().min(1).max(255).optional(),
  client_position: z.string().max(255).nullable().optional(),
  company_name: z.string().max(255).nullable().optional(),
  content: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  client_photo_url: z.string().url().max(500).nullable().optional(),
  project_reference: z.string().nullable().optional()
});

export const searchTestimonialInputSchema = z.object({
  user_id: z.string().optional(),
  project_reference: z.string().optional(),
  company_name: z.string().optional(),
  min_rating: z.number().int().min(1).max(5).optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['testimonial_id', 'rating', 'created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Testimonial = z.infer<typeof testimonialSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialInputSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialInputSchema>;
export type SearchTestimonialInput = z.infer<typeof searchTestimonialInputSchema>;


// Social Media Links
export const socialMediaLinkSchema = z.object({
  link_id: z.string(),
  user_id: z.string(),
  platform: z.string(),
  url: z.string(),
  display_order: z.number().int().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createSocialMediaLinkInputSchema = z.object({
  user_id: z.string(),
  platform: z.string().min(1).max(100),
  url: z.string().url().max(500),
  display_order: z.number().int().nullable().optional()
});

export const updateSocialMediaLinkInputSchema = z.object({
  link_id: z.string(),
  user_id: z.string().optional(),
  platform: z.string().min(1).max(100).optional(),
  url: z.string().url().max(500).optional(),
  display_order: z.number().int().nullable().optional()
});

export const searchSocialMediaLinkInputSchema = z.object({
  user_id: z.string().optional(),
  platform: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['link_id', 'platform', 'display_order', 'created_at', 'updated_at']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type SocialMediaLink = z.infer<typeof socialMediaLinkSchema>;
export type CreateSocialMediaLinkInput = z.infer<typeof createSocialMediaLinkInputSchema>;
export type UpdateSocialMediaLinkInput = z.infer<typeof updateSocialMediaLinkInputSchema>;
export type SearchSocialMediaLinkInput = z.infer<typeof searchSocialMediaLinkInputSchema>;


// Page Visits
export const pageVisitSchema = z.object({
  visit_id: z.string(),
  user_id: z.string().nullable(),
  page_path: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  referrer: z.string().nullable(),
  visited_at: z.string()
});

export const createPageVisitInputSchema = z.object({
  user_id: z.string().nullable().optional(),
  page_path: z.string().min(1).max(500),
  ip_address: z.string().max(50).nullable().optional(),
  user_agent: z.string().nullable().optional(),
  referrer: z.string().max(500).nullable().optional()
});

export const updatePageVisitInputSchema = z.object({
  visit_id: z.string(),
  user_id: z.string().nullable().optional(),
  page_path: z.string().min(1).max(500).optional(),
  ip_address: z.string().max(50).nullable().optional(),
  user_agent: z.string().nullable().optional(),
  referrer: z.string().max(500).nullable().optional()
});

export const searchPageVisitInputSchema = z.object({
  user_id: z.string().optional(),
  page_path: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['visit_id', 'visited_at', 'page_path']).default('visited_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type PageVisit = z.infer<typeof pageVisitSchema>;
export type CreatePageVisitInput = z.infer<typeof createPageVisitInputSchema>;
export type UpdatePageVisitInput = z.infer<typeof updatePageVisitInputSchema>;
export type SearchPageVisitInput = z.infer<typeof searchPageVisitInputSchema>;


// Section Visits
export const sectionVisitSchema = z.object({
  section_visit_id: z.string(),
  user_id: z.string().nullable(),
  page_path: z.string(),
  section_name: z.string(),
  visit_count: z.number().int(),
  last_visited_at: z.string()
});

export const createSectionVisitInputSchema = z.object({
  user_id: z.string().nullable().optional(),
  page_path: z.string().min(1).max(500),
  section_name: z.string().min(1).max(100),
  visit_count: z.number().int().positive().default(1)
});

export const updateSectionVisitInputSchema = z.object({
  section_visit_id: z.string(),
  user_id: z.string().nullable().optional(),
  page_path: z.string().min(1).max(500).optional(),
  section_name: z.string().min(1).max(100).optional(),
  visit_count: z.number().int().positive().optional()
});

export const searchSectionVisitInputSchema = z.object({
  user_id: z.string().optional(),
  page_path: z.string().optional(),
  section_name: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['section_visit_id', 'visit_count', 'last_visited_at']).default('last_visited_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type SectionVisit = z.infer<typeof sectionVisitSchema>;
export type CreateSectionVisitInput = z.infer<typeof createSectionVisitInputSchema>;
export type UpdateSectionVisitInput = z.infer<typeof updateSectionVisitInputSchema>;
export type SearchSectionVisitInput = z.infer<typeof searchSectionVisitInputSchema>;


// Media Assets
export const mediaAssetSchema = z.object({
  asset_id: z.string(),
  user_id: z.string(),
  filename: z.string(),
  url: z.string(),
  content_type: z.string(),
  file_size_bytes: z.number().int(),
  alt_text: z.string().nullable(),
  uploaded_at: z.string()
});

export const createMediaAssetInputSchema = z.object({
  user_id: z.string(),
  filename: z.string().min(1).max(255),
  url: z.string().url().max(500),
  content_type: z.string().min(1).max(100),
  file_size_bytes: z.number().int().positive(),
  alt_text: z.string().max(255).nullable().optional()
});

export const updateMediaAssetInputSchema = z.object({
  asset_id: z.string(),
  user_id: z.string().optional(),
  filename: z.string().min(1).max(255).optional(),
  url: z.string().url().max(500).optional(),
  content_type: z.string().min(1).max(100).optional(),
  file_size_bytes: z.number().int().positive().optional(),
  alt_text: z.string().max(255).nullable().optional()
});

export const searchMediaAssetInputSchema = z.object({
  user_id: z.string().optional(),
  content_type: z.string().optional(),
  filename: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['asset_id', 'filename', 'uploaded_at', 'file_size_bytes']).default('uploaded_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type CreateMediaAssetInput = z.infer<typeof createMediaAssetInputSchema>;
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetInputSchema>;
export type SearchMediaAssetInput = z.infer<typeof searchMediaAssetInputSchema>;