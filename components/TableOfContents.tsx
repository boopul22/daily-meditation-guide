import React, { useEffect, useState } from 'react';
import { TOCItem } from '../utils/tocUtils';

interface TableOfContentsProps {
    headings: TOCItem[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
    const [activeId, setActiveId] = useState<string>('');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Offset for sticky header
                behavior: 'smooth',
            });
            setActiveId(id);
            setIsMobileOpen(false); // Close mobile menu on click
        }
    };

    if (headings.length === 0) return null;

    return (
        <nav className="toc-container">
            {/* Mobile Accordion */}
            <div className="lg:hidden mb-8 border border-white/10 rounded-xl bg-zinc-900/30 overflow-hidden">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-full flex items-center justify-between p-4 text-zinc-200 font-medium"
                >
                    <span className="flex items-center gap-2">
                        <iconify-icon icon="solar:list-linear" width="20"></iconify-icon>
                        On this page
                    </span>
                    <iconify-icon
                        icon="solar:alt-arrow-down-linear"
                        width="20"
                        class={`transition-transform duration-300 ${isMobileOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isMobileOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className="p-4 pt-0 space-y-3 border-t border-white/5 overflow-y-auto max-h-[60vh]">
                        {headings.map((heading) => (
                            <li key={heading.id}
                                className={`${heading.level === 3 ? 'pl-4' : ''}`}
                            >
                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => handleClick(e, heading.id)}
                                    className={`block text-sm transition-colors ${activeId === heading.id
                                        ? 'text-indigo-400 font-medium'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Desktop Sticky Sidebar - Sticky is now handled by parent in DetailView */}
            <div className="hidden lg:block">
                <div className="pl-4 border-l border-white/10 relative">
                    {/* Active Indicator Line - simplistic implementation */}
                    <div
                        className="absolute left-[-1px] top-0 w-[1px] h-6 bg-indigo-500 transition-all duration-300 ease-out opacity-0"
                    //  Note: To fully animate this line to match the exact active item position requires intricate height calculations. 
                    //  For now, we will rely on text casing/color for active state.
                    ></div>

                    <h4 className="text-zinc-400 font-medium text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <iconify-icon icon="solar:list-linear" width="14"></iconify-icon>
                        On this page
                    </h4>
                    <ul className="space-y-3">
                        {headings.map((heading) => (
                            <li key={heading.id}>
                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => handleClick(e, heading.id)}
                                    className={`block text-sm transition-all duration-200 ${heading.level === 3 ? 'pl-4' : ''
                                        } ${activeId === heading.id
                                            ? 'text-indigo-400 translate-x-1'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default TableOfContents;
