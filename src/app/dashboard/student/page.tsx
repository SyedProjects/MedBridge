import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Session {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('studentId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const sessionData: Session[] = [];
      let hours = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionData.push({
          id: doc.id,
          doctorName: data.doctorName,
          specialty: data.specialty,
          date: data.date,
          time: data.time,
          status: data.status,
        });
        if (data.status === 'completed') {
          hours += 1; // Assuming each session is 1 hour
        }
      });

      setSessions(sessionData);
      setTotalHours(hours);
    };

    fetchSessions();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.displayName || 'Student'}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              You've completed {totalHours} hours of shadowing
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Link
            href="/sessions/book"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Book New Session</h3>
                <p className="text-sm text-gray-500">Find and book shadowing opportunities</p>
              </div>
            </div>
          </Link>

          <Link
            href="/certificates"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Certificates</h3>
                <p className="text-sm text-gray-500">View and download your certificates</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                <p className="text-sm text-gray-500">Update your information</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
            <div className="mt-4">
              {sessions.filter(s => s.status === 'upcoming').length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming sessions scheduled</p>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.status === 'upcoming')
                    .map(session => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">
                              {session.doctorName}
                            </h4>
                            <p className="text-sm text-gray-500">{session.specialty}</p>
                            <p className="text-sm text-gray-500">
                              {session.date} at {session.time}
                            </p>
                          </div>
                          <Link
                            href={`/sessions/${session.id}`}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 