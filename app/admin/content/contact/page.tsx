"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/backend/config";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSettingsSchema, ContactSettingsFormData } from "@/admin-lib/validations/schemas";
import { ContactSettings } from "@/admin-lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Plus, X, Facebook, Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ContactSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(contactSettingsSchema) as any,
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      phoneNumbers: [{ id: crypto.randomUUID(), label: "Primary", number: "", primary: true }],
      email: "",
      businessHours: daysOfWeek.map(day => ({
        id: crypto.randomUUID(),
        day,
        openTime: "09:00",
        closeTime: "18:00",
        closed: day === "Sunday",
      })),
      socialMedia: {
        facebook: "",
        instagram: "",
      },
    },
  });

  const { register, control, handleSubmit, formState: { errors }, reset, setValue } = form;

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const { fields: hoursFields } = useFieldArray({
    control,
    name: "businessHours",
  });

  useEffect(() => {
    loadContactSettings();
  }, []);

  const loadContactSettings = async () => {
    try {
      const docRef = doc(db, "contact_settings", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ContactSettings;
        reset({
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || "",
          addressLine3: data.addressLine3 || "",
          phoneNumbers: data.phoneNumbers,
          email: data.email,
          businessHours: data.businessHours,
          socialMedia: {
            facebook: data.socialMedia.facebook || "",
            instagram: data.socialMedia.instagram || "",
          },
        });
      }
    } catch (error) {
      console.error("Error loading contact settings:", error);
      toast.error("Failed to load contact settings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactSettingsFormData) => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const contactSettings: Omit<ContactSettings, "id"> = {
        ...data,
        updatedAt: serverTimestamp() as any,
        updatedBy: user.uid,
      };

      await setDoc(doc(db, "contact_settings", "global"), contactSettings);
      toast.success("Contact settings saved successfully");
    } catch (error) {
      console.error("Error saving contact settings:", error);
      toast.error("Failed to save contact settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/content">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contact Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage contact information displayed on your website
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Address Information
            </CardTitle>
            <CardDescription>
              Your business address displayed on the contact page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                {...register("addressLine1")}
                placeholder="123 Fashion Street"
                className="mt-1"
              />
              {errors.addressLine1 && (
                <p className="text-sm text-red-500 mt-1">{errors.addressLine1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                {...register("addressLine2")}
                placeholder="Style District"
                className="mt-1"
              />
              {errors.addressLine2 && (
                <p className="text-sm text-red-500 mt-1">{errors.addressLine2.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="addressLine3">Address Line 3</Label>
              <Input
                id="addressLine3"
                {...register("addressLine3")}
                placeholder="City, State 12345"
                className="mt-1"
              />
              {errors.addressLine3 && (
                <p className="text-sm text-red-500 mt-1">{errors.addressLine3.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-600" />
                Phone Numbers
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPhone({ id: crypto.randomUUID(), label: "", number: "", primary: false })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Phone
              </Button>
            </CardTitle>
            <CardDescription>
              Add multiple phone numbers with custom labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {phoneFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`phoneNumbers.${index}.label`}>Label</Label>
                    <Input
                      {...register(`phoneNumbers.${index}.label`)}
                      placeholder="Primary, Support, etc."
                      className="mt-1"
                    />
                    {errors.phoneNumbers?.[index]?.label && (
                      <p className="text-sm text-red-500 mt-1">{errors.phoneNumbers[index]?.label?.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`phoneNumbers.${index}.number`}>Number</Label>
                    <Input
                      {...register(`phoneNumbers.${index}.number`)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                    {errors.phoneNumbers?.[index]?.number && (
                      <p className="text-sm text-red-500 mt-1">{errors.phoneNumbers[index]?.number?.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-7">
                  <Switch
                    {...register(`phoneNumbers.${index}.primary`)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        phoneFields.forEach((_, i) => {
                          setValue(`phoneNumbers.${i}.primary`, i === index);
                        });
                      }
                    }}
                  />
                  <Label className="text-xs">Primary</Label>
                </div>

                {phoneFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhone(index)}
                    className="mt-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Mail className="h-5 w-5 mr-2 text-purple-600" />
              Email Address
            </CardTitle>
            <CardDescription>
              Contact email displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              {...register("email")}
              type="email"
              placeholder="info@elegantcloset.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Business Hours
            </CardTitle>
            <CardDescription>
              Set your operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hoursFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-28 font-medium text-gray-700">
                  {daysOfWeek[index]}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    {...register(`businessHours.${index}.closed`)}
                  />
                  <Label className="text-sm">Closed</Label>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="time"
                      {...register(`businessHours.${index}.openTime`)}
                      disabled={field.closed}
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      {...register(`businessHours.${index}.closeTime`)}
                      disabled={field.closed}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <div className="flex items-center space-x-2">
                <Facebook className="h-5 w-5 text-purple-600" />
                <Instagram className="h-5 w-5 text-pink-600" />
              </div>
              <span className="ml-2">Social Media</span>
            </CardTitle>
            <CardDescription>
              Links to your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="socialMedia.facebook" className="flex items-center">
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Label>
              <Input
                id="socialMedia.facebook"
                {...register("socialMedia.facebook")}
                type="url"
                placeholder="https://facebook.com/yourpage"
                className="mt-1"
              />
              {errors.socialMedia?.facebook && (
                <p className="text-sm text-red-500 mt-1">{errors.socialMedia.facebook.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="socialMedia.instagram" className="flex items-center">
                <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                Instagram
              </Label>
              <Input
                id="socialMedia.instagram"
                {...register("socialMedia.instagram")}
                type="url"
                placeholder="https://instagram.com/yourpage"
                className="mt-1"
              />
              {errors.socialMedia?.instagram && (
                <p className="text-sm text-red-500 mt-1">{errors.socialMedia.instagram.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Link href="/admin/content">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
