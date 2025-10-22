"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/backend/config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrency, convertCurrency, CURRENCIES } from "@/lib/currency";
import { getColorHex } from "@/lib/colors";
import type { Product, Category, ContactSettings } from "@/admin-lib/types";
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Clock, 
  Share2,
  Heart,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Loader2
} from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const specialTagConfig = {
  new: { label: "New Arrival", icon: Sparkles, gradient: "from-blue-500 to-cyan-500" },
  trending: { label: "Trending Now", icon: TrendingUp, gradient: "from-pink-500 to-purple-500" },
  bestseller: { label: "Bestseller", icon: Award, gradient: "from-yellow-500 to-orange-500" },
  limited: { label: "Limited Edition", icon: Clock, gradient: "from-red-500 to-pink-500" },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currency, setCurrency] = useState<string>("LKR");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [isOrderingViaWhatsApp, setIsOrderingViaWhatsApp] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    loadWhatsAppNumber();
  }, []);

  const loadWhatsAppNumber = async () => {
    try {
      const docRef = doc(db, "contact_settings", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const contactInfo = docSnap.data() as ContactSettings;
        if (contactInfo.phoneNumbers && contactInfo.phoneNumbers.length > 0) {
          const primaryPhone = contactInfo.phoneNumbers[0].number;
          let cleanNumber = primaryPhone.replace(/[^0-9+]/g, "");
          
          if (cleanNumber.startsWith("+")) {
            cleanNumber = cleanNumber.substring(1);
          }
          
          if (!cleanNumber.startsWith("94") && cleanNumber.startsWith("0")) {
            cleanNumber = "94" + cleanNumber.substring(1);
          }
          
          setWhatsappNumber(cleanNumber);
        }
      }
    } catch (error) {
      console.error("Error loading WhatsApp number:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("slug", "==", slug),
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const productData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
        
        if (!productData.colors || !Array.isArray(productData.colors)) {
          productData.colors = [];
        }
        if (!productData.sizes || !Array.isArray(productData.sizes)) {
          productData.sizes = [];
        }
        
        setProduct(productData);
        setSelectedColor(productData.colors[0] || "");
        setSelectedSize(productData.sizes[0] || "");

        await updateDoc(doc(db, "products", snapshot.docs[0].id), {
          viewCount: increment(1)
        });

        if (productData.categoryId) {
          const categoryDoc = await getDoc(doc(db, "categories", productData.categoryId));
          if (categoryDoc.exists()) {
            setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
          }
        }
      } else {
        router.push("/shop");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? (safeImages.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === (safeImages.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleOrderViaWhatsApp = () => {
    if (!product) return;

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color before ordering");
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before ordering");
      return;
    }

    if (!whatsappNumber) {
      alert("WhatsApp contact is not available at the moment. Please try again later.");
      return;
    }

    setIsOrderingViaWhatsApp(true);

    try {
      const hasDiscount = product.salePrice && product.salePrice < product.price;
      const finalPrice = hasDiscount ? product.salePrice! : product.price;
      const convertedPrice = currency !== "LKR" 
        ? convertCurrency(finalPrice, "LKR", currency as any)
        : finalPrice;

      const discountText = product.discountPercentage 
        ? `${product.discountPercentage}% OFF` 
        : `${Math.round(((product.price - product.salePrice!) / product.price) * 100)}% OFF`;

      const colorLine = selectedColor ? `🎨 *Selected Color:* ${selectedColor}` : '';
      const sizeLine = selectedSize ? `📏 *Selected Size:* ${selectedSize}` : '';
      const materialLine = product.material ? `🧵 *Material:* ${product.material}` : '';

      const message = `Hello! I would like to order the following product:

📦 *Product Details*
━━━━━━━━━━━━━━━
🏷️ *Name:* ${product.name || 'Product'}
🔖 *SKU:* ${product.sku || 'N/A'}
💰 *Price:* ${formatCurrency(convertedPrice, currency as any)}
${hasDiscount ? `~~${formatCurrency(currency !== "LKR" ? convertCurrency(product.price, "LKR", currency as any) : product.price, currency as any)}~~ (${discountText})` : ''}
${colorLine}
${sizeLine}
${materialLine}

🔗 *Product Link:* ${window.location.href}

Please confirm availability and provide payment details. Thank you!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error creating WhatsApp message:", error);
      alert("Failed to create WhatsApp message. Please try again.");
    } finally {
      setIsOrderingViaWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const convertedPrice = currency !== "LKR" && displayPrice
    ? convertCurrency(displayPrice, "LKR", currency as any)
    : displayPrice;
  
  const originalConvertedPrice = currency !== "LKR" && product.price
    ? convertCurrency(product.price, "LKR", currency as any)
    : product.price;

  const specialTag = product.specialTag ? specialTagConfig[product.specialTag] : null;

  const safeImages = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : product.featuredImage 
      ? [{ id: 'featured', url: product.featuredImage, alt: product.name || 'Product', order: 0 }] 
      : [];
  
  const currentImage = safeImages[selectedImageIndex]?.url || product.featuredImage || '/placeholder.jpg';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/shop?category=${category.slug}`}>
                      {category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="relative aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden group">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 50vw, 25vw"
              />

              {product.isSoldOut && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <p className="text-white font-bold text-2xl mb-2">Sold Out</p>
                    <p className="text-white/80">Currently Unavailable</p>
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {hasDiscount && !product.isSoldOut && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg text-base px-3 py-1">
                    {product.discountPercentage 
                      ? `-${product.discountPercentage}%`
                      : `-${Math.round(((product.price - product.salePrice!) / product.price) * 100)}%`
                    }
                  </Badge>
                )}
                
                {specialTag && !product.isSoldOut && (
                  <Badge className={`bg-gradient-to-r ${specialTag.gradient} text-white border-0 shadow-lg flex items-center gap-1.5 text-base px-3 py-1`}>
                    <specialTag.icon className="w-4 h-4" />
                    {specialTag.label}
                  </Badge>
                )}
              </div>

              {safeImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {safeImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {safeImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              {product.featured && (
                <Badge variant="outline" className="mb-3 border-purple-200">
                  Featured Product
                </Badge>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name || "Product"}</h1>
              {product.brand ? (
                <p className="text-lg text-gray-600">by {product.brand}</p>
              ) : null}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {product.price ? formatCurrency(convertedPrice, currency as any) : "Price not available"}
              </span>
              {hasDiscount && product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(originalConvertedPrice, currency as any)}
                </span>
              )}
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 ml-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CURRENCIES).map(curr => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product.introduction && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {product.introduction}
              </p>
            )}

            {product.shortDescription && (
              <p className="text-gray-600">
                {product.shortDescription}
              </p>
            )}

            <Separator />

            <div className="space-y-4">
              {product.colors && product.colors.length > 0 ? (
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Color: {selectedColor || "Please select"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const colorHex = getColorHex(color);
                      
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: colorHex }}
                          />
                          <span className="text-sm font-medium">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Color:</span> Contact us for available colors
                  </p>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 ? (
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Size: {selectedSize || "Please select"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-5 py-2.5 rounded-lg border font-medium transition-all ${
                            isSelected
                              ? "border-purple-500 bg-purple-500 text-white"
                              : "border-gray-300 hover:border-purple-400"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Size:</span> Contact us for available sizes
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
                <Button
                onClick={handleOrderViaWhatsApp}
                disabled={product.isSoldOut || !whatsappNumber || isOrderingViaWhatsApp}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isOrderingViaWhatsApp ? (
                  <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening WhatsApp...
                  </>
                ) : product.isSoldOut ? (
                  "Product Sold Out"
                ) : !whatsappNumber ? (
                  "WhatsApp Not Available"
                ) : (
                  <>
                  <IconBrandWhatsapp className="w-6 h-6 mr-2" stroke={2} />
                  Order via WhatsApp
                  </>
                )}
                </Button>
              
              <p className="text-xs text-center text-gray-500">
                {!product.isSoldOut && whatsappNumber ? (
                  <>
                    {(product.colors && product.colors.length > 0 && !selectedColor) || 
                     (product.sizes && product.sizes.length > 0 && !selectedSize) ? (
                      <span className="text-amber-600 font-medium">
                        ⚠️ Please select {!selectedColor && product.colors?.length > 0 ? 'color' : ''}{(!selectedColor && product.colors?.length > 0 && !selectedSize && product.sizes?.length > 0) ? ' and ' : ''}{!selectedSize && product.sizes?.length > 0 ? 'size' : ''} before ordering
                      </span>
                    ) : (
                      "Click to send order details via WhatsApp"
                    )}
                  </>
                ) : null}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-5 h-5 text-purple-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Fast Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-5 h-5 text-purple-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Authentic</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Package className="w-5 h-5 text-purple-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Easy Returns</p>
              </div>
            </div>

            {product.material && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Material:</span> {product.material}
                </p>
              </div>
            )}

            {product.sku && (
              <p className="text-sm text-gray-500 font-mono">SKU: {product.sku}</p>
            )}
          </motion.div>
        </div>

        {product.markdownDescription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
            <div className="prose prose-purple max-w-none bg-white rounded-xl border p-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.markdownDescription}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
