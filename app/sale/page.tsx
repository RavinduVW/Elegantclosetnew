export default function SalePage() {
  return (
    <main className="min-h-screen pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
          <h2 className="text-2xl font-bold text-red-900">Special Sale!</h2>
          <p className="text-red-700">Up to 50% off on selected items</p>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Sale Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                SALE
              </span>
              <span className="text-gray-400">Product {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
