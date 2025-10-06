export default function KidsPage() {
  return (
    <main className="min-h-screen pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kids&apos; Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              <span className="text-gray-400">Product {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
