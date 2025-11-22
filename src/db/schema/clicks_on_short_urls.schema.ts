import * as t from "drizzle-orm/pg-core";
import {shortUrlSchema} from "./shortUrl.schema.ts";

export const clicks_on_short_urlsSchema = t.pgTable("clicks_on_short_urls", {
    id: t.integer("id").primaryKey().generatedByDefaultAsIdentity(),
    click_time: t.timestamp().defaultNow().notNull(),
    shortUrlId: t.varchar("shortUrlId").references(() => shortUrlSchema.id, { onDelete: "cascade" }),
    user_agent: t.varchar("user_agent", {length: 255}).notNull(),
    ip_address: t.varchar("ip_address", {length: 255}).notNull(),
    browser: t.varchar("browser", {length: 255}).notNull(),
    referer: t.varchar("referer", {length: 255}).notNull(),
    createdAt: t.varchar("created_at", {length: 255}).notNull().default(new Date().toISOString()),
    updatedAt: t.varchar("updated_at", {length: 255}).notNull().default(new Date().toISOString())
})