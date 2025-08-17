"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Calendar, BookmarkPlus, Eye } from "lucide-react";



const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-900 mr-3">{job.title}</h3>
            {job.featured && (
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-2">{job.company}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {job.posted}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {job.duration}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600 mb-2">{job.rate}</div>
          <div className="text-sm text-gray-500">{job.applications} applicants</div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{job.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill: string) => (
            <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <BookmarkPlus className="h-4 w-4 mr-1" />
            Save
          </button>
          <button 
            onClick={handleViewDetails}
            className="flex items-center px-3 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;