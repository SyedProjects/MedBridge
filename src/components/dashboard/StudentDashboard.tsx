import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
}

interface Session {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined';
}

export default function StudentDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsRef = collection(db, 'users');
      const q = query(doctorsRef, where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(q);
      const doctorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Doctor));
      setDoctors(doctorsList);
    };

    const fetchSessions = async () => {
      if (!auth.currentUser) return;
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('studentId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const sessionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));
      setSessions(sessionsList);
    };

    fetchDoctors();
    fetchSessions();
  }, []);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedDoctor || !date || !time) return;

    try {
      const sessionRef = collection(db, 'sessions');
      await addDoc(sessionRef, {
        studentId: auth.currentUser.uid,
        doctorId: selectedDoctor,
        date,
        time,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      // Refresh sessions
      const q = query(sessionRef, where('studentId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const sessionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      
      {/* Book Session Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Book a Shadowing Session</h2>
        <form onSubmit={handleBookSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Book Session
          </button>
        </form>
      </div>
      
      {/* Upcoming Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{session.doctorName}</p>
                <p className="text-sm text-gray-500">
                  {session.date} at {session.time}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  session.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'declined'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {session.status}
              </span>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-500">No sessions booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 