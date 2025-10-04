const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./conn");
const userRoutes = require("./Routes/userRoutes");
const resumeRoutes = require("./Routes/resumeRoutes");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();
// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
  credentials: true,
  origin:"http://localhost:5173"
}));


app.get("/api", (req, res) => {
  res.send({ message: "Hii Welcome to Our Mern AI Resume Backend" });
});


// User routes
app.use("/api/user", userRoutes);
//Resume Routes.
app.use("/api/resume", resumeRoutes);

//serve static assets files  from the react app's build folder
app.use(express.static(path.join(__dirname, "build")));

//Handle React routing,return index.html for all other requests
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
