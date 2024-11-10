import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const userType = pgEnum("user_type", [
  "admin",
  "photographer",
  "client",
]);

export const studioRole = pgEnum("studio_role", ["owner", "admin", "member"]);

export const Users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  pendingEmail: text("pending_email"),
  image: text("image"),
  userType: userType("user_type").notNull().default("client"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const Accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({
      name: "accounts_pk",
      columns: [t.provider, t.providerAccountId],
    }),
  ],
);

export const Sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const VerificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [
    primaryKey({
      name: "verification_tokens_pk",
      columns: [t.identifier, t.token],
    }),
  ],
);

export const Authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (t) => [
    primaryKey({
      name: "authenticators_pk",
      columns: [t.userId, t.credentialID],
    }),
  ],
);

export const Studios = pgTable("studios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logo: text("logo"),
  createdById: text("created_by_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const StudioMembers = pgTable("studio_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id")
    .references(() => Studios.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  role: studioRole("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const Albums = pgTable("albums", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  studioId: text("studio_id")
    .notNull()
    .references(() => Studios.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const Photos = pgTable("photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  albumId: text("album_id")
    .notNull()
    .references(() => Albums.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  key: text("key").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
  order: integer("order").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date(),
  ),
});

export const AdminAuditLogs = pgTable("admin_audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  performedAt: timestamp("performed_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const UsersToAlbums = pgTable(
  "users_to_albums",
  {
    userId: text("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => Albums.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({
      name: "users_to_albums_pk",
      columns: [t.userId, t.albumId],
    }),
  ],
);

export const StudioClients = pgTable(
  "studio_clients",
  {
    studioId: text("studio_id")
      .notNull()
      .references(() => Studios.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      name: "studio_clients_pk",
      columns: [t.studioId, t.userId],
    }),
  ],
);

export const UsersRelations = relations(Users, ({ many }) => ({
  usersToAlbums: many(UsersToAlbums),
  studios: many(StudioMembers),
  managedByStudios: many(StudioClients),
}));

export const StudiosRelations = relations(Studios, ({ many }) => ({
  members: many(StudioMembers),
  albums: many(Albums),
  managedClients: many(StudioClients),
}));

export const StudioMembersRelations = relations(StudioMembers, ({ one }) => ({
  studio: one(Studios, {
    fields: [StudioMembers.studioId],
    references: [Studios.id],
  }),
  user: one(Users, {
    fields: [StudioMembers.userId],
    references: [Users.id],
  }),
}));

export const AlbumsRelations = relations(Albums, ({ many, one }) => ({
  photos: many(Photos),
  usersToAlbums: many(UsersToAlbums),
  studio: one(Studios, {
    fields: [Albums.studioId],
    references: [Studios.id],
  }),
}));

export const UsersToAlbumsRelations = relations(UsersToAlbums, ({ one }) => ({
  album: one(Albums, {
    fields: [UsersToAlbums.albumId],
    references: [Albums.id],
  }),
  user: one(Users, {
    fields: [UsersToAlbums.userId],
    references: [Users.id],
  }),
}));

export const PhotosRelations = relations(Photos, ({ one }) => ({
  album: one(Albums, {
    fields: [Photos.albumId],
    references: [Albums.id],
  }),
}));

export const StudioClientsRelations = relations(StudioClients, ({ one }) => ({
  studio: one(Studios, {
    fields: [StudioClients.studioId],
    references: [Studios.id],
  }),
  user: one(Users, {
    fields: [StudioClients.userId],
    references: [Users.id],
  }),
}));
