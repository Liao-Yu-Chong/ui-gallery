'use client';

import { zhTW } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    parseISO,
    getDay,
    isAfter,
    isBefore,
    differenceInDays,
} from 'date-fns';

import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarSpecialDay } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── 常數 ────────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const DEFAULT_MAX_VISIBLE = 2;
const DATE_AREA_H = 28; // px — 日期數字列高度
const BAR_H = 20; // px — 跨天條狀高度
const BAR_GAP = 2; // px — 堆疊條狀間距

type View = 'month' | 'week' | 'day';
const VIEW_LABELS: Record<View, string> = { month: '月', week: '週', day: '日' };

// ─── 跨天事件輔助函式 ─────────────────────────────────────────────────────────

type WeekSpan = {
    event: CalendarEvent;
    startCol: number;
    endCol: number;
    isActualStart: boolean;
    isActualEnd: boolean;
    slot: number;
};

function computeWeekSpans(week: Date[], events: CalendarEvent[]): WeekSpan[] {
    const weekStart = week[0];
    const weekEnd = week[6];

    const candidates: Omit<WeekSpan, 'slot'>[] = [];

    for (const evt of events) {
        if (!evt.endDate) continue;
        const evtStart = parseISO(evt.date);
        const evtEnd = parseISO(evt.endDate);
        if (isAfter(evtStart, weekEnd) || isBefore(evtEnd, weekStart)) continue;

        candidates.push({
            event: evt,
            startCol: isBefore(evtStart, weekStart) ? 0 : getDay(evtStart),
            endCol: isAfter(evtEnd, weekEnd) ? 6 : getDay(evtEnd),
            isActualStart: !isBefore(evtStart, weekStart),
            isActualEnd: !isAfter(evtEnd, weekEnd),
        });
    }

    const occupancy: boolean[][] = [];
    return candidates.map(c => {
        let slot = 0;
        while (true) {
            if (!occupancy[slot]) occupancy[slot] = Array(7).fill(false);
            let fits = true;
            for (let col = c.startCol; col <= c.endCol; col++) {
                if (occupancy[slot][col]) {
                    fits = false;
                    break;
                }
            }
            if (fits) {
                for (let col = c.startCol; col <= c.endCol; col++) occupancy[slot][col] = true;
                return { ...c, slot };
            }
            slot++;
        }
    });
}

// ─── 拖拉資料型別 ────────────────────────────────────────────────────────────

type DragData = { event: CalendarEvent };

// ─── 可拖拉的單日事件點 ───────────────────────────────────────────────────────

