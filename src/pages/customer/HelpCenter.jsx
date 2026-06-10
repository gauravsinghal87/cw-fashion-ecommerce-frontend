import { useState, useEffect } from 'react';
import { get, post } from '../../utils/apiMethods';
import { API } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const CATEGORIES = [
  { value: 'order_issue', label: 'Order Issue' },
  { value: 'refund_issue', label: 'Refund Issue' },
  { value: 'return_issue', label: 'Return Issue' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'coupon_not_working', label: 'Coupon Not Working' },
  { value: 'account_problem', label: 'Account Problem' },
  { value: 'referral_issue', label: 'Referral Issue' },
  { value: 'product_issue', label: 'Product Issue' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const HelpCenter = () => {
  const [tab, setTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const { data } = await get(API.SUPPORT.TICKETS);
      setTickets(data.tickets || []);
      setCounts(data.counts || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getCount = (status) => counts.find(c => c._id === status)?.count || 0;

  const createTicket = async (e) => {
    e.preventDefault();
    if (!createForm.category || !createForm.subject || !createForm.description) {
      toast.error('Please fill all required fields'); return;
    }
    setCreating(true);
    try {
      await post(API.SUPPORT.TICKETS, createForm);
      toast.success('Ticket created!');
      setShowCreate(false);
      setCreateForm({ category: '', subject: '', description: '', priority: 'medium' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create ticket'); }
    finally { setCreating(false); }
  };

  const openTicket = async (ticket) => {
    try {
      const { data } = await get(API.SUPPORT.TICKET(ticket._id));
      setSelected(data.ticket);
    } catch { toast.error('Failed to load ticket'); }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await post(API.SUPPORT.REPLY(selected._id), { message: replyMsg });
      setSelected(data.ticket);
      setReplyMsg('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const reopenTicket = async () => {
    try {
      const { data } = await post(API.SUPPORT.REOPEN(selected._id));
      setSelected(data.ticket);
      toast.success('Ticket reopened');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reopen'); }
  };

  const submitFeedback = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmittingFeedback(true);
    try {
      await post(API.SUPPORT.FEEDBACK(selected._id), { rating, comment: feedbackComment });
      toast.success('Feedback submitted');
      setRating(0);
      setFeedbackComment('');
      openTicket(selected);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit feedback'); }
    finally { setSubmittingFeedback(false); }
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
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const priorityBadge = (p) => {
    const colors = { low: 'text-gray-500', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600 font-bold' };
    return colors[p] || '';
  };

  if (loading) return <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6">Help Center</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        <button onClick={() => { setTab('tickets'); setSelected(null); }} className={`text-sm px-4 py-2 min-h-[36px] whitespace-nowrap ${tab === 'tickets' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}>My Tickets</button>
        <button onClick={() => { setTab('tickets'); setSelected(null); setShowCreate(true); }} className={`text-sm px-4 py-2 min-h-[36px] whitespace-nowrap ${showCreate ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}>Create Ticket</button>
        <button onClick={() => setTab('faq')} className={`text-sm px-4 py-2 min-h-[36px] whitespace-nowrap ${tab === 'faq' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}>FAQ</button>
      </div>

      {/* ── MY TICKETS ── */}
      {tab === 'tickets' && !selected && (
        <div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6">
            <div className="card-luxe p-3 text-center"><p className="text-lg font-bold">{tickets.length}</p><p className="text-[10px] text-gray-500">Total</p></div>
            <div className="card-luxe p-3 text-center"><p className="text-lg font-bold text-blue-600">{getCount('open') + getCount('assigned')}</p><p className="text-[10px] text-gray-500">Open</p></div>
            <div className="card-luxe p-3 text-center"><p className="text-lg font-bold text-yellow-600">{getCount('in_progress') + getCount('waiting_for_customer')}</p><p className="text-[10px] text-gray-500">In Progress</p></div>
            <div className="card-luxe p-3 text-center"><p className="text-lg font-bold text-green-600">{getCount('resolved')}</p><p className="text-[10px] text-gray-500">Resolved</p></div>
            <div className="card-luxe p-3 text-center"><p className="text-lg font-bold text-gray-500">{getCount('closed')}</p><p className="text-[10px] text-gray-500">Closed</p></div>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-400 text-sm mb-4">No tickets yet</p><button onClick={() => setShowCreate(true)} className="btn-primary text-sm px-6 py-2.5 min-h-[44px]">Create First Ticket</button></div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div key={t._id} onClick={() => openTicket(t)} className="card-luxe p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 cursor-pointer hover:border-primary transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{t.ticketNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 border rounded ${statusBadge(t.status)}`}>{t.status?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.category?.replace(/_/g, ' ')} — {formatDate(t.createdAt)}</p>
                  </div>
                  <span className={`text-xs ${priorityBadge(t.priority)}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          )}

          {/* Create Ticket Modal */}
        </div>
      )}

      {/* ── TICKET CHAT ── */}
      {tab === 'tickets' && selected && (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">&larr; Back to Tickets</button>

          <div className="card-luxe p-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-mono">{selected.ticketNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.5 border rounded ${statusBadge(selected.status)}`}>{selected.status?.replace(/_/g, ' ')}</span>
              <span className={`text-[10px] ${priorityBadge(selected.priority)}`}>{selected.priority}</span>
            </div>
            <h3 className="text-sm font-semibold">{selected.subject}</h3>
            <p className="text-xs text-gray-500 mt-1">Category: {selected.category?.replace(/_/g, ' ')}</p>
          </div>

          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
            {selected.messages?.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.isInternal ? 'bg-yellow-50 border border-yellow-200' : msg.senderRole === 'admin' ? 'bg-gray-100' : 'bg-primary/10'}`}>
                  {msg.isInternal && <span className="text-[10px] text-yellow-600 font-semibold uppercase">Internal Note</span>}
                  <p className="text-sm">{msg.message}</p>
                  {msg.attachments?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.attachments.map((a, j) => (
                        <a key={j} href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">{a.originalName || 'Attachment'}</a>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">{msg.sender?.name || msg.senderRole} · {formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {selected.status !== 'closed' ? (
            <form onSubmit={sendReply} className="flex gap-2">
              <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-luxe text-sm flex-1 min-h-[44px]" placeholder="Type your message..." />
              <button type="submit" disabled={sending || !replyMsg.trim()} className="btn-primary text-sm px-5 min-h-[44px]">{sending ? '...' : 'Send'}</button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">This ticket is closed.</p>
              <button onClick={reopenTicket} className="btn-primary text-sm px-5 py-2.5 min-h-[44px]">Reopen Ticket</button>
            </div>
          )}

          {/* Feedback modal for closed tickets */}
          {selected.status === 'closed' && !selected.feedback?.rating && (
            <div className="mt-4 card-luxe p-4">
              <h4 className="text-sm font-semibold mb-3">Rate Your Support Experience</h4>
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
      )}

      {/* ── FAQ ── */}
      {tab === 'faq' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Frequently Asked Questions</h3>
          {[
            { q: 'How do I return a product?', a: 'Go to your Orders, click on the order, and select "Return" for eligible items within the return window.' },
            { q: 'How do I track my order?', a: 'You can track your order from the Orders page. Click on the order to see real-time tracking updates.' },
            { q: 'How do I use a coupon?', a: 'Enter the coupon code at checkout in the "Apply Coupon" field. The discount will be applied to your order total.' },
            { q: 'When will I get my refund?', a: 'Refunds are processed within 5-7 business days after the returned item is received and inspected.' },
          ].map((faq, i) => (
            <details key={i} className="card-luxe p-3 sm:p-4 group">
              <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      )}

      {/* Create Ticket Modal (always rendered when open) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-5 sm:p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4">Create Ticket</h3>
            <form onSubmit={createTicket} className="space-y-3">
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
                <button type="submit" disabled={creating} className="btn-primary text-sm px-6 py-2.5 min-h-[44px] flex-1">{creating ? 'Creating...' : 'Submit Ticket'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="text-sm px-4 py-2.5 min-h-[44px] border border-border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
