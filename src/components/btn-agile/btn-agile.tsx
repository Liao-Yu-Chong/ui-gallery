import type { ComponentPropsWithoutRef, KeyboardEvent, ReactNode } from 'react';
import { useCallback, useRef } from 'react';

import { motion } from 'motion/react';

import { useAutoResetState } from '@/lib/hooks/use-auto-reset-state';
import { cn } from '@/lib/utils';

// 用 type 而非 interface：interface 少了隱含 index signature，過不了 motion 的 TargetAndTransition
type AnimateData = {
    x: string;
    y: string;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    skewX: number;
    skewY: number;
    scaleX: number;
    scaleY: number;
};

const DEFAULT_ANIMATE_DATA: AnimateData = {
    x: '0%',
    y: '0%',
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
};

/** 連點時的最短間隔，避免動畫互相打架 */
const THROTTLE_MS = 50;
/** 逃跑後彈回原位的時間 */
const RESET_MS = 200;

/**
 * @param min 最小值
 * @param max 最大值
 * @param randomSign 是否隨機正負號，用來讓按鈕往四面八方跑
 */
function random(min: number, max: number, randomSign = false) {
    const value = Math.random() * (max - min) + min;

    return randomSign && Math.random() < 0.5 ? -value : value;
}

export interface BtnAgileProps
    extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onClick'> {
    /** 按鈕內文字 */
    label?: string;
    /** 是否停用。停用時點下去按鈕會翻轉逃跑，而不是真的被按下 */
    disabled?: boolean;
    /** 同 CSS z-index，逃跑時想蓋過其他元素就設高一點 */
    zIndex?: number | string;
    /** 不論 disabled 與否都會觸發，是否要擋掉由呼叫端自行判斷 */
    onClick?: () => void;
    /** 傳 function 可以拿到目前狀態自訂按鈕外觀 */
    children?: ReactNode | ((slotProps: { disabled: boolean; label: string }) => ReactNode);
}

export function BtnAgile({
    label = '',
    disabled = false,
    zIndex,
    tabIndex = 0,
    onClick,
    children,
    className,
    style,
    ...rest
}: BtnAgileProps) {
    const [animate, setAnimate] = useAutoResetState(DEFAULT_ANIMATE_DATA, RESET_MS);

    const lastRunAt = useRef(0);
    const run = useCallback(() => {
        const now = Date.now();
        if (now - lastRunAt.current < THROTTLE_MS) return;
        lastRunAt.current = now;

        const scale = random(0.9, 1);
        setAnimate({
            ...DEFAULT_ANIMATE_DATA,
            x: `${random(50, 100, true)}%`,
            y: `${random(50, 100, true)}%`,
            rotateZ: random(60, 120, true),
            skewX: random(5, 30, true),
            skewY: random(5, 30, true),
            scaleX: scale,
            scaleY: -scale,
        });
    }, [setAnimate]);

    function handlePointerDown() {
        onClick?.();

        if (!disabled) return;
        run();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key !== 'Enter') return;
        if (!disabled) return;
        run();
    }

    return (
        // 外框
        <div
            className={cn('relative', className)}
            style={{ zIndex, ...style }}
            onPointerDown={handlePointerDown}
            {...rest}
        >
            {/* 按鈕移動容器 */}
            <motion.div
                className="relative"
                tabIndex={tabIndex}
                animate={animate}
                transition={{
                    type: 'spring',
                    duration: 0.2,
                    bounce: 0.7,
                }}
                onKeyDown={handleKeyDown}
            >
                {/* 本體 */}
                {typeof children === 'function'
                    ? children({ disabled, label })
                    : (children ?? (
                          <button
                              type="button"
                              className={cn(
                                  'select-none rounded border border-border bg-card px-6 py-3 text-foreground',
                                  'transition duration-200 active:scale-[0.98] active:duration-100',
                                  disabled
                                      ? 'cursor-not-allowed opacity-60'
                                      : 'hover:border-primary hover:text-primary'
                              )}
                          >
                              {label}
                          </button>
                      ))}
            </motion.div>
        </div>
    );
}

export default BtnAgile;
