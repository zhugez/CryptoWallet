import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/utils/enums';
import { FiHome, FiDollarSign, FiSettings } from 'react-icons/fi';


const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: <FiHome />, label: 'Dashboard', path: PATHS.DASHBOARD },
        { icon: <FiDollarSign />, label: 'Transactions', path: PATHS.TRANSACTION },
        { icon: <FiSettings />, label: 'Settings', path: PATHS.SETTINGS },
    ];

    return (
        <div className="w-64 h-full bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-r border-white/5">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                    Crypto Wallet
                </h1>
            </div>
            <nav className="mt-6">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${location.pathname === item.path
                            ? 'text-white bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border-l-2 border-emerald-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-2 hover:border-emerald-400/50'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;