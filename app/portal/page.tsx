'use client'
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowRight,
  LogOut
} from 'lucide-react';

interface DetailedResult {
  question_number: number;
  question: string;
  student_answer: string;
  score: number;
  max_marks: number;
  feedback: string;
}

interface StudentResult {
  _id: string;
  student_info: {
    name: string;
    level: string;
    mat_no: string;
    extracted_from_document: {
      name: string | null;
      level: string | null;
    };
  };
  exam_info: {
    exam_title: string;
    subject: string;
    questions_filename: string;
    answers_filename: string | null;
  };
  summary: {
    total_questions: number;
    marks_per_question: number;
    total_score: number;
    percentage: number;
    letter_grade: string;
    guidelines_used: string | null;
  };
  detailed_results: DetailedResult[];
  created_at: string;
  updated_at: string;
}

interface StudentLoginProps {
  onLogin: (matNo: string) => void;
  loading: boolean;
}

const StudentLoginPage = ({ onLogin, loading }: StudentLoginProps) => {
  const [matNo, setMatNo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matNo.trim()) {
      setError('Please enter your matriculation number');
      return;
    }
    setError('');
    onLogin(matNo.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Student Results Portal
            </h1>
            <p className="text-gray-600">
              Enter your matriculation number to view your exam results
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
            <div>
              <label htmlFor="matNo" className="block text-sm font-medium text-gray-700 mb-2">
                Matriculation Number
              </label>
              <div className="relative">
                <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="matNo"
                  value={matNo}
                  onChange={(e) => setMatNo(e.target.value)}
                  placeholder="e.g., U2021/5520027"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Checking Results...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  View My Results
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4">What you can do:</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-3 text-blue-500" />
                View detailed exam results
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-3 text-green-500" />
                Check grades and feedback
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 className="h-4 w-4 mr-3 text-purple-500" />
                Track performance over time
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentResultsPage = ({ 
  matNo, 
  onLogout 
}: { 
  matNo: string; 
  onLogout: () => void; 
}) => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailedView, setShowDetailedView] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{name: string, level: string} | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://exam-grader-bot.onrender.com';

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/students/${matNo}/results`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No results found for this matriculation number');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setFilteredResults(data.results);
        
        if (data.results.length > 0) {
          const firstResult = data.results[0];
          setStudentInfo({
            name: firstResult.student_info?.name || 'Unknown Student',
            level: firstResult.student_info?.level || 'N/A'
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch results');
      }
    } catch (err) {
      console.error('Error fetching student results:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStudentResults();
  }, [matNo]);

  // Filter and search logic
  useEffect(() => {
    let filtered = results.filter(result => {
      const examTitle = result.exam_info?.exam_title || '';
      const subject = result.exam_info?.subject || '';
      
      const matchesSearch = examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === 'all' || subject.toLowerCase().includes(filterSubject.toLowerCase());
      
      return matchesSearch && matchesSubject;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'exam_info.exam_title':
          aValue = a.exam_info?.exam_title || '';
          bValue = b.exam_info?.exam_title || '';
          break;
        case 'summary.percentage':
          aValue = a.summary?.percentage || 0;
          bValue = b.summary?.percentage || 0;
          break;
        case 'summary.total_score':
          aValue = a.summary?.total_score || 0;
          bValue = b.summary?.total_score || 0;
          break;
        case 'summary.letter_grade':
          aValue = a.summary?.letter_grade || '';
          bValue = b.summary?.letter_grade || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredResults(filtered);
    setCurrentPage(1);
  }, [results, searchTerm, sortBy, sortOrder, filterSubject]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D+':
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'E':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceTrend = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage >= 50) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getStatusFromGrade = (grade: string, percentage: number) => {
    if (percentage === 0 || grade === 'F') return 'failed';
    return 'passed';
  };

  const getStatusIcon = (grade: string, percentage: number) => {
    const status = getStatusFromGrade(grade, percentage);
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  // Statistics
  const validResults = results.filter(r => r.summary?.percentage !== undefined);
  const averageScore = validResults.length > 0 
    ? validResults.reduce((acc, result) => acc + (result.summary?.percentage || 0), 0) / validResults.length
    : 0;
  const passRate = validResults.length > 0
    ? (validResults.filter(result => (result.summary?.percentage || 0) >= 50).length / validResults.length) * 100
    : 0;
  const highestScore = validResults.length > 0 
    ? Math.max(...validResults.map(result => result.summary?.percentage || 0))
    : 0;
  const lowestScore = validResults.length > 0
    ? Math.min(...validResults.map(result => result.summary?.percentage || 0))
    : 0;

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(results.map(r => r.exam_info?.subject).filter(Boolean)));

  const exportToCSV = () => {
    const headers = ['Exam Title', 'Subject', 'Score', 'Percentage', 'Grade', 'Total Questions', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => 
        [
          `"${result.exam_info?.exam_title || 'N/A'}"`,
          `"${result.exam_info?.subject || 'N/A'}"`,
          `${result.summary?.total_score || 0}`,
          `${result.summary?.percentage || 0}%`,
          `"${result.summary?.letter_grade || 'N/A'}"`,
          `${result.summary?.total_questions || 0}`,
          `"${new Date(result.created_at).toLocaleDateString()}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_results_${matNo}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Results</h2>
          <p className="text-gray-600">Please wait while we fetch your exam data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => fetchStudentResults()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center mx-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Try Different Mat. No.
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  My Results
                </h1>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100 inline-block">
                <p className="text-sm text-gray-600 mb-1">Student Information</p>
                <p className="font-semibold text-gray-900">{studentInfo?.name || 'Unknown Student'}</p>
                <p className="text-sm text-gray-600">Mat. No: {matNo}</p>
                {studentInfo?.level && <p className="text-sm text-gray-600">Level: {studentInfo.level}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchStudentResults()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredResults.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{passRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">{highestScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 placeholder-gray-500 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border placeholder-gray-500 text-gray-500 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} of {filteredResults.length} results
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {currentResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                {results.length === 0 
                  ? "You don't have any exam results yet." 
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('exam_info.exam_title')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Exam</span>
                          {sortBy === 'exam_info.exam_title' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('summary.total_score')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Score</span>
                          {sortBy === 'summary.total_score' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('summary.percentage')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Percentage</span>
                          {sortBy === 'summary.percentage' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('summary.letter_grade')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Grade</span>
                          {sortBy === 'summary.letter_grade' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Date</span>
                          {sortBy === 'created_at' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Performance</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentResults.map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {result.exam_info?.exam_title || 'Untitled Exam'}
                            </div>
                            {result.exam_info?.subject && (
                              <div className="text-sm text-gray-500">{result.exam_info.subject}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {(result.summary?.total_score || 0).toFixed(1)}/100
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.summary?.total_questions || 0} questions
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className={`h-2 rounded-full ${
                                  (result.summary?.percentage || 0) >= 70 ? 'bg-green-500' :
                                  (result.summary?.percentage || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, result.summary?.percentage || 0)}%` }}
                              ></div>
                            </div>
                            <span className="font-medium text-gray-900">
                              {(result.summary?.percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(result.summary?.letter_grade || '')}`}>
                            {result.summary?.letter_grade || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.summary?.letter_grade || '', result.summary?.percentage || 0)}
                            <span className="text-sm font-medium capitalize">
                              {getStatusFromGrade(result.summary?.letter_grade || '', result.summary?.percentage || 0)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{formatDate(result.created_at)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getPerformanceTrend(result.summary?.percentage || 0)}
                            <span className="text-sm text-gray-600">
                              {(result.summary?.percentage || 0) >= 70 ? 'Excellent' :
                               (result.summary?.percentage || 0) >= 50 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowDetailedView(result._id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm font-medium rounded ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detailed View Modal */}
        {showDetailedView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Detailed Results</h2>
                <button
                  onClick={() => setShowDetailedView(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {(() => {
                const result = results.find(r => r._id === showDetailedView);
                if (!result) return null;
                
                return (
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] text-black">
                    {/* Student Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Student Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {result.student_info?.name || studentInfo?.name || 'Unknown'}</p>
                          <p><strong>Mat. No:</strong> {matNo}</p>
                          {(result.student_info?.level || studentInfo?.level) && (
                            <p><strong>Level:</strong> {result.student_info?.level || studentInfo?.level}</p>
                          )}
                        </div>
                        <div>
                          <p><strong>Exam:</strong> {result.exam_info?.exam_title || 'Untitled'}</p>
                          {result.exam_info?.subject && (
                            <p><strong>Subject:</strong> {result.exam_info.subject}</p>
                          )}
                          <p><strong>Date:</strong> {formatDate(result.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Performance Summary</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {result.summary?.total_questions || 0}
                          </p>
                          <p className="text-sm text-gray-600">Total Questions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {(result.summary?.total_score || 0).toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-600">Total Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {(result.summary?.percentage || 0).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">Percentage</p>
                        </div>
                        <div className="text-center">
                          <span className={`inline-block px-3 py-1 text-xl font-bold rounded-full ${getGradeColor(result.summary?.letter_grade || '')}`}>
                            {result.summary?.letter_grade || 'N/A'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">Final Grade</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Questions and Answers */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Question-by-Question Breakdown</h3>
                      <div className="space-y-4">
                        {result.detailed_results?.map((detail, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Question {detail.question_number}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-sm font-medium rounded ${
                                  detail.score >= detail.max_marks * 0.8 ? 'bg-green-100 text-green-800' :
                                  detail.score >= detail.max_marks * 0.5 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {detail.score.toFixed(1)}/{detail.max_marks.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="font-medium text-gray-700 mb-1">Question:</p>
                              <p className="text-gray-600">{detail.question}</p>
                            </div>
                            
                            <div className="mb-3">
                              <p className="font-medium text-gray-700 mb-1">Your Answer:</p>
                              <p className={`text-gray-600 ${detail.student_answer === '[No answer]' ? 'italic text-gray-400' : ''}`}>
                                {detail.student_answer || '[No answer provided]'}
                              </p>
                            </div>
                            
                            {detail.feedback && (
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="font-medium text-gray-700 mb-1">Feedback:</p>
                                <p className="text-gray-600 text-sm">{detail.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const StudentResultsApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMatNo, setCurrentMatNo] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (matNo: string) => {
    setLoginLoading(true);
    
    // Simulate checking if student exists (you could add actual validation here)
    setTimeout(() => {
      setCurrentMatNo(matNo);
      setIsLoggedIn(true);
      setLoginLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentMatNo('');
  };

  if (!isLoggedIn) {
    return (
      <StudentLoginPage 
        onLogin={handleLogin} 
        loading={loginLoading}
      />
    );
  }

  return (
    <StudentResultsPage 
      matNo={currentMatNo} 
      onLogout={handleLogout} 
    />
  );
};

export default StudentResultsApp;