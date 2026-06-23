import { useState } from 'react';

import CalendarView from '@/components/calendar/calendar-view';
import type { CalendarEvent, CalendarSpecialDay } from '@/components/calendar/types';
import { TooltipProvider } from '@/components/ui/tooltip';

const initialEvents: CalendarEvent[] = [
    {
        id: 'e1',
        date: '2026-06-03',
        label: '產品需求會議',
        tooltip: '產品需求會議 · 10:00 會議室 A',
        dotColor: 'bg-blue-500',
    },
    {
        id: 'e2',
        date: '2026-06-08',
        endDate: '2026-06-12',
        label: 'Sprint 14',
        tooltip: 'Sprint 14 開發週期（6/8 – 6/12）',
        dotColor: 'bg-violet-500',
        barColor: 'bg-violet-500/15',   // 暗色主題：半透明紫
        barTextColor: 'text-violet-300',
    },
    {
        id: 'e3',
        date: '2026-06-10',
        label: '設計審查',
        tooltip: '設計審查 · Figma 連結已寄出',
        dotColor: 'bg-pink-500',
    },
    {
        id: 'e4',
        date: '2026-06-15',
        endDate: '2026-06-19',
        label: '客戶試營運',
        tooltip: '客戶試營運（6/15 – 6/19）',
        dotColor: 'bg-amber-500',
        barColor: 'bg-amber-500/15',    // 暗色主題：半透明琥珀
        barTextColor: 'text-amber-300',
    },
    {
        id: 'e5',
        date: '2026-06-18',
        label: '版本發佈 v0.2',
        tooltip: '版本發佈 v0.2 · 上線後監控',
        dotColor: 'bg-emerald-500',
    },
    {
        id: 'e6',
        date: '2026-06-23',
        label: '今日站立會議',
        dotColor: 'bg-sky-500',
    },
    {
        id: 'e7',
        date: '2026-06-23',
        label: '程式碼審查',
        dotColor: 'bg-indigo-500',
    },
    {
        id: 'e8',
        date: '2026-06-23',
        label: 'UI 微調',
        dotColor: 'bg-rose-500',
    },
    {
        id: 'e9',
        date: '2026-06-26',
        label: '月度回顧',
        tooltip: '月度回顧 · 整理本月成果',
        dotColor: 'bg-teal-500',
    },
];

const specialDays: CalendarSpecialDay[] = [
    {
        date: '2026-06-19',
        label: '端午節',
        color: 'bg-red-500/10',         // 暗色主題：半透明紅
        textColor: 'text-red-400',
    },
];

export default function CalendarDemo() {
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-06-23'));

    return (
        <TooltipProvider delayDuration={150}>
            <CalendarView
                events={events}
                selectedDate={selectedDate}
                specialDays={specialDays}
                maxVisibleEvents={3}
                onDateSelect={(date) => setSelectedDate(date)}
                onEventMove={(eventId, newDate, newEndDate) =>
                    setEvents((prev) =>
                        prev.map((ev) =>
                            ev.id === eventId
                                ? { ...ev, date: newDate, endDate: newEndDate }
                                : ev
                        )
                    )
                }
            />
        </TooltipProvider>
    );
}
