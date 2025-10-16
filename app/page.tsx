"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/config";
import { Product, HeroSettings } from "@/admin-lib/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroSections } from "@/components/HeroSections";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  ArrowRight, 
  Zap,
  Star,
  Heart,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSaleIndex, setCurrentSaleIndex] = useState(0);
  const [currency, setCurrency] = useState("LKR");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  const fetchHeroSettings = async () => {
    try {
      setHeroLoading(true);
      const heroDoc = await getDoc(doc(db, "hero_settings", "global"));
      if (heroDoc.exists()) {
        setHeroSettings(heroDoc.data() as HeroSettings);
      }
    } catch (error) {
      console.error("Error fetching hero settings:", error);
    } finally {
      setHeroLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSettings();
    fetchHomePageData();
  }, []);

  useEffect(() => {
    if (saleProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSaleIndex((prev) => (prev + 1) % saleProducts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [saleProducts]);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);

      const productsQuery = query(
        collection(db, "products"),
        where("status", "==", "published"),
        where("inStock", "==", true),
        limit(50)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const allProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 8));

      const productsWithSale = allProducts.filter(p => p.salePrice && p.salePrice < p.price);
      setSaleProducts(productsWithSale.slice(0, 6));

      const imagesForGallery: string[] = [];
      allProducts.forEach(product => {
        if (product.featuredImage) imagesForGallery.push(product.featuredImage);
        if (product.images && product.images.length > 0) {
          product.images.slice(0, 2).forEach(img => {
            if (img.url) imagesForGallery.push(img.url);
          });
        }
      });
      const uniqueImages = [...new Set(imagesForGallery)];
      setGalleryImages(uniqueImages.sort(() => 0.5 - Math.random()).slice(0, 12));

    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSale = () => {
    setCurrentSaleIndex((prev) => (prev + 1) % saleProducts.length);
  };

  const prevSale = () => {
    setCurrentSaleIndex((prev) => (prev - 1 + saleProducts.length) % saleProducts.length);
  };

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <HeroSections heroSettings={heroSettings} loading={heroLoading} />

      <section className="py-20 bg-gradient-to-b from-white/20 to-purple-50/30 relative">
        <div className="absolute top-0 left-0 w-full h-1">
          <div className="w-full h-full bg-gradient-to-r from-white/0 via-purple-600 to-white/0 rounded-t-xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
          >
        <Badge className="mb-4 bg-purple-900 text-white border-0 px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          Featured Products
        </Badge>
        <h2 className="text-4xl sm:text-5xl font-bold bg-purple-900 bg-clip-text text-transparent mb-4">
          Discover Our Collection
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Handpicked items just for you
        </p>
          </motion.div>

          {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
          ) : randomProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {randomProducts.map((product, index) => (
            <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
            >
          <ProductCard product={product} targetCurrency={currency} />
            </motion.div>
          ))}
        </div>
          ) : (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-purple-300 mb-4" />
          <p className="text-gray-600">No products available at the moment</p>
        </div>
          )}

          <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-12"
          >
        <Link href="/shop">
          <Button size="lg" className="bg-purple-900 text-white px-8 py-6 rounded-xl font-semibold shadow-lg">
            View All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
          </motion.div>
        </div>
      </section>

      {saleProducts.length > 0 && (
        <section className="py-20 bg-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Tag className="w-4 h-4 mr-2" />
                Limited Time Offers
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Hot Deals & Sales
              </h2>
              <p className="text-purple-100 text-lg">
                Don't miss out on these amazing discounts
              </p>
            </motion.div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSaleIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-2 gap-8 items-center bg-white/10 backdrop-blur-lg p-8 rounded-2xl border-2 border-white/20"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-white/20">
                      {saleProducts[currentSaleIndex]?.featuredImage ? (
                        <Image
                          src={saleProducts[currentSaleIndex].featuredImage}
                          alt={saleProducts[currentSaleIndex].name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="w-20 h-20 text-white/30" />
                        </div>
                      )}
                      {saleProducts[currentSaleIndex]?.discountPercentage && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 text-lg px-4 py-2">
                          {Math.round(saleProducts[currentSaleIndex].discountPercentage!)}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="text-white space-y-6">
                      <div>
                        <Badge className="mb-3 bg-yellow-400 text-yellow-900 border-0">
                          <Zap className="w-4 h-4 mr-1" />
                          Flash Sale
                        </Badge>
                        <h3 className="text-3xl font-bold mb-2">
                          {saleProducts[currentSaleIndex]?.name}
                        </h3>
                        <p className="text-purple-100 line-clamp-2">
                          {saleProducts[currentSaleIndex]?.shortDescription || saleProducts[currentSaleIndex]?.description}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold">
                          LKR {saleProducts[currentSaleIndex]?.salePrice?.toFixed(2)}
                        </span>
                        <span className="text-2xl text-purple-200 line-through">
                          LKR {saleProducts[currentSaleIndex]?.price?.toFixed(2)}
                        </span>
                      </div>

                      <Link href={`/shop/${saleProducts[currentSaleIndex]?.slug}`}>
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-6 rounded-xl">
                          Shop Now
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={prevSale}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
                aria-label="Previous sale"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSale}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
                aria-label="Next sale"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {saleProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSaleIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSaleIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Go to sale ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-purple-900 text-white border-0 px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                Style Gallery
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold bg-purple-900 bg-clip-text text-transparent mb-4">
                Fashion Inspiration
              </h2>
              <p className="text-gray-600 text-lg">
                Browse our latest style moments
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((imageUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-lg"
                >
                  <Image
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-b from-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast Delivery",
                description: "Quick and reliable shipping across Sri Lanka",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Star,
                title: "Premium Quality",
                description: "Carefully curated high-quality products",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Heart,
                title: "Customer Love",
                description: "Happy customers and counting",
                gradient: "from-pink-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-300" />
                <div className="relative bg-white rounded-2xl p-8 border-2 border-purple-100 group-hover:border-purple-300 transition-colors duration-300">
                  <div className={`w-16 h-16 bg-purple-900 rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-purple-900" />
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-purple-900">
              Ready to Elevate Your Style?
            </h2>
            <p className="text-lg text-purple-800 mb-10">
              Join hundreds of satisfied customers and discover your perfect look today
            </p>
            
          </motion.div>
        </div>
      </section>
    </main>
  );
}
