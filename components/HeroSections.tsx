"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { HeroSettings } from "@/admin-lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSectionsProps {
  heroSettings: HeroSettings | null;
  loading: boolean;
}

export function HeroCarousel({ heroSettings }: { heroSettings: HeroSettings }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: heroSettings.autoPlayInterval, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!heroSettings || heroSettings.carouselImages.length === 0) {
    return <HeroSkeleton />;
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {heroSettings.carouselImages.map((image, index) => (
            <div key={image.id} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative h-screen">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-white max-w-5xl mx-auto px-4 pointer-events-auto"
        >
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            New Arrivals
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {heroSettings.headline}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
            {heroSettings.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={heroSettings.ctaLink || "/shop"}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 font-medium px-8 py-6 text-md rounded-xl shadow-2xl">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {heroSettings.ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {heroSettings.secondaryCtaText && (
              <Link href={heroSettings.secondaryCtaLink || "#"}>
                <Button size="lg" variant="outline" className="border-2 border-white text-black backdrop-blur-lg hover:bg-white/10 px-8 py-6 text-md rounded-xl hover:text-white">
                  {heroSettings.secondaryCtaText}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {heroSettings.showArrows && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </section>
  );
}

export function HeroGrid({ heroSettings }: { heroSettings: HeroSettings }) {
  const gridImage1 = heroSettings.gridImages.find(img => img.position === 1);
  const gridImage2 = heroSettings.gridImages.find(img => img.position === 2);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-white overflow-hidden py-8 sm:py-4 lg:py-8">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              New Arrivals
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              {heroSettings.headline}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xl mx-auto lg:mx-0">
              {heroSettings.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={heroSettings.ctaLink || "/shop"}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-lg rounded-xl shadow-lg w-full sm:w-auto">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {heroSettings.ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {heroSettings.secondaryCtaText && (
                <Link href={heroSettings.secondaryCtaLink || "#"}>
                  <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-lg rounded-xl w-full sm:w-auto">
                    {heroSettings.secondaryCtaText}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[400px] sm:h-[500px] lg:h-[600px]">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl h-full">
                {gridImage1 ? (
                  <Image
                    src={gridImage1.url}
                    alt={gridImage1.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 25vw"
                    priority
                  />
                ) : (
                  <div className="bg-gradient-to-br from-purple-200 to-pink-200 h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-purple-400" />
                  </div>
                )}
              </div>

              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl h-full">
                {gridImage2 ? (
                  <Image
                    src={gridImage2.url}
                    alt={gridImage2.alt}
                    fill
                    loading="lazy"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 25vw"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-pink-200 to-purple-200 h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-pink-400" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50 py-12">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
          <div className="order-2 lg:order-1 space-y-6">
            <Skeleton className="h-10 w-40 mx-auto lg:mx-0" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-3/4 mx-auto lg:mx-0" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Skeleton className="h-14 w-full sm:w-40" />
              <Skeleton className="h-14 w-full sm:w-40" />
            </div>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 h-[400px] sm:h-[500px] lg:h-[600px]">
            <Skeleton className="rounded-2xl h-full" />
            <Skeleton className="rounded-2xl h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSections({ heroSettings, loading }: HeroSectionsProps) {
  if (loading) {
    return <HeroSkeleton />;
  }

  if (!heroSettings) {
    return <HeroSkeleton />;
  }

  if (heroSettings.activeVersion === "carousel" && heroSettings.carouselImages.length > 0) {
    return <HeroCarousel heroSettings={heroSettings} />;
  }

  if (heroSettings.activeVersion === "grid") {
    return <HeroGrid heroSettings={heroSettings} />;
  }

  return <HeroSkeleton />;
}
