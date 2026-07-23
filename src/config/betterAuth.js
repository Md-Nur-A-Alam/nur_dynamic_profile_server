const { betterAuth } = require("better-auth");
const { ADMIN_EMAILS } = require("./constants");
const { MongoClient } = require("mongodb");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);

const resolveRole = (email) => {
  return ADMIN_EMAILS.includes(email) ? "admin" : "user";
};

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
      occupation: {
        type: "string",
        required: false,
      },
      profileImage: {
        type: "string",
        required: false,
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: resolveRole(user.email)
            }
          };
        }
      }
    },
    account: {
      create: {
        before: async (account) => {
          // FR-2: Ensure non-admin Google logins never result in a persisted user record.
          // Since user is created before account in Better Auth, if this throws, 
          // we must ensure the transaction rolls back or we manually delete the user.
          if (account.provider === 'google') {
             // We need the user's email to check against ADMIN_EMAILS.
             // Wait, account object doesn't have email. But wait! We can fetch the user!
          }
          return { data: account };
        }
      }
    }
  },
  callbacks: {
    signIn: async (user, account) => {
      // FR-2: Reject non-admin Google logins.
      // If we are doing it here, the user record is ALREADY persisted. 
      // To fulfill the requirement "never results in a persisted user record", we must delete the user here if they were just created.
      if (account.provider === 'google') {
        if (!ADMIN_EMAILS.includes(user.email)) {
          // Manually delete the persisted user record to fulfill the requirement
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

module.exports = auth;
