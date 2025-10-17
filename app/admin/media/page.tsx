"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/backend/config";
import type { Product } from "@/admin-lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image as ImageIcon, 
  Search, 
  Copy, 
  ExternalLink, 
  Download,
  Grid3x3,
  LayoutGrid,
  ImageOff,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";

interface MediaImage {
  id: string;
  url: string;
  alt: string;
  productId: string;
  productName: string;
  order: number;
  isFeatured: boolean;
}

export default function MediaPage() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllImages();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredImages(images);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = images.filter(
        (img) =>
          img.productName.toLowerCase().includes(query) ||
          img.alt.toLowerCase().includes(query) ||
          img.url.toLowerCase().includes(query)
      );
      setFilteredImages(filtered);
    }
  }, [searchQuery, images]);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const allImages: MediaImage[] = [];

      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as Product;
        
        if (product.images && product.images.length > 0) {
          product.images.forEach((image) => {
            allImages.push({
              id: image.id,
              url: image.url,
              alt: image.alt || product.name,
              productId: product.id,
              productName: product.name,
              order: image.order,
              isFeatured: product.featuredImage === image.url,
            });
          });
        }
      });

      allImages.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.productName.localeCompare(b.productName);
      });

      setImages(allImages);
      setFilteredImages(allImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("Image URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const getGridClass = () => {
    switch (gridSize) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";
      case "medium":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const stats = {
    total: images.length,
    featured: images.filter((img) => img.isFeatured).length,
    products: new Set(images.map((img) => img.productId)).size,
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            All images hosted on ImageBB from your products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {stats.total} Images
          </Badge>
          <Badge variant="outline" className="text-sm">
            {stats.products} Products
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Grid3x3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-sm text-muted-foreground">Featured Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <LayoutGrid className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.products}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>Browse and manage all uploaded images</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={gridSize} onValueChange={(val) => setGridSize(val as any)}>
                <TabsList>
                  <TabsTrigger value="small" className="text-xs">
                    Small
                  </TabsTrigger>
                  <TabsTrigger value="medium" className="text-xs">
                    Medium
                  </TabsTrigger>
                  <TabsTrigger value="large" className="text-xs">
                    Large
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by product name, alt text, or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className={`grid ${getGridClass()} gap-4`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <ImageOff className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "No images found" : "No images yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Upload images through product management"}
              </p>
            </div>
          ) : (
            <div className={`grid ${getGridClass()} gap-4`}>
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-xl"
                    onMouseEnter={() => setHoveredImage(image.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <NextImage
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {image.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 z-10">
                        Featured
                      </Badge>
                    )}

                    <AnimatePresence>
                      {hoveredImage === image.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4 z-20"
                        >
                          <div className="space-y-2">
                            <p className="text-white font-semibold text-sm line-clamp-1">
                              {image.productName}
                            </p>
                            <p className="text-white/80 text-xs line-clamp-1">
                              {image.alt}
                            </p>
                            <div className="flex items-center gap-1 pt-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-2 flex-1"
                                onClick={() => copyToClipboard(image.url)}
                              >
                                {copiedUrl === image.url ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-2"
                                onClick={() => window.open(image.url, "_blank")}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 px-2"
                                onClick={() =>
                                  downloadImage(
                                    image.url,
                                    `${image.productName.replace(/\s+/g, "-")}-${image.order}.jpg`
                                  )
                                }
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredImages.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Showing {filteredImages.length} of {images.length} images
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
