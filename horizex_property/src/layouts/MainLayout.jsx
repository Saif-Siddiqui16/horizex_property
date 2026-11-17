import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPermissions } from '../store/authSlice';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import api from '../api/client';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { WorkspaceTabBar } from '../components/workspace/WorkspaceTabBar';
import { SplitWorkspaceView } from '../components/workspace/SplitWorkspaceView';

const MainLayoutInner = ({ isSidebarOpen, toggleSidebar, closeSidebar }) => {
    const { splitMode } = useWorkspace();

    return (
        <div className="flex w-full min-h-screen overflow-x-hidden">
            {/* Fixed Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="flex flex-col flex-1 min-w-0 transition-all duration-200 ml-0 lg:ml-[280px]">
                {/* Sticky Top Header */}
                <Topbar onMenuClick={toggleSidebar} />

                {/* Multi-Window Workspace Tab Bar */}
                <WorkspaceTabBar />

                {/* Page Content: Split View or Standard Outlet */}
                {splitMode ? (
                    <SplitWorkspaceView primaryOutlet={<Outlet />} />
                ) : (
                    <main className="page-container flex-1 pt-4 md:pt-6">
                        <Outlet />
                    </main>
                )}
            </div>
        </div>
    );
};

export const MainLayout = () => {
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Check if running in embedded mode (e.g. secondary pane in Split View)
    const isEmbedded = new URLSearchParams(location.search).get('viewMode') === 'embedded';

    // Re-sync permissions in real-time on cross-tab updates, window focus, tab visibility & heartbeat
    useEffect(() => {
        const syncPermissions = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                
                const user = JSON.parse(userStr);
                if (user.role === 'COWORKER') {
                    const res = await api.get('/api/admin/my-permissions');
                    if (res.data) {
                        const oldPerms = localStorage.getItem('permissions');
                        const newPerms = JSON.stringify(res.data);
                        
                        // Update both localStorage & Redux store when permissions change
                        if (oldPerms !== newPerms) {
                            localStorage.setItem('permissions', newPerms);
                            dispatch(setPermissions(res.data));
                            window.dispatchEvent(new Event('permissionsUpdated'));
                        }
                    }
                }
            } catch (error) {
                console.error('Background permission sync failed:', error);
            }
        };

        syncPermissions();

        // 1. Instant cross-tab sync via BroadcastChannel
        let channel;
        if (typeof BroadcastChannel !== 'undefined') {
            channel = new BroadcastChannel('permissions_channel');
            channel.onmessage = () => {
                syncPermissions();
            };
        }

        // 2. Cross-tab sync via localStorage storage event
        const handleStorage = (e) => {
            if (e.key === 'last_permission_update') {
                syncPermissions();
            }
        };

        // 3. Tab visibility sync (triggers immediately when switching tabs)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncPermissions();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', syncPermissions);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 4. Background heartbeat check every 4 seconds
        const interval = setInterval(syncPermissions, 4000);
        
        return () => {
            window.removeEventListener('focus', syncPermissions);
            window.removeEventListener('storage', handleStorage);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
            if (channel) {
                channel.close();
            }
        };
    }, [location.pathname, dispatch]);

    // If embedded inside a dual-window pane, render clean page without outer sidebar/topbar
    if (isEmbedded) {
        return (
            <div className="w-full min-h-screen bg-bg p-4 overflow-y-auto">
                <Outlet />
            </div>
        );
    }

    // Toggle Sidebar for mobile view
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <WorkspaceProvider>
            <MainLayoutInner
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
            />
        </WorkspaceProvider>
    );
};

