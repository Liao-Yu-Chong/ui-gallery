import { useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import BtnAgile from '@/components/btn-agile/btn-agile';

const inputClass =
    'w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground ' +
    'placeholder:text-muted-foreground focus:border-primary focus:outline-hidden';

function Section({
    title,
    hint,
    children,
}: {
    title: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                <span className="flex-1 h-px bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">{hint}</p>
            {children}
        </section>
    );
}

/** 範例一：切換停用狀態，觀察按鈕逃跑 */
function BasicUsage() {
    const [disabled, setDisabled] = useState(true);

    return (
        <Section title="基本用法" hint="按鈕停用時，點下去它會翻轉逃跑，200ms 後彈回原位。">
            <label className="inline-flex w-fit cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    checked={disabled}
                    onChange={event => setDisabled(event.target.checked)}
                    className="accent-primary"
                />
                停用按鈕
            </label>

            <div className="flex justify-center py-10">
                <BtnAgile label="按我" disabled={disabled} />
            </div>
        </Section>
    );
}

/** 範例二：表單沒填完就抓不到送出鈕 */
function FormExample() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const disabled = form.username === '' || form.password === '';

    function handleSubmit() {
        if (disabled) return;
        setIsSubmitted(true);
    }

    function reset() {
        setIsSubmitted(false);
        setForm({ username: '', password: '' });
    }

    return (
        <Section title="表單範例" hint="帳號密碼都填完之前，登入鈕抓不到。填完就恢復正常。">
            <div className="relative flex w-full justify-center py-16">
                <div className="flex w-full max-w-[20rem] flex-col gap-4">
                    <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                        帳號 *
                        <input
                            value={form.username}
                            onChange={event =>
                                setForm(prev => ({ ...prev, username: event.target.value }))
                            }
                            className={inputClass}
                            placeholder="username"
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                        密碼 *
                        <input
                            type="password"
                            value={form.password}
                            onChange={event =>
                                setForm(prev => ({ ...prev, password: event.target.value }))
                            }
                            className={inputClass}
                            placeholder="password"
                        />
                    </label>

                    <div className="mt-3 flex justify-center">
                        <BtnAgile
                            label="登入"
                            disabled={disabled}
                            zIndex={30}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={reset}
                            className="absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center gap-6 rounded-lg bg-card/95 text-foreground"
                        >
                            <span className="text-xl tracking-wide">表單已送出！(*´∀`)~♥</span>
                            <span className="text-xs text-muted-foreground">點一下再來一次</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Section>
    );
}

export default function BtnAgileDemo() {
    return (
        <div className="flex flex-col gap-10">
            <BasicUsage />
            <FormExample />
        </div>
    );
}
