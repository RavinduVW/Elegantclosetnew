"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/backend/config";
import { HeroSettings, HeroImage, HeroGridImage } from "@/admin-lib/types";
import { uploadToImageBB, uploadMultipleToImageBB } from "@/lib/imagebb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  GripVertical,
  ImageIcon,
  LayoutGrid,
  PlayCircle,
  Settings as SettingsIcon
} from "lucide-react";
import Link from "next/link";

const defaultHeroSettings: HeroSettings = {
  id: "global",
  activeVersion: "carousel",
  carouselImages: [],
  gridImages: [],
  headline: "Elegant Fashion Redefined",
  subheadline: "Discover timeless elegance with our curated collection of premium clothing",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  secondaryCtaText: "",
  secondaryCtaLink: "",
  autoPlayInterval: 5000,
  showArrows: true,
  showDots: true,
  updatedAt: Timestamp.now(),
  updatedBy: "system"
};

export default function HeroManagementPage() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [uploadingGrid, setUploadingGrid] = useState<number | null>(null);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "hero_settings", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setHeroSettings(docSnap.data() as HeroSettings);
      } else {
        setHeroSettings(defaultHeroSettings);
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
      toast.error("Failed to load hero settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "hero_settings", "global");
      await setDoc(docRef, {
        ...heroSettings,
        updatedAt: Timestamp.now(),
        updatedBy: "admin"
      });
      toast.success("Hero settings saved successfully!");
    } catch (error) {
      console.error("Error saving hero settings:", error);
      toast.error("Failed to save hero settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingCarousel(true);
      const uploadedUrls = await uploadMultipleToImageBB(Array.from(files), "hero-carousel");
      
      const newImages: HeroImage[] = uploadedUrls.map((url, index) => ({
        id: `carousel-${Date.now()}-${index}`,
        url,
        alt: `Hero carousel image ${heroSettings.carouselImages.length + index + 1}`,
        order: heroSettings.carouselImages.length + index
      }));

      setHeroSettings(prev => ({
        ...prev,
        carouselImages: [...prev.carouselImages, ...newImages]
      }));

      toast.success(`${newImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading carousel images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingCarousel(false);
    }
  };

  const handleGridUpload = async (position: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingGrid(position);
      const response = await uploadToImageBB(file, `hero-grid-${position}`);
      
      const newImage: HeroGridImage = {
        id: `grid-${position}-${Date.now()}`,
        url: response.data.display_url,
        alt: `Hero grid image ${position}`,
        position
      };

      setHeroSettings(prev => ({
        ...prev,
        gridImages: [
          ...prev.gridImages.filter(img => img.position !== position),
          newImage
        ]
      }));

      toast.success(`Grid image ${position} uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading grid image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingGrid(null);
    }
  };

  const deleteCarouselImage = (id: string) => {
    setHeroSettings(prev => ({
      ...prev,
      carouselImages: prev.carouselImages.filter(img => img.id !== id)
    }));
    toast.success("Image removed");
  };

  const deleteGridImage = (position: 1 | 2) => {
    setHeroSettings(prev => ({
      ...prev,
      gridImages: prev.gridImages.filter(img => img.position !== position)
    }));
    toast.success("Image removed");
  };

  const getGridImage = (position: 1 | 2) => {
    return heroSettings.gridImages.find(img => img.position === position);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hero Section Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage homepage hero section versions and content
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="version" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="version">
            <Eye className="w-4 h-4 mr-2" />
            Active Version
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <PlayCircle className="w-4 h-4 mr-2" />
            Carousel Version
          </TabsTrigger>
          <TabsTrigger value="grid">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid Version
          </TabsTrigger>
        </TabsList>

        <TabsContent value="version" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Active Hero Version</CardTitle>
              <CardDescription>
                Select which hero section version to display on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setHeroSettings(prev => ({ ...prev, activeVersion: "carousel" }))}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    heroSettings.activeVersion === "carousel"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {heroSettings.activeVersion === "carousel" && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600">
                      Active
                    </Badge>
                  )}
                  <PlayCircle className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Carousel Version</h3>
                  <p className="text-gray-600 text-sm">
                    Auto-playing image carousel with smooth transitions
                  </p>
                  <div className="mt-4 text-sm text-purple-600 font-medium">
                    {heroSettings.carouselImages.length} images configured
                  </div>
                </button>

                <button
                  onClick={() => setHeroSettings(prev => ({ ...prev, activeVersion: "grid" }))}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    heroSettings.activeVersion === "grid"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {heroSettings.activeVersion === "grid" && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600">
                      Active
                    </Badge>
                  )}
                  <LayoutGrid className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Grid Version</h3>
                  <p className="text-gray-600 text-sm">
                    2-image grid layout with text content
                  </p>
                  <div className="mt-4 text-sm text-purple-600 font-medium">
                    {heroSettings.gridImages.length} of 2 images configured
                  </div>
                </button>
              </div>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Content Settings (Both Versions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Headline</Label>
                    <Input
                      value={heroSettings.headline}
                      onChange={(e) => setHeroSettings(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="Elegant Fashion Redefined"
                    />
                  </div>
                  <div>
                    <Label>Subheadline</Label>
                    <Textarea
                      value={heroSettings.subheadline}
                      onChange={(e) => setHeroSettings(prev => ({ ...prev, subheadline: e.target.value }))}
                      placeholder="Discover timeless elegance..."
                      rows={2}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Primary CTA Text</Label>
                      <Input
                        value={heroSettings.ctaText}
                        onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaText: e.target.value }))}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <Label>Primary CTA Link</Label>
                      <Input
                        value={heroSettings.ctaLink}
                        onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaLink: e.target.value }))}
                        placeholder="/shop"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Secondary CTA Text (Optional)</Label>
                      <Input
                        value={heroSettings.secondaryCtaText || ""}
                        onChange={(e) => setHeroSettings(prev => ({ ...prev, secondaryCtaText: e.target.value }))}
                        placeholder="Learn More"
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Link (Optional)</Label>
                      <Input
                        value={heroSettings.secondaryCtaLink || ""}
                        onChange={(e) => setHeroSettings(prev => ({ ...prev, secondaryCtaLink: e.target.value }))}
                        placeholder="/about"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carousel Images</CardTitle>
              <CardDescription>
                Upload and manage images for the carousel hero version. Images will auto-play in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => document.getElementById("carousel-upload")?.click()}
                  disabled={uploadingCarousel}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingCarousel ? "Uploading..." : "Upload Images"}
                </Button>
                <input
                  id="carousel-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCarouselUpload}
                  className="hidden"
                />
                <span className="text-sm text-gray-600">
                  {heroSettings.carouselImages.length} image(s) uploaded
                </span>
              </div>

              {heroSettings.carouselImages.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">No carousel images uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-2">Upload images to get started</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroSettings.carouselImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCarouselImage(image.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">Order: {index + 1}</Badge>
                        <Input
                          value={image.alt}
                          onChange={(e) => {
                            setHeroSettings(prev => ({
                              ...prev,
                              carouselImages: prev.carouselImages.map(img =>
                                img.id === image.id ? { ...img, alt: e.target.value } : img
                              )
                            }));
                          }}
                          placeholder="Image alt text"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">Carousel Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Auto-Play Interval (milliseconds)</Label>
                    <Input
                      type="number"
                      value={heroSettings.autoPlayInterval}
                      onChange={(e) => setHeroSettings(prev => ({ ...prev, autoPlayInterval: parseInt(e.target.value) || 5000 }))}
                      min={2000}
                      max={10000}
                      step={1000}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {heroSettings.autoPlayInterval / 1000}s per slide
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Navigation Arrows</Label>
                    <Switch
                      checked={heroSettings.showArrows}
                      onCheckedChange={(checked) => setHeroSettings(prev => ({ ...prev, showArrows: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Dot Indicators</Label>
                    <Switch
                      checked={heroSettings.showDots}
                      onCheckedChange={(checked) => setHeroSettings(prev => ({ ...prev, showDots: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grid Layout Images</CardTitle>
              <CardDescription>
                Upload 2 images for the grid hero version. Layout: 2 equal-sized images side by side.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {([1, 2] as const).map((position) => (
                  <div key={position} className="space-y-4">
                    <Label className="text-lg font-semibold">Position {position}</Label>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                      {uploadingGrid === position ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </div>
                        </div>
                      ) : getGridImage(position) ? (
                        <>
                          <Image
                            src={getGridImage(position)!.url}
                            alt={getGridImage(position)!.alt}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => document.getElementById(`grid-${position}`)?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Change
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteGridImage(position)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => document.getElementById(`grid-${position}`)?.click()}
                          className="flex items-center justify-center h-full w-full"
                        >
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">Position {position}</p>
                          </div>
                        </button>
                      )}
                    </div>
                    <input
                      id={`grid-${position}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGridUpload(position, e)}
                      className="hidden"
                    />
                  </div>
                ))}
              </div>

              {heroSettings.gridImages.length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Image Alt Text</h4>
                  <div className="space-y-2">
                    {[1, 2].map((pos) => {
                      const image = getGridImage(pos as 1 | 2);
                      if (!image) return null;
                      return (
                        <div key={pos} className="flex items-center gap-2">
                          <Badge>Position {pos}</Badge>
                          <Input
                            value={image.alt}
                            onChange={(e) => {
                              setHeroSettings(prev => ({
                                ...prev,
                                gridImages: prev.gridImages.map(img =>
                                  img.position === pos ? { ...img, alt: e.target.value } : img
                                )
                              }));
                            }}
                            placeholder="Image alt text"
                            className="text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
