const mongoose = require("mongoose")

// Vote.js
//
// One document per (user, issue) pair — the unique compound index is what
// actually prevents duplicate votes server-side (the Phase 1-6 frontend
// mock only faked this in memory; see issueService.js `voteRecords`).

const voteSchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    voteType: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: true }
)

voteSchema.index({ issue: 1, user: 1 }, { unique: true })

module.exports = mongoose.model("Vote", voteSchema)
