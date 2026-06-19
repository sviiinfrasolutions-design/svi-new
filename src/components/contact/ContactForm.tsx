'use client';

import { useCallback, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { submitContactForm } from '@/src/actions/contact';

const DIGIT_REGEX = /\d/g;

export default function ContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = 'Name can only contain letters and spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const digitCount = (formData.phone.match(DIGIT_REGEX) || []).length;
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.length < 3)
      newErrors.subject = 'Subject must be at least 3 characters';

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10)
      newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      try {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
        const result = await submitContactForm(fd);
        if (!result.success) {
          setSubmitError(result.error || 'Submission failed');
          return;
        }
        router.push('/thank-you');
      } catch {
        setSubmitError('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, router]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  return (
    <div className="border border-gray-200 bg-white p-6 shadow-sm md:p-10 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
        Inquiries
      </h4>
      <h3 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
        Send a Message
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
              placeholder="+91"
            />
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1 flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength={100}
              aria-invalid={errors.subject ? 'true' : 'false'}
              aria-describedby={errors.subject ? 'subject-error' : 'subject-count'}
              className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.subject ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.subject ? (
                <p
                  id="subject-error"
                  className="flex items-center gap-1 text-xs text-red-500"
                  role="alert"
                >
                  <AlertCircle size={12} /> {errors.subject}
                </p>
              ) : (
                <span></span>
              )}
              <span id="subject-count" className="text-[10px] text-gray-400">
                {formData.subject.length}/100
              </span>
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            name="message"
            value={formData.message}
            onChange={handleChange}
            maxLength={1000}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : 'message-count'}
            className={`w-full resize-none border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.message ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
          ></textarea>
          <div className="mt-1 flex items-center justify-between">
            {errors.message ? (
              <p
                id="message-error"
                className="flex items-center gap-1 text-xs text-red-500"
                role="alert"
              >
                <AlertCircle size={12} /> {errors.message}
              </p>
            ) : (
              <span></span>
            )}
            <span id="message-count" className="text-[10px] text-gray-400">
              {formData.message.length}/1000
            </span>
          </div>
        </div>
        {submitError && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} /> {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"></div>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
