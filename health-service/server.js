const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
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
  // Extract token from Authorization header
  // Handle both "Bearer token" and just "token" formats
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader) {
    // Check if it's in "Bearer token" format
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    } else {
      token = authHeader; // Use the token as is
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
  // Create Express app
  const app = express();

  // Apply middlewares
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());
  app.use(authMiddleware);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).send("Health Service is running");
  });

  try {
    // Create Apollo Server with Federation subgraph schema
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      introspection: true,
    });

    // Start Apollo Server
    await server.start();
    console.log("Apollo Server started");

    // Apply middleware for GraphQL
    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Log request headers for debugging
          console.log(
            "GraphQL request headers:",
            JSON.stringify(req.headers, null, 2)
          );

          return {
            req,
            headers: req.headers,
            user: req.user,
            isAuthenticated: req.isAuthenticated,
            token: req.headers.authorization,
          };
        },
      })
    );

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        `🚀 Health Service ready at http://localhost:${PORT}/graphql`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

// Start the server
startServer();
