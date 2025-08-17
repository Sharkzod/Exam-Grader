type PageType = 'home' | 'jobs' | 'pricing' | 'about' | 'login' | 'register' | 'job-detail';

interface NavigationBarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  posted: string;
  duration: string;
  rate: string;
  applications: number;
  description: string;
  skills: string[];
  featured?: boolean;
}

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    rate: string;
    type: string;
    duration: string;
    posted: string;
    skills: string[];
    description: string;
    featured: boolean;
    applications: number;
  };
}

interface PricingCardProps {
  title: string;
  price: string | number;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}

interface JobsPageProps {
  selectedJob: Job | null;
  setCurrentPage: (page: PageType) => void;
  setSelectedJob: (job: Job) => void;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: 'contractor' | 'company';
  agreedToTerms: boolean;
}

interface RegisterPageProps {
  setCurrentPage: (page: PageType) => void;
}
