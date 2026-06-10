import { useState, useEffect } from 'react';
import { get, post, put } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const SubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      get(API.ADMIN.SUB_ADMINS).then(({ data }) => setSubAdmins(data.subAdmins || [])),
      get(API.ADMIN.ROLES).then(({ data }) => setRoles(data.roles || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', roleId: roles[0]?._id || '' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      name: s.name || '',
      email: s.email || '',
      password: '',
      roleId: s.roleId?._id || s.roleId || '',
    });
    setEditing(s._id);
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const body = { name: form.name, email: form.email, roleId: form.roleId };
        if (form.password) body.password = form.password;
        await put(API.ADMIN.SUB_ADMIN(editing), body);
      } else {
        await post(API.ADMIN.SUB_ADMINS, form);
      }
      toast.success(editing ? 'Updated' : 'Created');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', roleId: '' });
      const { data } = await get(API.ADMIN.SUB_ADMINS);
      setSubAdmins(data.subAdmins || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, current) => {
    const action = current ? 'Deactivate' : 'Activate';
    if (!confirm(`${action} this sub-admin?`)) return;
    try {
      await put(API.ADMIN.SUB_ADMIN(id), { isActive: !current });
      const { data } = await get(API.ADMIN.SUB_ADMINS);
      setSubAdmins(data.subAdmins || []);
      toast.success(`${action}d`);
    } catch { toast.error('Failed'); }
  };

  const permissionCount = (roleObj) => {
    if (!roleObj?.permissions) return 0;
    let count = 0;
    for (const val of Object.values(roleObj.permissions)) {
      if (typeof val === 'object' && val !== null) {
        count += Object.values(val).filter(Boolean).length;
      } else if (val) {
        count++;
      }
    }
    return count;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold">Sub-Admins</h1>
        <Button onClick={openAdd} size="sm">+ Add Sub-Admin</Button>
      </div>
      <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg shadow">
        <table className="w-full text-sm border border-border min-w-[750px] lg:min-w-0">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Name</th>
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Email</th>
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Role</th>
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Permissions</th>
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Status</th>
            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading...</td></tr> : subAdmins.length === 0 ? <tr><td colSpan={6} className="p-10 text-center text-gray-400">No sub-admins</td></tr> : subAdmins.map((s) => (
              <tr key={s._id} className="border-t border-border hover:bg-gray-50">
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{s.name}</td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">{s.email}</td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">{s.roleId?.name || '—'}</td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{permissionCount(s.roleId)} permissions</span>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                  <span className={`text-[10px] px-2 py-0.5 ${s.isActive ? 'bg-success/10 text-success' : 'bg-red-50 text-red-600'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                  <button onClick={() => openEdit(s)} className="text-xs text-primary hover:underline mr-3 min-h-[36px]">Edit</button>
                  <button onClick={() => toggleActive(s._id, s.isActive)} className={`text-xs min-h-[36px] ${s.isActive ? 'text-danger' : 'text-success'} hover:underline`}>{s.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full sm:max-w-lg mx-2 sm:mx-4 p-4 sm:p-6 max-h-[85vh] overflow-y-auto m-0 sm:m-4 rounded-none sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Sub-Admin' : 'Add Sub-Admin'}</h2>
            <form onSubmit={save} className="space-y-3 sm:space-y-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Role</label>
                <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select a role</option>
                  {roles.filter(r => r.isActive !== false).map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
              {editing && <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Password (leave blank to keep current)</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="••••••••" /></div>}
              {!editing && <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required /></div>}

              {form.roleId && (() => {
                const selected = roles.find(r => r._id === form.roleId);
                if (!selected) return null;
                let count = 0;
                for (const v of Object.values(selected.permissions || {})) {
                  if (typeof v === 'object' && v !== null) count += Object.values(v).filter(Boolean).length;
                  else if (v) count++;
                }
                return (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Role: <span className="text-gray-900">{selected.name}</span></p>
                    <p className="text-[10px] text-gray-400">{count} permission{count !== 1 ? 's' : ''} assigned</p>
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
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

export default SubAdmins;
