"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { db, auth } from "@/backend/config";
import { ContactMessage } from "@/admin-lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Search, Filter, Eye, Archive, Star, ExternalLink, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    const q = query(
      collection(db, "contact_messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ContactMessage[];
      
      setMessages(messagesData);
      setFilteredMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(msg => msg.priority === priorityFilter);
    }

    setFilteredMessages(filtered);
  }, [searchQuery, statusFilter, priorityFilter, messages]);

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (message.status === "new") {
      try {
        const user = auth.currentUser;
        await updateDoc(doc(db, "contact_messages", message.id), {
          status: "read",
          readAt: serverTimestamp(),
          readBy: user?.uid || "unknown",
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: ContactMessage["status"]) => {
    try {
      await updateDoc(doc(db, "contact_messages", messageId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (messageId: string, newPriority: ContactMessage["priority"]) => {
    try {
      await updateDoc(doc(db, "contact_messages", messageId), {
        priority: newPriority,
        updatedAt: serverTimestamp(),
      });
      toast.success("Priority updated successfully");
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  };

  const getStatusColor = (status: ContactMessage["status"]) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "read": return "bg-gray-100 text-gray-800";
      case "replied": return "bg-green-100 text-green-800";
      case "archived": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: ContactMessage["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const newMessagesCount = messages.filter(m => m.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage customer messages from the contact form
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Mail className="mr-2 h-5 w-5 text-blue-600" />
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newMessagesCount}</div>
            <p className="text-sm text-gray-600">Unread messages</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Eye className="mr-2 h-5 w-5 text-gray-600" />
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">
              {messages.filter(m => m.status === "read").length}
            </div>
            <p className="text-sm text-gray-600">Read messages</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Mail className="mr-2 h-5 w-5 text-green-600" />
              Replied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {messages.filter(m => m.status === "replied").length}
            </div>
            <p className="text-sm text-gray-600">Replied to</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Archive className="mr-2 h-5 w-5 text-purple-600" />
              Archived
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {messages.filter(m => m.status === "archived").length}
            </div>
            <p className="text-sm text-gray-600">Archived</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">All Messages</CardTitle>
              <CardDescription>
                Total: {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No messages found</p>
              <p className="text-sm text-gray-500">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Messages from customers will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    message.status === "new" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{message.name}</h3>
                        <Badge className={getStatusColor(message.status)} variant="secondary">
                          {message.status}
                        </Badge>
                        <Badge className={getPriorityColor(message.priority)} variant="secondary">
                          {message.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {message.email}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(message.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Reply via Email
                      </Button>
                    </a>
                  </div>
                  <p className="font-medium text-gray-800 mb-1">{message.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Message Details</DialogTitle>
            <DialogDescription>
              View and manage this customer message
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">From</Label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">{selectedMessage.email}</span>
                    </div>
                    
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Select
                    value={selectedMessage.status}
                    onValueChange={(value) => handleStatusChange(selectedMessage.id, value as ContactMessage["status"])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Select
                    value={selectedMessage.priority}
                    onValueChange={(value) => handlePriorityChange(selectedMessage.id, value as ContactMessage["priority"])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Received</Label>
                <div className="flex items-center mt-1 text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  {format(selectedMessage.createdAt.toDate(), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Subject</Label>
                <p className="mt-1 font-semibold text-lg">{selectedMessage.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Message</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Admin Notes</Label>
                  <div className="mt-1 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.adminNotes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}&body=Hi ${selectedMessage.name},%0D%0A%0D%0A`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}
