export default function AboutPage() {
  return (
    <main className="min-h-screen pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-100 rounded-lg h-64 mb-8 flex items-center justify-center">
            <span className="text-gray-400">Company Image</span>
          </div>
          <div className="prose prose-lg">
            <p className="text-gray-600 mb-6">
              Welcome to Elegant Closet, where fashion meets tradition. We specialize in bringing you
              the finest batik designs and contemporary fashion that celebrates cultural heritage while
              embracing modern style.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Founded with a passion for preserving traditional craftsmanship, Elegant Closet has been
              serving fashion enthusiasts for years. Our collection features carefully curated pieces
              that blend timeless elegance with contemporary design.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We are committed to providing high-quality, sustainable fashion that tells a story. Each
              piece in our collection is selected with care to ensure it meets our standards of quality,
              style, and cultural significance.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
