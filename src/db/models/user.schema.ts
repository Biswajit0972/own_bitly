import {integer, pgTable, varchar} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    username: varchar("username", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    fullName: varchar("full_name", {length: 255}).notNull(),
    refreshToken: varchar("refresh_token", {length: 255}),
    createdAt: varchar("created_at", {length: 255}).notNull().default(new Date().toISOString()),
    updatedAt: varchar("updated_at", {length: 255}).notNull().default(new Date().toISOString())
});