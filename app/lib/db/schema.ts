import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { users } from './auth-schema';
export * from './auth-schema';

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  duration: integer('duration').notNull(),
  r2Key: text('r2_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const artifactTypes = ['transcript', 'words', 'srt'] as const;
export type ArtifactType = (typeof artifactTypes)[number];

export const artifacts = sqliteTable('artifacts', {
  id: text('id').primaryKey(),
  videoId: text('video_id')
    .notNull()
    .references(() => videos.id, { onDelete: 'cascade' }),
  type: text('type', { enum: artifactTypes }).notNull(),
  r2Key: text('r2_key').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});


