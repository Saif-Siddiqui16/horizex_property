import React, { useRef, useState, useEffect } from 'react';
import {
    X,
    Columns,
    ExternalLink,
    MoreVertical,
    Layers,
    ChevronLeft,
    ChevronRight,
    Maximize2
} from 'lucide-react';
import { useWorkspace, getRouteInfo } from '../../context/WorkspaceContext';
import clsx from 'clsx';

export const WorkspaceTabBar = () => {
    const {
        openWindows,
        activeWindowId,
        splitMode,
        switchToWindow,
        closeWindow,
        toggleSplitMode,
        closeOtherWindows,
        closeAllWindows
    } = useWorkspace();

    const tabsContainerRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Auto-scroll active tab into view
    useEffect(() => {
        if (!tabsContainerRef.current) return;
        const activeTabEl = tabsContainerRef.current.querySelector('[data-active="true"]');
        if (activeTabEl) {
            activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [activeWindowId]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll helpers
    const scrollTabs = (offset) => {
        if (tabsContainerRef.current) {
            tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    // Popout current window into a standalone browser window
    const handlePopout = () => {
        const currentWin = openWindows.find(w => w.id === activeWindowId);
        if (currentWin) {
            const url = window.location.origin + currentWin.path;
            window.open(url, '_blank', 'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no');
        }
    };

    return (
        <div className="bg-zinc-100/90 border-b border-zinc-200/90 px-3 py-1.5 flex items-center justify-between gap-2 select-none sticky top-14 sm:top-16 z-30 backdrop-blur-sm">
            {/* LEFT: Scroll Left + Tabs List + Scroll Right */}
            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                <div className="hidden sm:flex items-center text-zinc-400 mr-2 shrink-0">
                    <Layers size={14} className="text-zinc-500" />
                </div>

                <button
                    onClick={() => scrollTabs(-150)}
                    className="hidden sm:flex text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 p-1 rounded transition-colors mr-1 shrink-0"
                    title="Scroll left"
                >
                    <ChevronLeft size={14} />
                </button>

                {/* TABS CONTAINER */}
                <div
                    ref={tabsContainerRef}
                    className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {openWindows.map((win) => {
                        const isActive = win.id === activeWindowId;
                        const routeInfo = getRouteInfo(win.id);
                        const IconComponent = routeInfo.icon;

                        return (
                            <div
                                key={win.id}
                                data-active={isActive}
                                onClick={() => switchToWindow(win)}
                                className={clsx(
                                    "group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150 cursor-pointer shrink-0 max-w-[210px]",
                                    isActive
                                        ? "bg-white text-zinc-900 border-zinc-300 shadow-xs ring-1 ring-zinc-900/5 font-semibold"
                                        : "bg-zinc-200/50 text-zinc-600 border-transparent hover:bg-white/70 hover:text-zinc-800"
                                )}
                                title={win.title}
                            >
                                {IconComponent && (
                                    <IconComponent
                                        size={13}
                                        className={clsx(
                                            "shrink-0 transition-colors",
                                            isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600"
                                        )}
                                    />
                                )}

                                <span className="truncate">{win.title}</span>

                                {/* Close Button */}
                                {win.closable !== false && openWindows.length > 1 && (
                                    <button
                                        onClick={(e) => closeWindow(win.id, e)}
                                        className={clsx(
                                            "p-0.5 rounded-sm transition-all ml-1 shrink-0",
                                            isActive
                                                ? "text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                                                : "text-transparent group-hover:text-zinc-400 hover:!text-zinc-800 hover:bg-zinc-200"
                                        )}
                                        title="Close window (Ctrl+W)"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => scrollTabs(150)}
                    className="hidden sm:flex text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 p-1 rounded transition-colors ml-1 shrink-0"
                    title="Scroll right"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* RIGHT: Actions (Split View, Popout, Options Menu) */}
            <div className="flex items-center gap-1 shrink-0">
                {/* SPLIT VIEW BUTTON */}
                <button
                    onClick={() => toggleSplitMode()}
                    className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all",
                        splitMode
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-xs"
                            : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                    title={splitMode ? "Exit Split View" : "Open Split View (Side-by-Side Windows)"}
                >
                    <Columns size={13} className={splitMode ? "text-blue-600" : "text-zinc-500"} />
                    <span className="hidden md:inline">
                        {splitMode ? "Dual View Active" : "Split View"}
                    </span>
                </button>

                {/* POPOUT WINDOW BUTTON */}
                <button
                    onClick={handlePopout}
                    className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-white rounded-md border border-transparent hover:border-zinc-200 transition-colors"
                    title="Pop out in separate browser window"
                >
                    <ExternalLink size={13} />
                </button>

                {/* OPTIONS DROPDOWN */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(p => !p)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-white rounded-md border border-transparent hover:border-zinc-200 transition-colors"
                        title="Window Options"
                    >
                        <MoreVertical size={13} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                            <button
                                onClick={() => {
                                    closeOtherWindows(activeWindowId);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 flex items-center justify-between"
                            >
                                <span>Close Other Windows</span>
                            </button>
                            <button
                                onClick={() => {
                                    closeAllWindows();
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center justify-between"
                            >
                                <span>Close All Windows</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
