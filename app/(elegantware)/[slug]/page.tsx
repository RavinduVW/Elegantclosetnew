"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/backend/config";
import { Category, Product } from "@/admin-lib/types";
import ProductCard from "@/components/ProductCard";
import PriceRangeFilter from "@/components/shop/PriceRangeFilter";
import ColorFilter from "@/components/shop/ColorFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { convertCurrency, CURRENCIES } from "@/lib/currency";
import Link from "next/link";
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Grid3x3, 
  LayoutGrid,
  ArrowUpDown,
  ArrowLeft,
  ShoppingBag
} from "lucide-react";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [currency, setCurrency] = useState<string>("LKR");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug, sortBy]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      console.log("🔍 Fetching category with slug:", slug);

      const categoriesRef = collection(db, "categories");
      const categoryQuery = query(
        categoriesRef,
        where("slug", "==", slug),
        where("status", "==", "active"),
        limit(1)
      );
      const categorySnapshot = await getDocs(categoryQuery);

      if (categorySnapshot.empty) {
        console.log("❌ Category not found");
        setCategory(null);
        setLoading(false);
        return;
      }

      const categoryData = {
        id: categorySnapshot.docs[0].id,
        ...categorySnapshot.docs[0].data(),
      } as Category;
      setCategory(categoryData);
      console.log("✅ Category found:", categoryData.name, "ID:", categoryData.id);

      const subCategoriesQuery = query(
        collection(db, "categories"),
        where("parentId", "==", categoryData.id),
        where("status", "==", "active"),
        orderBy("order", "asc")
      );
      const subCategoriesSnapshot = await getDocs(subCategoriesQuery);
      const subCategoriesData = subCategoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setSubCategories(subCategoriesData);
      console.log("📂 Sub-categories found:", subCategoriesData.length);

      const productsRef = collection(db, "products");
      let productsQuery = query(
        productsRef,
        where("categoryId", "==", categoryData.id || ""),
        where("status", "==", "published")
      );

      console.log("🔎 Fetching products for category ID:", categoryData.id);

      try {
        switch (sortBy) {
          case "newest":
            productsQuery = query(productsQuery, orderBy("createdAt", "desc"));
            break;
          case "price-asc":
            productsQuery = query(productsQuery, orderBy("price", "asc"));
            break;
          case "price-desc":
            productsQuery = query(productsQuery, orderBy("price", "desc"));
            break;
          case "name-asc":
            productsQuery = query(productsQuery, orderBy("name", "asc"));
            break;
          case "name-desc":
            productsQuery = query(productsQuery, orderBy("name", "desc"));
            break;
        }

        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        console.log("✅ Products fetched:", productsData.length);
        console.log("📦 Products:", productsData.map(p => ({ name: p.name, id: p.id, categoryId: p.categoryId })));
        setProducts(productsData);
      } catch (sortError) {
        console.warn("⚠️ Sort query failed, fetching without sorting:", sortError);
        const basicQuery = query(
          productsRef,
          where("categoryId", "==", categoryData.id),
          where("status", "==", "published")
        );
        const productsSnapshot = await getDocs(basicQuery);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        console.log("✅ Products fetched (no sort):", productsData.length);
        setProducts(productsData);
      }
    } catch (error) {
      console.error("❌ Error fetching category and products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedSubCategoryId && product.subCategoryId !== selectedSubCategoryId) return false;
      if (showSaleOnly && !product.salePrice) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      
      if (selectedColors.length > 0) {
        const hasColor = selectedColors.some(color => product.colors.includes(color));
        if (!hasColor) return false;
      }
      
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some(size => product.sizes.includes(size));
        if (!hasSize) return false;
      }
      
      return true;
    });
  }, [products, selectedSubCategoryId, showSaleOnly, priceRange, selectedColors, selectedSizes]);

  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    products.forEach(product => {
      product.colors.forEach(color => colorsSet.add(color));
    });
    return Array.from(colorsSet).sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    products.forEach(product => {
      product.sizes.forEach(size => sizesSet.add(size));
    });
    return Array.from(sizesSet);
  }, [products]);

  const clearAllFilters = () => {
    setSelectedSubCategoryId(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 50000]);
    setShowSaleOnly(false);
  };

  const activeFiltersCount = 
    (selectedSubCategoryId ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length +
    (showSaleOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      {subCategories.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
          <h3 className="text-sm font-semibold text-purple-900 mb-3">Sub-Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedSubCategoryId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedSubCategoryId === null
                  ? "bg-purple-600 text-white font-medium"
                  : "hover:bg-purple-100 text-gray-700"
              }`}
            >
              All Products
              <Badge variant="secondary" className="ml-2 text-xs">
                {products.length}
              </Badge>
            </button>
            {subCategories.map(subCat => {
              const count = products.filter(p => p.subCategoryId === subCat.id).length;
              return (
                <button
                  key={subCat.id}
                  onClick={() => setSelectedSubCategoryId(subCat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSubCategoryId === subCat.id
                      ? "bg-purple-600 text-white font-medium"
                      : "hover:bg-purple-100 text-gray-700"
                  }`}
                >
                  {subCat.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={subCategories.length > 0 ? "border-t-2 border-purple-100 pt-6" : ""}>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
          <PriceRangeFilter
            min={0}
            max={50000}
            value={priceRange}
            onChange={setPriceRange}
            currency={currency}
          />
        </div>
      </div>

      <div className="border-t-2 border-purple-100 pt-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
          <ColorFilter
            availableColors={availableColors}
            selectedColors={selectedColors}
            onChange={setSelectedColors}
          />
        </div>
      </div>

      <div className="border-t-2 border-purple-100 pt-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
          <SizeFilter
            availableSizes={availableSizes}
            selectedSizes={selectedSizes}
            onChange={setSelectedSizes}
          />
        </div>
      </div>

      <div className="border-t-2 border-purple-100 pt-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sale-only" className="text-sm font-semibold text-purple-900">
              Sale Items Only
            </Label>
            <Switch
              id="sale-only"
              checked={showSaleOnly}
              onCheckedChange={setShowSaleOnly}
            />
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full border-2 border-purple-300 text-purple-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 font-semibold shadow-sm transition-all duration-200"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/shop">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-purple-50/50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/shop" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Shop
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{category?.name || "Loading..."}</h1>
            {category?.description && (
              <p className="text-gray-600 max-w-2xl">{category.description}</p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg shadow-purple-100/50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-100">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : (
                <FiltersContent />
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
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

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={gridCols === 2 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setGridCols(2)}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={gridCols === 3 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setGridCols(3)}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={gridCols === 4 ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setGridCols(4)}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={`grid gap-6 ${
                gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <ShoppingBag className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  {products.length === 0 
                    ? "We're working on adding products to this category." 
                    : "Try adjusting your filters to see more results."}
                </p>
                {activeFiltersCount > 0 ? (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                ) : (
                  <Link href="/shop">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Browse All Products
                    </Button>
                  </Link>
                )}
              </motion.div>
            ) : (
              <motion.div
                layout
                className={`grid gap-6 ${
                  gridCols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  gridCols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      targetCurrency={currency}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
