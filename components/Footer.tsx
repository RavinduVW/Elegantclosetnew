"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  ShoppingBag,
  BookOpen,
  MessageCircle,
  Info,
  ShieldCheck,
  FileText,
  Package,
  RotateCcw,
} from "lucide-react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/config";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ContactSettings } from "@/admin-lib/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  showInMenu: boolean;
  status: string;
}

const usefulLinks = [
  { title: "Shop", href: "/shop", icon: ShoppingBag },
  { title: "Blog", href: "/blog", icon: BookOpen },
  { title: "About Us", href: "/about", icon: Info },
  { title: "Contact Us", href: "/contact", icon: MessageCircle },
];

const quickMenuLinks = [
  { title: "Shipping Policy", href: "/shipping-policy", icon: Package },
  { title: "Returns & Refunds Policy", href: "/returns-refunds", icon: RotateCcw },
  { title: "Terms & Conditions", href: "/terms-conditions", icon: FileText },
  { title: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
];

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Instagram", href: "#", icon: Instagram },
];

const FooterSection = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
      {title}
    </h4>
    {children}
  </div>
));

FooterSection.displayName = "FooterSection";

const FooterLink = memo(({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm block"
  >
    {children}
  </Link>
));

FooterLink.displayName = "FooterLink";

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactSettings | null>(null);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      query(
        collection(db, "categories"),
        where("showInMenu", "==", true),
        where("status", "==", "active")
      ),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData);
      }
    );

    const loadContactInfo = async () => {
      try {
        const docRef = doc(db, "contact_settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContactInfo(docSnap.data() as ContactSettings);
        }
      } catch (error) {
        console.error("Error loading contact info:", error);
      }
    };

    loadContactInfo();

    return () => {
      unsubscribeCategories();
    };
  }, []);

  return (
    <footer className="relative w-full overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

      <div className="relative bg-gradient-to-b from-white via-purple-50/30 to-purple-100/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-purple-50/40 to-purple-100/60 backdrop-blur-md"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-3">
                <Image
                  src="/assets/brandlogo.png"
                  alt="Elegant Closet"
                  width={160}
                  height={50}
                  className="object-contain"
                  priority
                />
                <p className="text-base text-gray-700 leading-relaxed max-w-sm">
                  Discover the artistry of batik at Elegant Closet, Where Fashion Meets Tradition!
                </p>
              </div>

              {contactInfo && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-start space-x-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p>{contactInfo.addressLine1}</p>
                      {contactInfo.addressLine2 && <p>{contactInfo.addressLine2}</p>}
                      {contactInfo.addressLine3 && <p>{contactInfo.addressLine3}</p>}
                    </div>
                  </div>
                  {contactInfo.phoneNumbers.slice(0, 2).map((phone) => (
                    <div key={phone.id} className="flex items-center space-x-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">
                        {phone.label}: {phone.number}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="truncate">{contactInfo.email}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <FooterSection title="Useful Links">
                <ul className="space-y-2">
                  {usefulLinks.map((link, index) => (
                    <li key={index}>
                      <FooterLink href={link.href}>
                        {link.title}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </FooterSection>

              <FooterSection title="Categories">
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <FooterLink href={`/shop?category=${category.slug}`}>
                        {category.name}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </FooterSection>

              <FooterSection title="Quick Menu">
                <ul className="space-y-2">
                  {quickMenuLinks.map((link, index) => (
                    <li key={index}>
                      <FooterLink href={link.href}>
                        {link.title}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </FooterSection>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <Separator className="bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Follow us:</span>
                {socialLinks.map((social, index) => {
                  const href = contactInfo?.socialMedia?.[social.name.toLowerCase() as keyof typeof contactInfo.socialMedia] || social.href;
                  return (
                    <Link
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-purple-50 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-purple-100"
                    >
                      <social.icon className="w-4 h-4 text-gray-600 hover:text-purple-600" />
                    </Link>
                  );
                })}
              </div>

              <Badge variant="outline" className="border-purple-200 text-purple-700">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Trusted Fashion Brand
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
              <p className="text-center sm:text-left">
                © {currentYear} Elegant Closet. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {quickMenuLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="hover:text-purple-600 transition-colors whitespace-nowrap"
                  >
                    {link.title.replace(" Policy", "").replace("Returns & Refunds", "Returns")}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
