import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "Refund & Return Policy",
  description: "Learn about our refund and return policy at Elegant Closet.",
};

export default function ReturnsRefundsPage() {
  return (
    <div className="h-fit bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Refund & Return Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6 bg-white/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 lg:p-12 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund & Return Policy</h1>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Our products are made with the highest quality material following a stringent production process. Our batiks are meticulously hand crafted and minor anomalies that occur in this handcrafting process will not be considered as a fault in the product itself.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                In the event you are not satisfied with our products, we will be happy to exchange it for another product you see fit. We will however, under no circumstance offer refunds or store credit on returns /exchanges.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-4 bg-white/50">
                <AccordionTrigger className="text-gray-900 hover:text-purple-600">
                  For any exchange or return
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  For any exchange or return requests please call us on our contact numbers or visit us at our store during operating hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-4 bg-white/50">
                <AccordionTrigger className="text-gray-900 hover:text-purple-600">
                  For in-store exchange
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  For in-store exchange, the customer needs to present the item within 7 days of purchase along with the bill in order to qualify for exchange.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-4 bg-white/50">
                <AccordionTrigger className="text-gray-900 hover:text-purple-600">
                  In the event of online order returns or inability
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  In the event of online order returns or inability to physically visit our store, the customer can post the item through a reliable method to our store address provided. The customer will have to bear the postage costs both ways in such an instance. AKIRA will not be held responsible for the loss of products during transition and will not accept products if the external packaging is tampered with or damaged.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-4 bg-white/50">
                <AccordionTrigger className="text-gray-900 hover:text-purple-600">
                  For an exchange to be acceptable
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  For an exchange to be acceptable, the product should be in original condition with the labels intact. Any products on clearance or markdowns at the time of purchase cannot be exchanged.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-4 bg-white/50">
                <AccordionTrigger className="text-gray-900 hover:text-purple-600">
                  Tailor-made and customized products
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Tailor-made and customized products cannot be cancelled, exchanged or returned unless there is a quantifiable defect.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
