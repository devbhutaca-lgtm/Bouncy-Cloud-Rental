
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
  isBefore, startOfToday, isToday, isWithinInterval, parseISO, isSameDay 
} from 'date-fns';

interface BookingCalendarProps {
  startDate: string;
  endDate: string;
  onRangeSelect: (start: string, end: string) => void;
  bookedDates: string[]; // List of all individually booked dates
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ startDate, endDate, onRangeSelect, bookedDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfToday();

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      onRangeSelect(dateStr, '');
    } else {
      // Completing a range
      const start = parseISO(startDate);
      const end = parseISO(dateStr);

      if (isBefore(end, start)) {
        onRangeSelect(dateStr, '');
      } else {
        // Check if any date in the range is booked
        const interval = eachDayOfInterval({ start, end });
        const hasOverlap = interval.some(d => bookedDates.includes(format(d, 'yyyy-MM-dd')));
        
        if (hasOverlap) {
          alert("Sorry, one or more dates in your selected range are already booked.");
          onRangeSelect(dateStr, '');
        } else {
          onRangeSelect(startDate, dateStr);
        }
      }
    }
  };

  const isDateSelected = (dateStr: string) => {
    if (startDate && endDate) {
      return isWithinInterval(parseISO(dateStr), { 
        start: parseISO(startDate), 
        end: parseISO(endDate) 
      });
    }
    return startDate === dateStr;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-blue-600" size={20} />
          <h2 className="font-semibold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}

          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isBooked = bookedDates.includes(dateStr);
            const isPast = isBefore(day, today);
            const selected = isDateSelected(dateStr);
            const isStart = startDate === dateStr;
            const isEnd = endDate === dateStr;
            const isTodayDate = isToday(day);

            const isDisabled = isBooked || isPast;

            return (
              <button
                key={dateStr}
                disabled={isDisabled}
                onClick={() => handleDateClick(dateStr)}
                className={`
                  relative h-12 flex flex-col items-center justify-center text-sm font-medium transition-all
                  ${selected ? 'bg-blue-600 text-white z-10' : ''}
                  ${isStart ? 'rounded-l-xl' : ''}
                  ${isEnd ? 'rounded-r-xl' : ''}
                  ${selected && !isStart && !isEnd ? '' : 'rounded-xl'}
                  ${!selected && !isDisabled ? 'hover:bg-blue-50 text-slate-700 border border-slate-100' : ''}
                  ${isBooked ? 'bg-rose-50 text-rose-300 cursor-not-allowed' : ''}
                  ${isPast && !isBooked ? 'text-slate-200 cursor-not-allowed' : ''}
                  ${isTodayDate && !selected ? 'text-blue-600 border-blue-200 font-bold' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-600" /><span>Selected Range</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-slate-200" /><span>Available</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-100" /><span>Booked</span></div>
      </div>
    </div>
  );
};
