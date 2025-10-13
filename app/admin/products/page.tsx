"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/backend/config";
import { Product } from "@/admin-lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, Copy, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  async function loadProducts() {
    try {
      setLoading(true);
      const productsRef = collection(db, "products");
      
      let q = query(productsRef, orderBy("createdAt", "desc"));
      
      if (statusFilter !== "all") {
        q = query(productsRef, where("status", "==", statusFilter), orderBy("createdAt", "desc"));
      }

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", productId));
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      published: "default",
      draft: "secondary",
      archived: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={() => router.push("/admin/products/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "published" ? "default" : "outline"}
            onClick={() => setStatusFilter("published")}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === "draft" ? "default" : "outline"}
            onClick={() => setStatusFilter("draft")}
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg bg-white">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button onClick={() => router.push("/admin/products/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first product
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Colors/Sizes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.shortDescription && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.shortDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">LKR {product.price.toFixed(2)}</div>
                      {product.salePrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            LKR {product.salePrice.toFixed(2)}
                          </span>
                          {product.discountPercentage && (
                            <Badge variant="destructive" className="text-xs">
                              -{product.discountPercentage}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.isSoldOut ? (
                      <Badge variant="destructive">Sold Out</Badge>
                    ) : product.inStock ? (
                      <span className="text-green-600 text-sm">
                        {product.stockQuantity || "In Stock"}
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm">Out of Stock</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {product.colors?.length || 0} colors
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.sizes?.length || 0} sizes
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(product.status)}
                      {product.specialTag && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {product.specialTag === "new" && <Sparkles className="w-3 h-3 mr-1" />}
                          {product.specialTag === "trending" && <TrendingUp className="w-3 h-3 mr-1" />}
                          {product.specialTag === "bestseller" && <Award className="w-3 h-3 mr-1" />}
                          {product.specialTag === "limited" && <Clock className="w-3 h-3 mr-1" />}
                          {product.specialTag}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/products/${product.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Implement duplicate
                            toast("Duplicate feature coming soon");
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-muted-foreground">Total Products</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-muted-foreground">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.status === "published").length}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(p => p.status === "draft").length}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-muted-foreground">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => !p.inStock).length}
          </div>
        </div>
      </div>
    </div>
  );
}
