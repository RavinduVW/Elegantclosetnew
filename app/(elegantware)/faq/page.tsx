import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/backend/config";
import { FAQ } from "@/admin-lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

async function getFAQs(): Promise<FAQ[]> {
  try {
    const q = query(
      collection(db, "faqs"),
      where("published", "==", true),
      orderBy("order", "asc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FAQ[];
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">Find answers to common questions about our products and services</p>
          </div>

          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQs Available</h3>
              <p className="text-gray-600 mb-6">
                We&apos;re currently updating our FAQ section. Please check back soon or contact our support team.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Link>
            </div>
          ) : (
            <>
              <Accordion type="single" collapsible className="space-y-3 mb-12">
                {faqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h2>
                    <p className="text-gray-600 mb-4">
                      Can&apos;t find the answer you&apos;re looking for? Our customer support team is here to help.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-white to-pink-600 text-purple-700 px-6 py-3 rounded-lg font-medium  transition-all shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
