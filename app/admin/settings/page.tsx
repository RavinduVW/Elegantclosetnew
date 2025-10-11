"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Globe, Palette, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your site settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Site Settings
            </CardTitle>
            <CardDescription>
              Site name, description, and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Logo, colors, and visual identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Settings
            </CardTitle>
            <CardDescription>
              Email templates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              User roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="mr-2 h-5 w-5" />
            Settings Management
          </CardTitle>
          <CardDescription>
            Comprehensive settings planned for next phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-left bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Planned Features:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• General site settings (name, description, contact)</li>
              <li>• Branding (logo, colors, favicon)</li>
              <li>• Navigation menu builder</li>
              <li>• SEO defaults and analytics integration</li>
              <li>• E-commerce settings (currency, tax, shipping)</li>
              <li>• Email templates and SMTP configuration</li>
              <li>• User roles and permissions management</li>
              <li>• Social media links</li>
              <li>• Privacy and terms URLs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
