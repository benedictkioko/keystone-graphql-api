const dotenv = require("dotenv").config();
const { Keystone } = require("@keystonejs/keystone");
const { GraphQLApp } = require("@keystonejs/app-graphql");
const { AdminUIApp } = require("@keystonejs/app-admin-ui");
const { PasswordAuthStrategy } = require("@keystonejs/auth-password");
const { MongooseAdapter: Adapter } = require("@keystonejs/adapter-mongoose");

const PROJECT_NAME = "blog";
const adapterConfig = {
  mongoUri: process.env.MONGO_URI,
};

const PostSchema = require("./lists/Post");
const UserSchema = require("./lists/User");

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  cookieSecret: process.env.COOKIE_SECRET,
});

const isLoggedIn = ({ authentication: { item: user } }) => {
  return !!user;
};

const isAdmin = ({ authentication: { item: user } }) => {
  return !!user & !!user.isAdmin;
};

keystone.createList("Post", {
  fields: PostSchema.fields,
  access: {
    read: true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
});

keystone.createList("User", {
  fields: UserSchema.fields,
  access: {
    read: true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
});
keystone.createList("User", UserSchema);

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: "User",
  config: {
    indentityField: "email",
    secretField: "password",
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
      isAccessAllowed: isAdmin,
    }),
  ],
};
