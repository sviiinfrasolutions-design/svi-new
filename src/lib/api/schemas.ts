import { z } from 'zod';

// ─── Contact Form ──────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters'),

  email: z.string().email('Invalid email address').max(255, 'Email too long'),

  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),

  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be under 200 characters'),

  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be under 5000 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Chat Message ──────────────────────────────────────────────────────────
export const chatMessageSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      parts: z.array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
        })
      ),
    })
  ),
});

// ─── Grievance ─────────────────────────────────────────────────────────────
export const grievanceSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(20).max(5000),
});

export type GrievanceInput = z.infer<typeof grievanceSchema>;
