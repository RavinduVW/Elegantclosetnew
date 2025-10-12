import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for using Elegant Closet's website and services.",
};

export default function TermsConditionsPage() {
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
              <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6 bg-white/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 lg:p-12 shadow-sm">
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Elegant Closet operates this site as a business platform and service to its customer base. Kindly read and accept the following terms and conditions as a prerequisite to accessing our website.
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">These terms and conditions</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions will be applicable to all transactions which customers/ members enter using Elegant Closet and all common business relationships between Elegant Closet and its customers. We do not agree to any other terms and conditions unless explicitly stated otherwise
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
