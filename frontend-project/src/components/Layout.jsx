import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, Banknote, FileText, LogOut, ChevronRight, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Employee', path: '/employees', icon: Users },
        { name: 'Department', path: '/departments', icon: Building2 },
        { name: 'Salary', path: '/salaries', icon: Banknote },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const SidebarContent = () => (
        <>
            <div className="p-6">
                <div className="flex items-center justify-between text-indigo-400 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">SmartPark</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)} // Close on navigate
                            className="block relative group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-indigo-600 rounded-lg"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`relative flex items-center p-3 rounded-lg transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                                }`}>
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-200' : ''}`} />
                                <span className="font-medium">{item.name}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-400">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group"
                >
                    <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-slate-900 text-white flex-col shadow-xl z-20 print:hidden">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black z-30 md:hidden"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-40 md:hidden"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative print:overflow-visible print:h-auto w-full">
                <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center z-10 print:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 truncate">
                            {navItems.find((i) => i.path === location.pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="hidden md:inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            System Active
                        </span>
                        {/* Mobile active indicator (dot) */}
                        <span className="md:hidden w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
