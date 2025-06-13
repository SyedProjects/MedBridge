import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateCertificate } from '@/utils/certificateGenerator';

interface Session {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  status: 'completed';
}

export default function Certificates() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      if (!user) return;

      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(
          sessionsRef,
          where('studentId', '==', user.uid),
          where('status', '==', 'completed')
        );
        const querySnapshot = await getDocs(q);
        
        const sessionData: Session[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          sessionData.push({
            id: doc.id,
            doctorName: data.doctorName,
            specialty: data.specialty,
            date: data.date,
            status: 'completed',
          });
        });

        setSessions(sessionData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load certificates. Please try again.');
        setLoading(false);
      }
    };

    fetchCompletedSessions();
  }, [user]);

  const handleDownload = (session: Session) => {
    const certificateData = {
      studentName: user?.displayName || 'Student',
      doctorName: session.doctorName,
      specialty: session.specialty,
      hours: 1, // Assuming each session is 1 hour
      date: session.date,
    };

    const pdfDataUrl = generateCertificate(certificateData);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = `MedBridge_Certificate_${session.date.replace(/\//g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Certificates
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No certificates yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete shadowing sessions to earn certificates.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.specialty} Shadowing
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          with Dr. {session.doctorName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDownload(session)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Download
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
    </div>
  );
} 