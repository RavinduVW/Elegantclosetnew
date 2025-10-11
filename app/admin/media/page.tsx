"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your images and media files
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="mr-2 h-5 w-5" />
            Media Management
          </CardTitle>
          <CardDescription>
            Centralized media library with upload and organization tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              Media library is planned for the next development phase
            </p>
            <div className="text-sm text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Planned Features:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Drag-and-drop file upload</li>
                <li>• Grid and list view</li>
                <li>• Search and filter media</li>
                <li>• Bulk operations</li>
                <li>• Image editing (crop, resize, optimize)</li>
                <li>• Alt text management for SEO</li>
                <li>• Usage tracking</li>
                <li>• Storage analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
