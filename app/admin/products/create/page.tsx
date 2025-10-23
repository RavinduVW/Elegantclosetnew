"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/backend/config";
import type { Product, Category } from "@/admin-lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import MDEditor from "@uiw/react-md-editor";
import { uploadMultipleToUploadME } from "@/lib/uploadme";
import { PREDEFINED_COLORS, getAllColorNames } from "@/lib/colors";
import { getAllSizeCodes, sortSizes } from "@/lib/sizes";
import { ArrowLeft, Upload, X, Loader2, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [description, setDescription] = useState("");
  const [markdownDescription, setMarkdownDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState("");
  const [material, setMaterial] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [specialTag, setSpecialTag] = useState<"new" | "trending" | "bestseller" | "limited" | null>(null);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [visibility, setVisibility] = useState<"public" | "private" | "password">("public");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const allColors = getAllColorNames();
  const allSizes = getAllSizeCodes();

  useEffect(() => {
    const loadCategories = async () => {
      console.log("Loading categories...");
      await fetchCategories();
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
      setSubCategoryId("");
    }
  }, [categoryId]);

  useEffect(() => {
    if (price && salePrice) {
      const priceNum = parseFloat(price);
      const salePriceNum = parseFloat(salePrice);
      if (salePriceNum < priceNum) {
        const discount = Math.round(((priceNum - salePriceNum) / priceNum) * 100);
        setDiscountPercentage(discount);
      } else {
        setDiscountPercentage(null);
      }
    } else {
      setDiscountPercentage(null);
    }
  }, [price, salePrice]);

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
      console.log("Fetching categories from Firestore...");
      // Fetch all active categories first, then filter for main categories (no parentId)
      const q = query(
        collection(db, "categories"),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} active categories`);
      
      const categoriesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
      
      // Filter out categories that have a parentId (those are sub-categories)
      const mainCategories = categoriesData.filter(cat => !cat.parentId);
      console.log(`Filtered to ${mainCategories.length} main categories:`, mainCategories);
      
      setCategories(mainCategories);
      
      if (mainCategories.length === 0) {
        toast.info("No categories found. Please create categories first.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Check console for details.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSubCategories = async (parentId: string) => {
    try {
      console.log(`Fetching sub-categories for parent: ${parentId}`);
      const q = query(
        collection(db, "categories"),
        where("status", "==", "active"),
        where("parentId", "==", parentId)
      );
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} sub-categories`);
      
      const subCategoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setSubCategories(subCategoriesData);
      
      if (subCategoriesData.length === 0) {
        console.log("No sub-categories found for this category");
      }
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      toast.error("Failed to load sub-categories. Check console for details.");
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

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku || !price) {
      toast.error("Please fill in all required fields: Name, SKU, and Price");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (selectedColors.length === 0) {
      toast.warning("⚠️ No colors selected. Product will be created without color options.");
    }

    if (selectedSizes.length === 0 && !customSizes) {
      toast.warning("⚠️ No sizes selected. Product will be created without size options.");
    }

    if (!categoryId) {
      toast.warning("⚠️ No category selected. Product will appear in 'Uncategorized' section.");
    }

    if (salePrice && salePrice.trim() !== "" && parseFloat(salePrice) >= parseFloat(price)) {
      toast.error("Sale price must be lower than the regular price");
      return;
    }

    if (!description && !markdownDescription) {
      toast.warning("⚠️ No description provided. Consider adding product details for better customer experience.");
    }

    if (!material) {
      toast.warning("⚠️ Material field is empty. This helps customers make informed decisions.");
    }

    setLoading(true);

    try {
      console.log(`Uploading ${imageFiles.length} images to UploadME...`);
      toast.info(`Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...`);
      
      const imageUrls = await uploadMultipleToUploadME(imageFiles, {
        namePrefix: "products",
        folder: "products",
        quality: 100,
        preserveOriginal: true,
        tags: ["product", name || "product-image"],
      });
      console.log("Images uploaded successfully:", imageUrls);
      console.log("Number of URLs:", imageUrls.length);
      console.log("First URL:", imageUrls[0]);

      const sizesArray = [...selectedSizes];
      if (customSizes) {
        const customSizesArray = customSizes.split(",").map(s => s.trim()).filter(Boolean);
        sizesArray.push(...customSizesArray);
      }

      const mappedImages = imageUrls.map((url, index) => ({
        id: `img-${Date.now()}-${index}`,
        url,
        alt: name,
        order: index,
      }));
      console.log("Mapped images for Firestore:", mappedImages);

      const productData: Omit<Product, "id"> = {
        name,
        slug,
        description: description && description.trim() !== "" ? description : "",
        markdownDescription: markdownDescription && markdownDescription.trim() !== "" ? markdownDescription : undefined,
        shortDescription: shortDescription && shortDescription.trim() !== "" ? shortDescription : undefined,
        introduction: introduction && introduction.trim() !== "" ? introduction : undefined,
        sku,
        price: parseFloat(price),
        salePrice: salePrice && salePrice.trim() !== "" ? parseFloat(salePrice) : undefined,
        discountPercentage: discountPercentage || undefined,
        currency: "LKR",
        inStock,
        isSoldOut,
        stockQuantity: stockQuantity && stockQuantity.trim() !== "" ? parseInt(stockQuantity) : undefined,
        lowStockThreshold: lowStockThreshold && lowStockThreshold.trim() !== "" ? parseInt(lowStockThreshold) : undefined,
        allowBackorder,
        categoryId: categoryId && categoryId.trim() !== "" ? categoryId : undefined,
        subCategoryId: subCategoryId && subCategoryId.trim() !== "" ? subCategoryId : undefined,
        tags: tags && tags.trim() !== "" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        colors: selectedColors.length > 0 ? selectedColors : [],
        sizes: sizesArray.length > 0 ? sortSizes(sizesArray) : [],
        customSizes: customSizes && customSizes.trim() !== "" ? customSizes.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        material: material && material.trim() !== "" ? material : undefined,
        brand: brand && brand.trim() !== "" ? brand : undefined,
        images: mappedImages,
        featuredImage: imageUrls[0],
        hasVariants: false,
        status,
        featured,
        specialTag: specialTag || undefined,
        visibility,
        seoTitle: seoTitle && seoTitle.trim() !== "" ? seoTitle : undefined,
        seoDescription: seoDescription && seoDescription.trim() !== "" ? seoDescription : undefined,
        seoKeywords: seoKeywords && seoKeywords.trim() !== "" ? seoKeywords.split(",").map(k => k.trim()).filter(Boolean) : undefined,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        createdBy: auth.currentUser?.uid || "unknown",
        publishedAt: status === "published" ? serverTimestamp() as any : undefined,
      };

      console.log("Creating product in Firestore...", productData);
      const docRef = await addDoc(collection(db, "products"), productData);
      console.log("Product created with ID:", docRef.id);

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      if (error.message?.includes('UploadME') || error.message?.includes('upload')) {
        toast.error("Image upload failed: " + error.message);
      } else if (error.code === 'permission-denied') {
        toast.error("Permission denied. Check Firebase security rules.");
      } else {
        toast.error(error.message || "Failed to create product. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={loading}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="product-url-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from product name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Product Introduction</Label>
              <Textarea
                id="introduction"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder="Brief highlight or tagline for the product"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Detailed Description (Markdown)</Label>
              <div data-color-mode="light">
                <MDEditor
                  value={markdownDescription}
                  onChange={(val) => setMarkdownDescription(val || "")}
                  preview="edit"
                  height={400}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supports markdown formatting for rich product descriptions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary for product cards"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU Code *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PRODUCT-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (LKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="5000.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (LKR) (Optional)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Leave empty if no sale"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Set a lower price for sales/discounts
                </p>
              </div>

              {discountPercentage && (
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-green-50">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>In Stock</Label>
                <p className="text-sm text-muted-foreground">Product is available for purchase</p>
              </div>
              <Switch checked={inStock} onCheckedChange={setInStock} />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Sold Out</Label>
                <p className="text-sm text-muted-foreground">Mark product as sold out</p>
              </div>
              <Switch checked={isSoldOut} onCheckedChange={setIsSoldOut} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity (Optional)</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert (Optional)</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Allow Backorder</Label>
                <p className="text-sm text-muted-foreground">Allow purchases when out of stock</p>
              </div>
              <Switch checked={allowBackorder} onCheckedChange={setAllowBackorder} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images *</CardTitle>
            <CardDescription>Upload product photos (first image will be the featured image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
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

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Upload Image</span>
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
              Images will be uploaded to ImageBB. Maximum 32MB per image.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Colors <Badge variant="secondary">Optional</Badge>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                {allColors.map((colorName) => {
                  const colorData = PREDEFINED_COLORS.find(c => c.name === colorName);
                  const isSelected = selectedColors.includes(colorName);

                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => toggleColor(colorName)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                        style={{ backgroundColor: colorData?.hex || "#cccccc" }}
                      />
                      <span className="text-sm truncate">{colorName}</span>
                      {isSelected && <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedColors.length} {selectedColors.length === 1 ? 'color' : 'colors'}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Sizes <Badge variant="secondary">Optional</Badge>
              </Label>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedSizes.length} {selectedSizes.length === 1 ? 'size' : 'sizes'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customSizes">Custom Sizes (Optional)</Label>
              <Input
                id="customSizes"
                value={customSizes}
                onChange={(e) => setCustomSizes(e.target.value)}
                placeholder="36R, 38R, 40R (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Add custom sizes not in the standard list
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g., Cotton, Silk, Batik"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Elegant Closet"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                Main Category <Badge variant="secondary">Optional</Badge>
              </Label>
              <Select value={categoryId || "none"} onValueChange={(val) => setCategoryId(val === "none" ? "" : val)} disabled={categoriesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    categoriesLoading 
                      ? "Loading categories..." 
                      : "No category (product will be uncategorized)"
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

            {categoryId && (
              <div className="space-y-2">
                <Label htmlFor="subCategory">Sub-Category (Optional)</Label>
                <Select value={subCategoryId || "none"} onValueChange={(val) => setSubCategoryId(val === "none" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      subCategories.length === 0 
                        ? "No sub-categories available" 
                        : "Select a sub-category"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subCategories.length === 0 ? (
                      <SelectItem value="no-subs" disabled>
                        No sub-categories for this category
                      </SelectItem>
                    ) : (
                      subCategories.map((subCat) => (
                        <SelectItem key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Tags & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="summer, cotton, casual, trending (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <Label>Special Tag (Optional)</Label>
              <Select value={specialTag || "none"} onValueChange={(val) => setSpecialTag(val === "none" ? null : val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="No special tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Special Tag</SelectItem>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      New Arrival
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-pink-500" />
                      Trending Now
                    </div>
                  </SelectItem>
                  <SelectItem value="bestseller">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Bestseller
                    </div>
                  </SelectItem>
                  <SelectItem value="limited">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      Limited Edition
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Featured Product</Label>
                <p className="text-sm text-muted-foreground">Show in featured section on homepage</p>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Metadata</CardTitle>
            <CardDescription>Optimize for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${name} - Elegant Closet`}
              />
              <p className="text-xs text-muted-foreground">
                {seoTitle.length || 0}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {seoDescription.length || 0}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoKeywords">Keywords</Label>
              <Input
                id="seoKeywords"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="batik, traditional, sri lanka (comma-separated)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(val) => setVisibility(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="password">Password Protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 sticky bottom-0 bg-white p-4 border-t shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
