export default function BlogPage() {
  return (
    <main className="min-h-screen pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
        <p className="text-gray-600 mb-12">Fashion tips, trends, and style inspiration</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span className="text-gray-400">Blog Post {i + 1}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Blog Post Title {i + 1}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                </p>
                <button className="text-gray-900 font-medium text-sm hover:underline">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
