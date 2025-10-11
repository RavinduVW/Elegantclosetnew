"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/backend/config";
import { Search, Ruler, Info, Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  PREDEFINED_SIZES, 
  NUMERIC_SIZES, 
  KIDS_SIZES, 
  getAllSizes, 
  searchSizes as searchPredefinedSizes,
  type SizeOption 
} from "@/lib/sizes";

type SizeCategory = "all" | "standard" | "numeric" | "kids" | "custom";

interface CustomSize extends SizeOption {
  id?: string;
  category: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function SizesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SizeCategory>("all");
  const [selectedSize, setSelectedSize] = useState<CustomSize | null>(null);
  const [customSizes, setCustomSizes] = useState<CustomSize[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<CustomSize | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "custom",
    description: "",
  });

  useEffect(() => {
    fetchCustomSizes();
  }, []);

  const fetchCustomSizes = async () => {
    try {
      setIsLoading(true);
      const snapshot = await getDocs(collection(db, "sizes"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomSize[];
      setCustomSizes(data);
    } catch (error) {
      toast.error("Failed to fetch custom sizes");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryForSize = (size: SizeOption): string => {
    if (PREDEFINED_SIZES.some(s => s.code === size.code)) return "standard";
    if (NUMERIC_SIZES.some(s => s.code === size.code)) return "numeric";
    if (KIDS_SIZES.some(s => s.code === size.code)) return "kids";
    return "custom";
  };

  const allSizes = [...getAllSizes().map(s => ({ ...s, category: getCategoryForSize(s) })), ...customSizes];

  const filteredSizes = searchQuery 
    ? allSizes.filter(size =>
        size.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        size.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory === "all" 
      ? allSizes
      : allSizes.filter(s => s.category === selectedCategory);

  const totalCount = allSizes.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const now = Timestamp.now();
      const maxOrder = Math.max(...allSizes.map(s => s.order), 0);

      if (editingSize && editingSize.id) {
        await updateDoc(doc(db, "sizes", editingSize.id), {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          updatedAt: now,
        });
        toast.success("Size updated successfully");
      } else {
        await addDoc(collection(db, "sizes"), {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
        });
        toast.success("Size created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCustomSizes();
    } catch (error) {
      toast.error("Failed to save size");
    }
  };

  const handleEdit = (size: CustomSize) => {
    if (!size.id) {
      toast.error("Cannot edit predefined sizes");
      return;
    }
    setEditingSize(size);
    setFormData({
      code: size.code,
      name: size.name,
      category: size.category,
      description: size.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (size: CustomSize) => {
    if (!size.id) {
      toast.error("Cannot delete predefined sizes");
      return;
    }

    if (!confirm(`Are you sure you want to delete size "${size.code}"?`)) return;

    try {
      await deleteDoc(doc(db, "sizes", size.id));
      toast.success("Size deleted successfully");
      fetchCustomSizes();
      if (selectedSize?.id === size.id) {
        setSelectedSize(null);
      }
    } catch (error) {
      toast.error("Failed to delete size");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "custom",
      description: "",
    });
    setEditingSize(null);
  };

  const isCustomSize = (size: CustomSize) => Boolean(size.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Size Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage {PREDEFINED_SIZES.length + NUMERIC_SIZES.length + KIDS_SIZES.length} predefined + {customSizes.length} custom sizes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Size
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSize ? "Edit Custom Size" : "Create New Size"}
                </DialogTitle>
                <DialogDescription>
                  Add a custom size for special product variants
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Size Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., OS, FREE, XXS"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Short code used for display (e.g., OS for One Size)
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Size Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., One Size, Free Size"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="numeric">Numeric</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional size information"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingSize ? "Update Size" : "Create Size"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-purple-600" />
              <CardTitle>Size Library</CardTitle>
            </div>
            <CardDescription>
              Browse sizes by category or search across all sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search sizes by code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SizeCategory)}>
                <TabsList className="grid w-full grid-cols-5 bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                    All ({totalCount})
                  </TabsTrigger>
                  <TabsTrigger value="standard" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                    Standard ({PREDEFINED_SIZES.length})
                  </TabsTrigger>
                  <TabsTrigger value="numeric" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                    Numeric ({NUMERIC_SIZES.length})
                  </TabsTrigger>
                  <TabsTrigger value="kids" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                    Kids ({KIDS_SIZES.length})
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                    Custom ({customSizes.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <p className="text-sm text-gray-500 mt-4">
                Showing {filteredSizes.length} size{filteredSizes.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredSizes.map((size, index) => (
                <div
                  key={`${size.code}-${index}`}
                  className={`group relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg ${
                    selectedSize?.code === size.code
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-200"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <button
                    onClick={() => setSelectedSize(size)}
                    className="w-full text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-1">{size.code}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{size.name}</div>
                    {isCustomSize(size) && (
                      <Badge variant="outline" className="text-xs mt-2 bg-purple-50 text-purple-700 border-purple-300">
                        Custom
                      </Badge>
                    )}
                  </button>
                  
                  {isCustomSize(size) && (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(size);
                        }}
                        className="w-6 h-6 p-0 bg-white/90 hover:bg-white shadow-md"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(size);
                        }}
                        className="w-6 h-6 p-0 bg-white/90 hover:bg-red-50 text-red-600 shadow-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {selectedSize?.code === size.code && (
                    <div className="absolute bottom-1 left-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredSizes.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No sizes found</h3>
                <p className="text-gray-500">
                  Try adjusting your search query or category filter
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedSize && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle>Size Details</CardTitle>
              <CardDescription>
                Information about size {selectedSize.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Size Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Size Code</dt>
                      <dd className="text-lg font-bold text-gray-900 mt-1">{selectedSize.code}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="text-sm text-gray-900 mt-1">{selectedSize.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 capitalize">
                          {selectedSize.category}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sort Order</dt>
                      <dd className="text-sm text-gray-900 mt-1">#{selectedSize.order}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Size Preview</h3>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-purple-600 mb-2">
                        {selectedSize.code}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedSize.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Standard Sizes</h3>
                  <p className="text-2xl font-bold text-blue-600">{PREDEFINED_SIZES.length}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                XXS to 5XL sizes for adult clothing
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Numeric Sizes</h3>
                  <p className="text-2xl font-bold text-purple-600">{NUMERIC_SIZES.length}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Size 28 to 46 for pants and bottoms
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kids Sizes</h3>
                  <p className="text-2xl font-bold text-pink-600">{KIDS_SIZES.length}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                2T to 16 for children's clothing
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Size Management</h3>
                <p className="text-sm text-blue-800 mb-2">
                  This system includes {PREDEFINED_SIZES.length + NUMERIC_SIZES.length + KIDS_SIZES.length} predefined sizes organized into 3 categories, plus {customSizes.length} custom sizes:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Standard:</strong> Traditional letter sizes (XXS-5XL) for tops, dresses, and general clothing</li>
                  <li><strong>Numeric:</strong> Number-based sizes (28-46) for pants, jeans, and waist measurements</li>
                  <li><strong>Kids:</strong> Toddler and youth sizes (2T-16) for children's apparel</li>
                  <li><strong>Custom:</strong> Add unique sizes like "One Size", "Free Size", or specialty measurements</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  Predefined sizes cannot be edited or deleted. Custom sizes can be fully managed to suit your specific needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
