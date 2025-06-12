import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: {
    date: string;
    times: string[];
  }[];
}

export default function BookSession() {
  const { user } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'users');
        const q = query(doctorsRef, where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        
        const doctorData: Doctor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          doctorData.push({
            id: doc.id,
            name: data.name,
            specialty: data.specialty,
            availability: data.availability || [],
          });
        });

        setDoctors(doctorData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctors. Please try again.');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleBookSession = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      await addDoc(collection(db, 'sessions'), {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        studentId: user.uid,
        studentName: user.displayName,
        studentEmail: user.email,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      router.push('/dashboard/student');
    } catch (err) {
      setError('Failed to book session. Please try again.');
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Book a Shadowing Session
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Doctor Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select a Doctor
                </label>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`${
                        selectedDoctor?.id === doctor.id
                          ? 'ring-2 ring-indigo-500'
                          : 'hover:border-gray-400'
                      } p-4 border rounded-lg text-left focus:outline-none`}
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select a Date
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    {selectedDoctor.availability.map((slot) => (
                      <button
                        key={slot.date}
                        onClick={() => setSelectedDate(slot.date)}
                        className={`${
                          selectedDate === slot.date
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } p-4 border rounded-lg text-center focus:outline-none`}
                      >
                        {new Date(slot.date).toLocaleDateString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select a Time
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-4">
                    {selectedDoctor.availability
                      .find((slot) => slot.date === selectedDate)
                      ?.times.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`${
                            selectedTime === time
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          } p-2 border rounded-lg text-center focus:outline-none`}
                        >
                          {time}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              {selectedDoctor && selectedDate && selectedTime && (
                <div className="mt-6">
                  <button
                    onClick={handleBookSession}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Book Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 