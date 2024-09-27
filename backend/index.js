// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

let uri = "mongodb+srv://vkkhambra786:olsBTIlUOQVT4KLj@cluster0.buill3t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(uri); // Removed deprecated options
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Call the function to connect to the database
connectToDatabase();

// Define mongoose schema for movies
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true }, // Required and unique title
    genre: { type: String, required: true },
    year: { type: String, required: true },
    theaterName: { type: String },
    seatNumbers: { type: [String], required: true }, // Array of seat numbers
});

const Movie = mongoose.model("Movie", movieSchema);
movieSchema.index({ title: 1 }, { unique: true }); // Create a unique index on title

 
app.post("/api/movies", async (req, res) => {
    try {
      const { title, genre, year, theaterName, seatNumbers } = {
        title: req.body.Title || req.body.title,
        genre: req.body.genre,
        year: req.body.Year || req.body.year,
        theaterName: req.body.theaterName,
        seatNumbers: req.body.seatNumbers,
      };

      // Log incoming request for debugging
      console.log("Received data:", req.body);

      // Validate input
      if (!title || title.trim() === "" || !genre || !seatNumbers || seatNumbers.length === 0) {
        return res.status(400).json({ error: "Missing required fields or invalid data" });
      }

      // Convert seatNumbers to strings
      const processedSeatNumbers = seatNumbers.map(String);

      // Check if movie already exists
      const existingMovie = await Movie.findOne({ title });
      if (existingMovie) {
        return res.status(400).json({ error: "Movie already exists" });
      }

      // Create a new movie instance
      const movie = new Movie({
        title,
        genre,
        year,
        theaterName,
        seatNumbers: processedSeatNumbers,
      });

      // Save the movie to the database
      await movie.save();
      res.status(201).json({ message: "Movie added successfully", data: movie });
    } catch (error) {
      console.error("Error in POST /api/movies:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});

// API endpoint to retrieve all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json({ message: "Movies retrieved successfully", data: movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port - ${PORT}`);
});
