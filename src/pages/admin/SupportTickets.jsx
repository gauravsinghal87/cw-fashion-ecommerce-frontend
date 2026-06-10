import { useState, useEffect } from 'react';
import { get, put, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '../../utils/helpers';

const STATUSES = ['open', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [filter, setFilter] = useState({ status: '', source: '', search: '' });
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [noteBody, setNoteBody] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.source) params.set('source', filter.source);
      if (filter.search) params.set('search', filter.search);
      params.set('page', page);
      params.set('limit', 20);
      const [ticketRes, statsRes, agentRes] = await Promise.all([
        get(`${API.ADMIN_SUPPORT.TICKETS}?${params}`),
        get(API.ADMIN_SUPPORT.STATS),
        get(API.ADMIN_SUPPORT.AGENTS),
      ]);
      setTickets(ticketRes.data.tickets || []);
      setTotalPages(ticketRes.data.pagination?.totalPages || 1);
      setStats(statsRes.data.stats);
      setAgents(agentRes.data.agents || []);
    } catch { toast.error('Failed to load support data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter.status, filter.source, filter.search, page]);

  useEffect(() => { setPage(1); }, [filter.status, filter.source, filter.search]);

  const openTicket = async (id) => {
    try {
      const { data } = await get(API.ADMIN_SUPPORT.TICKET(id));
      setSelected(data.ticket);
    } catch { toast.error('Failed to load ticket'); }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await post(API.ADMIN_SUPPORT.REPLY(selected._id), { message: replyMsg });
      setSelected(data.ticket);
      setReplyMsg('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  const assignAgent = async (agentId) => {
    try {
      const { data } = await put(API.ADMIN_SUPPORT.ASSIGN(selected._id), { assignedTo: agentId || null });
      setSelected(data.ticket);
      toast.success('Assigned');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeStatus = async (status) => {
    try {
      const { data } = await put(API.ADMIN_SUPPORT.STATUS(selected._id), { status });
      setSelected(data.ticket);
      toast.success(`Status: ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const escalate = async () => {
    const agentId = prompt('Enter agent ID to escalate to (leave blank to unassign):');
    try {
      const { data } = await post(API.ADMIN_SUPPORT.ESCALATE(selected._id), { escalatedTo: agentId || undefined, reason: 'Escalated by support' });
      setSelected(data.ticket);
      toast.success('Escalated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await post(API.ADMIN_SUPPORT.NOTES(selected._id), { body: noteBody });
      setSelected(data.ticket);
      setNoteBody('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAddingNote(false); }
  };

  const statusBadge = (status) => {
    const colors = {
      open: 'text-blue-600 bg-blue-50 border-blue-200',
      assigned: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      in_progress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      waiting_for_customer: 'text-purple-600 bg-purple-50 border-purple-200',
      resolved: 'text-green-600 bg-green-50 border-green-200',
      closed: 'text-gray-500 bg-gray-100 border-gray-200',
    };
    return colors[status] || '';
  };

  const priorityColor = (p) => ({ low: 'text-gray-500', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600 font-bold' }[p] || '');

  if (loading) return <div className="p-4 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-20 skeleton" />)}</div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Support Tickets</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        <button onClick={() => { setTab('dashboard'); setSelected(null); }} className={`text-sm px-4 py-2 min-h-[36px] whitespace-nowrap ${tab === 'dashboard' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}>Dashboard</button>
        <button onClick={() => { setTab('tickets'); setSelected(null); }} className={`text-sm px-4 py-2 min-h-[36px] whitespace-nowrap ${tab === 'tickets' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}>All Tickets</button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold">{stats.total}</p><p className="text-[10px] sm:text-xs text-gray-500">Total</p></div>
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.open}</p><p className="text-[10px] sm:text-xs text-gray-500">Open</p></div>
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold text-green-600">{stats.resolved}</p><p className="text-[10px] sm:text-xs text-gray-500">Resolved</p></div>
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold text-gray-500">{stats.closed}</p><p className="text-[10px] sm:text-xs text-gray-500">Closed</p></div>
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold">{stats.monthlyTickets}</p><p className="text-[10px] sm:text-xs text-gray-500">This Month</p></div>
            <div className="card-luxe p-3 sm:p-4 text-center"><p className="text-xl sm:text-2xl font-bold">{stats.avgResolutionHours}h</p><p className="text-[10px] sm:text-xs text-gray-500">Avg Resolution</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card-luxe p-4">
              <h3 className="text-sm font-semibold mb-3">By Status</h3>
              <div className="space-y-2">
                {STATUSES.map(s => (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{stats.statusCounts?.[s] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-luxe p-4">
              <h3 className="text-sm font-semibold mb-3">By Source</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span>Customers</span><span className="font-medium">{stats.sourceCounts?.customer || 0}</span></div>
                <div className="flex items-center justify-between text-sm"><span>Vendors</span><span className="font-medium">{stats.sourceCounts?.vendor || 0}</span></div>
              </div>
              {stats.satisfaction > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-gray-500">Customer Satisfaction</p>
                  <p className="text-lg font-bold text-yellow-500">{stats.satisfaction} / 5</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ALL TICKETS ── */}
      {tab === 'tickets' && !selected && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 items-stretch">
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[140px]">
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filter.source} onChange={e => setFilter({ ...filter, source: e.target.value })} className="input-luxe text-sm min-h-[44px] w-full sm:w-auto sm:min-w-[120px]">
              <option value="">All Sources</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
            <input value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} className="input-luxe text-sm flex-1 min-h-[44px]" placeholder="Search ticket # or subject..." />
          </div>

          {tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No tickets found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left">
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Ticket</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">From</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Category</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Priority</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Status</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Assigned</th>
                  <th className="py-3 px-2 text-xs uppercase text-gray-500">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {tickets.map(t => (
                    <tr key={t._id} onClick={() => openTicket(t._id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-2 font-mono text-xs">{t.ticketNumber}<br /><span className="text-gray-700 font-medium">{t.subject?.slice(0, 30)}</span></td>
                      <td className="py-3 px-2 text-xs">{t.source === 'vendor' ? t.vendor?.storeName || 'Vendor' : t.user?.name || 'Customer'}</td>
                      <td className="py-3 px-2 text-xs capitalize">{t.category?.replace(/_/g, ' ')}</td>
                      <td className={`py-3 px-2 text-xs ${priorityColor(t.priority)}`}>{t.priority}</td>
                      <td className="py-3 px-2"><span className={`text-[10px] px-1.5 py-0.5 border ${statusBadge(t.status)}`}>{t.status?.replace(/_/g, ' ')}</span></td>
                      <td className="py-3 px-2 text-xs text-gray-500">{t.assignedTo?.name || '—'}</td>
                      <td className="py-3 px-2 text-xs text-gray-500">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-border disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ── TICKET DETAIL ── */}
      {tab === 'tickets' && selected && (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-4">&larr; Back to Tickets</button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat */}
            <div className="lg:col-span-2 card-luxe p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono text-gray-400">{selected.ticketNumber}</span>
                <span className={`text-[10px] px-1.5 py-0.5 border ${statusBadge(selected.status)}`}>{selected.status?.replace(/_/g, ' ')}</span>
                <span className={`text-xs ${priorityColor(selected.priority)}`}>{selected.priority}</span>
                <span className="text-xs text-gray-500">{selected.source}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{selected.subject}</h3>
              <p className="text-xs text-gray-500 mb-4">Category: {selected.category?.replace(/_/g, ' ')} · Created {formatDateTime(selected.createdAt)}</p>

              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {selected.messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderRole === 'customer' || msg.senderRole === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${msg.isInternal ? 'bg-yellow-50 border border-yellow-200' : msg.senderRole === 'admin' || msg.senderRole === 'subadmin' ? 'bg-gray-100' : 'bg-primary/10'}`}>
                      {msg.isInternal && <span className="text-[10px] text-yellow-600 font-semibold uppercase">Internal</span>}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachments?.length > 0 && <div className="flex gap-1 mt-1">{msg.attachments.map((a, j) => <a key={j} href={a.url} target="_blank" className="text-xs text-primary underline">{a.originalName || 'File'}</a>)}</div>}
                      <p className="text-[10px] text-gray-400 mt-1">{msg.sender?.name || msg.senderRole} · {formatDateTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.status !== 'closed' && (
                <form onSubmit={sendReply} className="flex gap-2">
                  <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-luxe text-sm flex-1 min-h-[44px]" placeholder="Reply..." />
                  <button type="submit" disabled={sending || !replyMsg.trim()} className="btn-primary text-sm px-4 min-h-[44px]">{sending ? '...' : 'Send'}</button>
                </form>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-3">
              <div className="card-luxe p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Assignment</h4>
                <select value={selected.assignedTo?._id || ''} onChange={e => assignAgent(e.target.value)} className="input-luxe text-sm w-full min-h-[44px]">
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.role})</option>)}
                </select>
              </div>

              <div className="card-luxe p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Status</h4>
                <div className="flex flex-wrap gap-1">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => changeStatus(s)} disabled={selected.status === s} className={`text-[10px] px-2 py-1 border rounded min-h-[28px] ${selected.status === s ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}>{s.replace(/_/g, ' ')}</button>
                  ))}
                </div>
              </div>

              <div className="card-luxe p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Escalate</h4>
                <select value={selected.escalatedTo?._id || ''} onChange={e => escalate(e.target.value)} className="input-luxe text-sm w-full min-h-[44px]">
                  <option value="">Not escalated</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.role})</option>)}
                </select>
              </div>

              <div className="card-luxe p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Internal Notes</h4>
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto">
                  {selected.internalNotes?.map((n, i) => (
                    <div key={i} className="bg-yellow-50 p-2 rounded text-xs">
                      <p>{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.createdBy?.name || 'Staff'} · {formatDateTime(n.createdAt)}</p>
                    </div>
                  ))}
                  {(!selected.internalNotes || selected.internalNotes.length === 0) && <p className="text-xs text-gray-400">No notes</p>}
                </div>
                <form onSubmit={addNote} className="flex gap-1">
                  <input value={noteBody} onChange={e => setNoteBody(e.target.value)} className="input-luxe text-xs flex-1 min-h-[36px]" placeholder="Add note..." />
                  <button type="submit" disabled={addingNote || !noteBody.trim()} className="btn-primary text-xs px-3 min-h-[36px]">{addingNote ? '...' : 'Add'}</button>
                </form>
              </div>

              {selected.feedback?.rating && (
                <div className="card-luxe p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Feedback</h4>
                  <p className="text-lg">{'★'.repeat(selected.feedback.rating)}{'☆'.repeat(5 - selected.feedback.rating)}</p>
                  {selected.feedback.comment && <p className="text-xs text-gray-600 mt-1">{selected.feedback.comment}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
