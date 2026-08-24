const mongoose = require("mongoose")

// db.js
//
// Establishes the MongoDB connection using Mongoose. Called once from
// server.js on boot. Exits the process on failure so a broken DB connection
// never silently leaves the API running in an unusable state.

async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and configure it.")
    process.exit(1)
  }

  try {
    mongoose.set("strictQuery", true)
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
