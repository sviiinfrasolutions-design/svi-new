'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Mail,
  Trash2,
  Edit3,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Eye,
} from 'lucide-react';
import { getToken } from './helpers';

interface Campaign {
  id: string;
  title: string;
  subject: string;
  recipient_group: 'all_users' | 'lottery_participants' | 'custom';
  custom_emails: string[] | null;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduled_at: string | null;
  reminder_at: string | null;
  reminder_sent_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

export function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<
    'all_users' | 'lottery_participants' | 'custom'
  >('all_users');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [scheduledAtInput, setScheduledAtInput] = useState('');
  const [reminderAtInput, setReminderAtInput] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');

  // Previews
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/admin/campaigns', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Time conversion helper UTC <-> IST (UTC+5:30)
  const toISTString = (utcString: string | null): string => {
    if (!utcString) return '';
    const date = new Date(utcString);
    // Format to local date picker format yyyy-MM-ddThh:mm
    const offset = 330; // 5 hours 30 mins
    const localDate = new Date(date.getTime() + offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const toUTCString = (istString: string): string => {
    if (!istString) return '';
    const date = new Date(istString);
    const offset = 330;
    const utcDate = new Date(date.getTime() - offset * 60 * 1000);
    return utcDate.toISOString();
  };

  const formatISTDisplay = (utcString: string | null): string => {
    if (!utcString) return 'Not set';
    return (
      new Date(utcString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' (IST)'
    );
  };

  // Open create/edit modal
  const openModal = async (campaign: Campaign | null = null) => {
    setFormError('');
    setIsPreviewMode(false);

    if (campaign) {
      try {
        const token = await getToken();
        const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.campaign) {
          const full = data.campaign;
          setEditingCampaign(full);
          setTitle(full.title);
          setSubject(full.subject);
          setBodyHtml(full.body_html || '');
          setRecipientGroup(full.recipient_group);
          setCustomEmailsInput(full.custom_emails ? full.custom_emails.join(', ') : '');
          setScheduledAtInput(toISTString(full.scheduled_at));
          setReminderAtInput(toISTString(full.reminder_at));
          setReminderSubject(full.reminder_subject || '');
        }
      } catch (err) {
        console.error('Error fetching campaign details:', err);
      }
    } else {
      setEditingCampaign(null);
      setTitle('');
      setSubject('');
      setBodyHtml(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #1a1a2e; border-bottom: 2px solid #c9a84c; padding-bottom: 10px;">🌟 Exclusive Update from SVI Infra</h2>
  <p>Hello,</p>
  <p>We are delighted to bring you our latest updates, investment plans, and property details!</p>
  
  <div style="background: #f8f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a2e;">🏗️ Current Hot Projects</h3>
    <p>Discover luxury living and high return investments on our standard pricing premium flats.</p>
  </div>
  
  <p>For more details, visit our dashboard or contact your account manager directly.</p>
  <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
    SVI Infra Solutions. All rights reserved.
  </p>
</div>`);
      setRecipientGroup('all_users');
      setCustomEmailsInput('');
      setScheduledAtInput('');
      setReminderAtInput('');
      setReminderSubject('');
    }
    setIsModalOpen(true);
  };

  // Submit Form (Save Draft / Schedule)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !bodyHtml) {
      setFormError('Please fill in Title, Subject, and HTML Content.');
      return;
    }

    const customEmails =
      recipientGroup === 'custom'
        ? customEmailsInput
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : [];

    if (recipientGroup === 'custom' && customEmails.length === 0) {
      setFormError('Please enter at least one valid recipient email.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const payload = {
      title,
      subject,
      body_html: bodyHtml,
      recipient_group: recipientGroup,
      custom_emails: recipientGroup === 'custom' ? customEmails : null,
      scheduled_at: scheduledAtInput ? toUTCString(scheduledAtInput) : null,
      reminder_at: reminderAtInput ? toUTCString(reminderAtInput) : null,
      reminder_subject: reminderSubject || null,
    };

    try {
      const token = await getToken();
      const url = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Immediate send
  const handleSendImmediately = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to send this campaign immediately to all group members? This action is irreversible.'
      )
    )
      return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Failed to send: ' + data.error);
      } else {
        alert(`Successfully sent immediately to ${data.sent} recipients!`);
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      alert('Error sending campaign');
    }
  };

  // Delete / Cancel campaign
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete/cancel this campaign?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchCampaigns();
      } else {
        const data = await res.json();
        alert('Failed to delete: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sent
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
            <Clock className="h-3.5 w-3.5" /> Scheduled
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-white/10 dark:text-gray-400">
            <Edit3 className="h-3.5 w-3.5" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-gray-700 dark:bg-[#0e0e14]">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent py-2.5 pr-4 pl-10 text-sm focus:outline-none dark:border-gray-700"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'draft', 'scheduled', 'sent', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-brand-gold text-brand-navy font-bold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-gold text-brand-navy inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
          Create Campaign
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-[#0e0e14]">
          <Mail className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No campaigns found</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Draft an email update, set recipient criteria, and test immediately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredCampaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-[#0e0e14]"
            >
              {/* Header block */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Mail className="text-brand-gold h-3.5 w-3.5" />
                      Subject:{' '}
                      <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                        {c.subject}
                      </span>
                    </p>
                  </div>
                  {getStatusBadge(c.status)}
                </div>

                {/* Meta properties */}
                <div className="mt-2 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3.5 text-xs dark:bg-gray-800/40">
                  <div>
                    <span className="mb-0.5 block text-gray-400">Recipients</span>
                    <span className="font-semibold text-gray-900 capitalize dark:text-white">
                      {c.recipient_group.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="mb-0.5 block font-medium text-gray-400">Recipients Sent</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {c.status === 'sent' ? c.recipient_count : 'Not sent yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2 border-t border-gray-100 pt-4 text-xs dark:border-gray-700/50">
                {c.scheduled_at && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="h-3.5 w-3.5" /> Scheduled Send:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatISTDisplay(c.scheduled_at)}
                    </span>
                  </div>
                )}
                {c.reminder_at && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="h-3.5 w-3.5" /> Reminder Email:
                    </span>
                    <span
                      className={`font-semibold ${c.reminder_sent_at ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}
                    >
                      {c.reminder_sent_at ? 'Sent' : formatISTDisplay(c.reminder_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  {c.status !== 'sent' && c.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => openModal(c)}
                        className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Edit Campaign"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendImmediately(c.id)}
                        className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors hover:brightness-110"
                        title="Send Campaign Now"
                      >
                        <Play className="h-3.5 w-3.5" /> Send Now
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  title="Delete Campaign"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Right Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative flex h-full w-full max-w-2xl flex-col justify-between bg-white shadow-2xl transition-transform duration-300 dark:bg-[#0e0e14]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-800/20">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Define subject, content and schedule parameters
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Scroll */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
              {formError && (
                <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Title & Subject */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Campaign Title (Internal)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Property Launch Alert"
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm focus:outline-none dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 🎉 Exclusive pre-launch booking now open at premium rates!"
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm focus:outline-none dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Recipient Targeting */}
              <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Target Recipients
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="recipient_group"
                      value="all_users"
                      checked={recipientGroup === 'all_users'}
                      onChange={() => setRecipientGroup('all_users')}
                      className="accent-brand-gold"
                    />
                    All Users
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="recipient_group"
                      value="lottery_participants"
                      checked={recipientGroup === 'lottery_participants'}
                      onChange={() => setRecipientGroup('lottery_participants')}
                      className="accent-brand-gold"
                    />
                    Lottery Participants
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="recipient_group"
                      value="custom"
                      checked={recipientGroup === 'custom'}
                      onChange={() => setRecipientGroup('custom')}
                      className="accent-brand-gold"
                    />
                    Custom List
                  </label>
                </div>

                {recipientGroup === 'custom' && (
                  <div className="mt-2 space-y-1">
                    <textarea
                      value={customEmailsInput}
                      onChange={(e) => setCustomEmailsInput(e.target.value)}
                      placeholder="e.g. client1@gmail.com, client2@outlook.com"
                      rows={2}
                      className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 text-xs focus:outline-none dark:border-gray-700"
                    />
                    <p className="text-[10px] text-gray-400">Comma-separated email addresses.</p>
                  </div>
                )}
              </div>

              {/* Scheduling & Reminders */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    <Calendar className="text-brand-gold h-3.5 w-3.5" />
                    Scheduled Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAtInput}
                    onChange={(e) => setScheduledAtInput(e.target.value)}
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm focus:outline-none dark:border-gray-700"
                  />
                  <p className="text-[10px] text-gray-400">Leave blank to save as Draft.</p>
                </div>

                <div className="space-y-2">
                  <label className="block flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    <Clock className="text-brand-gold h-3.5 w-3.5" />
                    Reminder Date & Time (IST)
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderAtInput}
                    onChange={(e) => setReminderAtInput(e.target.value)}
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm focus:outline-none dark:border-gray-700"
                  />
                  <p className="text-[10px] text-gray-400">
                    Optional automatic reminder email follow-up.
                  </p>
                </div>
              </div>

              {reminderAtInput && (
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Reminder Email Subject (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={reminderSubject}
                    onChange={(e) => setReminderSubject(e.target.value)}
                    placeholder="e.g. ⏰ Last chance: pre-launch offer ends today!"
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm focus:outline-none dark:border-gray-700"
                  />
                </div>
              )}

              {/* Rich Body Content HTML */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                    HTML Body Editor
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {isPreviewMode ? 'Edit Mode' : 'Live Preview'}
                  </button>
                </div>

                {isPreviewMode ? (
                  <div className="min-h-[300px] overflow-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#0e0e14]">
                    <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="Provide HTML formatted code for premium responsive rendering."
                    className="focus:border-brand-gold/50 dark:focus:border-brand-gold/50 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 font-mono text-xs focus:outline-none dark:border-gray-700"
                  />
                )}
              </div>
            </form>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/20">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-xl bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-brand-gold text-brand-navy inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all hover:brightness-110"
              >
                <Send className="h-4 w-4" />
                {isSubmitting
                  ? 'Saving...'
                  : scheduledAtInput
                    ? 'Schedule Campaign'
                    : 'Save Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
