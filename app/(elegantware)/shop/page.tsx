"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/backend/config";
import ProductCard from "@/components/ProductCard";
import PriceRangeFilter from "@/components/shop/PriceRangeFilter";
import ColorFilter from "@/components/shop/ColorFilter";
import SizeFilter from "@/components/shop/SizeFilter";
import CategoryFilter from "@/components/shop/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { convertCurrency, CURRENCIES } from "@/lib/currency";
import type { Product, Category } from "@/admin-lib/types";
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Grid3x3, 
  LayoutGrid,
  ArrowUpDown,
  Loader2
} from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(true);
  }, [selectedCategoryId, selectedSubCategoryId, sortBy]);

  const fetchCategories = async () => {
    try {
      const q = query(
        collection(db, "categories"),
        where("status", "==", "active"),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      let q = query(
        collection(db, "products"),
        where("status", "==", "published")
      );

      if (selectedCategoryId) {
        q = query(q, where("categoryId", "==", selectedCategoryId));
      }

      if (selectedSubCategoryId) {
        q = query(q, where("subCategoryId", "==", selectedSubCategoryId));
      }

      switch (sortBy) {
        case "newest":
          q = query(q, orderBy("createdAt", "desc"));
          break;
        case "price-asc":
          q = query(q, orderBy("price", "asc"));
          break;
        case "price-desc":
          q = query(q, orderBy("price", "desc"));
          break;
        case "name-asc":
          q = query(q, orderBy("name", "asc"));
          break;
        case "name-desc":
          q = query(q, orderBy("name", "desc"));
          break;
      }

      q = query(q, limit(PRODUCTS_PER_PAGE));

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      if (reset) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
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
  }, [products, showSaleOnly, priceRange, selectedColors, selectedSizes]);

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

  const handleCategoryChange = (categoryId: string | null, subCategoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(subCategoryId);
    setProducts([]);
  };

  const clearAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 50000]);
    setShowSaleOnly(false);
  };

  const activeFiltersCount = 
    (selectedCategoryId ? 1 : 0) +
    (selectedSubCategoryId ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length +
    (showSaleOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <div className="border-t-2 border-purple-100 pt-6">
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

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-purple-50/50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
            <p className="text-gray-600">Discover our elegant batik collection</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg shadow-purple-100/50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-100">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-black" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-purple-700 text-white border-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <FiltersContent />
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
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
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
                  <Filter className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
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

                {hasMore && !loading && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={() => fetchProducts(false)}
                      disabled={loadingMore}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Products'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
