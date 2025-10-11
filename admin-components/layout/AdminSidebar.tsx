"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  ShoppingCart,
  Video,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Palette,
  Ruler,
  DollarSign,
  Layers,
  Tag,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    subItems: [
      {
        title: "All Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        title: "Add New",
        href: "/admin/products/create",
        icon: Package,
      },
      {
        title: "Colors",
        href: "/admin/products/colors",
        icon: Palette,
      },
      {
        title: "Sizes",
        href: "/admin/products/sizes",
        icon: Ruler,
      },
    ],
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    subItems: [
      {
        title: "All Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        title: "Add New",
        href: "/admin/categories/create",
        icon: FolderTree,
      },
      {
        title: "Sub-Categories",
        href: "/admin/categories/sub",
        icon: Layers,
      },
    ],
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: Video,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    subItems: [
      {
        title: "General",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Currency",
        href: "/admin/settings/currency",
        icon: DollarSign,
      },
      {
        title: "Pricing",
        href: "/admin/settings/pricing",
        icon: Tag,
      },
    ],
  },
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-white text-black shadow-2xl transition-all duration-300 ease-in-out",
          isOpen
            ? "w-72 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between h-16 p-4 backdrop-blur-sm my-4">
          {isOpen ? (
            <Link
              href="/admin"
              className="flex items-center space-x-3 group transition-all duration-200"
            >
              <div className="flex ">
                <Image
                  src="https://i.postimg.cc/Qt6VmqdB/brandlogo.png"
                  alt="Elegant Closet"
                  fill
                  className="object-contain scale-150"
                  priority
                />
              </div>
            </Link>
          ) : (
            <div className="hidden lg:flex items-center justify-center w-full">
              <div className="w-auto h-auto flex items-center justify-center p-2">
                <img
                  src="https://i.postimg.cc/Qt6VmqdB/brandlogo.png"
                  alt="Elegant Closet"                  
                  className="object-contain scale-175"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const isExpanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.href}>
                <div className={cn("relative group")}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (hasSubItems && isOpen) {
                        e.preventDefault();
                        toggleExpanded(item.href);
                      }
                    }}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-purple-100 to-violet-200 text-black shadow-lg shadow-purple-500/30"
                        : "text-gray-700 hover:bg-gradient-to-r from-purple-100 to-violet-100 hover:text-black"
                    )}
                    title={!isOpen ? item.title : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                    )}

                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                        isActive ? "scale-110" : "group-hover:scale-110"
                      )}
                    />

                    {isOpen && (
                      <>
                        <span className="flex-1 font-medium">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold shadow-lg animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        {hasSubItems && (
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )}
                          />
                        )}
                      </>
                    )}
                  </Link>

                  {/* Tooltip for collapsed sidebar */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                      {item.title}
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-items */}
                {hasSubItems && isOpen && isExpanded && (
                  <div className="mt-1 ml-6 space-y-1 border-l-2 border-gray-700/50 pl-3">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            isSubActive
                              ? "bg-purple-600/30 text-black font-semibold"
                              : "text-gray-700 hover:text-black hover:bg-violet-800/30"
                          )}
                        >
                          <subItem.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer - Toggle button */}
        <div>
          <button
            onClick={onToggle}
            className={cn(
              "w-full flex items-center justify-center h-14 transition-colors duration-200 group",
              isOpen ? "px-4 justify-between" : ""
            )}
          >
            {isOpen && <span className="text-sm text-gray-800">{""}</span>}
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-800 group-hover:text-gray-400 transition-colors" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-gray-400 transition-colors" />
            )}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </>
  );
}
