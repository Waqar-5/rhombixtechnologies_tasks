import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { jobsApi } from '@/api/jobs';

const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

const statusLabels = {
  applied: 'Applied',
  'in-review': 'In review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  rejected: 'Rejected',
  hired: 'Hired'
};

export default function RecruiterAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .getAnalytics()
      .then((data) => setAnalytics(data.analytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const pipelineData = Object.entries(analytics?.statusBreakdown || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count
  }));

  const jobPerformanceData = (analytics?.topJobs || []).map((job) => ({
    name: job.title.length > 18 ? `${job.title.slice(0, 18)}…` : job.title,
    applicants: job.applicationsCount,
    views: job.views
  }));

  return (
    <div>
      <PageHeader title="Analytics" description="Understand how your job postings and pipeline are performing." />

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total jobs" value={analytics?.totalJobs ?? 0} icon={Briefcase} accent="primary" />
        <StatCard label="Open jobs" value={analytics?.openJobs ?? 0} icon={TrendingUp} accent="success" />
        <StatCard label="Total applicants" value={analytics?.totalApplications ?? 0} icon={Users} accent="secondary" />
        <StatCard label="Hired" value={analytics?.statusBreakdown?.hired ?? 0} icon={CheckCircle2} accent="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications by pipeline stage</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No application data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pipelineData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top jobs — views vs. applicants</CardTitle>
          </CardHeader>
          <CardContent>
            {jobPerformanceData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Post a job to see performance data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={jobPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="applicants" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
