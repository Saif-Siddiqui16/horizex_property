import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerTopbar } from './OwnerTopbar';

export const OwnerLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-bg selection:bg-indigo-100 selection:text-indigo-900">
            {/* Isolated Sidebar */}
            <OwnerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Isolated Topbar */}
                <OwnerTopbar onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto anim-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
