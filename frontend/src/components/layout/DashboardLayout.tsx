import React from 'react';
import Sidebar from '../Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#0D0D1F]">
            <Sidebar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;