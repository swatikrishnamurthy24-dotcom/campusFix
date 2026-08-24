const mongoose = require("mongoose")

// Comment.js
//
// Discussion comments on an issue. Kept as its own collection (rather than
// embedded on Issue) so it can grow independently and be queried/paginated
// on its own — the issue controller attaches these to `issue.comments` when
// returning a single issue, matching the shape the frontend already expects.

const commentSchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    role: { type: String, enum: ["student", "staff", "admin"], required: true },
    text: { type: String, required: [true, "Comment text cannot be empty."], trim: true },
  },
  { timestamps: true }
)

commentSchema.index({ issue: 1, createdAt: 1 })

commentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    author: this.authorName,
    role: this.role,
    text: this.text,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model("Comment", commentSchema)
