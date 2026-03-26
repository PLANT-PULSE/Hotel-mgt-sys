'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface AvailableDate {
  date: string;
  available: number;
}

export default function PublicCalendar({ roomTypeId }: { roomTypeId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const res = await fetch(
        `/api/calendar/availability?roomTypeId=${roomTypeId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailabilities(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [currentDate, roomTypeId]);



  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      // Ensure we format the date specifically as YYYY-MM-DD in local time
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-');
      days.push({ day: i, date: dateStr });
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDayStatusClass = (dateStr: string | null) => {
    if (!dateStr) return 'bg-gray-50';
    const avail = availabilities.find(a => a.date === dateStr);
    
    // Past dates
    if (new Date(dateStr) < new Date(new Date().setHours(0,0,0,0))) {
      return 'bg-gray-100 text-gray-400 opacity-50';
    }

    if (!avail) return 'bg-white border-green-100'; // Default un-fetched/available
    if (avail.available > 0) return 'bg-green-50 text-green-700 font-semibold border-green-200';
    return 'bg-red-50 text-red-500 line-through opacity-70';
  };

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 border-r last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="grid grid-cols-7">
            {days.map((dayObj, index) => (
              <div 
                key={index} 
                className={`
                  h-10 border-r border-b last:border-r-0 flex items-center justify-center text-xs transition-colors
                  ${getDayStatusClass(dayObj.date)}
                `}
                title={dayObj.date ? dayObj.date : ''}
              >
                {dayObj.day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-200 rounded-sm"></span> Available</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm"></span> Booked</div>
      </div>
    </div>
  );
}
