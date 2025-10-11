"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, orderBy, query } from "firebase/firestore";
import { db } from "@/backend/config";
import { FAQ } from "@/admin-lib/types";
import { HelpCircle, Plus, Edit2, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    published: true,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "faqs"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FAQ[];
      setFaqs(data);
    } catch (error) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      const now = Timestamp.now();

      if (editingFAQ) {
        await updateDoc(doc(db, "faqs", editingFAQ.id), {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          published: formData.published,
          updatedAt: now,
        });
        toast.success("FAQ updated successfully");
      } else {
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order || 0)) : 0;
        await addDoc(collection(db, "faqs"), {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          order: maxOrder + 1,
          published: formData.published,
          createdAt: now,
          updatedAt: now,
          createdBy: "admin",
        });
        toast.success("FAQ created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchFAQs();
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      if (errorMessage.includes("permission")) {
        toast.error("Permission denied. Please check your admin access.");
      } else if (errorMessage.includes("network")) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error(`Failed to save FAQ: ${errorMessage}`);
      }
      console.error("FAQ save error:", error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      published: faq.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (faq: FAQ) => {
    if (!confirm(`Are you sure you want to delete "${faq.question}"?`)) return;

    try {
      await deleteDoc(doc(db, "faqs", faq.id));
      toast.success("FAQ deleted successfully");
      fetchFAQs();
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      toast.error(`Failed to delete FAQ: ${errorMessage}`);
      console.error("FAQ delete error:", error);
    }
  };

  const togglePublished = async (faq: FAQ) => {
    try {
      await updateDoc(doc(db, "faqs", faq.id), {
        published: !faq.published,
        updatedAt: Timestamp.now(),
      });
      toast.success(faq.published ? "FAQ unpublished" : "FAQ published");
      fetchFAQs();
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      toast.error(`Failed to update status: ${errorMessage}`);
      console.error("FAQ toggle error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      published: true,
    });
    setEditingFAQ(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FAQ Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage frequently asked questions ({faqs.length} total, {faqs.filter(f => f.published).length} published)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFAQ ? "Edit FAQ" : "Create New FAQ"}
                </DialogTitle>
                <DialogDescription>
                  Add or update frequently asked questions for your customers
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="What is your return policy?"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="answer">Answer *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Provide a detailed answer..."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.answer.length} characters
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <div>
                    <Label htmlFor="published" className="cursor-pointer">
                      Publish FAQ
                    </Label>
                    <p className="text-sm text-gray-500">
                      Make this FAQ visible to customers
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingFAQ ? "Update FAQ" : "Create FAQ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <CardTitle>All FAQs</CardTitle>
            </div>
            <CardDescription>
              Create, edit, and organize frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading FAQs...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first FAQ
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First FAQ
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 cursor-move">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {faq.question}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={faq.published ? "default" : "secondary"}>
                              {faq.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {faq.answer}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePublished(faq)}
                            className="hover:bg-purple-50"
                          >
                            {faq.published ? (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(faq)}
                            className="hover:bg-blue-50"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(faq)}
                            className="hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
