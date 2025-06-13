import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface TimeSlot {
  date: string;
  times: string[];
}

interface Availability {
  slots: TimeSlot[];
}

const timeOptions = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM'
];

export default function Availability() {
  const { user } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability>({ slots: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.availability) {
            setAvailability({ slots: data.availability });
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load availability. Please try again.');
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const newSlot: TimeSlot = {
        date: selectedDate,
        times: selectedTimes,
      };

      const updatedSlots = [
        ...availability.slots.filter(slot => slot.date !== selectedDate),
        newSlot,
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      await updateDoc(doc(db, 'users', user.uid), {
        availability: updatedSlots,
      });

      setAvailability({ slots: updatedSlots });
      setSelectedDate('');
      setSelectedTimes([]);
      setSuccess('Availability updated successfully!');
    } catch (err) {
      setError('Failed to update availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time].sort()
    );
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const existingSlot = availability.slots.find(slot => slot.date === date);
    setSelectedTimes(existingSlot?.times || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Generate next 30 days for date selection
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Manage Availability
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {dateOptions.map(date => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`${
                        selectedDate === date
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } p-4 border rounded-lg text-center focus:outline-none`}
                    >
                      {new Date(date).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Available Times
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {timeOptions.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeToggle(time)}
                        className={`${
                          selectedTimes.includes(time)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } p-4 border rounded-lg text-center focus:outline-none`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {selectedDate && (
                <div>
                  <button
                    onClick={handleSave}
                    disabled={saving || selectedTimes.length === 0}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      (saving || selectedTimes.length === 0) ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save Availability'}
                  </button>
                </div>
              )}

              {/* Current Availability */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Current Availability
                </h3>
                {availability.slots.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No availability set yet. Select dates and times above to add availability.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {availability.slots.map(slot => (
                      <div
                        key={slot.date}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-900">
                          {new Date(slot.date).toLocaleDateString()}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {slot.times.map(time => (
                            <span
                              key={time}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {time}
                            </span>
                          ))}
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
    </div>
  );
} 