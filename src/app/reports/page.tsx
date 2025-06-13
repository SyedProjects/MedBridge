import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SessionStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  uniqueStudents: number;
  totalHours: number;
}

interface MonthlyStats {
  month: string;
  sessions: number;
  hours: number;
}

export default function Reports() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    uniqueStudents: 0,
    totalHours: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(sessionsRef, where('doctorId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const uniqueStudents = new Set();
        const monthlyData: { [key: string]: { sessions: number; hours: number } } = {};
        let completed = 0;
        let pending = 0;
        let cancelled = 0;
        let totalHours = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const month = new Date(data.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          
          // Update monthly stats
          if (!monthlyData[month]) {
            monthlyData[month] = { sessions: 0, hours: 0 };
          }
          monthlyData[month].sessions++;
          
          // Update status counts
          switch (data.status) {
            case 'completed':
              completed++;
              totalHours++;
              monthlyData[month].hours++;
              break;
            case 'pending':
              pending++;
              break;
            case 'cancelled':
              cancelled++;
              break;
          }

          // Track unique students
          uniqueStudents.add(data.studentId);
        });

        // Convert monthly data to array and sort by date
        const monthlyStatsArray = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          sessions: data.sessions,
          hours: data.hours,
        })).sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
        });

        setStats({
          total: querySnapshot.size,
          completed,
          pending,
          cancelled,
          uniqueStudents: uniqueStudents.size,
          totalHours,
        });
        setMonthlyStats(monthlyStatsArray);
        setLoading(false);
      } catch (err) {
        setError('Failed to load statistics. Please try again.');
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Session Reports
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Hours
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.totalHours}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Students Mentored
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.uniqueStudents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Sessions
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Session Status
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="mt-2 text-3xl font-semibold text-green-900">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-yellow-900">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">Cancelled</p>
                <p className="mt-2 text-3xl font-semibold text-red-900">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Monthly Breakdown
            </h3>
            <div className="space-y-4">
              {monthlyStats.map((month) => (
                <div key={month.month} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {month.month}
                    </h4>
                    <div className="flex space-x-4">
                      <div>
                        <p className="text-xs text-gray-500">Sessions</p>
                        <p className="text-sm font-medium text-gray-900">
                          {month.sessions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hours</p>
                        <p className="text-sm font-medium text-gray-900">
                          {month.hours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 