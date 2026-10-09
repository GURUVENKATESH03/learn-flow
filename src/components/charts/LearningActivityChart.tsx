import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, Sparkles } from 'lucide-react';

interface DayActivity {
  day: string;
  fullDay: string;
  hours: number;
  tasksCompleted: number;
  topics: string[];
}

export const LearningActivityChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'this_week' | 'last_week'>('this_week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(4); // Friday selected by default (peak day)

  const thisWeekData: DayActivity[] = [
    { day: 'Mon', fullDay: 'Monday', hours: 1.5, tasksCompleted: 2, topics: ['Kafka Architecture', 'Zookeeper vs KRaft'] },
    { day: 'Tue', fullDay: 'Tuesday', hours: 1.0, tasksCompleted: 1, topics: ['Vue.js Composition API'] },
    { day: 'Wed', fullDay: 'Wednesday', hours: 2.0, tasksCompleted: 3, topics: ['Spring Boot 3 Filters', 'SecurityContext'] },
    { day: 'Thu', fullDay: 'Thursday', hours: 2.8, tasksCompleted: 4, topics: ['PostgreSQL B-Tree Indexing'] },
    { day: 'Fri', fullDay: 'Friday', hours: 4.2, tasksCompleted: 6, topics: ['JWT Token Validation', 'Food Saver API'] },
    { day: 'Sat', fullDay: 'Saturday', hours: 1.8, tasksCompleted: 2, topics: ['Docker multi-stage builds'] },
    { day: 'Sun', fullDay: 'Sunday', hours: 2.2, tasksCompleted: 3, topics: ['Resume Analyzer NER model'] },
  ];

  const lastWeekData: DayActivity[] = [
    { day: 'Mon', fullDay: 'Monday', hours: 2.0, tasksCompleted: 3, topics: ['Java Stream API'] },
    { day: 'Tue', fullDay: 'Tuesday', hours: 2.5, tasksCompleted: 3, topics: ['Spring Data JPA'] },
    { day: 'Wed', fullDay: 'Wednesday', hours: 1.5, tasksCompleted: 2, topics: ['Flyway DB Migrations'] },
    { day: 'Thu', fullDay: 'Thursday', hours: 3.0, tasksCompleted: 4, topics: ['REST API Exceptions'] },
    { day: 'Fri', fullDay: 'Friday', hours: 3.5, tasksCompleted: 5, topics: ['Spring Security Architecture'] },
    { day: 'Sat', fullDay: 'Saturday', hours: 2.0, tasksCompleted: 2, topics: ['DSA Trees & Graphs'] },
    { day: 'Sun', fullDay: 'Sunday', hours: 1.2, tasksCompleted: 1, topics: ['System Design Basics'] },
  ];

  const data = timeframe === 'this_week' ? thisWeekData : lastWeekData;
  const maxHours = 5; // Y-axis max
  const activeDay = data[selectedDayIndex] || data[4];
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0).toFixed(1);
  const avgHours = (Number(totalHours) / data.length).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header with Title and Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Learning Activity</h3>
            <p className="text-[11px] text-slate-400">Total {totalHours} hrs • {avgHours}h daily avg</p>
          </div>
        </div>

        {/* Dropdown Pill */}
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
        </select>
      </div>

      {/* Main Interactive Bar Chart with Y-Axis */}
      <div className="relative pt-4 pb-2">
        <div className="flex items-end justify-between h-40 gap-2 px-1">
          {/* Y-Axis scale labels */}
          <div className="flex flex-col justify-between h-32 text-[10px] text-slate-400 font-mono pr-1 select-none">
            <span>4h</span>
            <span>3h</span>
            <span>2h</span>
            <span>1h</span>
            <span>0h</span>
          </div>

          {/* Vertical Columns for Each Day */}
          {data.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            const barHeightPercent = Math.min(100, Math.max(8, (item.hours / maxHours) * 100));

            return (
              <div
                key={item.day}
                onClick={() => setSelectedDayIndex(idx)}
                className="flex-1 flex flex-col items-center cursor-pointer group"
              >
                {/* Bar Container */}
                <div className="w-full flex items-end justify-center h-32 relative">
                  {/* Floating tooltip on selection */}
                  {isSelected && (
                    <div className="absolute -top-7 bg-indigo-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md animate-in fade-in slide-in-from-bottom-1 z-10 whitespace-nowrap">
                      {item.hours}h
                    </div>
                  )}

                  {/* The bar element */}
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                    }`}
                  >
                    {/* Subtle top indicator cap */}
                    <div
                      className={`w-full h-1.5 rounded-t-xl ${
                        isSelected ? 'bg-indigo-300' : 'bg-indigo-200 dark:bg-indigo-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Day label */}
                <span
                  className={`text-[11px] font-bold mt-2 transition ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Panel */}
      {activeDay && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeDay.fullDay} Focus
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                {activeDay.hours} hours logged
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                {activeDay.tasksCompleted} tasks done
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {activeDay.topics.map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                • {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
