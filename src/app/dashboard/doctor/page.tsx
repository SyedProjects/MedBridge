import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Session {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('doctorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const sessionData: Session[] = [];
      const uniqueStudents = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionData.push({
          id: doc.id,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          date: data.date,
          time: data.time,
          status: data.status,
        });
        uniqueStudents.add(data.studentId);
      });

      setSessions(sessionData);
      setTotalStudents(uniqueStudents.size);
    };

    fetchSessions();
  }, [user]);

  const handleSessionAction = async (sessionId: string, newStatus: Session['status']) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { status: newStatus });
      
      // Update local state
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus }
            : session
        )
      );
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, Dr. {user?.displayName || 'Doctor'}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              You've mentored {totalStudents} students
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Link
            href="/availability"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Set Availability</h3>
                <p className="text-sm text-gray-500">Manage your available time slots</p>
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

          <Link
            href="/reports"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">View session statistics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Pending Sessions */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
            <div className="mt-4">
              {sessions.filter(s => s.status === 'pending').length === 0 ? (
                <p className="text-sm text-gray-500">No pending session requests</p>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.status === 'pending')
                    .map(session => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">
                              {session.studentName}
                            </h4>
                            <p className="text-sm text-gray-500">{session.studentEmail}</p>
                            <p className="text-sm text-gray-500">
                              {session.date} at {session.time}
                            </p>
                          </div>
                          <div className="space-x-2">
                            <button
                              onClick={() => handleSessionAction(session.id, 'approved')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSessionAction(session.id, 'cancelled')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
            <div className="mt-4">
              {sessions.filter(s => s.status === 'approved').length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming sessions</p>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.status === 'approved')
                    .map(session => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">
                              {session.studentName}
                            </h4>
                            <p className="text-sm text-gray-500">{session.studentEmail}</p>
                            <p className="text-sm text-gray-500">
                              {session.date} at {session.time}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSessionAction(session.id, 'completed')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Mark Complete
                          </button>
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