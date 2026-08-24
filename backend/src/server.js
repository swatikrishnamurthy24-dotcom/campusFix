require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")

const authRoutes = require("./routes/authRoutes")
const issueRoutes = require("./routes/issueRoutes")
const userRoutes = require("./routes/userRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

const app = express()

// ---- Core middleware --------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
)
app.use(express.json({ limit: "5mb" })) // 5mb allows base64 image data URLs from ImageUpload.jsx
app.use(express.urlencoded({ extended: true }))

// ---- Health check -------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", timestamp: new Date().toISOString() })
})

// ---- API routes -----------------------------------------------------------
const apiVersion = process.env.API_VERSION || "v1"
const base = `/api/${apiVersion}`

app.use(`${base}/auth`, authRoutes)
app.use(`${base}/issues`, issueRoutes)
app.use(`${base}/users`, userRoutes)
app.use(`${base}/notifications`, notificationRoutes)

// ---- Errors -----------------------------------------------------------
app.use(notFound)
app.use(errorHandler)

// ---- Boot -----------------------------------------------------------------
const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`CampusFix backend listening on port ${PORT} (API base: ${base})`)
  })
}

start()

module.exports = app
