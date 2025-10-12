import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export const metadata = {
  title: "Shipping Policy",
  description: "Learn about our delivery and shipping policy at Elegant Closet.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shipping Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-8 bg-white/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 lg:p-12 shadow-sm">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Delivery</h2>
            <p className="text-gray-700 leading-relaxed">
              Delivery will be made to the address provided at the time of ordering. No changes will be accepted once the order has been accepted.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Shipping</h2>
            <p className="text-gray-700 leading-relaxed">
              Shipping of products will be done in keeping with the delivery timelines provided for each product. These times may vary due to conditions that may be out of our control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">For returns</h2>
            <p className="text-gray-700 leading-relaxed">
              For returns policies, please check our section on{" "}
              <Link 
                href="/returns-refunds" 
                className="text-purple-600 hover:text-purple-700 underline font-medium"
              >
                Return and exchange policy
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
