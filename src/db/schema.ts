import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const Users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  isAdmin: boolean("isAdmin").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const Accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const Sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const VerificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const Authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const Albums = pgTable("albums", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("userId")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const Photos = pgTable("photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  albumId: text("albumId")
    .notNull()
    .references(() => Albums.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  key: text("key").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const AdminAuditLogs = pgTable("admin_audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: text("adminId")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  performedAt: timestamp("performed_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const UsersRelations = relations(Users, ({ many }) => ({
  albums: many(Albums),
}));

export const AlbumsRelations = relations(Albums, ({ one, many }) => ({
  photos: many(Photos),
  user: one(Users, {
    fields: [Albums.userId],
    references: [Users.id],
  }),
}));

export const PhotosRelations = relations(Photos, ({ one }) => ({
  album: one(Albums, {
    fields: [Photos.albumId],
    references: [Albums.id],
  }),
}));
