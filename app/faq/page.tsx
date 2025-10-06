export default function FAQPage() {
  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unused items in their original packaging.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 day delivery.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. Shipping costs and times vary by location.",
    },
    {
      question: "How do I care for my batik clothing?",
      answer: "Hand wash in cold water with mild detergent. Avoid direct sunlight when drying to preserve colors.",
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, all our batik products are authentic and sourced from skilled artisans.",
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you will receive a tracking number via email once your order ships.",
    },
  ];

  return (
    <main className="min-h-screen pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-12">Find answers to common questions about our products and services</p>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please contact our customer support team.
          </p>
          <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
}
