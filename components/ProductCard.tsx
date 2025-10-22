"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import { getColorHex } from "@/lib/colors";
import type { Product } from "@/admin-lib/types";
import { Sparkles, TrendingUp, Award, Clock } from "lucide-react";

interface ProductCardProps {
  product: Product;
  targetCurrency?: string;
  className?: string;
}

const specialTagConfig = {
  new: { label: "New", icon: Sparkles, gradient: "from-blue-500 to-cyan-500" },
  trending: { label: "Trending", icon: TrendingUp, gradient: "from-pink-500 to-purple-500" },
  bestseller: { label: "Bestseller", icon: Award, gradient: "from-yellow-500 to-orange-500" },
  limited: { label: "Limited", icon: Clock, gradient: "from-red-500 to-pink-500" },
};

export default function ProductCard({ product, targetCurrency = "LKR", className = "" }: ProductCardProps) {
  if (!product) return null;
  
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const convertedPrice = targetCurrency !== "LKR" && displayPrice
    ? convertCurrency(displayPrice, "LKR", targetCurrency as any)
    : displayPrice;
  
  const originalConvertedPrice = targetCurrency !== "LKR" && product.price
    ? convertCurrency(product.price, "LKR", targetCurrency as any)
    : product.price;

  const specialTag = product.specialTag ? specialTagConfig[product.specialTag] : null;
  
  const productImage = product.featuredImage || 
    (product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images[0]?.url : null) || 
    "/placeholder.jpg";
  
  const productName = product.name || "Product";
  const productSlug = product.slug || product.id || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group relative ${className}`}
    >
      <Link href={`/shop/${productSlug}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-none hover:shadow-xl transition-all duration-300 border-none">
          <div className="relative aspect-[3/4] overflow-hidden bg-none">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 brightness-90 rounded-xl"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
            
            {product.isSoldOut && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <p className="text-white font-bold text-xl mb-1">Sold Out</p>
                  <p className="text-white/80 text-sm">Currently Unavailable</p>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              {hasDiscount && !product.isSoldOut && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                  {product.discountPercentage 
                    ? `-${product.discountPercentage}%`
                    : `-${Math.round(((product.price - product.salePrice!) / product.price) * 100)}%`
                  }
                </Badge>
              )}
              
              {specialTag && !product.isSoldOut && (
                <Badge className={`bg-gradient-to-r ${specialTag.gradient} text-white border-0 shadow-lg flex items-center gap-1`}>
                  <specialTag.icon className="w-3 h-3" />
                  {specialTag.label}
                </Badge>
              )}
            </div>

            {product.featured && !product.isSoldOut && (
              <div className="absolute top-3 right-3 z-20">
                <Badge variant="outline" className="bg-purple-100/90 backdrop-blur-sm border-purple-200">
                  Featured
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4 space-y-1">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {productName}
              </h3>
              
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-bold text-gray-900">
                {displayPrice ? formatCurrency(convertedPrice, targetCurrency as any) : "Price not available"}
              </span>
              {hasDiscount && displayPrice && (
                <span className="text-sm text-purple-800 line-through">
                  {formatCurrency(originalConvertedPrice, targetCurrency as any)}
                </span>
              )}
            </div>

            
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
