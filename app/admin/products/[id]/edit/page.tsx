"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
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
import { Skeleton } from "@/components/ui/skeleton";
import MDEditor from "@uiw/react-md-editor";
import { uploadMultipleToFirebaseStorage } from "@/lib/firebase-storage";
import { PREDEFINED_COLORS, getAllColorNames } from "@/lib/colors";
import { getAllSizeCodes, sortSizes } from "@/lib/sizes";
import { ArrowLeft, Upload, X, Loader2, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string; alt: string; order: number }>>([]);
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
    const loadData = async () => {
      await Promise.all([
        fetchProduct(),
        fetchCategories()
      ]);
      setPageLoading(false);
    };
    loadData();
  }, [productId]);

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

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      const product = { id: docSnap.id, ...docSnap.data() } as Product;

      setName(product.name);
      setSlug(product.slug);
      setIntroduction(product.introduction || "");
      setDescription(product.description || "");
      setMarkdownDescription(product.markdownDescription || "");
      setShortDescription(product.shortDescription || "");
      setSku(product.sku);
      setPrice(product.price.toString());
      setSalePrice(product.salePrice?.toString() || "");
      setCategoryId(product.categoryId || "");
      setSubCategoryId(product.subCategoryId || "");
      setSelectedColors(product.colors || []);
      setSelectedSizes(product.sizes || []);
      setCustomSizes(product.customSizes?.join(", ") || "");
      setMaterial(product.material || "");
      setBrand(product.brand || "");
      setTags(product.tags?.join(", ") || "");
      setInStock(product.inStock);
      setIsSoldOut(product.isSoldOut || false);
      setStockQuantity(product.stockQuantity?.toString() || "");
      setLowStockThreshold(product.lowStockThreshold?.toString() || "10");
      setAllowBackorder(product.allowBackorder || false);
      setSpecialTag(product.specialTag || null);
      setFeatured(product.featured || false);
      setStatus(product.status);
      setVisibility(product.visibility || "public");
      setSeoTitle(product.seoTitle || "");
      setSeoDescription(product.seoDescription || "");
      setSeoKeywords(product.seoKeywords?.join(", ") || "");
      setExistingImages(product.images || []);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, where("parentId", "==", null));
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSubCategories = async (parentId: string) => {
    try {
      const subCategoriesRef = collection(db, "categories");
      const q = query(subCategoriesRef, where("parentId", "==", parentId));
      const snapshot = await getDocs(q);
      const subCategoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku || !price) {
      toast.error("Please fill in all required fields: Name, SKU, and Price");
      return;
    }

    if (selectedColors.length === 0) {
      toast.error("Please select at least one color");
      return;
    }

    if (selectedSizes.length === 0 && !customSizes) {
      toast.error("Please select at least one size or add custom sizes");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error("Please keep at least one existing image or upload new images");
      return;
    }

    if (salePrice && salePrice.trim() !== "" && parseFloat(salePrice) >= parseFloat(price)) {
      toast.error("Sale price must be lower than the regular price");
      return;
    }

    setLoading(true);

    try {
      let newImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} new images to Firebase Storage...`);
        toast.info(`Uploading ${imageFiles.length} new image${imageFiles.length > 1 ? 's' : ''}...`);
        
        const uploadResults = await uploadMultipleToFirebaseStorage(imageFiles, {
          folder: "products",
          namePrefix: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
          parallel: true,
        });
        
        newImageUrls = uploadResults.map(result => result.data.url);
        console.log("New images uploaded successfully to Firebase Storage:", newImageUrls);
      }

      const allImages = [
        ...existingImages,
        ...newImageUrls.map((url, index) => ({
          id: `img-${Date.now()}-${index}`,
          url,
          alt: name,
          order: existingImages.length + index,
        }))
      ];

      const sizesArray = [...selectedSizes];
      if (customSizes) {
        const customSizesArray = customSizes.split(",").map(s => s.trim()).filter(Boolean);
        sizesArray.push(...customSizesArray);
      }

      const productData: Partial<Product> = {
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
        colors: selectedColors,
        sizes: sortSizes(sizesArray),
        customSizes: customSizes && customSizes.trim() !== "" ? customSizes.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        material: material && material.trim() !== "" ? material : undefined,
        brand: brand && brand.trim() !== "" ? brand : undefined,
        images: allImages,
        featuredImage: allImages[0]?.url,
        status,
        featured,
        specialTag: specialTag || undefined,
        visibility,
        seoTitle: seoTitle && seoTitle.trim() !== "" ? seoTitle : undefined,
        seoDescription: seoDescription && seoDescription.trim() !== "" ? seoDescription : undefined,
        seoKeywords: seoKeywords && seoKeywords.trim() !== "" ? seoKeywords.split(",").map(k => k.trim()).filter(Boolean) : undefined,
        updatedAt: serverTimestamp() as any,
      };

      if (status === "published" && !existingImages.length) {
        productData.publishedAt = serverTimestamp() as any;
      }

      console.log("Updating product in Firestore...", productData);
      await updateDoc(doc(db, "products", productId), productData);
      console.log("Product updated successfully");

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      
      if (error.message?.includes('ImageBB')) {
        toast.error("Image upload failed. Check your ImageBB API key.");
      } else if (error.code === 'permission-denied') {
        toast.error("Permission denied. Check Firebase security rules.");
      } else {
        toast.error(error.message || "Failed to update product. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6 max-w-6xl pb-12">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={loading}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product details</p>
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
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Manage product photos (first image will be the featured image)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-auto aspect-[9/16] object-cover rounded-lg border-2 border-gray-200"
                  />
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-purple-600">Featured</Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                    Existing
                  </Badge>
                </div>
              ))}

              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Badge variant="default" className="absolute bottom-2 left-2 bg-green-600 text-xs">
                    New
                  </Badge>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-purple-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Add Images</span>
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
              Keep existing images or upload new ones. New images will be uploaded to ImageBB.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Colors * (Select at least one)</Label>
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
              <Label>Sizes * (Select at least one)</Label>
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
                    {subCategories.map((subCat) => (
                      <SelectItem key={subCat.id} value={subCat.id}>
                        {subCat.name}
                      </SelectItem>
                    ))}
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
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
