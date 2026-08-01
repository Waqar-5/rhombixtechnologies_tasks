import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['jobseeker', 'recruiter']),
    companyName: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
  .refine((data) => data.role !== 'recruiter' || (data.companyName && data.companyName.trim().length > 1), {
    message: 'Company name is required for recruiter accounts',
    path: ['companyName']
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address')
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const jobSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120),
  category: z.string().min(1, 'Select a category'),
  description: z.string().min(50, 'Description should be at least 50 characters'),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  workMode: z.enum(['on-site', 'remote', 'hybrid']),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead']),
  location: z.string().min(2, 'Location is required'),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  vacancies: z.coerce.number().min(1).default(1),
  skills: z.string().optional(),
  applicationDeadline: z.string().optional()
});

export const applySchema = z.object({
  coverNote: z.string().max(1500, 'Keep the note under 1500 characters').optional()
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  skills: z.string().optional()
});

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(120),
  tagline: z.string().max(160).optional(),
  description: z.string().max(3000).optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  founded: z.coerce.number().optional(),
  website: z.string().optional(),
  headquarters: z.string().optional()
});
