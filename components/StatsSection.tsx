export const StatsSection = () => (
  <div className="py-16 bg-blue-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-blue-800 mb-2">10M+</div>
          <div className="text-gray-600">Exams Graded</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-800 mb-2">99.2%</div>
          <div className="text-gray-600">Grading Accuracy</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-800 mb-2">90%</div>
          <div className="text-gray-600">Time Saved</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-800 mb-2">500+</div>
          <div className="text-gray-600">Institutions Using</div>
        </div>
      </div>
      
      {/* Additional credibility indicators */}
      <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
          <div className="text-gray-700">Availability</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
          <div className="text-gray-700">Question Types Supported</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">0.5s</div>
          <div className="text-gray-700">Average Grading Time</div>
        </div>
      </div>
    </div>
  </div>
);