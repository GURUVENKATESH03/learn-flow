import React, { useState } from 'react';
import { BarChart3, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Note, TaskItem } from '../../types';

interface LearningActivityChartProps {
  notes?: Note[];
  tasks?: TaskItem[];
}

interface DayActivity {
  day: string;
  fullDay: string;
  hours: number;
  tasksCompleted: number;
  notesCreated: number;
  topics: string[];
}

export const LearningActivityChart: React.FC<LearningActivityChartProps> = ({
  notes = [],
  tasks = [],
}) => {
  const [timeframe, setTimeframe] = useState<'this_week' | 'last_week'>('this_week');

  // Days definition starting with Monday (0 = Mon, 6 = Sun)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Current day index in Mon-Sun array (0-6)
  const todayRaw = new Date().getDay(); // 0 is Sun, 1 is Mon
  const todayIndex = todayRaw === 0 ? 6 : todayRaw - 1;

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);

  const completedTasks = tasks.filter((t) => t.completed);
  const totalNotes = notes.length;
  const totalCompletedTasks = completedTasks.length;

  const hasActivity = totalNotes > 0 || totalCompletedTasks > 0;

  // Distribute activity into days
  const dynamicData: DayActivity[] = days.map((day, idx) => {
    if (!hasActivity) {
      return {
        day,
        fullDay: fullDays[idx],
        hours: 0,
        tasksCompleted: 0,
        notesCreated: 0,
        topics: [],
      };
    }

    // Filter notes created on this day of week
    const notesOnThisDay = notes.filter((n) => {
      try {
        const d = new Date(n.createdAt);
        const dayNum = d.getDay();
        const mappedIdx = dayNum === 0 ? 6 : dayNum - 1;
        return mappedIdx === idx;
      } catch {
        return false;
      }
    });

    // If notes don't have valid dates or for today, fallback gracefully
    const isToday = idx === todayIndex;
    const notesCount = notesOnThisDay.length > 0 ? notesOnThisDay.length : isToday ? totalNotes : 0;
    const tasksCount = isToday ? totalCompletedTasks : 0;

    // Estimate hours: 30 mins per note, 20 mins per completed goal
    const hours = Number(((notesCount * 0.5) + (tasksCount * 0.35)).toFixed(1));

    const dayTopics = notesOnThisDay.flatMap((n) => n.tags || []);
    if (isToday && dayTopics.length === 0 && notes.length > 0) {
      dayTopics.push(...notes.flatMap((n) => n.tags || []).slice(0, 3));
    }

    return {
      day,
      fullDay: fullDays[idx],
      hours,
      tasksCompleted: tasksCount,
      notesCreated: notesCount,
      topics: Array.from(new Set(dayTopics)).slice(0, 4),
    };
  });

  const data = dynamicData;
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0).toFixed(1);
  const maxHours = Math.max(1.5, ...data.map((d) => d.hours));
  const activeDay = data[selectedDayIndex] || data[todayIndex] || data[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header with Title and Timeframe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Learning Activity
            </h3>
            <p className="text-xs text-slate-400">
              {hasActivity
                ? `${totalHours} hrs logged this week · ${totalCompletedTasks} goals completed`
                : 'Zero hours recorded · Track your focus sessions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeframe('this_week')}
            className={`px-2.5 py-1 rounded-lg transition ${
              timeframe === 'this_week'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('last_week')}
            className={`px-2.5 py-1 rounded-lg transition ${
              timeframe === 'last_week'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last Week
          </button>
        </div>
      </div>

      {!hasActivity ? (
        /* Clean Zero-Data Empty State */
        <div className="py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No Study Activity Logged Yet
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            As you check off daily focus goals and write notes, your study hours and activity distribution will visualize automatically here.
          </p>
        </div>
      ) : (
        /* Interactive Bar Chart */
        <>
          <div className="relative pt-4 pb-2">
            <div className="flex items-end justify-between h-36 gap-2 sm:gap-3 px-1">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between h-28 text-[10px] text-slate-400 font-mono pr-2 select-none">
                <span>{maxHours.toFixed(1)}h</span>
                <span>{(maxHours / 2).toFixed(1)}h</span>
                <span>0h</span>
              </div>

              {/* Day Bars */}
              {data.map((item, idx) => {
                const isSelected = selectedDayIndex === idx;
                const isToday = idx === todayIndex;
                const heightPercent =
                  maxHours > 0
                    ? Math.min(100, Math.max(item.hours > 0 ? 15 : 6, (item.hours / maxHours) * 100))
                    : 6;

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedDayIndex(idx)}
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-full flex items-end justify-center h-28 relative">
                      {isSelected && (
                        <div className="absolute -top-7 bg-indigo-950 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md animate-in fade-in z-10 whitespace-nowrap">
                          {item.hours}h
                        </div>
                      )}

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-t-xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-indigo-600 ring-2 ring-indigo-400/50 shadow-md shadow-indigo-500/25'
                            : item.hours > 0
                            ? 'bg-indigo-100 dark:bg-indigo-950/70 hover:bg-indigo-200 dark:hover:bg-indigo-900/80'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col items-center mt-2">
                      <span
                        className={`text-xs font-bold transition ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isToday
                            ? 'text-slate-900 dark:text-white font-extrabold'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Breakdown */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {activeDay.fullDay} Summary
              </span>
              <p className="text-[11px] text-slate-400">
                {activeDay.hours > 0
                  ? `${activeDay.hours} hours logged · ${activeDay.tasksCompleted} tasks completed · ${activeDay.notesCreated} notes`
                  : 'No activity recorded on this day'}
              </p>
            </div>

            {activeDay.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activeDay.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
