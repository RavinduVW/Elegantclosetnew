"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/backend/config";
import { Search, Info, Plus, Edit2, Trash2, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PREDEFINED_COLORS, searchColors as searchPredefinedColors, type ColorOption } from "@/lib/colors";

interface CustomColor extends ColorOption {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function ColorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState<CustomColor | null>(null);
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<CustomColor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    hex: "#000000",
    aliases: "",
  });

  useEffect(() => {
    fetchCustomColors();
  }, []);

  const fetchCustomColors = async () => {
    try {
      setIsLoading(true);
      const snapshot = await getDocs(collection(db, "colors"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomColor[];
      setCustomColors(data);
    } catch (error) {
      toast.error("Failed to fetch custom colors");
    } finally {
      setIsLoading(false);
    }
  };

  const allColors = [...PREDEFINED_COLORS, ...customColors];
  const filteredColors = searchQuery 
    ? allColors.filter(color =>
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.aliases?.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allColors;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.hex) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const now = Timestamp.now();
      const aliases = formData.aliases
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (editingColor && editingColor.id) {
        await updateDoc(doc(db, "colors", editingColor.id), {
          name: formData.name,
          hex: formData.hex,
          aliases: aliases.length > 0 ? aliases : undefined,
          updatedAt: now,
        });
        toast.success("Color updated successfully");
      } else {
        await addDoc(collection(db, "colors"), {
          name: formData.name,
          hex: formData.hex,
          aliases: aliases.length > 0 ? aliases : undefined,
          createdAt: now,
          updatedAt: now,
        });
        toast.success("Color created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCustomColors();
    } catch (error) {
      toast.error("Failed to save color");
    }
  };

  const handleEdit = (color: CustomColor) => {
    if (!color.id) {
      toast.error("Cannot edit predefined colors");
      return;
    }
    setEditingColor(color);
    setFormData({
      name: color.name,
      hex: color.hex,
      aliases: color.aliases?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (color: CustomColor) => {
    if (!color.id) {
      toast.error("Cannot delete predefined colors");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${color.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "colors", color.id));
      toast.success("Color deleted successfully");
      fetchCustomColors();
      if (selectedColor?.id === color.id) {
        setSelectedColor(null);
      }
    } catch (error) {
      toast.error("Failed to delete color");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      hex: "#000000",
      aliases: "",
    });
    setEditingColor(null);
  };

  const isCustomColor = (color: CustomColor) => Boolean(color.id);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Color Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage {PREDEFINED_COLORS.length} predefined colors + {customColors.length} custom colors
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Color
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingColor ? "Edit Custom Color" : "Create New Color"}
                </DialogTitle>
                <DialogDescription>
                  Add a custom color to your palette for unique product variants
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Color Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rose Gold, Midnight Blue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hex">Hex Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex"
                      type="text"
                      value={formData.hex}
                      onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      required
                      className="flex-1"
                    />
                    <div
                      className="w-20 h-10 rounded border-2 border-gray-300"
                      style={{ backgroundColor: formData.hex }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Use # followed by 6 hexadecimal digits
                  </p>
                </div>

                <div>
                  <Label htmlFor="aliases">Aliases (optional)</Label>
                  <Textarea
                    id="aliases"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    placeholder="Separate multiple aliases with commas (e.g., dusty rose, antique pink)"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingColor ? "Update Color" : "Create Color"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              <CardTitle>Color Library</CardTitle>
            </div>
            <CardDescription>
              These colors are used across all products. Select a color to view details and usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search colors by name or alias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredColors.length} color{filteredColors.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredColors.map((color, index) => (
                <div
                  key={`${color.name}-${index}`}
                  className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedColor?.name === color.name
                      ? "border-purple-500 shadow-lg shadow-purple-200"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <button
                    onClick={() => setSelectedColor(color)}
                    className="w-full"
                  >
                    <div
                      className="h-32 w-full transition-opacity group-hover:opacity-90"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-4 bg-white text-left">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{color.name}</h3>
                        {isCustomColor(color) && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{color.hex}</p>
                      {color.aliases && color.aliases.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {color.aliases.slice(0, 2).map((alias, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-gray-100 text-gray-600"
                            >
                              {alias}
                            </Badge>
                          ))}
                          {color.aliases.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{color.aliases.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {isCustomColor(color) && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(color);
                        }}
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-md"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(color);
                        }}
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 shadow-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {selectedColor?.name === color.name && (
                    <div className="absolute bottom-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
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

            {filteredColors.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No colors found</h3>
                <p className="text-gray-500">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedColor && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle>Color Details</CardTitle>
              <CardDescription>
                Information about {selectedColor.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Color Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900 mt-1">{selectedColor.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Hex Code</dt>
                      <dd className="text-sm text-gray-900 mt-1 font-mono">{selectedColor.hex}</dd>
                    </div>
                    {selectedColor.aliases && selectedColor.aliases.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Aliases</dt>
                        <dd className="flex flex-wrap gap-2 mt-1">
                          {selectedColor.aliases.map((alias) => (
                            <Badge key={alias} variant="secondary" className="bg-gray-100 text-gray-700">
                              {alias}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Color Preview</h3>
                  <div className="space-y-4">
                    <div
                      className="w-full h-32 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div
                          className="w-full h-16 rounded border border-gray-200 mb-1"
                          style={{ backgroundColor: selectedColor.hex, opacity: 0.3 }}
                        />
                        <p className="text-xs text-gray-500">30% Opacity</p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-full h-16 rounded border border-gray-200 mb-1"
                          style={{ backgroundColor: selectedColor.hex, opacity: 0.6 }}
                        />
                        <p className="text-xs text-gray-500">60% Opacity</p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-full h-16 rounded border border-gray-200 mb-1"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <p className="text-xs text-gray-500">100% Opacity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Color Management</h3>
                <p className="text-sm text-blue-800 mb-2">
                  This palette includes {PREDEFINED_COLORS.length} predefined colors and {customColors.length} custom colors. 
                  When creating or editing products, you can select multiple colors from this palette.
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Predefined colors are system colors that cannot be edited or deleted</li>
                  <li>Custom colors can be added, edited, or deleted as needed</li>
                  <li>Use custom colors for unique product variants and special collections</li>
                  <li>Each color can have multiple aliases for easier searching</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
