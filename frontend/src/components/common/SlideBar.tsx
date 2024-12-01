// components/common/SlideBar.tsx
import { memo, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWallet, FaChevronLeft, FaHome } from 'react-icons/fa';
import { SiNewbalance } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  ariaLabel?: string;
}

interface NavLinkProps {
  item: NavItem;
  isActive: (path: string) => string;
  isCollapsed: boolean;
}

// Navigation items with aria labels
export const navItems: NavItem[] = [
  {
    path: '/',
    icon: FaHome,
    label: 'Home',
    ariaLabel: 'Go to home dashboard'
  },
  {
    path: '/create-wallet',
    icon: FaWallet,
    label: 'Create Wallet',
    ariaLabel: 'Navigate to wallet creation'
  },
  {
    path: '/transaction',
    icon: SiNewbalance,
    label: 'Transaction',
    ariaLabel: 'View transactions'
  }
];

// Memoized NavLink component with animations
const NavLink = memo<NavLinkProps>(({ item, isActive, isCollapsed }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      to={item.path}
      className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 hover:bg-purple-700 ${isActive(
        item.path
      )}`}
      aria-label={item.ariaLabel || item.label}
      role="menuitem"
    >
      <item.icon className="text-2xl" aria-hidden="true" />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  </motion.div>
));

NavLink.displayName = 'NavLink';

// Main SlideBar component with error boundary
export const SlideBar = memo(() => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = useCallback((path: string): string => {
    return location.pathname === path ? 'bg-purple-700' : '';
  }, [location.pathname]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '5rem' : '18rem' }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen bg-gray-800 text-white p-5 shadow-lg"
      role="navigation"
      aria-label="Main navigation"
      onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex justify-end mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-purple-700"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronLeft />
          </motion.div>
        </motion.button>
      </div>
      <nav className="flex flex-col gap-4" role="menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </motion.aside>
  );
});

SlideBar.displayName = 'SlideBar';

export default SlideBar;