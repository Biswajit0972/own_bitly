import {integer, pgTable, varchar} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    username: varchar("username", {length: 255}).notNull(),
    password: varchar("password", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull(),
    fullName: varchar("full_name", {length: 255}).notNull(),
    createdAt: varchar("created_at", {length: 255}).notNull().default("now()"),
    updatedAt: varchar("updated_at", {length: 255}).notNull().default("now()")
});