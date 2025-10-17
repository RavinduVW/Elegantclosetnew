"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/backend/config";
import type { Product, Category } from "@/admin-lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Eye, Package, DollarSign, Tag, Palette, Ruler, ShoppingBag, Sparkles, TrendingUp, Award, Clock, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { getColorHex } from "@/lib/colors";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      const productData = { id: docSnap.id, ...docSnap.data() } as Product;
      setProduct(productData);

      if (productData.categoryId) {
        const catDoc = await getDoc(doc(db, "categories", productData.categoryId));
        if (catDoc.exists()) {
          setCategory({ id: catDoc.id, ...catDoc.data() } as Category);
        }
      }

      if (productData.subCategoryId) {
        const subCatDoc = await getDoc(doc(db, "categories", productData.subCategoryId));
        if (subCatDoc.exists()) {
          setSubCategory({ id: subCatDoc.id, ...subCatDoc.data() } as Category);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      published: "default",
      draft: "secondary",
      archived: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getSpecialTagIcon = (tag: string) => {
    switch (tag) {
      case "new":
        return <Sparkles className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      case "bestseller":
        return <Award className="w-4 h-4" />;
      case "limited":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => router.push("/admin/products")} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={()=> router.push(`/admin/products/${productId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={product.featuredImage || product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-purple-600">Featured</Badge>
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((image, index) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Product Name</p>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">URL Slug</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.slug}</code>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">SKU</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{product.sku}</code>
              </div>

              {product.introduction && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Introduction</p>
                  <p className="text-sm">{product.introduction}</p>
                </div>
              )}

              {product.shortDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Short Description</p>
                  <p className="text-sm">{product.shortDescription}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(product.status)}
                {product.featured && <Badge variant="outline">Featured</Badge>}
                {product.specialTag && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getSpecialTagIcon(product.specialTag)}
                    {product.specialTag}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Regular Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(product.price, "LKR")}</p>
                </div>
                {product.salePrice && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sale Price</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(product.salePrice, "LKR")}</p>
                      {product.discountPercentage && (
                        <Badge variant="destructive">-{product.discountPercentage}%</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stock Status</p>
                  {product.isSoldOut ? (
                    <Badge variant="destructive">Sold Out</Badge>
                  ) : product.inStock ? (
                    <Badge className="bg-green-600">In Stock</Badge>
                  ) : (
                    <Badge variant="secondary">Out of Stock</Badge>
                  )}
                </div>
                {product.stockQuantity && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                    <p className="font-semibold">{product.stockQuantity} units</p>
                  </div>
                )}
              </div>

              {product.allowBackorder && (
                <Badge variant="outline">Backorder Allowed</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {product.markdownDescription && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-color-mode="light">
              <MDEditor.Markdown source={product.markdownDescription} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const hex = getColorHex(color);
                return (
                  <div key={color} className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <div
                      className="w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-sm font-medium">{color}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Sizes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Badge key={size} variant="outline" className="px-3 py-1">
                  {size}
                </Badge>
              ))}
            </div>
            {product.customSizes && product.customSizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Custom Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.customSizes.map((size) => (
                    <Badge key={size} variant="secondary" className="px-3 py-1">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Main Category</p>
              <Badge variant="outline" className="text-base px-3 py-1">
                {category?.name || "Not set"}
              </Badge>
            </div>
            {subCategory && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sub-Category</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {subCategory.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.material && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Material</p>
                <p className="font-medium">{product.material}</p>
              </div>
            )}
            {product.brand && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Brand</p>
                <p className="font-medium">{product.brand}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {product.tags && product.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(product.seoTitle || product.seoDescription || product.seoKeywords) && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.seoTitle && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">SEO Title</p>
                <p className="font-medium">{product.seoTitle}</p>
              </div>
            )}
            {product.seoDescription && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">SEO Description</p>
                <p className="text-sm">{product.seoDescription}</p>
              </div>
            )}
            {product.seoKeywords && product.seoKeywords.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {product.seoKeywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created At</p>
            <p className="text-sm font-medium">
              {product.createdAt && typeof product.createdAt === 'object' && 'toDate' in product.createdAt 
                ? new Date(product.createdAt.toDate()).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Updated At</p>
            <p className="text-sm font-medium">
              {product.updatedAt && typeof product.updatedAt === 'object' && 'toDate' in product.updatedAt
                ? new Date(product.updatedAt.toDate()).toLocaleString()
                : "N/A"}
            </p>
          </div>
          {product.publishedAt && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Published At</p>
              <p className="text-sm font-medium">
                {typeof product.publishedAt === 'object' && 'toDate' in product.publishedAt
                  ? new Date(product.publishedAt.toDate()).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Visibility</p>
            <Badge variant="outline">{product.visibility || "public"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
