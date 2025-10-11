"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, getDocs, Timestamp, query, limit } from "firebase/firestore";
import { db } from "@/backend/config";
import { AboutContent } from "@/admin-lib/types";
import { uploadToImageBB } from "@/lib/imagebb";
import { FileText, Save, Eye, Upload, X, Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function AboutManagementPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    content: "",
    published: true,
  });

  const [images, setImages] = useState<Array<{ url: string; alt: string; caption?: string }>>([]);
  const [newImage, setNewImage] = useState({ alt: "", caption: "" });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "about"), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        const data = { id: docData.id, ...docData.data() } as AboutContent;
        setContent(data);
        setFormData({
          content: data.content || "",
          published: data.published,
        });
        setImages(data.images || []);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      toast.error(`Failed to fetch content: ${errorMessage}`);
      console.error("Fetch content error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      const now = Timestamp.now();
      
      const cleanedImages = images.map(img => {
        const cleaned: any = { url: img.url, alt: img.alt };
        if (img.caption !== undefined && img.caption !== "") {
          cleaned.caption = img.caption;
        }
        return cleaned;
      });
      
      const data: any = {
        content: formData.content.trim(),
        images: cleanedImages,
        published: formData.published,
        updatedAt: now,
        updatedBy: "admin",
      };

      Object.keys(data).forEach(key => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });

      if (content) {
        await updateDoc(doc(db, "about", content.id), data);
        toast.success("About page updated successfully");
      } else {
        const newDocData = { ...data, createdAt: now };
        Object.keys(newDocData).forEach(key => {
          if (newDocData[key] === undefined) {
            delete newDocData[key];
          }
        });
        await addDoc(collection(db, "about"), newDocData);
        toast.success("About page created successfully");
      }

      await fetchContent();
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      if (errorMessage.includes("permission")) {
        toast.error("Permission denied. Please check your admin access and Firestore rules.");
      } else if (errorMessage.includes("network")) {
        toast.error("Network error. Please check your internet connection.");
      } else if (errorMessage.includes("not found")) {
        toast.error("Document not found. The content may have been deleted.");
      } else {
        toast.error(`Failed to save: ${errorMessage}`);
      }
      console.error("Save error details:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error("Image size must be less than 32MB");
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadToImageBB(file, "about-page");
      setImages([...images, {
        url: response.data.display_url,
        alt: newImage.alt || file.name,
        caption: newImage.caption || undefined,
      }]);
      setNewImage({ alt: "", caption: "" });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      if (errorMessage.includes("API key")) {
        toast.error("ImageBB API key not configured. Check your environment variables.");
      } else if (errorMessage.includes("size")) {
        toast.error("Image too large. Maximum size is 32MB.");
      } else {
        toast.error(`Upload failed: ${errorMessage}`);
      }
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const before = formData.content.substring(0, start);
    const after = formData.content.substring(end);

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "bold":
        newText = `${before}**${selectedText || "bold text"}**${after}`;
        cursorOffset = selectedText ? 0 : -2;
        break;
      case "italic":
        newText = `${before}*${selectedText || "italic text"}*${after}`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case "h1":
        newText = `${before}# ${selectedText || "Heading 1"}${after}`;
        cursorOffset = 0;
        break;
      case "h2":
        newText = `${before}## ${selectedText || "Heading 2"}${after}`;
        cursorOffset = 0;
        break;
      case "h3":
        newText = `${before}### ${selectedText || "Heading 3"}${after}`;
        cursorOffset = 0;
        break;
      case "ul":
        newText = `${before}\n- ${selectedText || "List item"}\n- Item 2\n- Item 3${after}`;
        cursorOffset = 0;
        break;
      case "ol":
        newText = `${before}\n1. ${selectedText || "First item"}\n2. Second item\n3. Third item${after}`;
        cursorOffset = 0;
        break;
      case "link":
        newText = `${before}[${selectedText || "link text"}](url)${after}`;
        cursorOffset = selectedText ? -5 : -10;
        break;
      default:
        return;
    }

    setFormData({ ...formData, content: newText });
    setTimeout(() => {
      textarea.focus();
      const newPosition = newText.length + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              About Page Editor
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your About page content with markdown support
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published" className="cursor-pointer text-sm">
                {formData.published ? "Published" : "Draft"}
              </Label>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="editor">
              <FileText className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="w-4 h-4 mr-2" />
              Images ({images.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle>Markdown Editor</CardTitle>
                <CardDescription>
                  Write content using markdown syntax. Use the toolbar for quick formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4 flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("bold")}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("italic")}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("h1")}
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("h2")}
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("h3")}
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("ul")}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("ol")}
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertMarkdown("link")}
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>

                <Textarea
                  id="content-editor"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="# About Us&#10;&#10;Write your content here using markdown...&#10;&#10;## Our Story&#10;&#10;Tell your story...&#10;&#10;**Bold text** and *italic text* are supported."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {formData.content.length} characters | Supports: **bold**, *italic*, # headers, lists, links
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your content will appear to visitors
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {images.length > 0 && (
                  <div className="mb-8">
                    <img
                      src={images[0].url}
                      alt={images[0].alt}
                      className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
                    />
                    {images[0].caption && (
                      <p className="text-sm text-gray-600 mt-2 italic">{images[0].caption}</p>
                    )}
                  </div>
                )}

                {formData.content ? (
                  <article className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 prose-a:text-purple-600 hover:prose-a:text-purple-700 prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Start writing to see preview...</p>
                  </div>
                )}

                {images.length > 1 && (
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.slice(1).map((image, index) => (
                      <div key={index}>
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full aspect-video object-cover rounded-lg shadow-md"
                        />
                        {image.caption && (
                          <p className="text-sm text-gray-600 mt-2 italic">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle>Image Gallery</CardTitle>
                <CardDescription>
                  Upload and manage images for your About page (ImageBB hosted)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Upload Image</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload images up to 32MB. First image will be featured at the top.
                  </p>

                  <div className="max-w-md mx-auto space-y-3 mb-4">
                    <Input
                      placeholder="Image alt text (for accessibility)"
                      value={newImage.alt}
                      onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                    />
                    <Input
                      placeholder="Image caption (optional)"
                      value={newImage.caption}
                      onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                    />
                  </div>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="max-w-xs mx-auto"
                  />
                  {isUploading && (
                    <p className="text-sm text-purple-600 mt-2">Uploading to ImageBB...</p>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="mt-2 text-sm">
                          <p className="font-medium text-gray-900 truncate">{image.alt}</p>
                          {image.caption && (
                            <p className="text-gray-600 truncate">{image.caption}</p>
                          )}
                          {index === 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
