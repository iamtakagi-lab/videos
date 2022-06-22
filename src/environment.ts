require("dotenv").config();

if (!process.env.SITE_BASEURL) throw new Error("SITE_BASEURL is not set");
if (!process.env.ADMIN_USER) throw new Error("ADMIN_USER is not set");
if (!process.env.ADMIN_PASS) throw new Error("ADMIN_PASS is not set");
if (!process.env.UPLOAD_LIMIT_MB) throw new Error("UPLOAD_LIMIT_MB is not set");

process.env.TZ = "Asia/Tokyo";

export const SITE_BASEURL = process.env.SITE_BASEURL;
export const ADMIN_USER = process.env.ADMIN_USER;
export const ADMIN_PASS = process.env.ADMIN_PASS;
export const UPLOAD_LIMIT_MB = parseInt(process.env.UPLOAD_LIMIT_MB)