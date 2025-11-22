import * as t from "drizzle-orm/pg-core";
import {usersTable} from "./user.schema.ts";

export const shortUrlSchema = t.pgTable("short_urls", {
        id: t.integer("id").primaryKey().generatedByDefaultAsIdentity(),
        shortCode: t.varchar("shortCode", {length: 155}).notNull().unique(),
        long_url: t.varchar("long_url", {length: 555}).notNull(),
        user_id: t.integer("user_id").references(() => usersTable.id),
        title: t.varchar("title", {length: 255}).default("My Shortened Link"),
        description: t.varchar("description", {length: 255}).default(`A shortened link created using our URL Shortener service.`),
        createdAt: t.varchar("created_at", {length: 255}).notNull().default(new Date().toISOString()),
        updatedAt: t.varchar("updated_at", {length: 255}).notNull().default(new Date().toISOString()),
    },
    (table) => [
        t.index("idx_short_urls_user_id").on(table.user_id)
    ]
);

