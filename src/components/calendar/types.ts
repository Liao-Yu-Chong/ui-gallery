export type CalendarEvent = {
    id: string;
    date: string; // Start date yyyy-MM-dd
    endDate?: string; // End date yyyy-MM-dd (inclusive). If set → multi-day bar
    label: string;
    tooltip?: string; // 滑鼠懸停時顯示的完整文字，未設定則顯示 label
    dotColor: string; // Tailwind bg class for single-day dot, e.g. 'bg-blue-400'
    barColor?: string; // Tailwind bg class for multi-day bar, e.g. 'bg-amber-100'
    barTextColor?: string; // Tailwind text class for multi-day bar text, e.g. 'text-amber-700'
};

export type CalendarSpecialDay = {
    date: string; // yyyy-MM-dd
    label?: string; // e.g. '元旦', '勞動節'
    color?: string; // Tailwind bg class for the cell, e.g. 'bg-red-50'
    textColor?: string; // Tailwind text class for the label, e.g. 'text-red-500'
};
