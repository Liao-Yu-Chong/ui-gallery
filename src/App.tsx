import { useState } from 'react';

import { components } from './gallery/registry';

// TODO: 換成你的 GitHub repo 與名字
const GITHUB_URL = 'https://github.com/your-username/ui-gallery';
const AUTHOR = 'Your Name';

export default function App() {
    const [activeId, setActiveId] = useState(components[0]?.id ?? '');
    const active = components.find((c) => c.id === activeId) ?? components[0];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top bar */}
            <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">
                            元件作品集 · Component Gallery
                        </h1>
                        <p className="text-sm text-slate-500">
                            {AUTHOR} 親手打造的 UI 元件,點選左側查看互動 demo
                        </p>
                    </div>
                    <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        GitHub ↗
                    </a>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
                {/* Sidebar */}
                <aside className="w-56 shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            元件
                        </p>
                        {components.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveId(c.id)}
                                className={
                                    'block w-full rounded-md px-3 py-2 text-left text-sm transition ' +
                                    (c.id === active?.id
                                        ? 'bg-slate-900 font-medium text-white'
                                        : 'text-slate-600 hover:bg-slate-100')
                                }
                            >
                                {c.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="min-w-0 flex-1">
                    {active && (
                        <article className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {active.name}
                                </h2>
                                <p className="mt-1 text-slate-600">{active.description}</p>
                                {active.tags && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {active.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {active.highlights && (
                                <ul className="grid gap-1.5 sm:grid-cols-2">
                                    {active.highlights.map((h) => (
                                        <li
                                            key={h}
                                            className="flex items-start gap-2 text-sm text-slate-600"
                                        >
                                            <span className="mt-0.5 text-emerald-500">✓</span>
                                            <span>{h}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Live demo canvas */}
                            <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
                                <active.Demo />
                            </div>
                        </article>
                    )}
                </main>
            </div>

            <footer className="border-t py-8 text-center text-sm text-slate-400">
                Built with React · Vite · Tailwind ·{' '}
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="underline">
                    原始碼
                </a>
            </footer>
        </div>
    );
}