function DraggableChip({ event, disabled }: { event: CalendarEvent; disabled: boolean }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: event.id,
        data: { event } as DragData,
        disabled,
    });

    const chip = (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
                'flex items-center gap-1 text-xs truncate',
                disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                isDragging && 'opacity-30'
            )}
        >
            <span className={cn('h-2 w-2 shrink-0 rounded-full', event.dotColor)} />
            <span className="truncate text-foreground">{event.label}</span>
        </div>
    );

    if (!event.tooltip) return chip;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{chip}</TooltipTrigger>
            <TooltipContent side="top" avoidCollisions={false}>
                {event.tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

// ─── 可拖拉的跨天條狀 ────────────────────────────────────────────────────────

type DraggableBarProps = {
    span: WeekSpan;
    dragId: string;
    disabled: boolean;
};

function DraggableBar({ span, dragId, disabled }: DraggableBarProps) {
    const { event, startCol, endCol, isActualStart, isActualEnd, slot } = span;
    const isInteractive = isActualStart && !disabled;

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: dragId,
        data: { event } as DragData,
        disabled: !isInteractive,
    });

    const bar = (
        <div
            ref={isInteractive ? setNodeRef : undefined}
            {...(isInteractive ? { ...attributes, ...listeners } : {})}
            onClick={e => e.stopPropagation()}
            className={cn(
                'absolute flex items-center text-xs font-medium overflow-hidden pointer-events-auto z-10',
                isActualStart ? 'rounded-l pl-2 border-l-2 border-current' : '',
                isActualEnd ? 'rounded-r pr-1.5' : '',
                event.barColor ?? 'bg-primary/20',
                event.barTextColor ?? 'text-primary',
                isInteractive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                isDragging && 'opacity-30'
            )}
            style={{
                left: `calc(${startCol} / 7 * 100%)`,
                width: `calc(${endCol - startCol + 1} / 7 * 100%)`,
                top: DATE_AREA_H + slot * (BAR_H + BAR_GAP),
                height: BAR_H,
            }}
        >
            {isActualStart && <span className="min-w-0 truncate">{event.label}</span>}
        </div>
    );

    if (!event.tooltip || !isActualStart) return bar;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{bar}</TooltipTrigger>
            <TooltipContent side="top" avoidCollisions={false}>
                {event.tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

// ─── 日期格（單一格子）────────────────────────────────────────────────────────

type DateCellProps = {
    day: Date;
    currentDate: Date;
    today: Date;
    selectedDate?: Date;
    singleDayByDate: Record<string, CalendarEvent[]>;
    specialDayByDate: Record<string, CalendarSpecialDay>;
    isWeekView: boolean;
    reservedH: number;
    maxVisibleEvents: number;
    dragEnabled: boolean;
    onDateSelect?: (date: Date) => void;
    onMoreClick?: (date: Date, hiddenEvents: CalendarEvent[]) => void;
};

function DateCell({
    day,
    currentDate,
    today,
    selectedDate,
    singleDayByDate,
    specialDayByDate,
    isWeekView,
    reservedH,
    maxVisibleEvents,
    dragEnabled,
    onDateSelect,
    onMoreClick,
}: DateCellProps) {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = singleDayByDate[dateKey] ?? [];
    const inMonth = isWeekView || isSameMonth(day, currentDate);
    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
    const isToday = isSameDay(day, today);
    const visibleEvts = dayEvents.slice(0, maxVisibleEvents);
    const hiddenCount = dayEvents.length - visibleEvts.length;
    const special = specialDayByDate[dateKey];

    const { setNodeRef, isOver } = useDroppable({ id: dateKey });

    return (
        <div
            ref={setNodeRef}
            onClick={() => onDateSelect?.(day)}
            className={cn(
                'border-b border-r border-border p-1.5 overflow-hidden cursor-pointer transition-colors flex flex-col',
                isSelected
                    ? 'bg-primary/10'
                    : (special?.color ??
                          (inMonth ? 'bg-background hover:bg-muted/40' : 'bg-muted/30 hover:bg-muted/60')),
                dragEnabled && isOver && 'ring-2 ring-inset ring-primary'
            )}
        >
            {/* 日期數字 + 特殊日標籤 */}
            <div className="flex items-start justify-between" style={{ height: DATE_AREA_H }}>
                <span
                    className={cn(
                        'inline-flex h-6 min-w-[1.5rem] px-[5px] items-center justify-center rounded-full text-xs font-mono shrink-0',
                        isToday && 'border border-primary text-primary font-bold',
                        !isToday && inMonth && 'text-foreground',
                        !isToday && !inMonth && 'text-muted-foreground/30'
                    )}
                >
                    {format(day, 'd')}
                </span>
                {special?.label && (
                    <span
                        className={cn(
                            'text-[10px] font-medium truncate leading-5 ml-1',
                            special.textColor ?? 'text-destructive'
                        )}
                    >
                        {special.label}
                    </span>
                )}
            </div>

            {/* 為跨天條狀預留的空間 */}
            {reservedH > 0 && <div style={{ height: reservedH }} />}

            {/* 單日事件點 */}
            <div className="flex-1 space-y-0.5 overflow-hidden">
                {visibleEvts.map(evt => (
                    <DraggableChip key={evt.id} event={evt} disabled={!dragEnabled} />
                ))}
            </div>

            {/* 查看更多 — 固定在左下 */}
            {hiddenCount > 0 && (
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onMoreClick?.(day, dayEvents.slice(maxVisibleEvents));
                    }}
                    className="text-xs text-primary hover:text-primary transition-colors self-start mt-1"
                >
                    查看更多...（共 {dayEvents.length} 筆）
                </button>
            )}
        </div>
    );
}

// ─── 週列（7 格 + 跨天條狀覆蓋）─────────────────────────────────────────────

type WeekRowProps = {
    week: Date[];
    weekKey: number;
    spans: WeekSpan[];
    singleDayByDate: Record<string, CalendarEvent[]>;
    specialDayByDate: Record<string, CalendarSpecialDay>;
    selectedDate?: Date;
    today: Date;
    currentDate: Date;
    isWeekView: boolean;
    maxVisibleEvents: number;
    dragEnabled: boolean;
    onDateSelect?: (date: Date) => void;
    onMoreClick?: (date: Date, hiddenEvents: CalendarEvent[]) => void;
};

