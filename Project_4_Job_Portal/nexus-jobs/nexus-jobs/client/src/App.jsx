import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import PublicLayout from '@/components/layout/PublicLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute, RoleRoute } from '@/routes/guards';

import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Companies from '@/pages/Companies';
import CompanyProfile from '@/pages/CompanyProfile';
import NotFound from '@/pages/NotFound';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from '@/pages/VerifyEmail';

import SeekerOverview from '@/pages/seeker/Overview';
import SeekerApplications from '@/pages/seeker/Applications';
import SeekerSavedJobs from '@/pages/seeker/SavedJobs';
import SeekerProfile from '@/pages/seeker/Profile';

import RecruiterOverview from '@/pages/recruiter/Overview';
import RecruiterJobsList from '@/pages/recruiter/JobsList';
import RecruiterJobForm from '@/pages/recruiter/JobForm';
import RecruiterApplicants from '@/pages/recruiter/Applicants';
import RecruiterAnalytics from '@/pages/recruiter/Analytics';
import RecruiterCompany from '@/pages/recruiter/Company';
import RecruiterProfile from '@/pages/recruiter/Profile';

import NotificationsList from '@/components/common/NotificationsList';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-body text-sm',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem'
          }
        }}
      />

      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<CompanyProfile />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Job seeker dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute role="jobseeker" />}>
            <Route path="/seeker" element={<DashboardLayout role="jobseeker" />}>
              <Route index element={<SeekerOverview />} />
              <Route path="applications" element={<SeekerApplications />} />
              <Route path="saved" element={<SeekerSavedJobs />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="profile" element={<SeekerProfile />} />
            </Route>
          </Route>

          {/* Recruiter dashboard */}
          <Route element={<RoleRoute role="recruiter" />}>
            <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
              <Route index element={<RecruiterOverview />} />
              <Route path="jobs" element={<RecruiterJobsList />} />
              <Route path="jobs/new" element={<RecruiterJobForm />} />
              <Route path="jobs/:id/edit" element={<RecruiterJobForm />} />
              <Route path="jobs/:jobId/applicants" element={<RecruiterApplicants />} />
              <Route path="applicants" element={<RecruiterApplicants />} />
              <Route path="analytics" element={<RecruiterAnalytics />} />
              <Route path="company" element={<RecruiterCompany />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="profile" element={<RecruiterProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
