import { useEffect, useState } from "react"
import { Tag, AlertCircle, Plus, Pencil } from "lucide-react"
import { getCategories, addCategory, updateCategory, setCategoryEnabled } from "@/services/adminService"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

function CategoryFormDialog({ trigger, title, initialName = "", initialDescription = "", onSubmit }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setDescription(initialDescription)
      setError("")
    }
  }, [open, initialName, initialDescription])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError("Category name cannot be empty.")
      return
    }
    setIsSaving(true)
    setError("")
    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
      setOpen(false)
    } catch (err) {
      setError(err.message || "Couldn't save this category. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Frontend mock only — not connected to a backend yet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category-description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  function loadCategories() {
    setIsLoading(true)
    setLoadError("")
    return getCategories()
      .then((data) => setCategories(data))
      .catch(() => setLoadError("Couldn't load categories right now. Please try again."))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  async function handleAdd({ name, description }) {
    const created = await addCategory({ name, description })
    setCategories((prev) => [...prev, created])
  }

  async function handleEdit(categoryId, { name, description }) {
    const updated = await updateCategory(categoryId, { name, description })
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)))
  }

  async function handleToggle(category) {
    const updated = await setCategoryEnabled(category.id, !category.enabled)
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Issue Categories</h2>
          <p className="text-sm text-muted-foreground">Manage the categories students choose when reporting an issue.</p>
        </div>
        <CategoryFormDialog
          title="Add Category"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
          onSubmit={handleAdd}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-foreground">{loadError}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Tag className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No categories configured yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <CardContent className="space-y-2 p-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant={category.enabled ? "success" : "muted"}>
                    {category.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-1">
                  <CategoryFormDialog
                    title="Edit Category"
                    initialName={category.name}
                    initialDescription={category.description}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    }
                    onSubmit={(fields) => handleEdit(category.id, fields)}
                  />
                  <Button variant="outline" size="sm" onClick={() => handleToggle(category)}>
                    {category.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
