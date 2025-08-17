"use client";
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, ClipboardList, Settings, Download, Play, CheckCircle, X, AlertCircle, HelpCircle, Eye, Trash2, Plus, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: 'questions' | 'answers';
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  file: File; // Store the actual File object here
}

interface GradingResult {
  success: boolean;
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
  const [activeTab, setActiveTab] = useState<'upload' | 'guidelines' | 'resources' | 'results'>('upload');
  const [gradingResults, setGradingResults] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string>('');
  const [apiUrl] = useState('https://exam-grader-bot.onrender.com');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<'questions' | 'answers'>('questions');


  const generateId = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => console.log('Backend status:', data))
      .catch(err => console.error('Connection error:', err));
  }, []);

  // useEffect(() => {
  //   if (uploadedScripts.length > 0 && 
  //       uploadedScripts.every(file => file.status === 'success') && 
  //       activeTab === 'upload') {
  //     setActiveTab('guidelines');
  //   }
  // }, [uploadedScripts, activeTab]);

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
    type: currentUploadType, // Use the selected upload type
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
      // 1. Validate we have uploaded files
      if (uploadedScripts.length === 0) {
        throw new Error('Please upload at least one file');
      }

      // 2. Find the first file marked as 'questions'
      const questionsFileItem = uploadedScripts.find(f => f.type === 'questions');
      if (!questionsFileItem) {
        throw new Error('No questions file found - please mark a file as questions');
      }

      // 3. Get the actual File object
      const questionsFile = questionsFileItem.file;

      // 4. Verify file has content
      if (questionsFile.size === 0) {
        throw new Error('Questions file is empty');
      }

      // 5. Prepare FormData
      const formData = new FormData();
      formData.append('questions_file', questionsFile, questionsFile.name);

      // 6. Add answers file if exists
      const answersFileItem = uploadedScripts.find(f => f.type === 'answers');
      if (answersFileItem) {
        const answersFile = answersFileItem.file;
        formData.append('answers_file', answersFile, answersFile.name);
      }

      // 7. Add guidelines if provided
      if (guidelines.trim()) {
        formData.append('guidelines', guidelines);
      }

      // 8. Debug output
      console.log('Submitting to server:', {
        questionsFileName: questionsFile.name,
        questionsFileSize: questionsFile.size,
        answersFileName: answersFileItem?.name || 'none',
        guidelinesLength: guidelines.length
      });

      // 9. Submit to backend
      const response = await fetch(`${apiUrl}/grade-exam`, {
        method: 'POST',
        body: formData
      });

      // 10. Handle response
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Grading failed');
      }

      const result = await response.json();
      setGradingResults(result);
      setActiveTab('results');

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

  const tabClasses = (tab: string) =>
    `px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Exam Marking Setup
          </h1>
          <p className="text-gray-600 text-lg">Upload scripts, define guidelines, and let AI handle the marking</p>
        </div>

        {/* Progress Indicator */}
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
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl shadow-inner">
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
            {gradingResults && (
              <button
                onClick={() => setActiveTab('results')}
                className={`ml-1 ${tabClasses('results')}`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Results
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Upload Scripts Tab */}
          {/* Upload Scripts Tab */}
{/* Upload Scripts Tab */}
{activeTab === 'upload' && (
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
    {/* File Header */}
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

    {/* File Details */}
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span>Size: {(file.size / 1024).toFixed(1)} KB</span>
        
      </div>
      
      
      
      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-xs text-gray-500">Ready to process</span>
      </div>
    </div>

    {/* Action buttons (optional) */}
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
        Preview
      </button>
      <button className="text-xs text-gray-500 hover:text-gray-700">
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
          {/* Guidelines Tab */}
          {activeTab === 'guidelines' && (
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
                    placeholder="Enter comprehensive marking guidelines here..."
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {guidelines.length} characters
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">
                  💡 These guidelines will ensure consistent and fair marking across all submitted scripts
                </div>
                <button
                  onClick={handleGuidelinesSubmit}
                  disabled={!guidelines.trim()}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    guidelines.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Guidelines
                </button>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
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

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="p-8">
              {isGrading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                  <p className="mt-4 text-lg font-medium text-gray-700">
                    AI is grading the exam...
                  </p>
                  <p className="text-sm text-gray-500">
                    This may take a few moments depending on the number of questions
                  </p>
                </div>
              ) : gradingResults ? (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Eye className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-gray-800">Grading Results</h2>
                    </div>
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
                              <p className="text-gray-800">{result.question}</p>
                            </div>
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Student Answer:</h4>
                              <p className="text-gray-800">{result.student_answer}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback:</h4>
                              <p className="text-gray-800">{result.feedback}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Summary */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Overall Feedback</h3>
                    <div className="text-gray-700">
                      {gradingResults.summary.percentage >= 80 ? (
                        <p>The student has demonstrated excellent understanding of the material with comprehensive answers and strong analytical skills.</p>
                      ) : gradingResults.summary.percentage >= 60 ? (
                        <p>The student shows good understanding of core concepts but could improve in depth of analysis and detail in responses.</p>
                      ) : (
                        <p>The student needs to strengthen their understanding of key concepts and provide more detailed, accurate responses.</p>
                      )}
                      <p className="mt-2">Areas for improvement: {gradingResults.detailed_results
                        .filter(r => r.score < r.max_marks * 0.7)
                        .map(r => `Question ${r.question_number}`)
                        .join(', ')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-500">
                    No grading results yet
                  </p>
                  <p className="text-sm text-gray-400">
                    Upload files and start the grading process to see results
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to Upload
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-y-4">
          {uploadedScripts.some(f => f.type === 'questions' && f.status === 'success') && (
            <div className="flex justify-center gap-4">
              {/* Start AI Marking Button */}
              <button
                onClick={startAIMarking}
                disabled={!guidelines.trim() || isGrading}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center transition-all duration-200 ${
                  guidelines.trim() && !isGrading
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGrading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Grading in Progress...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start AI Marking
                  </>
                )}
              </button>

              {/* Optional: Add a back button if needed */}
              {activeTab !== 'upload' && (
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Back to Upload
                </button>
              )}
            </div>
          )}

          {/* Error messages */}
          {!uploadedScripts.some(f => f.type === 'questions' && f.status === 'success') && (
            <p className="text-sm text-red-500">
              A questions file is required to start grading
            </p>
          )}
          {uploadedScripts.some(f => f.type === 'questions' && f.status === 'success') && !guidelines.trim() && (
            <p className="text-sm text-red-500">
              Please enter marking guidelines before starting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkingSetupPage;