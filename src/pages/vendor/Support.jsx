import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '../../utils/helpers';

const CATEGORIES = [
  { value: 'product_approval', label: 'Product Approval Issue' },
  { value: 'settlement_issue', label: 'Settlement Issue' },
  { value: 'withdrawal_issue', label: 'Withdrawal Issue' },
  { value: 'inventory_issue', label: 'Inventory Issue' },
  { value: 'store_issue', label: 'Store Issue' },
  { value: 'commission_issue', label: 'Commission Issue' },
  { value: 'technical_problem', label: 'Technical Problem' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUSES = ['open', 'assigned', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'];

const statusBadge = (status) => {
  const colors = {
    open: 'text-blue-600 bg-blue-50 border-blue-200',
    assigned: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    in_progress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    waiting_for_customer: 'text-purple-600 bg-purple-50 border-purple-200',
    resolved: 'text-green-600 bg-green-50 border-green-200',
    closed: 'text-gray-500 bg-gray-100 border-gray-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
};

const priorityBadge = (p) => {
  const colors = { low: 'text-gray-500', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600 font-bold' };
  return colors[p] || '';
};

const VendorSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ category: '', subject: '', description: '', priority: 'medium' });
  const [creating, setCreating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await get(`${API.VENDORS.SUPPORT_TICKETS}${params}`);
      setTickets(data.tickets || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const openTicket = async (ticket) => {
    try {
      const { data } = await get(API.VENDORS.SUPPORT_TICKET_DETAIL(ticket._id));
      setSelected(data.ticket);
    } catch { toast.error('Failed to load ticket'); }
  };

  const createSupportTicket = async (e) => {
    e.preventDefault();
    if (!createForm.category || !createForm.subject || !createForm.description) {
      toast.error('Please fill all required fields'); return;
    }
    setCreating(true);
    try {
      await post(API.VENDORS.SUPPORT_TICKET_CREATE, createForm);
      toast.success('Ticket created!');
      setShowCreate(false);
      setCreateForm({ category: '', subject: '', description: '', priority: 'medium' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create ticket'); }
    finally { setCreating(false); }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await post(API.VENDORS.SUPPORT_TICKET_REPLY(selected._id), { message: replyMsg });
      setSelected(data.ticket);
      setReplyMsg('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const reopenTicket = async () => {
    try {
      const { data } = await post(API.VENDORS.SUPPORT_TICKET_REOPEN(selected._id));
      setSelected(data.ticket);
      toast.success('Ticket reopened');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reopen'); }
  };

  const submitFeedback = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmittingFeedback(true);
    try {
      await post(API.VENDORS.SUPPORT_TICKET_FEEDBACK(selected._id), { rating, comment: feedbackComment });
      toast.success('Feedback submitted');
      setRating(0);
      setFeedbackComment('');
      openTicket(selected);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmittingFeedback(false); }
  };

  const filteredTickets = filter ? tickets.filter(t => t.status === filter) : tickets;

  if (loading && tickets.length === 0) return <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>;

  // ── DETAIL VIEW ──
  if (selected) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">&larr; Back to Tickets</button>

        <div className="card-luxe p-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{selected.ticketNumber}</span>
            <span className={`text-[10px] px-1.5 py-0.5 border rounded ${statusBadge(selected.status)}`}>{selected.status?.replace(/_/g, ' ')}</span>
            <span className={`text-xs ${priorityBadge(selected.priority)}`}>{selected.priority}</span>
          </div>
          <h3 className="text-sm font-semibold">{selected.subject}</h3>
          <p className="text-xs text-gray-500 mt-1">{selected.category?.replace(/_/g, ' ')} · Created {formatDateTime(selected.createdAt)}</p>
          {selected.assignedTo && <p className="text-xs text-gray-500 mt-1">Assigned to: {selected.assignedTo.name}</p>}
        </div>

        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {selected.messages?.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderRole === 'admin' || msg.senderRole === 'subadmin' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.senderRole === 'admin' || msg.senderRole === 'subadmin' ? 'bg-gray-100' : 'bg-primary/10'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments?.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {msg.attachments.map((a, j) => (
                      <a key={j} href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">{a.originalName || 'Attachment'}</a>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">{msg.sender?.name || msg.senderRole} · {formatDateTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {selected.status !== 'closed' ? (
          <form onSubmit={sendReply} className="flex gap-2">
            <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-luxe text-sm flex-1 min-h-[44px]" placeholder="Type your message..." />
            <button type="submit" disabled={sending || !replyMsg.trim()} className="btn-primary text-sm px-5 min-h-[44px]">{sending ? 'Sending...' : 'Send'}</button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">This ticket is closed.</p>
            <button onClick={reopenTicket} className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">Reopen Ticket</button>
          </div>
        )}

        {selected.status === 'closed' && !selected.feedback?.rating && (
          <div className="mt-4 card-luxe p-4">
            <h4 className="text-sm font-semibold mb-3">Rate Support</h4>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className={`w-8 h-8 text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <textarea value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} className="input-luxe text-sm w-full h-16 min-h-[44px] mb-2" placeholder="Optional comment..." />
            <button onClick={submitFeedback} disabled={submittingFeedback || !rating} className="btn-primary text-sm px-4 py-2 min-h-[36px]">{submittingFeedback ? 'Submitting...' : 'Submit Feedback'}</button>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Support</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">Create Ticket</button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2">
        {['', ...STATUSES].map(s => (
          <button key={s || 'all'} onClick={() => setFilter(s)} className={`text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px] whitespace-nowrap border rounded-full transition-colors ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-border hover:border-gray-400'}`}>
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm mb-4">No tickets found</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">Create Ticket</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((t) => (
            <div key={t._id} onClick={() => openTicket(t)} className="card-luxe p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 cursor-pointer hover:border-primary transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{t.ticketNumber || t._id.slice(-6)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 border rounded ${statusBadge(t.status)}`}>{t.status?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm font-medium truncate">{t.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.category?.replace(/_/g, ' ')} · {formatDate(t.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {t.assignedTo && <span className="text-[10px] text-gray-400">{t.assignedTo.name}</span>}
                <span className={`text-xs ${priorityBadge(t.priority)}`}>{t.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-5 sm:p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4">Create Ticket</h3>
            <form onSubmit={createSupportTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                <input value={createForm.subject} onChange={e => setCreateForm({ ...createForm, subject: e.target.value })} className="input-luxe text-sm w-full min-h-[44px]" placeholder="Brief title" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="input-luxe text-sm w-full h-24 min-h-[44px]" placeholder="Describe your issue in detail" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={creating} className="btn-primary text-sm px-6 py-2.5 min-h-[44px] flex-1">{creating ? 'Creating...' : 'Submit'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm px-4 py-2.5 min-h-[44px] border border-border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorSupport;
