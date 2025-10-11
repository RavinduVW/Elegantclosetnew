"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Truck } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders and fulfillment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              New Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Pending processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Shipped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Out for delivery</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Order processing and fulfillment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              No orders yet. Order management will be available once customers start placing orders.
            </p>
            <div className="text-sm text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Planned Features:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Order list with filters and search</li>
                <li>• Order details view</li>
                <li>• Status updates (pending, processing, shipped, delivered)</li>
                <li>• Customer information</li>
                <li>• Shipping tracking</li>
                <li>• Print invoices and packing slips</li>
                <li>• Refund processing</li>
                <li>• Order notes and history</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
