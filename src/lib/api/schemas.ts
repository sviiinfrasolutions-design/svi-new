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
  subject: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
});

export type GrievanceInput = z.infer<typeof grievanceSchema>;

// ─── Lottery Draw ──────────────────────────────────────────────────────────
// Supports both modes:
//   - Manual: winnerId or winnerIds array specifies exact winners
//   - Random: neither winnerId nor winnerIds provided → random selection
export const lotteryDrawSchema = z.object({
  lotteryId: z.string().uuid('Invalid lottery ID'),
  winnerId: z.string().uuid().optional(),
  winnerIds: z.array(z.string().uuid()).optional(),
});

export type LotteryDrawInput = z.infer<typeof lotteryDrawSchema>;

// ─── Property Registration ────────────────────────────────────────────────
export const propertyRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').max(255).optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
  project: z.string().min(1, 'Project is required'),
  property_type: z.string().optional(),
  property_size: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export type PropertyRegistrationInput = z.infer<typeof propertyRegistrationSchema>;

// ─── Email Campaign ────────────────────────────────────────────────────────
export const emailCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(500),
  body_html: z.string().min(1, 'Body is required'),
  recipient_group: z.enum(['all_users', 'custom', 'lottery_participants']).default('all_users'),
  custom_emails: z.array(z.string().email()).optional(),
  scheduled_at: z.string().datetime().optional(),
  reminder_at: z.string().datetime().optional(),
  reminder_subject: z.string().max(500).optional(),
  lottery_id: z.string().uuid().optional(),
});

export type EmailCampaignInput = z.infer<typeof emailCampaignSchema>;
