import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { createIssue } from "@/services/issueService"
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES } from "@/data/mockIssues"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import ImageUpload from "@/components/issues/ImageUpload"

const DESCRIPTION_MAX_LENGTH = 500

const initialForm = {
  title: "",
  category: "",
  description: "",
  location: "",
  building: "",
  floor: "",
  room: "",
  priority: "",
}

export default function ReportIssue() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submittedId, setSubmittedId] = useState(null)

  function setField(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = "Issue title is required."
    if (!form.category) nextErrors.category = "Please select a category."
    if (!form.description.trim()) nextErrors.description = "Please describe the issue."
    if (!form.location.trim()) nextErrors.location = "Location is required."
    if (!form.priority) nextErrors.priority = "Please select a priority."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError("")
    if (!validate()) return
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const created = await createIssue({
        ...form,
        reportedBy: user.id,
        reportedByName: user.name,
        image: image?.previewUrl ?? null,
      })
      setSubmittedId(created.id)
    } catch (err) {
      setSubmitError(err.message || "Something went wrong while submitting your issue. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state — shown in place of the form right after a successful submit.
  if (submittedId) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">Issue reported</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your issue <span className="font-medium text-foreground">{submittedId}</span> has been
            submitted and is now <span className="font-medium">Pending</span> review.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate(`/student/issues/${submittedId}`)}>Track this issue</Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm(initialForm)
                setImage(null)
                setSubmittedId(null)
              }}
            >
              Report another issue
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Report a Campus Issue</CardTitle>
          <CardDescription>
            Give as much detail as you can — it helps staff resolve it faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div role="alert" className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Issue Title <span className="text-danger">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g. Broken fan in Classroom 204"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && <p className="text-xs text-danger">{errors.title}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category <span className="text-danger">*</span>
                </label>
                <Select value={form.category} onValueChange={(v) => setField("category", v)} disabled={isSubmitting}>
                  <SelectTrigger id="category" aria-invalid={Boolean(errors.category)}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-danger">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Priority <span className="text-danger">*</span>
                </label>
                <Select value={form.priority} onValueChange={(v) => setField("priority", v)} disabled={isSubmitting}>
                  <SelectTrigger id="priority" aria-invalid={Boolean(errors.priority)}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-danger">{errors.priority}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description <span className="text-danger">*</span>
                </label>
                <span className="text-xs text-muted-foreground">
                  {form.description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                rows={4}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Describe what's wrong, and anything else that would help staff fix it..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <p className="text-xs text-danger">{errors.description}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location <span className="text-danger">*</span>
              </label>
              <Input
                id="location"
                placeholder="e.g. Main Block"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.location)}
              />
              {errors.location && <p className="text-xs text-danger">{errors.location}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="building" className="text-sm font-medium text-foreground">
                  Building <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="building"
                  placeholder="e.g. CSE Block"
                  value={form.building}
                  onChange={(e) => setField("building", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="floor" className="text-sm font-medium text-foreground">
                  Floor <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="floor"
                  placeholder="e.g. 2nd Floor"
                  value={form.floor}
                  onChange={(e) => setField("floor", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="room" className="text-sm font-medium text-foreground">
                  Room / Area <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="room"
                  placeholder="e.g. Lab 2"
                  value={form.room}
                  onChange={(e) => setField("room", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Attach an image <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </p>
              <ImageUpload value={image} onChange={setImage} disabled={isSubmitting} />
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting…" : "Submit Issue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
