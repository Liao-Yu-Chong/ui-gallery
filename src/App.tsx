import { useState } from 'react';

import { components } from './gallery/registry';

// TODO: 換成你的 GitHub repo 與名字
const GITHUB_URL = 'https://github.com/Liao-Yu-Chong/ui-gallery';
const AUTHOR     = 'Liao-Yu-Chong';

export default function App() {
    const [activeId, setActiveId] = useState(components[0]?.id ?? '');
    const active = components.find((c) => c.id === activeId) ?? components[0];

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* 環境光暈 */}
            <div
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/4 w-[900px] h-[700px]"
                style={{
                    background:
                        'radial-gradient(closest-side, rgba(229,160,74,0.09), rgba(229,160,74,0) 72%)',
                }}
            />

            {/* ── Top bar ── */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(229,160,74,0.8)]" />
                        <span className="font-mono text-xs tracking-[0.22em] text-foreground">
                            EVAN&nbsp;LIAO
                        </span>
                    </div>

                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-border px-3.5 py-1.5 font-mono text-xs tracking-wide
                                   text-muted-foreground transition-all
                                   hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                        GitHub ↗
                    </a>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-5xl px-8">
                {/* ── Hero ── */}
                <section className="pb-14 pt-20">
                    <p className="font-mono text-xs tracking-[0.32em] text-muted-foreground/60 mb-6">
                        COMPONENT&nbsp;GALLERY&nbsp;·&nbsp;{AUTHOR.toUpperCase()}
                    </p>
                    <h1 className="font-serif font-black text-[72px] leading-none tracking-tight text-foreground">
                        元件作品<span className="text-primary">集</span>
                    </h1>
                    <p className="font-mono text-xs tracking-[0.28em] text-muted-foreground/40 mt-3">
                        COMPONENT&nbsp;GALLERY
                    </p>
                    <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        親手打造、可互動的前端 UI 元件集。每個元件都有 live demo，
                        點選左側即可把玩。專注於模組化、效能優化與清晰的程式架構。
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Tailwind', 'Vite'].map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-border px-3 py-1
                                           font-mono text-xs text-muted-foreground"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ── Sidebar + Main ── */}
                <div className="flex gap-14 items-start pb-20">
                    {/* Sidebar */}
                    <aside className="w-48 shrink-0 sticky top-24">
                        <p className="mb-4 pl-3 font-mono text-[11px] tracking-[0.2em] text-muted-foreground/50">
                            元件 / COMPONENTS
                        </p>
                        <nav className="flex flex-col gap-0.5">
                            {components.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveId(c.id)}
                                    className={
                                        'relative flex items-center gap-2.5 w-full rounded-md px-3 py-2.5 text-sm text-left transition-colors ' +
                                        (c.id === activeId
                                            ? 'bg-accent/60 text-foreground font-medium'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground')
                                    }
                                >
                                    {c.id === activeId && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                                    )}
                                    {c.name}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="min-w-0 flex-1">
                        {active && (
                            <article className="space-y-6">
                                {/* Section header */}
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-xs text-primary">
                                        {String(components.indexOf(active) + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="font-serif font-bold text-2xl text-foreground shrink-0">
                                        {active.name}
                                    </h2>
                                    <span className="flex-1 h-px bg-border -translate-y-1" />
                                </div>

                                <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                                    {active.description}
                                </p>

                                {/* Highlights */}
                                {active.highlights && (
                                    <ul className="grid gap-2.5 sm:grid-cols-2">
                                        {active.highlights.map((h) => (
                                            <li
                                                key={h}
                                                className="flex items-start gap-2 text-[13.5px] text-muted-foreground"
                                            >
                                                <span className="mt-0.5 text-primary shrink-0">✓</span>
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Tags */}
                                {active.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {active.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded border border-border px-2.5 py-1
                                                           font-mono text-[11px] text-muted-foreground/60"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Live demo panel */}
                                <div className="relative rounded-lg border border-border bg-card/40 p-5">
                                    {/* LIVE DEMO badge */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(229,160,74,0.8)]" />
                                        <span className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground/60">
                                            LIVE&nbsp;DEMO
                                        </span>
                                    </div>
                                    <active.Demo />
                                </div>
                            </article>
                        )}
                    </main>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="relative z-10 border-t border-border">
                <div className="mx-auto max-w-5xl px-8 py-7 flex items-center justify-between font-mono text-[11px] tracking-wide text-muted-foreground/40">
                    <span>© 2026 廖宥驄 Evan Liao</span>
                    <span>
                        Designed &amp; built by myself ·{' '}
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-primary transition-colors"
                        >
                            原始碼
                        </a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
