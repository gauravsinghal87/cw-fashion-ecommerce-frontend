import { useState, useEffect } from 'react';
import { get, post, put, del } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const PERMISSION_GROUPS = [
  {
    label: 'Dashboard', key: 'dashboard',
    permissions: [{ key: 'dashboard', label: 'View Dashboard' }],
  },
  {
    label: 'Users', key: 'users',
    permissions: [
      { key: 'users.view', label: 'View Users' },
      { key: 'users.suspend', label: 'Suspend/Activate Users' },
      { key: 'users.ban', label: 'Ban Users' },
      { key: 'users.wallet', label: 'Adjust Wallet' },
    ],
  },
  {
    label: 'Products', key: 'products',
    permissions: [
      { key: 'products.view', label: 'View Products' },
      { key: 'products.approve', label: 'Approve/Reject' },
      { key: 'products.edit', label: 'Edit (Featured/Flash Sale)' },
      { key: 'products.delete', label: 'Hide/Unhide' },
    ],
  },
  {
    label: 'Orders', key: 'orders',
    permissions: [
      { key: 'orders.view', label: 'View Orders' },
      { key: 'orders.update', label: 'Update Status' },
      { key: 'orders.cancel', label: 'Cancel Orders' },
      { key: 'orders.refund', label: 'Force Refund' },
      { key: 'orders.forceDeliver', label: 'Force Deliver' },
    ],
  },
  {
    label: 'Vendors', key: 'vendors',
    permissions: [
      { key: 'vendors.view', label: 'View Vendors' },
      { key: 'vendors.approve', label: 'Approve/Reject' },
      { key: 'vendors.suspend', label: 'Suspend' },
      { key: 'vendors.ban', label: 'Ban' },
      { key: 'vendors.edit', label: 'Edit Details' },
    ],
  },
  {
    label: 'Returns', key: 'returns',
    permissions: [
      { key: 'returns.view', label: 'View Returns' },
      { key: 'returns.approve', label: 'Approve/Schedule/QC' },
      { key: 'returns.reject', label: 'Reject Returns' },
      { key: 'returns.refund', label: 'Process Refund' },
    ],
  },
  {
    label: 'Coupons', key: 'coupons',
    permissions: [
      { key: 'coupons.view', label: 'View Coupons' },
      { key: 'coupons.create', label: 'Create Coupons' },
      { key: 'coupons.edit', label: 'Edit Coupons' },
      { key: 'coupons.delete', label: 'Delete Coupons' },
    ],
  },
  {
    label: 'Categories', key: 'categories',
    permissions: [
      { key: 'categories.view', label: 'View Categories' },
      { key: 'categories.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'Brands', key: 'brands',
    permissions: [
      { key: 'brands.view', label: 'View Brands' },
      { key: 'brands.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'Banners', key: 'banners',
    permissions: [
      { key: 'banners.view', label: 'View Banners' },
      { key: 'banners.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'CMS Pages', key: 'cms',
    permissions: [
      { key: 'cms.view', label: 'View CMS' },
      { key: 'cms.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'Notifications', key: 'notifications',
    permissions: [
      { key: 'notifications.view', label: 'View Notifications' },
      { key: 'notifications.send', label: 'Send Notifications' },
    ],
  },
  {
    label: 'Reports', key: 'reports',
    permissions: [
      { key: 'reports.view', label: 'View All Reports' },
    ],
  },
  {
    label: 'Withdrawals', key: 'withdrawals',
    permissions: [
      { key: 'withdrawals.view', label: 'View Withdrawals' },
      { key: 'withdrawals.approve', label: 'Approve/Reject/Hold' },
    ],
  },
  {
    label: 'Settlements', key: 'settlements',
    permissions: [
      { key: 'settlements.view', label: 'View Settlements' },
      { key: 'settlements.release', label: 'Release Settlements' },
    ],
  },
  {
    label: 'Support', key: 'support',
    permissions: [
      { key: 'support.view', label: 'View Tickets' },
      { key: 'support.reply', label: 'Reply Tickets' },
      { key: 'support.assign', label: 'Assign Tickets' },
      { key: 'support.manage', label: 'Change Status / Close / Escalate' },
    ],
  },
  {
    label: 'Settings', key: 'settings',
    permissions: [
      { key: 'settings.view', label: 'View Settings' },
      { key: 'settings.manage', label: 'Manage Settings' },
    ],
  },
  {
    label: 'SEO', key: 'seo',
    permissions: [
      { key: 'seo.view', label: 'View SEO' },
      { key: 'seo.manage', label: 'Manage SEO' },
    ],
  },
  {
    label: 'Wallet', key: 'wallet',
    permissions: [
      { key: 'wallet.view', label: 'View Wallet Transactions' },
      { key: 'wallet.manage', label: 'Manage Wallet' },
    ],
  },
  {
    label: 'Shipping', key: 'shipping',
    permissions: [
      { key: 'shipping.view', label: 'View Shipping Settings' },
      { key: 'shipping.manage', label: 'Manage Shipping' },
    ],
  },
  {
    label: 'Reviews', key: 'reviews',
    permissions: [
      { key: 'reviews.view', label: 'View Reviews' },
      { key: 'reviews.manage', label: 'Moderate Reviews' },
    ],
  },
  {
    label: 'Payments', key: 'payments',
    permissions: [
      { key: 'payments.view', label: 'View Payments' },
      { key: 'payments.manage', label: 'Manage Payments' },
    ],
  },
  {
    label: 'Sub-Admins', key: 'subAdmins',
    permissions: [
      { key: 'subAdmins.view', label: 'View Sub-Admins' },
      { key: 'subAdmins.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'Roles', key: 'roles',
    permissions: [
      { key: 'roles.view', label: 'View Roles' },
      { key: 'roles.manage', label: 'Create/Edit/Delete' },
    ],
  },
  {
    label: 'Inventory', key: 'inventory',
    permissions: [
      { key: 'inventory.view', label: 'View Inventory' },
    ],
  },
  {
    label: 'Audit Logs', key: 'auditLogs',
    permissions: [
      { key: 'auditLogs.view', label: 'View Audit Logs' },
    ],
  },
  {
    label: 'Referrals', key: 'referrals',
    permissions: [
      { key: 'referrals.view', label: 'View Referrals' },
      { key: 'referrals.manage', label: 'Flag Fraud' },
    ],
  },
];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: {} });
  const [saving, setSaving] = useState(false);

  const allPermissionKeys = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

  function flattenNested(nested) {
    const flat = {};
    for (const [res, actions] of Object.entries(nested || {})) {
      if (typeof actions === 'object' && actions !== null) {
        for (const [act, val] of Object.entries(actions)) {
          flat[`${res}.${act}`] = val;
        }
      } else {
        flat[res] = actions;
      }
    }
    return flat;
  }

  function nestFlat(flat) {
    const nested = {};
    for (const [key, val] of Object.entries(flat || {})) {
      if (key.includes('.')) {
        const [res, act] = key.split('.');
        if (!nested[res]) nested[res] = {};
        nested[res][act] = val;
      } else {
        nested[key] = val;
      }
    }
    return nested;
  }

  useEffect(() => {
    get(API.ADMIN.ROLES).then(({ data }) => setRoles(data.roles || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    const perms = {};
    allPermissionKeys.forEach(k => { perms[k] = false; });
    setForm({ name: '', description: '', permissions: perms });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    const flat = flattenNested(r.permissions);
    const perms = {};
    allPermissionKeys.forEach(k => { perms[k] = flat[k] || false; });
    setForm({ name: r.name, description: r.description || '', permissions: perms });
    setEditing(r._id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name: form.name, description: form.description, permissions: nestFlat(form.permissions) };
      if (editing) await put(API.ADMIN.ROLE(editing), body);
      else await post(API.ADMIN.ROLES, body);
      toast.success(editing ? 'Updated' : 'Created');
      setShowForm(false);
      const { data } = await get(API.ADMIN.ROLES);
      setRoles(data.roles || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete role?')) return;
    try { await del(API.ADMIN.ROLE(id)); setRoles(prev => prev.filter(r => r._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const togglePerm = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));
  };

  const getGroupPerms = (group) => {
    return group.permissions.every(p => form.permissions[p.key]);
  };

  const setGroupPerms = (group, val) => {
    const updated = { ...form.permissions };
    group.permissions.forEach(p => { updated[p.key] = val; });
    setForm({ ...form, permissions: updated });
  };

  const permissionCount = (perms) => {
    if (!perms) return 0;
    const flat = flattenNested(perms);
    return Object.entries(flat).filter(([, v]) => v).length;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Roles & Permissions</h1>
        <Button onClick={openAdd} size="sm">+ Add Role</Button>
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg shadow">
        <table className="w-full text-sm border border-border min-w-[650px] lg:min-w-0">
          <thead><tr className="bg-gray-50 text-left"><th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Name</th><th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Permissions</th><th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="p-10 text-center text-gray-400">Loading...</td></tr> : roles.length === 0 ? <tr><td colSpan={3} className="p-10 text-center text-gray-400">No roles</td></tr> : roles.map((r) => (
              <tr key={r._id} className="border-t border-border hover:bg-gray-50">
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{r.name}</td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{permissionCount(r.permissions)} permissions</span>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                  <button onClick={() => openEdit(r)} className="text-xs text-primary hover:underline mr-3 min-h-[36px]">Edit</button>
                  <button onClick={() => remove(r._id)} className="text-xs text-danger hover:underline min-h-[36px]">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full sm:max-w-3xl mx-2 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto m-0 sm:m-4 rounded-none sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Role' : 'Add Role'}</h2>
            <form onSubmit={save} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Role Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-3">Permissions</label>
                <div className="divide-y divide-gray-100 border border-border rounded-lg">
                  {PERMISSION_GROUPS.map((group) => {
                    const allChecked = getGroupPerms(group);
                    const someChecked = group.permissions.some(p => form.permissions[p.key]);
                    return (
                      <div key={group.key} className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id={`group-${group.key}`}
                            checked={allChecked}
                            ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                            onChange={() => setGroupPerms(group, !allChecked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`group-${group.key}`} className="text-xs font-semibold text-gray-700 cursor-pointer select-none">{group.label}</label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 ml-5">
                          {group.permissions.map((p) => (
                            <label key={p.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none min-h-[32px]">
                              <input
                                type="checkbox"
                                checked={!!form.permissions[p.key]}
                                onChange={() => togglePerm(p.key)}
                                className="rounded border-gray-300"
                              />
                              {p.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-white py-2 border-t border-gray-100">
                <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm border border-border hover:bg-gray-50 w-full sm:w-auto min-h-[44px]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
