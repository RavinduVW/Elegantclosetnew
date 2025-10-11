"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/backend/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  FolderTree 
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  activeCategories: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    activeCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Fetch products
      const productsRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsRef);
      
      let publishedCount = 0;
      let draftCount = 0;
      let lowStockCount = 0;

      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "published") publishedCount++;
        if (data.status === "draft") draftCount++;
        if (data.inStock && data.stockQuantity && data.stockQuantity < (data.lowStockThreshold || 10)) {
          lowStockCount++;
        }
      });

      // Fetch orders (if collection exists)
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
        // Orders collection might not exist yet
        console.log("Orders collection not found");
      }

      // Fetch categories
      let categoriesCount = 0;
      let activeCategoriesCount = 0;
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        categoriesCount = categoriesSnapshot.size;
        
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "active") {
            activeCategoriesCount++;
          }
        });
      } catch (error) {
        console.log("Categories collection not found");
      }

      setStats({
        totalProducts: productsSnapshot.size,
        publishedProducts: publishedCount,
        draftProducts: draftCount,
        lowStockProducts: lowStockCount,
        totalOrders: ordersCount,
        totalRevenue: revenue,
        totalCategories: categoriesCount,
        activeCategories: activeCategoriesCount,
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
    trend 
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: any; 
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Elegant Closet Admin Panel
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          description={`${stats.publishedProducts} published, ${stats.draftProducts} drafts`}
          icon={Package}
        />
        
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          description={`${stats.activeCategories} active categories`}
          icon={FolderTree}
        />
        
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          description="All time orders"
          icon={ShoppingCart}
        />
        
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockProducts}
          description="Products below threshold"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a 
              href="/admin/products/create" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Add New Product</div>
              <div className="text-sm text-muted-foreground">Create a new product listing</div>
            </a>
            <a 
              href="/admin/categories" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Manage Categories</div>
              <div className="text-sm text-muted-foreground">Organize your product categories</div>
            </a>
            <a 
              href="/admin/content" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Edit Content</div>
              <div className="text-sm text-muted-foreground">Update site content and pages</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Set up your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Admin account created</div>
                <div className="text-muted-foreground">You're logged in and ready</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">
                1
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Add your first product</div>
                <div className="text-muted-foreground">Start building your catalog</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm">
                2
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Customize site content</div>
                <div className="text-muted-foreground">Update homepage and pages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              You have {stats.lowStockProducts} product(s) running low on stock. 
              <a href="/admin/products?filter=low-stock" className="underline ml-1">
                View products
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
