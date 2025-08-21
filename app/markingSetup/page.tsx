"use client";
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, ClipboardList, Settings, Download, Play, CheckCircle, X, AlertCircle, HelpCircle, Eye, Trash2, Plus, Loader2, Clock, UserCheck, XCircle, Users, BarChart3, RefreshCw } from 'lucide-react';
import { useRouter } from "next/navigation";


interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: 'questions' | 'answers';
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  file: File;
}

interface GradingResult {
  success: boolean;
  database_id?: string;
  approval_status?: string;
  approval_info?: {
    status: string;
    message: string;
  };
  summary: {
    total_questions: number;
    marks_per_question: number;
    total_score: number;
    percentage: number;
    letter_grade: string;
  };
  detailed_results: Array<{
    question_number: number;
    question: string;
    student_answer: string;
    score: number;
    max_marks: number;
    feedback: string;
  }>;
  student_info?: {
    name: string;
    level: string;
    mat_no: string;
  };
  exam_info?: {
    exam_title: string;
    subject: string;
  };
}

interface ApprovalResult extends GradingResult {
  _id: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ApprovalStats {
  total_results: number;
  status_breakdown: {
    pending: number;
    approved: number;
    rejected: number;
  };
  percentages: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recent_activity: {
    submitted_last_week: number;
    approved_last_week: number;
    rejected_last_week: number;
  };
}

const MarkingSetupPage = () => {
  const [gradingProgress, setGradingProgress] = useState<number>(0);
  const [isReadyForGrading, setIsReadyForGrading] = useState<boolean>(false);
  const [uploadedScripts, setUploadedScripts] = useState<UploadedFile[]>([]);
  const [guidelines, setGuidelines] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [guidelinesSaved, setGuidelinesSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'guidelines' | 'resources' | 'results' | 'approval'>('upload');
  const [gradingResults, setGradingResults] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string>('');
  const [apiUrl] = useState('https://exam-grader-bot.onrender.com');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<'questions' | 'answers'>('questions');
  
  // States for approval workflow
  const [userRole, setUserRole] = useState<'lecturer' | 'student'>('lecturer');
  const [lecturerId, setLecturerId] = useState<string>('Dr. Smith');
  const [pendingResults, setPendingResults] = useState<ApprovalResult[]>([]);
  const [approvedResults, setApprovedResults] = useState<ApprovalResult[]>([]);
  const [rejectedResults, setRejectedResults] = useState<ApprovalResult[]>([]);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [activeApprovalTab, setActiveApprovalTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [refreshing, setRefreshing] = useState(false);
const router = useRouter()
  const generateId = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // API Functions for Approval System
  const fetchApprovalStats = async (): Promise<ApprovalStats | null> => {
    try {
      const response = await fetch(`${apiUrl}/statistics/approval`);
      const data = await response.json();
      
      if (data.success) {
        return data.statistics;
      } else {
        throw new Error(data.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      setError('Failed to load approval statistics');
      return null;
    }
  };

  const fetchPendingResults = async (): Promise<ApprovalResult[]> => {
    try {
      const response = await fetch(`${apiUrl}/results/pending`);
      const data = await response.json();
      
      if (data.success) {
        return data.results || [];
      } else {
        throw new Error(data.error || 'Failed to fetch pending results');
      }
    } catch (error) {
      console.error('Error fetching pending results:', error);
      setError('Failed to load pending results');
      return [];
    }
  };

  const fetchApprovedResults = async (): Promise<ApprovalResult[]> => {
    try {
      const response = await fetch(`${apiUrl}/results/approved`);
      const data = await response.json();
      
      if (data.success) {
        return data.results || [];
      } else {
        throw new Error(data.error || 'Failed to fetch approved results');
      }
    } catch (error) {
      console.error('Error fetching approved results:', error);
      setError('Failed to load approved results');
      return [];
    }
  };

  const fetchRejectedResults = async (): Promise<ApprovalResult[]> => {
    try {
      const response = await fetch(`${apiUrl}/results/rejected`);
      const data = await response.json();
      
      if (data.success) {
        return data.results || [];
      } else {
        throw new Error(data.error || 'Failed to fetch rejected results');
      }
    } catch (error) {
      console.error('Error fetching rejected results:', error);
      setError('Failed to load rejected results');
      return [];
    }
  };

  const approveResult = async (resultId: string, notes: string = '') => {
    setLoadingApproval(true);
    try {
      const response = await fetch(`${apiUrl}/results/${resultId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecturer_id: lecturerId,
          notes: notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await loadApprovalData();
        setError('');
      } else {
        throw new Error(data.error || 'Failed to approve result');
      }
    } catch (error) {
      console.error('Error approving result:', error);
      setError(error instanceof Error ? error.message : 'Error approving result');
    } finally {
      setLoadingApproval(false);
    }
  };

  const rejectResult = async (resultId: string, reason: string) => {
    setLoadingApproval(true);
    try {
      const response = await fetch(`${apiUrl}/results/${resultId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecturer_id: lecturerId,
          notes: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await loadApprovalData();
        setError('');
      } else {
        throw new Error(data.error || 'Failed to reject result');
      }
    } catch (error) {
      console.error('Error rejecting result:', error);
      setError(error instanceof Error ? error.message : 'Error rejecting result');
    } finally {
      setLoadingApproval(false);
    }
  };

  const bulkApprove = async () => {
    if (selectedResults.length === 0) {
      setError('No results selected');
      return;
    }

    setLoadingApproval(true);
    try {
      const response = await fetch(`${apiUrl}/results/bulk-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result_ids: selectedResults,
          lecturer_id: lecturerId,
          notes: 'Bulk approval'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedResults([]);
        await loadApprovalData();
        setError('');
        alert(`Successfully approved ${data.approved_count} out of ${data.total_count} results`);
      } else {
        throw new Error(data.error || 'Failed to bulk approve');
      }
    } catch (error) {
      console.error('Error with bulk approval:', error);
      setError(error instanceof Error ? error.message : 'Error with bulk approval');
    } finally {
      setLoadingApproval(false);
    }
  };

  const bulkReject = async (reason: string) => {
    if (selectedResults.length === 0) {
      setError('No results selected');
      return;
    }

    setLoadingApproval(true);
    try {
      const response = await fetch(`${apiUrl}/results/bulk-reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result_ids: selectedResults,
          lecturer_id: lecturerId,
          notes: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedResults([]);
        await loadApprovalData();
        setError('');
        alert(`Successfully rejected ${data.rejected_count} out of ${data.total_count} results`);
      } else {
        throw new Error(data.error || 'Failed to bulk reject');
      }
    } catch (error) {
      console.error('Error with bulk rejection:', error);
      setError(error instanceof Error ? error.message : 'Error with bulk rejection');
    } finally {
      setLoadingApproval(false);
    }
  };

  const loadApprovalData = async () => {
    setRefreshing(true);
    try {
      // Load all data in parallel
      const [stats, pending, approved, rejected] = await Promise.all([
        fetchApprovalStats(),
        fetchPendingResults(),
        fetchApprovedResults(),
        fetchRejectedResults()
      ]);

      setApprovalStats(stats);
      setPendingResults(pending);
      setApprovedResults(approved);
      setRejectedResults(rejected);
      setError('');
    } catch (error) {
      console.error('Error loading approval data:', error);
      setError('Failed to load approval data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        console.log('Backend status:', data);
      } catch (error) {
        console.error('Connection error:', error);
        setError('Unable to connect to backend server. Please ensure the server is running.');
      }
    };

    checkBackendConnection();
    
    // Load approval data if lecturer
    if (userRole === 'lecturer') {
      loadApprovalData();
    }
  }, [userRole, apiUrl]);
  

  useEffect(() => {
    setIsReadyForGrading(
      uploadedScripts.some(f => f.type === 'questions' && f.status === 'success') &&
      guidelines.trim().length > 0
    );
  }, [uploadedScripts, guidelines]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    if (!files || files.length === 0) {
      setError('No files selected');
      return;
    }

    setIsUploading(true);
    setError('');
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
      type: currentUploadType,
      file: file
    }));

    setUploadedScripts(prev => [...prev, ...newFiles]);

    newFiles.forEach((fileItem, index) => {
      const interval = setInterval(() => {
        setUploadedScripts(prev => 
          prev.map(f => {
            if (f.id === fileItem.id) {
              const newProgress = (f.progress || 0) + Math.random() * 30;
              if (newProgress >= 100) {
                clearInterval(interval);
                return { ...f, status: 'success' as const, progress: 100 };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setUploadedScripts(prev => 
          prev.map(f => f.id === fileItem.id ? { ...f, status: 'success' as const, progress: 100 } : f)
        );
        if (index === newFiles.length - 1) {
          setIsUploading(false);
        }
      }, 1500 + index * 200);
    });
  };

  const removeFile = (id: string) => {
    setUploadedScripts(prev => prev.filter(f => f.id !== id));
  };

  const handleGuidelinesSubmit = () => {
    if (!guidelines.trim()) {
      alert('Please enter marking guidelines before saving.');
      return;
    }
    
    setGuidelinesSaved(true);
    setTimeout(() => setGuidelinesSaved(false), 3000);
  };

  const startAIMarking = async () => {
    setIsGrading(true);
    setError('');
    setGradingProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGradingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Prepare form data for API
      const formData = new FormData();
      
      // Add files
      const questionsFile = uploadedScripts.find(f => f.type === 'questions');
      const answersFile = uploadedScripts.find(f => f.type === 'answers');
      
      if (questionsFile) {
        formData.append('questions_file', questionsFile.file);
      }
      if (answersFile) {
        formData.append('answers_file', answersFile.file);
      }
      
      // Add other data
      formData.append('guidelines', guidelines);
      formData.append('exam_title', 'Data Structures and Algorithms');
      formData.append('subject', 'Computer Science');

      // Make API call
      const response = await fetch(`${apiUrl}/grade-exam`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setGradingProgress(100);

      if (result.success) {
        setGradingResults(result);
        setActiveTab('results');
        
        // Refresh approval data to show the new pending result
        if (userRole === 'lecturer') {
          await loadApprovalData();
        }
      } else {
        throw new Error(result.error || 'Grading failed');
      }

    } catch (err) {
      console.error('Grading failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown grading error');
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
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

  const tabClasses = (tab: string) =>
    `px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  const renderApprovalTab = () => (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Results Approval Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadApprovalData}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Lecturer:</span>
            <input
              type="text"
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      {approvalStats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-blue-600 text-sm font-medium">Total Results</div>
            <div className="text-2xl font-bold text-blue-800">{approvalStats.total_results}</div>
            <div className="text-xs text-blue-500 mt-1">
              {approvalStats.recent_activity.submitted_last_week} submitted this week
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="text-yellow-600 text-sm font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">{approvalStats.status_breakdown.pending}</div>
            <div className="text-xs text-yellow-600 mt-1">
              {approvalStats.percentages.pending.toFixed(1)}% of total
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-green-600 text-sm font-medium">Approved</div>
            <div className="text-2xl font-bold text-green-800">{approvalStats.status_breakdown.approved}</div>
            <div className="text-xs text-green-600 mt-1">
              {approvalStats.recent_activity.approved_last_week} approved this week
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-600 text-sm font-medium">Rejected</div>
            <div className="text-2xl font-bold text-red-800">{approvalStats.status_breakdown.rejected}</div>
            <div className="text-xs text-red-600 mt-1">
              {approvalStats.recent_activity.rejected_last_week} rejected this week
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedResults.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800">
              {selectedResults.length} result(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={bulkApprove}
                disabled={loadingApproval}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50"
              >
                {loadingApproval ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Bulk Approve
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Reason for rejection:');
                  if (reason) {
                    bulkReject(reason);
                  }
                }}
                disabled={loadingApproval}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Bulk Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for different statuses */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending Review', count: pendingResults.length, color: 'text-yellow-600' },
            { key: 'approved', label: 'Approved', count: approvedResults.length, color: 'text-green-600' },
            { key: 'rejected', label: 'Rejected', count: rejectedResults.length, color: 'text-red-600' }
          ].map(tab => {
            const isActive = activeApprovalTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveApprovalTab(tab.key as 'pending' | 'approved' | 'rejected')}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 ${tab.color}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {(activeApprovalTab === 'pending' ? pendingResults :
          activeApprovalTab === 'approved' ? approvedResults : rejectedResults
        ).map((result) => (
          <div key={result._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {activeApprovalTab === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedResults.includes(result._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResults([...selectedResults, result._id]);
                      } else {
                        setSelectedResults(selectedResults.filter(id => id !== result._id));
                      }
                    }}
                    className="mt-1"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getApprovalStatusIcon(result.approval_status)}
                    <h3 className="font-semibold text-gray-900">
                      {result.student_info?.name || 'Unknown Student'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Mat No: {result.student_info?.mat_no || 'N/A'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>Score: {result.summary?.percentage?.toFixed(1)}%</div>
                    <div>Grade: {result.summary?.letter_grade}</div>
                    <div>Questions: {result.summary?.total_questions}</div>
                    <div>Submitted: {formatDate(result.created_at)}</div>
                  </div>
                  {result.approval_notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {result.approval_notes}
                    </div>
                  )}
                  {result.approved_by && result.approved_at && (
                    <div className="text-xs text-gray-500 mt-2">
                      {result.approval_status === 'approved' ? 'Approved' : 'Rejected'} by {result.approved_by} on {formatDate(result.approved_at)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // View details - you can implement a modal here
                    alert(`Viewing details for ${result.student_info?.name}'s result`);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                {result.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const notes = prompt('Add approval notes (optional):');
                        approveResult(result._id, notes || '');
                      }}
                      disabled={loadingApproval}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (required):');
                        if (reason && reason.trim()) {
                          rejectResult(result._id, reason);
                        } else {
                          alert('Rejection reason is required');
                        }
                      }}
                      disabled={loadingApproval}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(activeApprovalTab === 'pending' ? pendingResults :
        activeApprovalTab === 'approved' ? approvedResults : rejectedResults
      ).length === 0 && !refreshing && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {activeApprovalTab === 'pending' && <Clock className="h-12 w-12 mx-auto" />}
            {activeApprovalTab === 'approved' && <CheckCircle className="h-12 w-12 mx-auto" />}
            {activeApprovalTab === 'rejected' && <XCircle className="h-12 w-12 mx-auto" />}
          </div>
          <p className="text-gray-500">
            No {activeApprovalTab} results found
          </p>
        </div>
      )}

      {/* Loading State */}
      {refreshing && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Exam Marking System
          </h1>
          <p className="text-gray-600 text-lg">
            {userRole === 'lecturer' 
              ? 'Upload scripts, define guidelines, grade, and approve results'
              : 'View your approved exam results'
            }
          </p>
          
          {/* Role Selector */}
          <div className="flex justify-center mt-4">
            <div className="bg-white rounded-lg p-2 shadow-sm border">
              <button
                onClick={() => setUserRole('lecturer')}
                className={`px-4 py-2 rounded-md font-medium ${
                  userRole === 'lecturer' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Lecturer View
              </button>
              {/* <button
                onClick={() => setUserRole('student')}
                className={`px-4 py-2 rounded-md font-medium ${
                  userRole === 'student' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Student View
              </button> */}
            </div>
          </div>
        </div>

        {/* Progress Indicator - Only show for lecturers */}
        {userRole === 'lecturer' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${uploadedScripts.length > 0 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {uploadedScripts.length > 0 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm font-medium text-gray-900">Upload Scripts</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${guidelines.trim() ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {guidelines.trim() ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="text-sm font-medium text-gray-900">Set Guidelines</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${gradingResults ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {gradingResults ? <CheckCircle className="h-4 w-4" /> : '3'}
                </div>
                <span className="text-sm font-medium text-gray-900">AI Marking</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pendingResults.length === 0 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                  {pendingResults.length === 0 ? <CheckCircle className="h-4 w-4" /> : pendingResults.length}
                </div>
                <span className="text-sm font-medium text-gray-900">Approval</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl shadow-inner">
            {userRole === 'lecturer' && (
              <>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={tabClasses('upload')}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Scripts
                </button>
                <button
                  onClick={() => setActiveTab('guidelines')}
                  className={`ml-1 ${tabClasses('guidelines')}`}
                >
                  <ClipboardList className="h-4 w-4 inline mr-2" />
                  Guidelines
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`ml-1 ${tabClasses('resources')}`}
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Resources
                </button>
                <button
                  onClick={() => setActiveTab('approval')}
                  className={`ml-1 ${tabClasses('approval')}`}
                >
                  <UserCheck className="h-4 w-4 inline mr-2" />
                  Approval
                  {pendingResults.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {pendingResults.length}
                    </span>
                  )}
                </button>
                {gradingResults && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`ml-1 ${tabClasses('results')}`}
                  >
                    <Eye className="h-4 w-4 inline mr-2" />
                    Results
                  </button>
                )}
              </>
            )}
            
            {userRole === 'student' && (
              <button
                onClick={() => setActiveTab('results')}
                className={tabClasses('results')}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                My Results
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Upload Scripts Tab - Only for lecturers */}
          {activeTab === 'upload' && userRole === 'lecturer' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Upload className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Upload Exam Scripts</h2>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                  <p className="text-blue-800 text-sm">
                    <strong>Upload Instructions:</strong> Select whether you're uploading questions or answers, then drag and drop or click to browse files.
                  </p>
                </div>
              </div>

              {/* Upload Type Selector */}
              <div className="mb-4 flex justify-center space-x-4">
                <button
                  onClick={() => setCurrentUploadType('questions')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentUploadType === 'questions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload Questions
                </button>
                <button
                  onClick={() => setCurrentUploadType('answers')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentUploadType === 'answers'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload Answers
                </button>
              </div>

              {/* Uploaded Files List */}
              {uploadedScripts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Uploaded Files ({uploadedScripts.length})
                    </h3>
                    <button 
                      onClick={() => {
                        setUploadedScripts([]);
                        setError('');
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {uploadedScripts.map((file) => (
                      <div key={file.id} className={`bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors ${
                        file.type === 'questions' ? 'border-l-4 border-blue-500' : 'border-l-4 border-green-500'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              file.type === 'questions' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {file.name}
                            </h3>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            file.type === 'questions' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {file.type === 'questions' ? 'Questions' : 'Script'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span>Size: {(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-gray-500">Ready to process</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Preview
                          </button>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? currentUploadType === 'questions' 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-green-500 bg-green-50 scale-105'
                    : isUploading 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isUploading 
                      ? 'bg-orange-100' 
                      : currentUploadType === 'questions' 
                        ? 'bg-blue-100' 
                        : 'bg-green-100'
                  }`}>
                    <Upload className={`h-8 w-8 ${
                      isUploading 
                        ? 'text-orange-500' 
                        : currentUploadType === 'questions' 
                          ? 'text-blue-500' 
                          : 'text-green-500'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {isUploading 
                      ? 'Processing Files...' 
                      : `Drop ${currentUploadType} file here or click to browse`}
                  </h3>
                  <p className="text-gray-500">
                    {currentUploadType === 'questions' 
                      ? 'Upload the exam questions file (required)'
                      : 'Upload student answers file (optional)'}
                  </p>
                </div>
              </div>

              {/* Next Button */}
              {uploadedScripts.some(f => f.type === 'questions') && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setActiveTab('guidelines')}
                    disabled={!uploadedScripts.some(f => f.type === 'questions' && f.status === 'success')}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center ${
                      uploadedScripts.some(f => f.type === 'questions' && f.status === 'success')
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Guidelines Tab - Only for lecturers */}
          {activeTab === 'guidelines' && userRole === 'lecturer' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ClipboardList className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Marking Guidelines</h2>
                </div>
                {guidelinesSaved && (
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guidelines saved successfully!
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
                  <p className="text-blue-800 text-sm">
                    <strong>Pro Tip:</strong> Be specific and detailed in your guidelines. The AI will follow these instructions precisely for consistent marking across all scripts.
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Detailed Marking Criteria for AI Processing
                </label>
                <div className="relative">
                  <textarea
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    className="w-full h-80 p-6 border-2 text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter comprehensive marking guidelines here...

Example:
- Question 1: Award 5 points for correct algorithm, 3 points for implementation, 2 points for explanation
- Partial credit: Give 50% for correct approach even if final answer is wrong
- Deduct 1 point for minor syntax errors
- Award bonus points for exceptional insights or optimizations"
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {guidelines.length} characters
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">
                  These guidelines will ensure consistent and fair marking across all submitted scripts
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGuidelinesSubmit}
                    disabled={!guidelines.trim()}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      guidelines.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save Guidelines
                  </button>
                  {isReadyForGrading && (
                    <button
                      onClick={startAIMarking}
                      disabled={isGrading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center disabled:opacity-50"
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Grading...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start AI Grading
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab - Only for lecturers */}
          {activeTab === 'resources' && userRole === 'lecturer' && (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Download className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Templates & Resources</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">DOCX</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Marking Scheme Template</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Professional template with pre-built sections for different question types, rubrics, and scoring guidelines.
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
                
                <div className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">PDF</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Sample Answer Key</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Example answer keys showing best practices for clear, detailed marking criteria with point allocations.
                  </p>
                  <button className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    <Download className="h-4 w-4 mr-2" />
                    View Examples
                  </button>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">PDF</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">AI Marking Guide</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive guide on how to write effective guidelines for AI marking systems.
                  </p>
                  <button className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    <Download className="h-4 w-4 mr-2" />
                    Download Guide
                  </button>
                </div>

                <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">FAQ</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Frequently Asked Questions</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Common questions about AI marking, best practices, and troubleshooting tips.
                  </p>
                  <button className="text-orange-600 hover:text-orange-800 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    <Eye className="h-4 w-4 mr-2" />
                    View FAQ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Approval Tab - Only for lecturers */}
          {activeTab === 'approval' && userRole === 'lecturer' && renderApprovalTab()}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="p-8">
              {isGrading ? (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      AI is grading the exam...
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      This may take a few moments depending on the number of questions
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${gradingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{gradingProgress.toFixed(0)}% complete</p>
                  </div>
                </div>
              ) : gradingResults ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Eye className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-gray-800">
                        {userRole === 'lecturer' ? 'Grading Results' : 'My Exam Results'}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Approval Status Indicator */}
                      {gradingResults.approval_status && (
                        <div className={`flex items-center px-3 py-2 rounded-lg ${
                          gradingResults.approval_status === 'approved' 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : gradingResults.approval_status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {getApprovalStatusIcon(gradingResults.approval_status)}
                          <span className="ml-2 font-medium">
                            {gradingResults.approval_status === 'pending' && 'Pending Approval'}
                            {gradingResults.approval_status === 'approved' && 'Approved'}
                            {gradingResults.approval_status === 'rejected' && 'Rejected'}
                          </span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          const dataStr = JSON.stringify(gradingResults, null, 2);
                          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                          const exportFileDefaultName = 'exam_results.json';
                          const linkElement = document.createElement('a');
                          linkElement.setAttribute('href', dataUri);
                          linkElement.setAttribute('download', exportFileDefaultName);
                          linkElement.click();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                      </button>
                    </div>
                  </div>

                  {/* Approval Message */}
                  {gradingResults.approval_info && (
                    <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                      gradingResults.approval_status === 'pending'
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                        : gradingResults.approval_status === 'approved'
                        ? 'bg-green-50 border-green-400 text-green-800'
                        : 'bg-red-50 border-red-400 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {getApprovalStatusIcon(gradingResults.approval_status || 'pending')}
                        <span className="ml-2 font-medium">{gradingResults.approval_info.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Student Information */}
                  {gradingResults.student_info && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Student Information</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Name:</span>
                          <span className="ml-2 text-blue-800">{gradingResults.student_info.name}</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Level:</span>
                          <span className="ml-2 text-blue-800">{gradingResults.student_info.level}</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Mat No:</span>
                          <span className="ml-2 text-blue-800">{gradingResults.student_info.mat_no}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exam Information */}
                  {gradingResults.exam_info && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-purple-900 mb-2">Exam Information</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-purple-600 font-medium">Exam:</span>
                          <span className="ml-2 text-purple-800">{gradingResults.exam_info.exam_title}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 font-medium">Subject:</span>
                          <span className="ml-2 text-purple-800">{gradingResults.exam_info.subject}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="text-blue-600 text-sm font-medium">Total Questions</div>
                      <div className="text-2xl font-bold text-blue-800">{gradingResults.summary.total_questions}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-green-600 text-sm font-medium">Total Score</div>
                      <div className="text-2xl font-bold text-green-800">{gradingResults.summary.total_score.toFixed(1)}/100</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="text-purple-600 text-sm font-medium">Percentage</div>
                      <div className="text-2xl font-bold text-purple-800">{gradingResults.summary.percentage.toFixed(1)}%</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="text-orange-600 text-sm font-medium">Letter Grade</div>
                      <div className="text-2xl font-bold text-orange-800">{gradingResults.summary.letter_grade}</div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Question Results</h3>
                    <div className="space-y-4">
                      {gradingResults.detailed_results.map((result) => (
                        <div key={result.question_number} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                            <div className="font-medium text-gray-800">
                              Question {result.question_number} (Score: {result.score}/{result.max_marks})
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.score >= result.max_marks * 0.8 
                                ? 'bg-green-100 text-green-800' 
                                : result.score >= result.max_marks * 0.5
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round((result.score / result.max_marks) * 100)}%
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Question:</h4>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded">{result.question}</p>
                            </div>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Student Answer:</h4>
                              <p className="text-gray-800 bg-blue-50 p-3 rounded">{result.student_answer}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Feedback:</h4>
                              <p className="text-gray-800 bg-green-50 p-3 rounded border-l-4 border-green-400">{result.feedback}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall Feedback Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Overall Performance Summary
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-blue-700">
                          <strong>Strengths:</strong> {gradingResults.summary.percentage >= 80 
                            ? 'Excellent understanding of core concepts with clear explanations.' 
                            : gradingResults.summary.percentage >= 60 
                            ? 'Good grasp of fundamental concepts with room for improvement in detail.'
                            : 'Basic understanding present but needs significant improvement.'}
                        </p>
                        <p className="text-blue-700">
                          <strong>Areas for Improvement:</strong> {gradingResults.summary.percentage < 80 
                            ? 'Focus on providing more detailed explanations and examples.'
                            : 'Continue building on strong foundation with advanced concepts.'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-700">
                          <strong>Overall Grade:</strong> {gradingResults.summary.letter_grade} 
                          ({gradingResults.summary.percentage.toFixed(1)}%)
                        </p>
                        <p className="text-blue-700">
                          <strong>Status:</strong> {gradingResults.summary.percentage >= 50 
                            ? 'Pass - Well done!' 
                            : 'Below passing threshold - Review and retake recommended.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    {userRole === 'lecturer' ? (
                      <>
                        <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Yet</h3>
                        <p className="text-gray-500 mb-6">
                          Upload exam scripts and set marking guidelines to start the AI grading process.
                        </p>
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => setActiveTab('upload')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Scripts
                          </button>
                          {isReadyForGrading && (
                            <button
                              onClick={startAIMarking}
                              disabled={isGrading}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center disabled:opacity-50"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Grading
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Available</h3>
                        <p className="text-gray-500">
                          Your exam results will appear here once they have been graded and approved by your lecturer.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            AI Exam Marking System - Powered by Advanced Machine Learning
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Ensuring fair, consistent, and efficient exam evaluation
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarkingSetupPage;