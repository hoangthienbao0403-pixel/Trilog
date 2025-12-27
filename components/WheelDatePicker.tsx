import React, { useEffect, useRef, useState } from 'react';
import { Icons } from './Icons';

interface WheelDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
  title?: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

const generateArray = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const WheelDatePicker: React.FC<WheelDatePickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialDate,
  title = "Select Date"
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const years = generateArray(2020, 2030);
  const months = generateArray(1, 12);
  // Dynamic days based on year/month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const days = generateArray(1, getDaysInMonth(selectedYear, selectedMonth));

  // Update logic when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedYear(initialDate.getFullYear());
      setSelectedMonth(initialDate.getMonth() + 1);
      setSelectedDay(initialDate.getDate());
    }
  }, [isOpen, initialDate]);

  // Adjust day if month changes and day is out of range
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedYear, selectedMonth]);

  const handleSave = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onSelect(date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium px-2 py-1"
          >
            Cancel
          </button>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={handleSave} 
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold px-2 py-1"
          >
            Done
          </button>
        </div>

        {/* Picker Columns Container */}
        <div className="relative h-[200px] flex justify-center items-center overflow-hidden mask-gradient-to-b">
          {/* Highlight Bar */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-[40px] bg-slate-100/50 dark:bg-slate-800/50 rounded-lg pointer-events-none border-y border-indigo-100/50 dark:border-indigo-900/30 z-0"></div>

          <div className="grid grid-cols-3 gap-4 w-full relative z-10">
            <ScrollColumn 
              items={years} 
              selectedValue={selectedYear} 
              onChange={setSelectedYear} 
              label="Year"
            />
            <ScrollColumn 
              items={months} 
              selectedValue={selectedMonth} 
              onChange={setSelectedMonth} 
              label="Month"
              format={(m) => new Date(2000, m-1, 1).toLocaleString('default', { month: 'short' })}
            />
            <ScrollColumn 
              items={days} 
              selectedValue={selectedDay} 
              onChange={setSelectedDay} 
              label="Day"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScrollColumnProps {
  items: number[];
  selectedValue: number;
  onChange: (val: number) => void;
  label: string;
  format?: (val: number) => string;
}

const ScrollColumn: React.FC<ScrollColumnProps> = ({ items, selectedValue, onChange, format }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Initial scroll position
  useEffect(() => {
    if (containerRef.current) {
      const index = items.indexOf(selectedValue);
      if (index !== -1) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, []);

  // Sync scroll to external value changes
  useEffect(() => {
    if (containerRef.current && !isScrolling.current) {
      const index = items.indexOf(selectedValue);
      if (index !== -1) {
         // containerRef.current.scrollTop = index * ITEM_HEIGHT; 
      }
    }
  }, [selectedValue, items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrolling.current = true;
    const target = e.currentTarget;
    const index = Math.round(target.scrollTop / ITEM_HEIGHT);
    if (items[index] !== undefined && items[index] !== selectedValue) {
       onChange(items[index]);
    }
    
    // Reset scrolling flag after a timeout
    clearTimeout((target as any)._scrollTimeout);
    (target as any)._scrollTimeout = setTimeout(() => {
      isScrolling.current = false;
      target.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="h-[200px] relative">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[80px]"
        onScroll={handleScroll}
      >
        {items.map((item) => (
          <div 
            key={item} 
            className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 ${
              item === selectedValue 
                ? 'text-slate-800 dark:text-slate-100 font-bold text-lg scale-110' 
                : 'text-slate-400 dark:text-slate-600 text-base scale-95'
            }`}
          >
            {format ? format(item) : item}
          </div>
        ))}
      </div>
    </div>
  );
};