function WeekRow({
    week,
    weekKey,
    spans,
    singleDayByDate,
    specialDayByDate,
    selectedDate,
    today,
    currentDate,
    isWeekView,
    maxVisibleEvents,
    dragEnabled,
    onDateSelect,
    onMoreClick,
}: WeekRowProps) {
    const maxSlot = spans.length > 0 ? Math.max(...spans.map(s => s.slot)) + 1 : 0;
    const reservedH = maxSlot * (BAR_H + BAR_GAP);

    return (
        <div className="flex-1 relative grid grid-cols-7 min-h-0">
            {week.map(day => (
                <DateCell
                    key={format(day, 'yyyy-MM-dd')}
                    day={day}
                    currentDate={currentDate}
                    today={today}
                    selectedDate={selectedDate}
                    singleDayByDate={singleDayByDate}
                    specialDayByDate={specialDayByDate}
                    isWeekView={isWeekView}
                    reservedH={reservedH}
                    maxVisibleEvents={maxVisibleEvents}
                    dragEnabled={dragEnabled}
                    onDateSelect={onDateSelect}
                    onMoreClick={onMoreClick}
                />
            ))}

            {/* 跨天條狀覆蓋層 */}
            {spans.map(span => (
                <DraggableBar
                    key={`${span.event.id}-w${weekKey}`}
                    span={span}
                    dragId={`${span.event.id}-w${weekKey}`}
                    disabled={!dragEnabled}
                />
            ))}
        </div>
    );
}

// ─── 使用方式 ─────────────────────────────────────────────────────────────────
//
// 基本用法（唯讀，不需要任何互動回呼）：
//   <CalendarView events={events} />
//
// 完整用法：
//   <CalendarView
//     events={calendarEvents}          // CalendarEvent[]（必填）
//     selectedDate={selectedDate}      // 目前選取的日期（對應右側面板）
//     onDateSelect={handleDateSelect}  // 點擊日期格時觸發
//     onEventMove={handleEventMove}    // 拖動事件放下時觸發；不傳則禁用拖拉
//     onViewChange={handleViewChange}  // 切換月／週／日視圖時觸發
//     onNavigate={handleNavigate}      // 點擊上／下翻頁時觸發（可用來重新取得 API 資料）
//     onMoreClick={handleMoreClick}    // 點擊「查看更多」時觸發
//     maxVisibleEvents={2}             // 每格最多顯示幾筆（預設 2）
//     specialDays={specialDays}        // 特殊日期（節日、假日等）
//     className="flex-1 min-h-0"       // 外層 className
//   />
//
// CalendarEvent 格式：
//   { id, date, label, dotColor }                              // 單日事件
//   { id, date, endDate, label, dotColor, barColor, barTextColor }  // 跨天事件
//
// CalendarSpecialDay 格式：
//   { date, label?, color?, textColor? }

// ─── Props ────────────────────────────────────────────────────────────────────

export type CalendarViewProps = {
    events: CalendarEvent[];
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
    onEventMove?: (eventId: string, newDate: string, newEndDate?: string) => void;
    onMoreClick?: (date: Date, hiddenEvents: CalendarEvent[]) => void;
    onViewChange?: (view: 'month' | 'week' | 'day') => void;
    onNavigate?: (date: Date) => void;
    maxVisibleEvents?: number;
    specialDays?: CalendarSpecialDay[];
    className?: string;
};

// ─── 主元件 ──────────────────────────────────────────────────────────────────

