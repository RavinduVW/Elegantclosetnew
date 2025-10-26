"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/backend/config";
import { uploadToFirebaseStorage } from "@/lib/firebase-storage";
import { Category } from "@/admin-lib/types";
import { toast } from "sonner";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
    showInMenu: true,
    menuLabel: "",
    status: "active" as "active" | "inactive",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setFetching(true);
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      
      if (!categoryDoc.exists()) {
        toast.error("Category not found");
        router.push("/admin/categories");
        return;
      }

      const data = categoryDoc.data() as Category;
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        order: data.order,
        showInMenu: data.showInMenu,
        menuLabel: data.menuLabel || data.name,
        status: data.status,
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
      });

      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to load category");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;

    try {
      console.log("Uploading category image to Firebase Storage...");
      const response = await uploadToFirebaseStorage(imageFile, {
        folder: "categories",
        customName: `category-${formData.slug || Date.now()}`,
      });
      console.log("Category image uploaded to Firebase Storage:", response);
      console.log("Download URL:", response.data.url);
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image: " + (error instanceof Error ? error.message : "Unknown error"));
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      console.log("Image URL to be saved:", imageUrl);

      const updateData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        order: Number(formData.order) || 0,
        showInMenu: formData.showInMenu,
        menuLabel: formData.menuLabel || formData.name,
        status: formData.status,
        seoTitle: formData.seoTitle || formData.name,
        seoDescription: formData.seoDescription || formData.description || null,
        updatedAt: Timestamp.now(),
      };

      if (imageUrl) {
        updateData.image = imageUrl;
      } else if (!imagePreview) {
        updateData.image = null;
      }

      console.log("Category update data:", updateData);
      await updateDoc(doc(db, "categories", categoryId), updateData);
      console.log("Category updated in Firestore");
      toast.success("Category updated successfully");
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading category...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground">Update category information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL-friendly version of the name
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="menuLabel">Menu Label</Label>
                  <Input
                    id="menuLabel"
                    name="menuLabel"
                    value={formData.menuLabel}
                    onChange={handleInputChange}
                    placeholder={formData.name || "Display name in menu"}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder={formData.name || "Page title for search engines"}
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Description for search engines"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <Label
                      htmlFor="image"
                      className="cursor-pointer text-sm text-primary hover:underline"
                    >
                      Click to upload image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showInMenu">Show in Menu</Label>
                  <Switch
                    id="showInMenu"
                    checked={formData.showInMenu}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, showInMenu: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
