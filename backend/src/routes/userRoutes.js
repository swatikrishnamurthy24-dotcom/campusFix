const express = require("express")
const { getUsers, getUserById, createUser, updateMe, updateUser } = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware")
const { authorize } = require("../middleware/authorizeMiddleware")

const router = express.Router()

router.use(protect)

router.patch("/me", updateMe)

router.get("/", authorize("admin"), getUsers)
router.post("/", authorize("admin"), createUser)
router.get("/:id", authorize("admin"), getUserById)
router.patch("/:id", authorize("admin"), updateUser)

module.exports = router
