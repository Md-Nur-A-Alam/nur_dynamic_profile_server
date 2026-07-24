const { ADMIN_EMAILS } = require("./constants");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);

const resolveRole = (email) => {
  return ADMIN_EMAILS.includes(email) ? "admin" : "user";
};

let authInstance = null;

const getAuth = async () => {
  if (authInstance) return authInstance;

  const { betterAuth } = await import("better-auth");
  const { mongodbAdapter } = await import("better-auth/adapters/mongodb");

  authInstance = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.SERVER_BASE_URL,
    trustedOrigins: [
      process.env.CLIENT_BASE_URL, 
      "http://localhost:3000",
      "https://nur-dynamic-profile-client-beta.vercel.app"
    ].filter(Boolean),
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
    user: {
      additionalFields: {
        role: { type: "string", required: false },
        occupation: { type: "string", required: false },
        profileImage: { type: "string", required: false }
      }
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true
      }
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: { ...user, role: resolveRole(user.email) }
          })
        }
      },
      account: {
        create: {
          before: async (account) => {
            return { data: account };
          }
        }
      }
    },
    callbacks: {
      signIn: async (user, account) => {
        if (account.provider === 'google') {
          if (!ADMIN_EMAILS.includes(user.email)) {
            await db.collection("user").deleteOne({ _id: user.id });
            await db.collection("account").deleteMany({ userId: user.id });
            await db.collection("session").deleteMany({ userId: user.id });
            throw new Error("Unauthorized Google account. Only admins can login via Google.");
          }
        }
        return true;
      }
    },
  });

  return authInstance;
};

module.exports = getAuth;
