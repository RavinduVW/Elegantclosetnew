"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/backend/config";
import { HEADER_CONFIG, MAIN_NAVIGATION } from "./header-config";
import { useScrollPosition, useBodyScrollLock } from "./hooks/useHeader";
import type { Category } from "./header-types";

const Header = () => {
  const isScrolled = useScrollPosition(HEADER_CONFIG.scrollThreshold);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<"menu" | "categories">(
    "menu"
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const q = query(
        categoriesRef,
        where("status", "==", "active"),
        where("showInMenu", "==", true),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.menuLabel || data.name,
          href: `/${data.slug}`,
        };
      });
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useBodyScrollLock(isMobileMenuOpen);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          position: isScrolled ? "fixed" : "relative",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: isScrolled ? "0.75rem" : "1.5rem",
          paddingBottom: isScrolled ? "0.75rem" : "0.75rem",
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 1)",
          boxShadow: isScrolled
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
            : "none",
        }}
        transition={{
          duration: HEADER_CONFIG.transitionDuration,
          ease: HEADER_CONFIG.transitionEasing,
        }}
        className="z-50 w-full backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <motion.div
                animate={{
                  width: isScrolled
                    ? HEADER_CONFIG.logo.compact.width
                    : HEADER_CONFIG.logo.expanded.width,
                  height: isScrolled
                    ? HEADER_CONFIG.logo.compact.height
                    : HEADER_CONFIG.logo.expanded.height,
                }}
                transition={{
                  duration: HEADER_CONFIG.transitionDuration,
                  ease: HEADER_CONFIG.transitionEasing,
                }}
                className="relative"
              >
                <Image
                  src="/assets/brandlogo.png"
                  alt="Elegant Closet"
                  fill
                  className="object-contain scale-175"
                  priority
                  sizes="(max-width: 768px) 175px, 225px"
                />
              </motion.div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {MAIN_NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors duration-200 hover:text-gray-900 ${
                    pathname === item.href ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeMainNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  0
                </span>
              </motion.button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="hidden lg:block border-t border-gray-200 mt-4 pt-4">
            <nav className="flex items-center justify-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`relative text-sm font-medium transition-colors duration-200 hover:text-gray-900 ${
                    pathname === category.href
                      ? "text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {category.name}
                  {pathname === category.href && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: HEADER_CONFIG.mobile.springConfig.damping,
                stiffness: HEADER_CONFIG.mobile.springConfig.stiffness,
              }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-full bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex flex-row items-center justify-between mb-6">
                  <Image
                    src="/assets/brandlogo.png"
                    alt="Elegant Closet"
                    width={180}
                    height={40}
                    className="object-contain w-auto h-20"
                    priority
                  />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setMobileActiveTab("menu")}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                      mobileActiveTab === "menu"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Menu
                    {mobileActiveTab === "menu" && (
                      <motion.div
                        layoutId="mobileTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setMobileActiveTab("categories")}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                      mobileActiveTab === "categories"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Categories
                    {mobileActiveTab === "categories" && (
                      <motion.div
                        layoutId="mobileTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {mobileActiveTab === "menu" ? (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {MAIN_NAVIGATION.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}

                      <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
                        <button className="flex items-center w-full text-left text-gray-600 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <Search className="w-5 h-5 mr-3" />
                          <span>Search</span>
                        </button>

                        <button className="flex items-center w-full text-left text-gray-600 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <User className="w-5 h-5 mr-3" />
                          <span>Account</span>
                        </button>

                        <button className="flex items-center justify-between w-full text-left text-gray-600 hover:text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            <span>Shopping Bag</span>
                          </div>
                          <span className="bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                            0
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                            pathname === category.href
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isScrolled && <div className="h-[72px]" />}
    </>
  );
};

export default Header;