const CalendarView = ({
    events,
    selectedDate,
    onDateSelect,
    onEventMove,
    onMoreClick,
    onViewChange,
    onNavigate,
    maxVisibleEvents = DEFAULT_MAX_VISIBLE,
    specialDays = [],
    className,
}: CalendarViewProps) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(selectedDate ?? today);
    const [view, setView] = useState<View>('month');
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

    const dragEnabled = !!onEventMove;

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // ── 衍生資料 ──────────────────────────────────────────────────────────────

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const weeks = useMemo(() => {
        const rows: Date[][] = [];
        for (let i = 0; i < calendarDays.length; i += 7) rows.push(calendarDays.slice(i, i + 7));
        return rows;
    }, [calendarDays]);

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 });
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const { spanningEvents, singleDayByDate } = useMemo(() => {
        const spanning: CalendarEvent[] = [];
        const byDate: Record<string, CalendarEvent[]> = {};
        for (const evt of events) {
            if (evt.endDate && evt.endDate !== evt.date) {
                spanning.push(evt);
            } else {
                if (!byDate[evt.date]) byDate[evt.date] = [];
                byDate[evt.date].push(evt);
            }
        }
        return { spanningEvents: spanning, singleDayByDate: byDate };
    }, [events]);

    const specialDayByDate = useMemo(() => {
        const map: Record<string, CalendarSpecialDay> = {};
        for (const sd of specialDays) map[sd.date] = sd;
        return map;
    }, [specialDays]);

    // ── 導覽 ──────────────────────────────────────────────────────────────────

    const goToPrev = () => {
        const next =
            view === 'month'
                ? subMonths(currentDate, 1)
                : view === 'week'
                  ? subWeeks(currentDate, 1)
                  : subDays(currentDate, 1);
        setCurrentDate(next);
        onNavigate?.(next);
    };
    const goToNext = () => {
        const next =
            view === 'month'
                ? addMonths(currentDate, 1)
                : view === 'week'
                  ? addWeeks(currentDate, 1)
                  : addDays(currentDate, 1);
        setCurrentDate(next);
        onNavigate?.(next);
    };

    const handleViewChange = (v: View) => {
        setView(v);
        onViewChange?.(v);
    };

    const prevLabel = view === 'month' ? '上個月' : view === 'week' ? '上一週' : '前一天';
    const nextLabel = view === 'month' ? '下個月' : view === 'week' ? '下一週' : '後一天';

    const headerLabel = useMemo(() => {
        if (view === 'month') return format(currentDate, 'yyyy 年 M 月', { locale: zhTW });
        if (view === 'week') {
            const s = startOfWeek(currentDate, { weekStartsOn: 0 });
            const e = endOfWeek(currentDate, { weekStartsOn: 0 });
            return `${format(s, 'M 月 d 日', { locale: zhTW })} – ${format(e, 'M 月 d 日', { locale: zhTW })}`;
        }
        return format(currentDate, 'yyyy 年 M 月 d 日 (EEE)', { locale: zhTW });
    }, [currentDate, view]);

    // ── 拖拉事件處理 ──────────────────────────────────────────────────────────

    const handleDragStart = (e: DragStartEvent) => {
        const data = e.active.data.current as DragData | undefined;
        if (data?.event) setActiveEvent(data.event);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setActiveEvent(null);
        if (!e.over || !onEventMove) return;
        const data = e.active.data.current as DragData | undefined;
        if (!data?.event) return;

        const { event } = data;
        const dropDateKey = e.over.id as string;

        if (event.endDate && event.endDate !== event.date) {
            // 跨天事件：整體平移相同天數
            const delta = differenceInDays(parseISO(dropDateKey), parseISO(event.date));
            if (delta === 0) return;
            const newDate = format(addDays(parseISO(event.date), delta), 'yyyy-MM-dd');
            const newEndDate = format(addDays(parseISO(event.endDate), delta), 'yyyy-MM-dd');
            onEventMove(event.id, newDate, newEndDate);
        } else {
            if (event.date === dropDateKey) return;
            onEventMove(event.id, dropDateKey);
        }
    };

    // ── 日視圖 ────────────────────────────────────────────────────────────────

    const renderDayView = () => {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const dayEvents = singleDayByDate[dateKey] ?? [];
        const special = specialDayByDate[dateKey];

        const daySpanning = spanningEvents.filter(evt => {
            const s = parseISO(evt.date);
            const e = parseISO(evt.endDate!);
            return !isAfter(s, currentDate) && !isBefore(e, currentDate);
        });

        return (
            <div className="flex-1 min-h-0 overflow-y-auto border-t border-border">
                {special && (
                    <div
                        className={cn(
                            'mx-3 mt-3 rounded px-3 py-1.5 text-xs font-medium',
                            special.color ?? 'bg-destructive/10',
                            special.textColor ?? 'text-destructive'
                        )}
                    >
                        {special.label}
                    </div>
                )}
                <div className="p-3 space-y-2">
                    {daySpanning.map(evt => (
                        <div
                            key={evt.id}
                            className={cn(
                                'rounded-md px-3 py-2 text-xs font-medium flex items-center gap-2',
                                evt.barColor ?? 'bg-primary/20',
                                evt.barTextColor ?? 'text-primary'
                            )}
                        >
                            <span>{evt.label}</span>
                            <span className="opacity-60 font-normal">
                                {evt.date} ～ {evt.endDate}
                            </span>
                        </div>
                    ))}
                    {dayEvents.map(evt => (
                        <div
                            key={evt.id}
                            className="flex items-center gap-2.5 py-2 border-b border-border last:border-0"
                        >
                            <span
                                className={cn('h-2.5 w-2.5 shrink-0 rounded-full', evt.dotColor)}
                            />
                            <span className="text-sm text-foreground">{evt.label}</span>
                        </div>
                    ))}
                    {daySpanning.length === 0 && dayEvents.length === 0 && (
                        <p className="text-sm text-muted-foreground/60 text-center py-12">當日無事件</p>
                    )}
                </div>
            </div>
        );
    };

    // ── 渲染 ──────────────────────────────────────────────────────────────────

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={cn('flex flex-col', className)}>
                {/* 標題列：導覽 + 視圖切換 */}
                <div className="flex items-center gap-2 mb-3">
                    <button
                        onClick={goToPrev}
                        className="flex items-center gap-1 font-mono text-xs tracking-wide text-primary hover:text-primary transition-colors shrink-0"
                    >
                        <ChevronLeft size={14} />
                        {prevLabel}
                    </button>
                    <span className="flex-1 text-center text-lg font-bold text-foreground truncate font-serif">
                        {headerLabel}
                    </span>
                    <button
                        onClick={goToNext}
                        className="flex items-center gap-1 font-mono text-xs tracking-wide text-primary hover:text-primary transition-colors shrink-0"
                    >
                        {nextLabel}
                        <ChevronRight size={14} />
                    </button>

                    {/* 視圖切換按鈕 */}
                    <div className="flex rounded-md border border-border overflow-hidden text-xs shrink-0">
                        {(['month', 'week', 'day'] as const).map((v, i) => (
                            <button
                                key={v}
                                onClick={() => handleViewChange(v)}
                                className={cn(
                                    'px-2.5 py-1 transition-colors',
                                    i > 0 && 'border-l border-border',
                                    view === v
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-muted/30'
                                )}
                            >
                                {VIEW_LABELS[v]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 星期標題列（月視圖 / 週視圖）*/}
                {view !== 'day' && (
                    <div className="grid grid-cols-7 mb-1">
                        {WEEK_DAYS.map(d => (
                            <div
                                key={d}
                                className="text-center font-mono text-[11px] tracking-wide text-muted-foreground/60 py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                )}

                {/* 月視圖 */}
                {view === 'month' && (
                    <div className="flex-1 min-h-0 flex flex-col border-t border-l border-border">
                        {weeks.map((week, i) => (
                            <WeekRow
                                key={i}
                                week={week}
                                weekKey={i}
                                spans={computeWeekSpans(week, spanningEvents)}
                                singleDayByDate={singleDayByDate}
                                specialDayByDate={specialDayByDate}
                                selectedDate={selectedDate}
                                today={today}
                                currentDate={currentDate}
                                isWeekView={false}
                                maxVisibleEvents={maxVisibleEvents}
                                dragEnabled={dragEnabled}
                                onDateSelect={onDateSelect}
                                onMoreClick={onMoreClick}
                            />
                        ))}
                    </div>
                )}

                {/* 週視圖 */}
                {view === 'week' && (
                    <div className="flex-1 min-h-0 flex flex-col border-t border-l border-border">
                        <WeekRow
                            week={weekDays}
                            weekKey={0}
                            spans={computeWeekSpans(weekDays, spanningEvents)}
                            singleDayByDate={singleDayByDate}
                            specialDayByDate={specialDayByDate}
                            selectedDate={selectedDate}
                            today={today}
                            currentDate={currentDate}
                            isWeekView={true}
                            maxVisibleEvents={maxVisibleEvents}
                            dragEnabled={dragEnabled}
                            onDateSelect={onDateSelect}
                            onMoreClick={onMoreClick}
                        />
                    </div>
                )}

                {/* 日視圖 */}
                {view === 'day' && renderDayView()}
            </div>

            {/* 拖拉殘影 */}
            <DragOverlay dropAnimation={null}>
                {activeEvent ? (
                    activeEvent.endDate && activeEvent.endDate !== activeEvent.date ? (
                        <div
                            className={cn(
                                'rounded px-2.5 py-1 text-xs font-medium shadow-lg opacity-95 cursor-grabbing select-none',
                                activeEvent.barColor ?? 'bg-primary/20',
                                activeEvent.barTextColor ?? 'text-primary'
                            )}
                        >
                            {activeEvent.label}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-card shadow-lg rounded px-2.5 py-1 text-xs cursor-grabbing select-none">
                            <span
                                className={cn(
                                    'h-2 w-2 shrink-0 rounded-full',
                                    activeEvent.dotColor
                                )}
                            />
                            <span className="text-foreground font-medium">{activeEvent.label}</span>
                        </div>
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CalendarView;
