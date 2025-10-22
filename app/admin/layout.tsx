"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/backend/config";
import AdminSidebar from "@/admin-components/layout/AdminSidebar";
import AdminHeader from "@/admin-components/layout/AdminHeader";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  active: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is an admin
          const adminDocRef = doc(db, "admin_users", firebaseUser.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists() && adminDoc.data().active) {
            setUser({
              id: adminDoc.id,
              email: firebaseUser.email || "",
              displayName:
                adminDoc.data().displayName || firebaseUser.email || "",
              role: adminDoc.data().role || "viewer",
              active: adminDoc.data().active,
            });
          } else {
            // User is not an admin
            setUser(null);
            if (pathname !== "/admin/login") {
              router.push("/admin/login");
            }
          }
        } catch (error) {
          console.error("Error fetching admin user:", error);
          setUser(null);
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          }
        }
      } else {
        setUser(null);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Show loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page without layout
  if (!user && pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  // Show admin layout
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        <Toaster position="top-right" richColors />
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader 
            user={user} 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zincs-50 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
