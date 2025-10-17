"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/backend/config";
import type { Product, Category } from "@/admin-lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  FolderTree,
  Eye,
  Star,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Award
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import NextImage from "next/image";
import Link from "next/link";

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  activeCategories: number;
  featuredProducts: number;
  totalImages: number;
  newProducts: number;
  trendingProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    archivedProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    activeCategories: 0,
    featuredProducts: 0,
    totalImages: 0,
    newProducts: 0,
    trendingProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [topCategories, setTopCategories] = useState<Array<{ category: Category; productCount: number }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const productsRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsRef);
      
      let publishedCount = 0;
      let draftCount = 0;
      let archivedCount = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      let featuredCount = 0;
      let imageCount = 0;
      let newCount = 0;
      let trendingCount = 0;
      const allProducts: Product[] = [];
      const categoryMap = new Map<string, number>();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      productsSnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as Product;
        allProducts.push(product);

        if (product.status === "published") publishedCount++;
        if (product.status === "draft") draftCount++;
        if (product.status === "archived") archivedCount++;
        if (product.featured) featuredCount++;
        if (product.specialTag === "new") newCount++;
        if (product.specialTag === "trending") trendingCount++;

        if (product.inStock && product.stockQuantity !== undefined) {
          if (product.stockQuantity === 0) {
            outOfStockCount++;
          } else if (product.stockQuantity < (product.lowStockThreshold || 10)) {
            lowStockCount++;
          }
        }

        if (product.images) {
          imageCount += product.images.length;
        }

        if (product.categoryId) {
          categoryMap.set(product.categoryId, (categoryMap.get(product.categoryId) || 0) + 1);
        }
      });

      const recentProductsList = allProducts
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        })
        .slice(0, 5);

      const topProductsList = allProducts
        .filter((p) => p.status === "published")
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);

      setRecentProducts(recentProductsList);
      setTopProducts(topProductsList);

      let ordersCount = 0;
      let revenue = 0;
      try {
        const ordersRef = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersRef);
        ordersCount = ordersSnapshot.size;
        
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.paymentStatus === "paid") {
            revenue += data.total || 0;
          }
        });
      } catch (error) {
        console.log("Orders collection not found");
      }

      let categoriesCount = 0;
      let activeCategoriesCount = 0;
      const categoriesData: Category[] = [];
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        categoriesCount = categoriesSnapshot.size;
        
        categoriesSnapshot.forEach((doc) => {
          const category = { id: doc.id, ...doc.data() } as Category;
          categoriesData.push(category);
          if (category.status === "active") {
            activeCategoriesCount++;
          }
        });

        const topCategoriesList = categoriesData
          .filter((cat) => !cat.parentId)
          .map((cat) => ({
            category: cat,
            productCount: categoryMap.get(cat.id) || 0,
          }))
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 5);

        setTopCategories(topCategoriesList);
      } catch (error) {
        console.log("Categories collection not found");
      }

      setStats({
        totalProducts: productsSnapshot.size,
        publishedProducts: publishedCount,
        draftProducts: draftCount,
        archivedProducts: archivedCount,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        totalOrders: ordersCount,
        totalRevenue: revenue,
        totalCategories: categoriesCount,
        activeCategories: activeCategoriesCount,
        featuredProducts: featuredCount,
        totalImages: imageCount,
        newProducts: newCount,
        trendingProducts: trendingCount,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    color = "purple"
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: any; 
    trend?: string;
    color?: "purple" | "blue" | "green" | "yellow" | "red" | "orange";
  }) => {
    const colorClasses = {
      purple: "bg-purple-100 text-purple-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      orange: "bg-orange-100 text-orange-600",
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const healthScore = Math.round(
    ((stats.publishedProducts / Math.max(stats.totalProducts, 1)) * 30) +
    ((stats.activeCategories / Math.max(stats.totalCategories, 1)) * 20) +
    ((stats.totalProducts > 0 ? 1 : 0) * 30) +
    ((stats.featuredProducts > 0 ? 1 : 0) * 10) +
    ((stats.lowStockProducts === 0 ? 1 : 0) * 10)
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        
      </div>

      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">eStore Performance</h3>
                <p className="text-sm text-muted-foreground">Overall performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{healthScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention"}
                </p>
              </div>
              <div className="w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#9333EA"
                    strokeWidth="3"
                    strokeDasharray={`${healthScore}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          description={`${stats.publishedProducts} published`}
          icon={Package}
          trend={stats.totalProducts > 0 ? `${stats.draftProducts} drafts` : undefined}
          color="purple"
        />
        
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          description={`${stats.activeCategories} active`}
          icon={FolderTree}
          color="blue"
        />
        
        <StatCard
          title="Featured Items"
          value={stats.featuredProducts}
          description="Highlighted products"
          icon={Star}
          color="yellow"
        />
        
        <StatCard
          title="Total Images"
          value={stats.totalImages}
          description="Hosted on ImageBB"
          icon={ImageIcon}
          color="green"
        />

        <StatCard
          title="Published"
          value={stats.publishedProducts}
          description={`${Math.round((stats.publishedProducts / Math.max(stats.totalProducts, 1)) * 100)}% of total`}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Drafts"
          value={stats.draftProducts}
          description="Pending publish"
          icon={Clock}
          color="orange"
        />

        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          description="Below threshold"
          icon={AlertTriangle}
          color="red"
        />

        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          description="Need restock"
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Distribution</CardTitle>
                <CardDescription>Status breakdown</CardDescription>
              </div>
              <PieChart className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Published</span>
                  </div>
                  <span className="font-medium">{stats.publishedProducts}</span>
                </div>
                <Progress 
                  value={(stats.publishedProducts / Math.max(stats.totalProducts, 1)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Drafts</span>
                  </div>
                  <span className="font-medium">{stats.draftProducts}</span>
                </div>
                <Progress 
                  value={(stats.draftProducts / Math.max(stats.totalProducts, 1)) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span>Archived</span>
                  </div>
                  <span className="font-medium">{stats.archivedProducts}</span>
                </div>
                <Progress 
                  value={(stats.archivedProducts / Math.max(stats.totalProducts, 1)) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">New Products</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.newProducts}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Trending</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <p className="text-2xl font-bold">{stats.trendingProducts}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Most products per category</CardDescription>
              </div>
              <Award className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((item, index) => (
                  <div key={item.category.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.productCount} product{item.productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.productCount}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderTree className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No categories yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Latest additions to catalog</CardDescription>
              </div>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {product.featuredImage && (
                        <NextImage
                          src={product.featuredImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.price, "LKR")}
                      </p>
                    </div>
                    <Badge variant={product.status === "published" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No products yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Viewed Products</CardTitle>
                <CardDescription>Most popular items</CardDescription>
              </div>
              <Eye className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 && topProducts.some(p => (p.viewCount || 0) > 0) ? (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <Link 
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {product.featuredImage && (
                        <NextImage
                          src={product.featuredImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{product.viewCount || 0} views</span>
                      </div>
                    </div>
                    {product.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No view data yet</p>
                <p className="text-xs mt-1">Views are tracked when customers visit product pages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/products/create">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Add Product</div>
                    <div className="text-xs text-muted-foreground mt-1">Create new listing</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/categories">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderTree className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Categories</div>
                    <div className="text-xs text-muted-foreground mt-1">Organize catalog</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/content">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Content</div>
                    <div className="text-xs text-muted-foreground mt-1">Edit pages</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/media">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Media</div>
                    <div className="text-xs text-muted-foreground mt-1">Manage images</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Low Stock Warning</span>
                </div>
                <Link href="/admin/products?filter=low-stock">
                  <Badge variant="outline" className="border-orange-300">
                    {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''}
                  </Badge>
                </Link>
              </div>
            )}
            {stats.outOfStockProducts > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
                <Link href="/admin/products?filter=out-of-stock">
                  <Badge variant="outline" className="border-red-300">
                    {stats.outOfStockProducts} product{stats.outOfStockProducts !== 1 ? 's' : ''}
                  </Badge>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
