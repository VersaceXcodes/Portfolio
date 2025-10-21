import { z } from 'zod';

// USER SCHEMAS
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  tagline: z.string().nullable(),
  bio_text: z.string().nullable(),
  header_image_url: z.string().nullable(),
  avatar_url: z.string().nullable(),
  video_embed_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createUserInputSchema = z.object({
  user_id: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password_hash: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  tagline: z.string().nullable(),
  bio_text: z.string().nullable(),
  header_image_url: z.string().url().nullable(),
  avatar_url: z.string().url().nullable(),
  video_embed_url: z.string().url().nullable()
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().max(255).optional(),
  password_hash: z.string().min(1).max(255).optional(),
  name: z.string().min(1).max(255).optional(),
  tagline: z.string().nullable().optional(),
  bio_text: z.string().nullable().optional(),
  header_image_url: z.string().url().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  video_embed_url: z.string().url().nullable().optional()
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

// SOCIAL MEDIA LINK SCHEMAS
export const socialMediaLinkSchema = z.object({
  link_id: z.string(),
  user_id: z.string(),
  platform: z.string(),
  url: z.string(),
  display_order: z.number().int()
});

export const createSocialMediaLinkInputSchema = z.object({
  link_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  platform: z.string().min(1).max(255),
  url: z.string().url(),
  display_order: z.number().int().default(0)
});

export const updateSocialMediaLinkInputSchema = z.object({
  link_id: z.string(),
  user_id: z.string().optional(),
  platform: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  display_order: z.number().int().optional()
});

export const searchSocialMediaLinkInputSchema = z.object({
  user_id: z.string().optional(),
  platform: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['link_id', 'user_id', 'platform', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type SocialMediaLink = z.infer<typeof socialMediaLinkSchema>;
export type CreateSocialMediaLinkInput = z.infer<typeof createSocialMediaLinkInputSchema>;
export type UpdateSocialMediaLinkInput = z.infer<typeof updateSocialMediaLinkInputSchema>;
export type SearchSocialMediaLinkInput = z.infer<typeof searchSocialMediaLinkInputSchema>;

// SKILL SCHEMAS
export const skillSchema = z.object({
  skill_id: z.string(),
  user_id: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  proficiency_level: z.string().nullable(),
  icon_url: z.string().nullable(),
  description: z.string().nullable(),
  display_order: z.number().int()
});

export const createSkillInputSchema = z.object({
  skill_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  category: z.string().max(255).nullable(),
  proficiency_level: z.string().max(255).nullable(),
  icon_url: z.string().url().nullable(),
  description: z.string().nullable(),
  display_order: z.number().int().default(0)
});

export const updateSkillInputSchema = z.object({
  skill_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  category: z.string().max(255).nullable().optional(),
  proficiency_level: z.string().max(255).nullable().optional(),
  icon_url: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  display_order: z.number().int().optional()
});

export const searchSkillInputSchema = z.object({
  user_id: z.string().optional(),
  category: z.string().optional(),
  proficiency_level: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['skill_id', 'user_id', 'name', 'category', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type Skill = z.infer<typeof skillSchema>;
export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillInputSchema>;
export type SearchSkillInput = z.infer<typeof searchSkillInputSchema>;

// PROJECT SCHEMAS
export const projectSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  project_url: z.string().nullable(),
  source_code_url: z.string().nullable(),
  tech_stack: z.string().nullable(),
  display_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProjectInputSchema = z.object({
  project_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  thumbnail_url: z.string().url().nullable(),
  project_url: z.string().url().nullable(),
  source_code_url: z.string().url().nullable(),
  tech_stack: z.string().nullable(),
  display_order: z.number().int().default(0)
});

export const updateProjectInputSchema = z.object({
  project_id: z.string(),
  user_id: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  project_url: z.string().url().nullable().optional(),
  source_code_url: z.string().url().nullable().optional(),
  tech_stack: z.string().nullable().optional(),
  display_order: z.number().int().optional()
});

export const searchProjectInputSchema = z.object({
  user_id: z.string().optional(),
  title: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['project_id', 'user_id', 'title', 'display_order', 'created_at']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type SearchProjectInput = z.infer<typeof searchProjectInputSchema>;

// PROJECT SCREENSHOT SCHEMAS
export const projectScreenshotSchema = z.object({
  screenshot_id: z.string(),
  project_id: z.string(),
  image_url: z.string(),
  caption: z.string().nullable(),
  display_order: z.number().int()
});

export const createProjectScreenshotInputSchema = z.object({
  screenshot_id: z.string().min(1).max(255),
  project_id: z.string().min(1).max(255),
  image_url: z.string().url(),
  caption: z.string().nullable(),
  display_order: z.number().int().default(0)
});

export const updateProjectScreenshotInputSchema = z.object({
  screenshot_id: z.string(),
  project_id: z.string().optional(),
  image_url: z.string().url().optional(),
  caption: z.string().nullable().optional(),
  display_order: z.number().int().optional()
});

export const searchProjectScreenshotInputSchema = z.object({
  project_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['screenshot_id', 'project_id', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type ProjectScreenshot = z.infer<typeof projectScreenshotSchema>;
export type CreateProjectScreenshotInput = z.infer<typeof createProjectScreenshotInputSchema>;
export type UpdateProjectScreenshotInput = z.infer<typeof updateProjectScreenshotInputSchema>;
export type SearchProjectScreenshotInput = z.infer<typeof searchProjectScreenshotInputSchema>;

// EXPERIENCE SCHEMAS
export const experienceSchema = z.object({
  experience_id: z.string(),
  user_id: z.string(),
  role_title: z.string(),
  company_name: z.string(),
  company_logo_url: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_current: z.boolean(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  display_order: z.number().int()
});

export const createExperienceInputSchema = z.object({
  experience_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  role_title: z.string().min(1).max(255),
  company_name: z.string().min(1).max(255),
  company_logo_url: z.string().url().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_current: z.boolean().default(false),
  location: z.string().max(255).nullable(),
  description: z.string().nullable(),
  display_order: z.number().int().default(0)
});

export const updateExperienceInputSchema = z.object({
  experience_id: z.string(),
  user_id: z.string().optional(),
  role_title: z.string().min(1).max(255).optional(),
  company_name: z.string().min(1).max(255).optional(),
  company_logo_url: z.string().url().nullable().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional(),
  location: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  display_order: z.number().int().optional()
});

export const searchExperienceInputSchema = z.object({
  user_id: z.string().optional(),
  company_name: z.string().optional(),
  is_current: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['experience_id', 'user_id', 'role_title', 'company_name', 'start_date', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Experience = z.infer<typeof experienceSchema>;
export type CreateExperienceInput = z.infer<typeof createExperienceInputSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceInputSchema>;
export type SearchExperienceInput = z.infer<typeof searchExperienceInputSchema>;

// EDUCATION SCHEMAS
export const educationSchema = z.object({
  education_id: z.string(),
  user_id: z.string(),
  institution_name: z.string(),
  degree: z.string().nullable(),
  institution_logo_url: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_current: z.boolean(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  display_order: z.number().int()
});

export const createEducationInputSchema = z.object({
  education_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  institution_name: z.string().min(1).max(255),
  degree: z.string().max(255).nullable(),
  institution_logo_url: z.string().url().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_current: z.boolean().default(false),
  location: z.string().max(255).nullable(),
  description: z.string().nullable(),
  display_order: z.number().int().default(0)
});

export const updateEducationInputSchema = z.object({
  education_id: z.string(),
  user_id: z.string().optional(),
  institution_name: z.string().min(1).max(255).optional(),
  degree: z.string().max(255).nullable().optional(),
  institution_logo_url: z.string().url().nullable().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().optional(),
  location: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  display_order: z.number().int().optional()
});

export const searchEducationInputSchema = z.object({
  user_id: z.string().optional(),
  institution_name: z.string().optional(),
  degree: z.string().optional(),
  is_current: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['education_id', 'user_id', 'institution_name', 'degree', 'start_date', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Education = z.infer<typeof educationSchema>;
export type CreateEducationInput = z.infer<typeof createEducationInputSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationInputSchema>;
export type SearchEducationInput = z.infer<typeof searchEducationInputSchema>;

// KEY FACT SCHEMAS
export const keyFactSchema = z.object({
  fact_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  display_order: z.number().int()
});

export const createKeyFactInputSchema = z.object({
  fact_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  content: z.string().min(1),
  display_order: z.number().int().default(0)
});

export const updateKeyFactInputSchema = z.object({
  fact_id: z.string(),
  user_id: z.string().optional(),
  content: z.string().min(1).optional(),
  display_order: z.number().int().optional()
});

export const searchKeyFactInputSchema = z.object({
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['fact_id', 'user_id', 'display_order']).default('display_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
});

export type KeyFact = z.infer<typeof keyFactSchema>;
export type CreateKeyFactInput = z.infer<typeof createKeyFactInputSchema>;
export type UpdateKeyFactInput = z.infer<typeof updateKeyFactInputSchema>;
export type SearchKeyFactInput = z.infer<typeof searchKeyFactInputSchema>;

// RESUME DOWNLOAD SCHEMAS
export const resumeDownloadSchema = z.object({
  download_id: z.string(),
  user_id: z.string(),
  file_format: z.string(),
  download_url: z.string(),
  created_at: z.string()
});

export const createResumeDownloadInputSchema = z.object({
  download_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  file_format: z.string().min(1).max(50),
  download_url: z.string().url(),
  created_at: z.string()
});

export const updateResumeDownloadInputSchema = z.object({
  download_id: z.string(),
  user_id: z.string().optional(),
  file_format: z.string().min(1).max(50).optional(),
  download_url: z.string().url().optional()
});

export const searchResumeDownloadInputSchema = z.object({
  user_id: z.string().optional(),
  file_format: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['download_id', 'user_id', 'file_format', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ResumeDownload = z.infer<typeof resumeDownloadSchema>;
export type CreateResumeDownloadInput = z.infer<typeof createResumeDownloadInputSchema>;
export type UpdateResumeDownloadInput = z.infer<typeof updateResumeDownloadInputSchema>;
export type SearchResumeDownloadInput = z.infer<typeof searchResumeDownloadInputSchema>;

// CONTACT MESSAGE SCHEMAS
export const contactMessageSchema = z.object({
  message_id: z.string(),
  user_id: z.string(),
  sender_name: z.string(),
  sender_email: z.string(),
  sender_phone: z.string().nullable(),
  message_content: z.string(),
  sent_at: z.string(),
  status: z.string()
});

export const createContactMessageInputSchema = z.object({
  message_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  sender_name: z.string().min(1).max(255),
  sender_email: z.string().email().max(255),
  sender_phone: z.string().max(50).nullable(),
  message_content: z.string().min(1),
  sent_at: z.string(),
  status: z.string().min(1).max(50).default('pending')
});

export const updateContactMessageInputSchema = z.object({
  message_id: z.string(),
  user_id: z.string().optional(),
  sender_name: z.string().min(1).max(255).optional(),
  sender_email: z.string().email().max(255).optional(),
  sender_phone: z.string().max(50).nullable().optional(),
  message_content: z.string().min(1).optional(),
  sent_at: z.string().optional(),
  status: z.string().min(1).max(50).optional()
});

export const searchContactMessageInputSchema = z.object({
  user_id: z.string().optional(),
  sender_email: z.string().optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['message_id', 'user_id', 'sender_email', 'sent_at', 'status']).default('sent_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;
export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageInputSchema>;
export type SearchContactMessageInput = z.infer<typeof searchContactMessageInputSchema>;

// APP SETTINGS SCHEMAS
export const appSettingSchema = z.object({
  setting_id: z.string(),
  user_id: z.string(),
  theme_mode: z.string(),
  font_scale: z.number(),
  hidden_sections: z.string().nullable(),
  updated_at: z.string()
});

export const createAppSettingInputSchema = z.object({
  setting_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  theme_mode: z.string().min(1).max(50).default('light'),
  font_scale: z.number().default(1),
  hidden_sections: z.string().nullable(),
  updated_at: z.string()
});

export const updateAppSettingInputSchema = z.object({
  setting_id: z.string(),
  user_id: z.string().optional(),
  theme_mode: z.string().min(1).max(50).optional(),
  font_scale: z.number().optional(),
  hidden_sections: z.string().nullable().optional(),
  updated_at: z.string().optional()
});

export const searchAppSettingInputSchema = z.object({
  user_id: z.string().optional(),
  theme_mode: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['setting_id', 'user_id', 'theme_mode', 'updated_at']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AppSetting = z.infer<typeof appSettingSchema>;
export type CreateAppSettingInput = z.infer<typeof createAppSettingInputSchema>;
export type UpdateAppSettingInput = z.infer<typeof updateAppSettingInputSchema>;
export type SearchAppSettingInput = z.infer<typeof searchAppSettingInputSchema>;

// NAVIGATION PREFERENCE SCHEMAS
export const navigationPreferenceSchema = z.object({
  preference_id: z.string(),
  user_id: z.string(),
  hidden_tabs: z.string().nullable(),
  updated_at: z.string()
});

export const createNavigationPreferenceInputSchema = z.object({
  preference_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  hidden_tabs: z.string().nullable(),
  updated_at: z.string()
});

export const updateNavigationPreferenceInputSchema = z.object({
  preference_id: z.string(),
  user_id: z.string().optional(),
  hidden_tabs: z.string().nullable().optional(),
  updated_at: z.string().optional()
});

export const searchNavigationPreferenceInputSchema = z.object({
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['preference_id', 'user_id', 'updated_at']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type NavigationPreference = z.infer<typeof navigationPreferenceSchema>;
export type CreateNavigationPreferenceInput = z.infer<typeof createNavigationPreferenceInputSchema>;
export type UpdateNavigationPreferenceInput = z.infer<typeof updateNavigationPreferenceInputSchema>;
export type SearchNavigationPreferenceInput = z.infer<typeof searchNavigationPreferenceInputSchema>;