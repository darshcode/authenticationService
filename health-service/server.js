const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) throw new Error("User not found");
      req.user = decoded;
      req.isAuthenticated = true;
    } catch (err) {
      console.warn("Invalid token:", err.message);
      req.isAuthenticated = false;
    }
  } else {
    req.isAuthenticated = false;
  }
  next();
};

async function startServer() {
  const app = express();

  // Set up CORS
  const allowedOrigins = [
    "https://authenticationapp-mylj.onrender.com",
    "https://nurse-app-izij.onrender.com",
    "https://patient-mfe.onrender.com",
    "https://shell-app.onrender.com",
  ];

  app.use(cookieParser());
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  // JSON error handler
  app.use(
    express.json({
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf);
        } catch (e) {
          throw new Error("Invalid JSON");
        }
      },
    })
  );

  app.use(authMiddleware);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).send("Health Service is running");
  });

  const distPath = path.join(__dirname, "dist");

  const staticAssetsPath = path.join(distPath, "assets");

  app.use(
    "/assets",
    express.static(staticAssetsPath, {
      setHeaders: (res, path, stat) => {
        const origin = res.req.headers.origin;

        // Reflect allowed origin for CORS
        if (origin && allowedOrigins.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }

        // Always set required headers
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // 🧠 Tells Render/Cloudflare to cache responses *per origin*
        res.setHeader("Vary", "Origin");

        // (Optional) Prevent caching while debugging CORS
        res.setHeader("Cache-Control", "no-cache");
      },
    })
  );

  try {
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      introspection: true,
    });

    await server.start();
    console.log("Apollo Server started");

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => ({
          req,
          headers: req.headers,
          user: req.user,
          isAuthenticated: req.isAuthenticated,
          token: req.headers.authorization,
        }),
      })
    );

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
