"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, addDoc, updateDoc, deleteDoc, where, Timestamp } from "firebase/firestore";
import { db } from "@/backend/config";
import { Plus, Edit2, Trash2, Layers, Search, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  showInMenu: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string;
  order: number;
  status: "active" | "inactive";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"), where("showInMenu", "==", true));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "categories"), where("parentId", "!=", null));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubCategory[];
      setSubCategories(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast.error("Failed to fetch sub-categories");
    } finally {
      setIsLoading(false);
    }
  };

  const createSlug = (text: string): string => {
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.parentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const slug = createSlug(formData.name);
      const now = Timestamp.now();

      if (editingSubCategory) {
        await updateDoc(doc(db, "categories", editingSubCategory.id), {
          name: formData.name,
          slug,
          description: formData.description,
          parentId: formData.parentId,
          status: formData.status,
          updatedAt: now,
        });
        toast.success("Sub-category updated successfully");
      } else {
        const maxOrder = Math.max(...subCategories.map(sc => sc.order), 0);
        await addDoc(collection(db, "categories"), {
          name: formData.name,
          slug,
          description: formData.description,
          parentId: formData.parentId,
          order: maxOrder + 1,
          status: formData.status,
          showInMenu: false,
          createdAt: now,
          updatedAt: now,
        });
        toast.success("Sub-category created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSubCategories();
    } catch (error) {
      toast.error("Failed to save sub-category");
    }
  };

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      description: subCategory.description || "",
      parentId: subCategory.parentId,
      status: subCategory.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub-category?")) return;

    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Sub-category deleted successfully");
      fetchSubCategories();
    } catch (error) {
      toast.error("Failed to delete sub-category");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentId: "",
      status: "active",
    });
    setEditingSubCategory(null);
  };

  const filteredSubCategories = subCategories.filter(sc =>
    sc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getParentName = (parentId: string) => {
    return categories.find(c => c.id === parentId)?.name || "Unknown";
  };

  const getSubCategoriesByParent = (parentId: string) => {
    return filteredSubCategories.filter(sc => sc.parentId === parentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sub-Categories
            </h1>
            <p className="text-gray-600 mt-1">
              Manage sub-categories within main categories
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Sub-Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSubCategory ? "Edit Sub-Category" : "Create New Sub-Category"}
                </DialogTitle>
                <DialogDescription>
                  Sub-categories help organize products within main categories
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="parentId">Parent Category *</Label>
                  <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Sub-Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., T-Shirts, Jeans, Formal Wear"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this sub-category"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingSubCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  All Sub-Categories
                </CardTitle>
                <CardDescription>
                  {subCategories.length} sub-categories across {categories.length} main categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search sub-categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading sub-categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No main categories found</h3>
                <p className="text-gray-500">Create main categories first before adding sub-categories</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((category) => {
                  const subs = getSubCategoriesByParent(category.id);
                  if (searchQuery && subs.length === 0) return null;

                  return (
                    <div key={category.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FolderTree className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {subs.length} sub-categories
                        </Badge>
                      </div>

                      {subs.length === 0 ? (
                        <p className="text-sm text-gray-500 ml-7">No sub-categories yet</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-7">
                          {subs.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{subCategory.name}</h4>
                                <Badge variant={subCategory.status === "active" ? "default" : "secondary"}>
                                  {subCategory.status}
                                </Badge>
                              </div>
                              {subCategory.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subCategory.description}</p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(subCategory)}
                                  className="flex-1"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(subCategory.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && filteredSubCategories.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No sub-categories found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
