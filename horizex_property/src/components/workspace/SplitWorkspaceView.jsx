import React, { useState, useRef } from 'react';
import {
    X,
    RotateCcw,
    ArrowLeftRight,
    Maximize2,
    ChevronDown,
    Building2,
    CreditCard,
    Layers
} from 'lucide-react';
import { useWorkspace, getRouteInfo } from '../../context/WorkspaceContext';

export const SplitWorkspaceView = ({ primaryOutlet }) => {
    const {
        openWindows,
        activeWindowId,
        secondaryWindowId,
        setSecondaryWindowId,
        toggleSplitMode,
        switchToWindow
    } = useWorkspace();

    const [splitRatio, setSplitRatio] = useState(50); // percentage 50/50
    const [iframeKey, setIframeKey] = useState(0);
    const iframeRef = useRef(null);

    // Identify secondary window object
    const secondaryWindow = openWindows.find(w => w.id === secondaryWindowId) ||
        openWindows.find(w => w.id !== activeWindowId) ||
        { id: '/payments/outstanding', path: '/payments/outstanding', title: 'Outstanding Rent List' };

    // Format secondary URL with ?viewMode=embedded
    const getSecondaryUrl = (path) => {
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}viewMode=embedded`;
    };

    // Swap panes
    const handleSwapPanes = () => {
        if (secondaryWindow) {
            const tempSecId = activeWindowId;
            switchToWindow(secondaryWindow);
            setSecondaryWindowId(tempSecId);
        }
    };

    // Reload secondary iframe
    const handleReloadSecondary = () => {
        setIframeKey(k => k + 1);
    };

    const activeInfo = getRouteInfo(activeWindowId);
    const secondaryInfo = getRouteInfo(secondaryWindow.id);

    return (
        <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-105px)] overflow-hidden gap-2 p-2">
            {/* LEFT PANE (PRIMARY ACTIVE WINDOW) */}
            <div
                className="flex flex-col bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden transition-all duration-150"
                style={{ width: window.innerWidth >= 1024 ? `${splitRatio}%` : '100%', height: window.innerWidth >= 1024 ? '100%' : '50%' }}
            >
                {/* Pane 1 Header */}
                <div className="h-9 px-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-600 select-none shrink-0">
                    <div className="flex items-center gap-2 font-semibold text-zinc-800">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Window 1: {activeInfo.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                        <span className="text-[11px] bg-zinc-200/70 text-zinc-600 px-1.5 py-0.5 rounded">Active Focus</span>
                    </div>
                </div>

                {/* Pane 1 Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-bg">
                    {primaryOutlet}
                </div>
            </div>

            {/* DIVIDER CONTROLS (Center on large screens) */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-1 shrink-0 py-2">
                <button
                    onClick={handleSwapPanes}
                    className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 rounded transition-colors shadow-xs"
                    title="Swap Windows Left ⇄ Right"
                >
                    <ArrowLeftRight size={14} />
                </button>
            </div>

            {/* RIGHT PANE (SECONDARY DUAL WINDOW) */}
            <div
                className="flex flex-col bg-white rounded-lg border border-zinc-200 shadow-xs overflow-hidden transition-all duration-150"
                style={{ width: window.innerWidth >= 1024 ? `${100 - splitRatio}%` : '100%', height: window.innerWidth >= 1024 ? '100%' : '50%' }}
            >
                {/* Pane 2 Header with Window Selector */}
                <div className="h-9 px-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-600 select-none shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-medium text-zinc-700">Window 2:</span>

                        {/* Dropdown to switch secondary window */}
                        <div className="relative inline-block">
                            <select
                                value={secondaryWindow.id}
                                onChange={(e) => setSecondaryWindowId(e.target.value)}
                                className="bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold rounded px-2 py-0.5 pr-6 cursor-pointer hover:border-zinc-300 focus:outline-hidden appearance-none"
                            >
                                {openWindows.map(win => (
                                    <option key={win.id} value={win.id}>
                                        {win.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Reload secondary window */}
                        <button
                            onClick={handleReloadSecondary}
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded transition-colors"
                            title="Reload Window 2"
                        >
                            <RotateCcw size={12} />
                        </button>

                        {/* Maximize secondary window */}
                        <button
                            onClick={() => {
                                switchToWindow(secondaryWindow);
                                toggleSplitMode();
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded transition-colors"
                            title="Maximize Window 2"
                        >
                            <Maximize2 size={12} />
                        </button>

                        {/* Close Split View */}
                        <button
                            onClick={() => toggleSplitMode()}
                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-1"
                            title="Exit Split View"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>

                {/* Pane 2 Body (Clean Embedded Iframe) */}
                <div className="flex-1 w-full h-full bg-white relative">
                    <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        src={getSecondaryUrl(secondaryWindow.path)}
                        title={secondaryWindow.title}
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
};
