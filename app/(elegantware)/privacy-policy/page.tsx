import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how Elegant Closet collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6 bg-white/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 lg:p-12 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Your privacy is of utmost importance to us and this is why we assure you that this website is under the sole ownership of Elegant Closet and we operate a strict privacy policy when it comes to our website.
              </p>

              <p>
                We collect personal information for the purpose of recording contact details, online orders, loyalty programmes, subscriptions to email lists etc. In the event that a data gathering is of an abstract nature, we will ensure that information is collected with the full knowledge and consent of our customers and is stored by lawful means.
              </p>

              <p>
                The information gathered is stored for a period of time as deemed necessary by Elegant Closet to continue servicing our clients and is not in any event shared with any party outside of Elegant Closet, with the exception of legal requirements. Our data storage methods guarantee that your information will be safe from illicit access, data theft, unlawful use or modification and disclosure according to commercially acceptable standards.
              </p>

              <p>
                If our website links to third party websites, please use your sole discretion when operating these sites as we will not be liable or have control over the policies and subject matter of such websites. We wish to clearly state that we will hold no responsibility or liability for actions of such linked websites external to Elegant Closet.
              </p>

              <p>
                Your continued use of our website will be considered as acceptance on your part of our terms and conditions and privacy policy regarding personal information.
              </p>

              <p>
                Please feel free to contact us if you require further clarifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
