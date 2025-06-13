import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface Session {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined';
}

export default function DoctorDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!auth.currentUser) return;
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('doctorId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const sessionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));
      setSessions(sessionsList);
    };

    fetchSessions();
  }, []);

  const handleSessionStatus = async (sessionId: string, status: 'approved' | 'declined') => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { status });
      
      // Update local state
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? { ...session, status } : session
        )
      );
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>
      
      {/* Pending Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
        <div className="space-y-4">
          {sessions
            .filter(session => session.status === 'pending')
            .map(session => (
              <div
                key={session.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{session.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {session.date} at {session.time}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleSessionStatus(session.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleSessionStatus(session.id, 'declined')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          {sessions.filter(session => session.status === 'pending').length === 0 && (
            <p className="text-gray-500">No pending requests.</p>
          )}
        </div>
      </div>
      
      {/* Approved Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <div className="space-y-4">
          {sessions
            .filter(session => session.status === 'approved')
            .map(session => (
              <div
                key={session.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{session.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {session.date} at {session.time}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Approved
                </span>
              </div>
            ))}
          {sessions.filter(session => session.status === 'approved').length === 0 && (
            <p className="text-gray-500">No upcoming sessions.</p>
          )}
        </div>
      </div>
    </div>
  );
} 