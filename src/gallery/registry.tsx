import type { ComponentType } from 'react';

import CalendarDemo from './demos/CalendarDemo';
import BtnAgileDemo from './demos/BtnAgileDemo';

export interface GalleryComponent {
    /** URL-safe id, also used as the sidebar key */
    id: string;
    /** Display name */
    name: string;
    /** One-line summary shown under the title */
    description: string;
    /** Short feature bullets shown beside the demo */
    highlights?: string[];
    /** Tech / tags */
    tags?: string[];
    /** The live, interactive demo */
    Demo: ComponentType;
}

/**
 * Add a new component here to make it appear in the gallery:
 * 1. Drop the component into src/components/...
 * 2. Write a demo in src/gallery/demos/<Name>Demo.tsx
 * 3. Append an entry to this array.
 */
export const components: GalleryComponent[] = [
    {
        id: 'calendar',
        name: '行事曆 Calendar',
        description: '月／週／日三種檢視的行事曆,支援多日事件長條、拖拉移動、特殊節日標記與每日事件上限收合。',
        highlights: [
            '單日圓點 + 多日事件長條兩種呈現',
            '事件可拖拉到其他日期（@dnd-kit）',
            '特殊節日標記（自訂底色與文字色）',
            '超過上限的事件收合為「更多」',
            'hover 顯示完整事件 tooltip',
            '月 / 週 / 日 視圖切換'
        ],
        tags: ['React', 'TypeScript', 'Tailwind', 'date-fns', '@dnd-kit'],
        Demo: CalendarDemo,
    },
    {
        id: 'btn-agile',
        name: '敏捷按鈕 BtnAgile',
        description: '停用狀態下會翻轉、歪斜、彈開逃跑的惡搞按鈕，200ms 後自動彈回原位。',
        highlights: [
            '停用時點擊會往隨機方向彈開並上下翻面',
            'spring 動畫，放開後 200ms 自動歸位',
            '連點 throttle，避免動畫互相打架',
            '鍵盤 Enter 也能觸發',
            'render-prop 可完全自訂按鈕外觀',
            '刻意不用原生 disabled，否則收不到 pointer 事件',
        ],
        tags: ['React', 'TypeScript', 'Tailwind', 'Motion'],
        Demo: BtnAgileDemo,
    },
];
