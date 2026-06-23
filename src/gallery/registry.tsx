import type { ComponentType } from 'react';

import CalendarDemo from './demos/CalendarDemo';

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
];
