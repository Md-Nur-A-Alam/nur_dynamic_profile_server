const { betterAuth } = require("better-auth");
const { ADMIN_EMAILS } = require("./constants");
const { MongoClient } = require("mongodb");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.SERVER_BASE_URL,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  callbacks: {
    signIn: async (user, account) => {
      // If it's a Google login and not on the admin whitelist, we must reject or downgrade?
      // Wait, the requirement says: "Admin login via email/password and Google OAuth, both restricted to the two whitelisted admin emails."
      // Let's enforce that for Google logins: if it's Google and not in whitelist, reject. (Or maybe we downgrade? The SRS says "reject any Google login whose email is not on the admin whitelist, verified server-side").
      if (account.provider === 'google') {
        if (!ADMIN_EMAILS.includes(user.email)) {
          throw new Error("Unauthorized Google account. Only admins can login via Google.");
        }
      }
      return true;
    }
  },
  // We can inject user roles into session later
});

module.exports = auth;
