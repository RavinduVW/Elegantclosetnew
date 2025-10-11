"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/backend/config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactMessageSchema,
  ContactMessageFormData,
} from "@/admin-lib/validations/schemas";
import { ContactSettings } from "@/admin-lib/types";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactSettings | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactMessageFormData>({
    resolver: zodResolver(contactMessageSchema),
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const docRef = doc(db, "contact_settings", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setContactInfo(docSnap.data() as ContactSettings);
      }
    } catch (error) {
      console.error("Error loading contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactMessageFormData) => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "contact_messages"), {
        ...data,
        status: "new",
        priority: "medium",
        createdAt: serverTimestamp(),
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
          <Card className="shadow-none border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                <Send className="h-6 w-6 text-purple-600" />
                Get in Touch
              </CardTitle>
              <CardDescription>
                If you have any questions, please feel free to get in touch with
                us. We will reply to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Your name"
                    className="h-11"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="How can we help?"
                    className="h-11"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    {...register("message")}
                    placeholder="Your message..."
                    className="resize-none"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {loading ? (
              <Card className="shadow-lg border-gray-200">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ) : contactInfo ? (
              <>
                <Card className="shadow-lg border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
                      <Mail className="h-5 w-5 text-purple-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Address
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {contactInfo.addressLine1}
                          {contactInfo.addressLine2 && (
                            <>
                              <br />
                              {contactInfo.addressLine2}
                            </>
                          )}
                          {contactInfo.addressLine3 && (
                            <>
                              <br />
                              {contactInfo.addressLine3}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Phone
                        </h3>
                        {contactInfo.phoneNumbers.map((phone) => (
                          <p key={phone.id} className="text-gray-600">
                            <span className="font-medium">{phone.label}:</span>{" "}
                            {phone.number}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Email
                        </h3>
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Business Hours
                        </h3>
                        <div className="space-y-1">
                          {contactInfo.businessHours.map((hours) => (
                            <div
                              key={hours.id}
                              className="flex justify-between text-sm text-gray-600"
                            >
                              <span className="font-medium">{hours.day}:</span>
                              <span>
                                {hours.closed
                                  ? "Closed"
                                  : `${hours.openTime} - ${hours.closeTime}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(contactInfo.socialMedia.facebook ||
                  contactInfo.socialMedia.instagram) && (
                  <Card className="shadow-lg border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl text-gray-900">
                        Follow Us
                      </CardTitle>
                      <CardDescription>
                        Stay connected on social media
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {contactInfo.socialMedia.facebook && (
                          <a
                            href={contactInfo.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-none rounded-lg flex items-center justify-center text-zinc-700 border border-gray-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}
                        {contactInfo.socialMedia.instagram && (
                          <a
                            href={contactInfo.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-none rounded-lg flex items-center justify-center text-zinc-700 border border-gray-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="shadow-lg border-gray-200">
                <CardContent className="p-6">
                  <p className="text-gray-600">
                    Contact information will be displayed here once configured
                    by the admin.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
