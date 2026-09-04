import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 設值之後過 delay 毫秒自動還原成預設值。
 *
 * @param defaultValue 預設值（僅取首次 render 的值，之後不會跟著更新）
 * @param delay 還原前的等待時間，單位毫秒
 */
export function useAutoResetState<T>(defaultValue: T, delay = 200) {
    // 預設值放進 ref，避免物件 literal 每次 render 換 reference 導致 setter 重建
    const defaultRef = useRef(defaultValue);
    const [value, setValue] = useState<T>(defaultValue);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = useCallback(
        (next: T) => {
            setValue(next);

            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setValue(defaultRef.current), delay);
        },
        [delay]
    );

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    return [value, set] as const;
}
