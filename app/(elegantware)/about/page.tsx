import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/backend/config";
import { AboutContent } from "@/admin-lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const q = query(
      collection(db, "about"),
      where("published", "==", true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as AboutContent;
  } catch (error) {
    console.error("Error fetching about content:", error);
    return null;
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();

  if (!content) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">HOME</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>ABOUT US</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-purple-100 to-pink-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About us</h1>
            </div>
          </div>
        </div>

        <div className="bg-[#f5f5f0] py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg">
                We&apos;re currently updating our About page. Please check back soon!
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">HOME</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>ABOUT US</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {content.images && content.images.length > 0 && (
        <div className="relative w-full h-64 md:h-96 bg-white">
          <Image
            src={content.images[0].url}
            alt={content.images[0].alt || "About us"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">About us</h1>
          </div>
          {content.images[0].caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm text-center">{content.images[0].caption}</p>
            </div>
          )}
        </div>
      )}

      {(!content.images || content.images.length === 0) && (
        <div className="relative w-full h-64 md:h-96 bg-white">
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">About us</h1>
          </div>
        </div>
      )}

      <div className="bg-none py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-purple-600 hover:prose-a:text-purple-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {content.content}
              </ReactMarkdown>
            </article>

            {content.images && content.images.length > 1 && (
              <div className="mt-12 md:mt-16">
                <div className="relative w-full h-64 md:h-[500px] mb-8">
                  <Image
                    src={content.images[1].url}
                    alt={content.images[1].alt || "Our facility"}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                  {content.images[1].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                      <p className="text-white text-sm text-center">{content.images[1].caption}</p>
                    </div>
                  )}
                </div>

                {content.images.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {content.images.slice(2).map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                        <Image
                          src={image.url}
                          alt={image.alt || `Image ${index + 3}`}
                          fill
                          className="object-cover"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm text-center">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
