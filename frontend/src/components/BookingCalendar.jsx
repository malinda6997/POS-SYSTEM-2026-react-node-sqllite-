import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BookingCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500' };
      case 'Processing':
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', badge: 'bg-gray-500' };
      case 'Pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500' };
      case 'Cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', badge: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', badge: 'bg-gray-500' };
    }
  };

  const getBookingsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return bookings.filter((booking) => booking.event_date === dateStr);
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings
      .filter(b => new Date(b.event_date) >= today)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 5);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().getDate());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const upcomingBookings = getUpcomingBookings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-black/95 dark:bg-black border border-gray-900 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Calendar */}
        <div className="lg:col-span-2 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">{monthName}</h2>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevMonth}
                className="p-2.5 hover:bg-gray-900 rounded-lg transition-all"
              >
                <ChevronLeft size={22} className="text-gray-500 hover:text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-lg transition-all"
              >
                Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextMonth}
                className="p-2.5 hover:bg-gray-900 rounded-lg transition-all"
              >
                <ChevronRight size={22} className="text-gray-500 hover:text-white" />
              </motion.button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-500 text-sm py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {emptyDays.map((day) => (
              <div
                key={`empty-${day}`}
                className="aspect-square bg-gray-900/30 rounded-xl"
              />
            ))}

            {/* Calendar days */}
            {daysArray.map((day) => {
              const dayBookings = getBookingsForDate(day);
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();
              const isSelected = day === selectedDate;

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-xl transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-gray-900 ring-2 ring-gray-500 shadow-lg'
                      : isToday
                      ? 'bg-gray-900/60 border border-gray-700'
                      : 'bg-gray-900/40 hover:bg-gray-900/60 border border-gray-900'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <span className="text-sm font-bold text-white">{day}</span>
                    <div className="space-y-1 min-h-0">
                      {dayBookings.slice(0, 3).map((booking, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`text-xs px-2 py-0.5 rounded font-semibold truncate ${
                            getStatusColor(booking.status).bg
                          } ${getStatusColor(booking.status).text}`}
                          title={booking.customer_name}
                        >
                          {booking.customer_name.split(' ')[0]}
                        </motion.div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayBookings.length - 3}</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right sidebar - Selected date events + Upcoming */}
        <div className="border-t lg:border-t-0 lg:border-l border-gray-900 p-8 bg-gray-900/50 flex flex-col">
          {/* Selected Date Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              {selectedDate ? `${selectedDate} ${monthName.split(' ')[0]}` : 'No date selected'}
            </h3>
            
            {selectedDate ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedDateBookings.length > 0 ? (
                  selectedDateBookings.map((booking, idx) => {
                    const colors = getStatusColor(booking.status);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${colors.bg} border-gray-700`}
                      >
                        <p className={`font-semibold text-sm ${colors.text}`}>
                          {booking.customer_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{booking.event_time || '–'}</p>
                        <p className="text-xs text-gray-500 mt-2">Rs. {booking.total_amount?.toLocaleString()}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold text-white ${colors.badge}`}>
                          {booking.status}
                        </span>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 py-4">No bookings on this date</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">Click a date to view events</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-900 my-4" />

          {/* Upcoming Events Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Upcoming Events</h3>
            
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {upcomingBookings.map((booking, idx) => {
                  const colors = getStatusColor(booking.status);
                  const bookingDate = new Date(booking.event_date);
                  const formattedDate = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border ${colors.bg} border-gray-700`}
                    >
                      <p className={`font-semibold text-sm ${colors.text}`}>
                        {booking.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formattedDate} • {booking.event_time || '–'}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingCalendar;
