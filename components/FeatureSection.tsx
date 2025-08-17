import { BookCheck, Gauge, ClipboardList, Sparkles, ShieldCheck, BarChart } from "lucide-react";

export const FeaturesSection = () => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Transforming Assessment with AI
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Instant Grading</h3>
          <p className="text-gray-600">Get accurate results in seconds, not days. Our AI evaluates answers with human-level precision.</p>
        </div>

        {/* Feature 2 */}
        <div className="text-center">
          <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Gauge className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Bias Reduction</h3>
          <p className="text-gray-600">Eliminate grading inconsistencies with our standardized evaluation framework.</p>
        </div>

        {/* Feature 3 */}
        <div className="text-center">
          <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Detailed Analytics</h3>
          <p className="text-gray-600">Comprehensive performance reports highlighting class trends and knowledge gaps.</p>
        </div>

        {/* Feature 4 */}
        <div className="text-center">
          <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Adaptive Learning</h3>
          <p className="text-gray-600">Automatically generates personalized feedback for each student's improvement.</p>
        </div>

        {/* Feature 5 */}
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Academic Integrity</h3>
          <p className="text-gray-600">Advanced plagiarism detection and answer pattern recognition for fair assessments.</p>
        </div>

        {/* Feature 6 */}
        <div className="text-center">
          <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BarChart className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Seamless Integration</h3>
          <p className="text-gray-600">Works with all major LMS platforms and supports various question formats.</p>
        </div>
      </div>
    </div>
  </div>
);