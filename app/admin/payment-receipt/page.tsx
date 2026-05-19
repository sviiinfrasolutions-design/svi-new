'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { Receipt, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function PaymentReceiptPage() {
  const { token } = useAdminSession();
  const [formData, setFormData] = useState({
    receiptNo: '',
    date: '',
    name: '',
    refId: '',
    amount: '',
    amountWords: '',
    paymentRef: '',
    drawnOn: '',
    plotNo: '',
    plotSize: '',
    account: '',
    paymentMethod: 'UPI', // Defaulted
  });

  const [preview, setPreview] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save document record to database
    if (token) {
      try {
        const response = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_type: 'payment_receipt',
            form_data: formData,
            status: 'draft',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDocumentId(data.document.id);
        }
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }

    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Receipt.pdf');

    // Update document status to completed
    if (documentId && token) {
      try {
        await fetch(`/api/admin/documents/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'completed' }),
        });
      } catch (error) {
        console.error('Failed to update document status:', error);
      }
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('receiptPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Receipt.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Payment <span className="text-brand-gold italic">Receipt</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate official payment receipts for client transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <Receipt className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Receipt Number"
                name="receiptNo"
                value={formData.receiptNo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <FormField
                label="Name (Mr./Mrs./M/s)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Ref. Id"
                name="refId"
                value={formData.refId}
                onChange={handleChange}
                required
              />
              <FormField
                label="Amount (in digits)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
              />

              <FormField
                label="Amount (in words)"
                name="amountWords"
                value={formData.amountWords}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />

              <FormSelect
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Bank Transfer', label: 'Bank Transfer' },
                  { value: 'UPI', label: 'UPI' },
                ]}
              />

              <FormField
                label="Payment Reference Number"
                name="paymentRef"
                value={formData.paymentRef}
                onChange={handleChange}
                required
              />
              <FormField
                label="Drawn On"
                name="drawnOn"
                type="date"
                value={formData.drawnOn}
                onChange={handleChange}
              />
              <FormField
                label="Plot No"
                name="plotNo"
                value={formData.plotNo}
                onChange={handleChange}
              />
              <FormField
                label="Plot Size"
                name="plotSize"
                value={formData.plotSize}
                onChange={handleChange}
                required
              />

              <FormField
                label="On Account Of"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Receipt
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <h2 className="mb-4 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900 dark:border-white/10 dark:text-white">
            Live Preview
          </h2>

          <PreviewContainer previewId="receiptPreview" hasPreview={preview}>
            {/* Header */}
            <div className="border-brand-gold flex items-start justify-between border-b-2 pb-6">
              <div>
                <h1 className="text-brand-navy font-serif text-2xl font-bold">
                  SVI Infra Solutions Pvt. Ltd
                </h1>
                <p className="mt-1 font-sans text-sm">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
                <p className="font-sans text-sm">
                  Cell: +91 9216014579 | Email: info@sviinfrasolutions.com
                </p>
                <p className="font-sans text-sm">Website: www.sviinfrasolutions.in</p>
              </div>
            </div>

            <div className="mt-6 mb-8 text-center">
              <h2 className="inline-block text-xl font-bold tracking-widest uppercase underline">
                Payment Receipt
              </h2>
            </div>

            <div className="mb-8 flex justify-between font-sans text-sm font-bold">
              <p className="rounded border border-gray-200 bg-gray-50 px-3 py-1.5">
                Receipt No: <span className="ml-1 text-red-600">{formData.receiptNo}</span>
              </p>
              <p className="rounded border border-gray-200 bg-gray-50 px-3 py-1.5">
                Date: <span className="ml-1 text-red-600">{formData.date}</span>
              </p>
            </div>

            <div className="mt-4 space-y-6 font-sans text-sm leading-relaxed">
              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap">
                  Received with thanks from Mr. / Mrs. / M/s :
                </span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.name}
                </span>
              </div>

              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap">Ref. Id :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.refId}
                </span>
              </div>

              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap">The sum of Rupees :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 text-lg font-bold">
                  ₹ {formData.amount}
                </span>
              </div>

              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap">Rupees in Words :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold italic">
                  {formData.amountWords}
                </span>
              </div>

              <div className="flex items-end">
                <span className="mr-2 whitespace-nowrap">By {formData.paymentMethod} No :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.paymentRef}
                </span>
              </div>

              <div className="flex justify-between gap-6 pt-2">
                <div className="flex flex-1 items-end">
                  <span className="mr-2 whitespace-nowrap">Drawn On :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.drawnOn}
                  </span>
                </div>
                <div className="flex flex-1 items-end">
                  <span className="mr-2 whitespace-nowrap">Plot No :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.plotNo}
                  </span>
                </div>
                <div className="flex flex-1 items-end">
                  <span className="mr-2 whitespace-nowrap">Plot Size :</span>
                  <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                    {formData.plotSize}
                  </span>
                </div>
              </div>

              <div className="flex items-end pt-2">
                <span className="mr-2 whitespace-nowrap">On Account of :</span>
                <span className="flex-1 border-b border-gray-400 pb-0.5 font-bold">
                  {formData.account}
                </span>
              </div>
            </div>

            <div className="mt-16 flex items-end justify-between pb-8">
              <div className="border-brand-navy rounded-sm border-2 bg-gray-50 px-6 py-3 text-2xl font-bold shadow-inner">
                ₹ {formData.amount}/-
              </div>
              <div className="w-56 border-t border-gray-400 pt-2 text-center">
                <p className="text-sm font-bold">Authorized Signatory</p>
                <p className="mt-1 text-xs text-gray-500">Stamp & Signature</p>
              </div>
            </div>

            <p className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 italic">
              Thank you for your business. Please keep this receipt for your records.
            </p>
          </PreviewContainer>

          <DownloadOptions
            onDownloadPDF={handleDownloadPDF}
            onDownloadImage={handleDownloadImage}
            disabled={!preview}
          />
        </div>
      </div>
    </div>
  );
}
