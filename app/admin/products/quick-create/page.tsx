"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/backend/config";
import type { Product, Category } from "@/admin-lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadMultipleToUploadME } from "@/lib/uploadme";
import { ArrowLeft, Upload, X, Loader2, Zap, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function QuickCreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      await fetchCategories();
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  }, [name]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const q = query(
        collection(db, "categories"),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      
      const categoriesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
      
      const mainCategories = categoriesData.filter(cat => !cat.parentId);
      setCategories(mainCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku || !price) {
      toast.error("Please fill in all required fields: Name, SKU, and Price");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be a valid number greater than 0");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      toast.info(`Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...`);
      
      const imageUrls = await uploadMultipleToUploadME(imageFiles, {
        namePrefix: "products",
        folder: "products",
        quality: 100,
        preserveOriginal: true,
        tags: ["product", name || "quick-product"],
      });

      const mappedImages = imageUrls.map((url, index) => ({
        id: `img-${Date.now()}-${index}`,
        url,
        alt: name || "Product Image",
        order: index,
      }));

      const productData: Omit<Product, "id"> = {
        name: name.trim(),
        slug: slug.trim(),
        description: "",
        sku: sku.trim(),
        price: priceNum,
        currency: "LKR",
        inStock: true,
        isSoldOut: false,
        allowBackorder: false,
        categoryId: categoryId && categoryId.trim() !== "" ? categoryId : undefined,
        tags: [],
        colors: [],
        sizes: [],
        images: mappedImages,
        featuredImage: imageUrls[0],
        hasVariants: false,
        status: "published",
        featured: false,
        visibility: "public",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        createdBy: auth.currentUser?.uid || "unknown",
        publishedAt: serverTimestamp() as any,
      };

      const docRef = await addDoc(collection(db, "products"), productData);
      
      toast.success("Product created successfully via Quick Create!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      if (error.message?.includes('UploadME') || error.message?.includes('upload')) {
        toast.error("Image upload failed: " + error.message);
      } else if (error.code === 'permission-denied') {
        toast.error("Permission denied. Check Firebase security rules.");
      } else {
        toast.error(error.message || "Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={loading}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              Quick Product Create
            </h1>
          </div>
          <p className="text-muted-foreground">Add products quickly with essential details only</p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Quick Create</strong> allows you to add products with minimal information. Only product name, SKU, price, and images are required. Category is optional. You can edit the product later to add more details like colors, sizes, description, etc.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Essential Information</CardTitle>
            <CardDescription>Only the basics needed to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Product Name <Badge variant="destructive">Required</Badge>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="product-url-slug"
                required
                className="border-2"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from product name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="flex items-center gap-2">
                  SKU Code <Badge variant="destructive">Required</Badge>
                </Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PRODUCT-001"
                  required
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  Price (LKR) <Badge variant="destructive">Required</Badge>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="5000.00"
                  required
                  className="border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                Category <Badge variant="secondary">Optional</Badge>
              </Label>
              <Select 
                value={categoryId || "none"} 
                onValueChange={(val) => setCategoryId(val === "none" ? "" : val)} 
                disabled={categoriesLoading}
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder={
                    categoriesLoading 
                      ? "Loading categories..." 
                      : "No category (can be added later)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Products without categories will appear in the shop page
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              Product Images <Badge variant="destructive">Required</Badge>
            </CardTitle>
            <CardDescription>Upload product photos (first image will be the featured image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-purple-600">Featured</Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-colors">
                <Upload className="h-8 w-8 text-purple-400 mb-2" />
                <span className="text-sm text-purple-600 font-medium">Upload Image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Images will be uploaded to UploadME. Maximum 50MB per image.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-yellow-900">
                <p className="font-semibold">What happens with Quick Create?</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Product is published immediately</li>
                  <li>Default values are used for colors and sizes (empty arrays)</li>
                  <li>Description fields are left empty</li>
                  <li>Stock status is set to "In Stock"</li>
                  <li>Product appears in shop page regardless of category</li>
                  <li>You can edit the product later to add full details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 sticky bottom-0 bg-white p-4 border-t shadow-lg rounded-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="min-w-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Quick Create
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
