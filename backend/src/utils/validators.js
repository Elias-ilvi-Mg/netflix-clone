// src/utils/validators.js
import { z } from 'zod'

// ---- shared helpers
const StrId = z.union([z.string(), z.number()]).transform(v => String(v)).refine(v => v.length > 0, 'id required')
const Email = z.string().min(3).max(254).email().transform(v => v.trim().toLowerCase())
const Url = z.string().url()
const Caption = z.object({ label: z.string().min(1), srclang: z.string().min(2), src: Url })


export const CatalogSeriesCreateSchema = z.object({
  seriesId: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional().default(''),
  overview: z.string().optional().default(''),
  poster: z.string().optional().default(''),
  backdrop: z.string().optional().default(''),
  genres: z.array(z.string()).optional().default([]),
  maturity: z.string().optional().default('TV-14'),
  kids: z.boolean().optional().default(false),
  trailerUrl: Url.optional().default(''),
  trailerCaptions: z.array(Caption).optional().default([]),
})
export const CatalogSeriesUpdateSchema = CatalogSeriesCreateSchema.partial()

export const CatalogEpisodeCreateSchema = z.object({
  seriesId: z.union([z.string(), z.number()]).transform(String),
  season: z.coerce.number().int().min(0),
  episode: z.coerce.number().int().min(1),
  title: z.string().optional().default(''),
  overview: z.string().optional().default(''),
  runtimeSec: z.coerce.number().int().min(0).optional().default(0),
  streamUrl: Url,
  captions: z.array(Caption).optional().default([]),
  poster: z.string().optional().default(''),
  backdrop: z.string().optional().default(''),
  introStartSec: z.coerce.number().min(0).optional().default(0),
  introEndSec: z.coerce.number().min(0).optional().default(0),
  creditsStartSec: z.coerce.number().min(0).optional().default(0),
})
export const CatalogEpisodeUpdateSchema = CatalogEpisodeCreateSchema.partial()


export const CatalogCreateSchema = z.object({
  mediaId: z.union([z.string(), z.number()]).transform(v => String(v)),
  type: z.enum(['movie','tv']).default('movie'),
  title: z.string().optional().default(''),
  streamUrl: Url,
  poster: z.string().optional().default(''),
  backdrop: z.string().optional().default(''),
  captions: z.array(Caption).optional().default([]),
  maturity: z.string().optional().default('PG-13'),
  kids: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
})

export const CatalogUpdateSchema = CatalogCreateSchema.partial()



// ---- auth
export const RegisterSchema = z.object({
  email: Email,
  // keep demo-friendly
  password: z.string().min(6).max(72),
})

export const LoginSchema = z.object({
  email: Email,
  // allow any non-empty in demo
  password: z.string().min(1),
})

// ---- my list (save/toggle item)
export const SaveItemSchema = z.object({
  id: StrId,
  type: z.enum(['movie', 'tv']).optional().default('movie'),
  title: z.string().optional().default(''),
  poster: z.string().optional().default(''),
  backdrop: z.string().optional().default(''),
})

// ---- profiles
export const CreateProfileSchema = z.object({
  name: z.string().min(1).max(60),
  kids: z.boolean().optional().default(false),
})
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  kids: z.boolean().optional(),
})
export const ActiveProfileSchema = z.object({
  id: StrId,
})

// ---- playback progress
export const ProgressSaveSchema = z.object({
  mediaId: StrId,
  t: z.number().nonnegative(),
  d: z.number().nonnegative().optional().default(0),
})
// alias for routes that import ProgressSchema
export const ProgressSchema = ProgressSaveSchema

// ---- admin
export const RoleSchema = z.object({
  role: z.enum(['user', 'admin']),
})
