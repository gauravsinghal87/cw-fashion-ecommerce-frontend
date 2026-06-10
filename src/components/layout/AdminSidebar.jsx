import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import { useSite } from '../../context/SiteContext';
import { logout } from '../../store/authSlice';

const PERMISSION_LINK_MAP = {
  '/admin': 'dashboard',
  '/admin/users': 'users',
  '/admin/vendors': 'vendors',
  '/admin/products': 'products',
  '/admin/categories': 'categories',
  '/admin/brands': 'brands',
  '/admin/coupons': 'coupons',
  '/admin/orders': 'orders',
  '/admin/reviews': 'reviews',
  '/admin/returns': 'returns',
  '/admin/withdrawals': 'withdrawals',
  '/admin/payments': 'payments',
  '/admin/wallet': 'wallet',
  '/admin/referrals': 'referrals',
  '/admin/commission': 'settings',
  '/admin/banners': 'banners',
  '/admin/cms': 'cms',
  '/admin/notifications': 'notifications',
  '/admin/reports': 'reports',
  '/admin/audit-logs': 'auditLogs',
  '/admin/seo': 'seo',
  '/admin/shipping': 'shipping',
  '/admin/sub-admins': 'subAdmins',
  '/admin/roles': 'roles',
  '/admin/support': 'support',
  '/admin/footer': 'settings',
};

const AdminSidebar = ({ sidebarOpen, onClose }) => {
  const { siteTitle } = useSite();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState({});

  const toggleGroup = (label) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    try { await post(API.AUTH.LOGOUT); } catch (_) {}
    dispatch(logout());
    navigate('/login');
  };

  const canAccess = (resource) => {
    if (user?.role === 'admin' || !resource) return true;
    if (user?.role === 'subadmin') {
      const perms = user?.rolePermissions || {};
      return Object.keys(perms).some(k => k.startsWith(resource + '.') && perms[k]);
    }
    return false;
  };

  const sections = [
    {
      label: 'Overview',
      resource: 'dashboard',
      links: [
        { to: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      ],
    },
    {
      label: 'Management',
      resource: 'users',
      links: [
        { to: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { to: '/admin/vendors', label: 'Vendors', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { to: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { to: '/admin/categories', label: 'Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { to: '/admin/brands', label: 'Brands', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { to: '/admin/coupons', label: 'Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
      ],
    },
    {
      label: 'Orders & Finance',
      resource: 'orders',
      links: [
        { to: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { to: '/admin/reviews', label: 'Review Moderation', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { to: '/admin/returns', label: 'Returns', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
        { to: '/admin/payments', label: 'Payments & Withdrawals', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { to: '/admin/wallet', label: 'Wallet', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { to: '/admin/referrals', label: 'Referrals', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { to: '/admin/commission', label: 'Commission', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      ],
    },
    {
      label: 'Support',
      resource: 'support',
      links: [
        { to: '/admin/support', label: 'Support Tickets', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
      ],
    },
    {
      label: 'Content',
      resource: 'banners',
      links: [
        { to: '/admin/banners', label: 'Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { to: '/admin/cms', label: 'CMS Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { to: '/admin/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      ],
    },
    {
      label: 'Reports & Logs',
      resource: 'reports',
      links: [
        { to: '/admin/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { to: '/admin/seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      ],
    },
    {
      label: 'Settings',
      resource: 'settings',
      links: [
        { to: '/admin/shipping', label: 'Shipping', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { to: '/admin/sub-admins', label: 'Sub-Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { to: '/admin/roles', label: 'Roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { to: '/admin/footer', label: 'Footer Settings', icon: 'M3 4h18M3 8h18m-3 4h3m-6 4h6m-9 4h9' },
      ],
    },
  ];

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <div className="w-7 h-7 bg-primary rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-display font-bold tracking-tight truncate min-w-0 flex-1">{siteTitle}</span>
          <button onClick={onClose} className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-primary flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-5 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Admin Panel</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {sections.map((section) => {
            const visibleLinks = section.links.filter(l => canAccess(PERMISSION_LINK_MAP[l.to]));
            if (visibleLinks.length === 0) return null;
            const hasActive = visibleLinks.some((link) => window.location.pathname === link.to);
            const isCollapsed = collapsed[section.label];
            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleGroup(section.label)}
                  className={`group flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all duration-200 ${
                    hasActive
                      ? 'text-primary bg-primary/[0.06]'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 text-left uppercase">{section.label}</div>
                  <div className={`flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 ${
                    hasActive ? 'bg-primary/10' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <svg className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                  <div className="ml-2 pl-3 border-l-2 border-gray-100 space-y-0.5 mt-0.5">
                    {visibleLinks.map((link) => (
                      <NavLink key={link.to} to={link.to} onClick={onClose} className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-all duration-150 group relative ${
                          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                        }`
                      }>
                        {({ isActive }) => (
                          <>
                            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />}
                            <svg className={`w-4 h-4 flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                            </svg>
                            {link.label}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.name || user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
