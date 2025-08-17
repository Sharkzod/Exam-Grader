import { DollarSign, MapPin, Search } from "lucide-react";

export const JobSearchBar = () => (
  <div className="bg-white rounded-lg shadow p-6 mb-8">
    <div className="grid md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <select className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
          <option>All Locations</option>
          <option>London</option>
          <option>Manchester</option>
          <option>Remote</option>
        </select>
      </div>
      <div className="relative">
        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <select className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
          <option>All Rates</option>
          <option>£300-£500/day</option>
          <option>£500-£700/day</option>
          <option>£700+/day</option>
        </select>
      </div>
    </div>
  </div>
);