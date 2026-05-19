'use client';

import { useState } from 'react';
import { RefreshCw, Receipt } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormField, FormSelect, PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';

export default function PaymentReceiptPage() {
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
    paymentMethod: 'UPI' // Defaulted
  });

  const [preview, setPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="max-w-7xl mx-auto w-full font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand-navy dark:text-white tracking-tight mb-2">
            Payment <span className="text-brand-gold italic">Receipt</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate official payment receipts for client transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="w-8 h-8 rounded bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Receipt Number" name="receiptNo" value={formData.receiptNo} onChange={handleChange} required />
              <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              
              <FormField label="Name (Mr./Mrs./M/s)" name="name" value={formData.name} onChange={handleChange} required className="md:col-span-2" />
              <FormField label="Ref. Id" name="refId" value={formData.refId} onChange={handleChange} required />
              <FormField label="Amount (in digits)" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
              
              <FormField label="Amount (in words)" name="amountWords" value={formData.amountWords} onChange={handleChange} required className="md:col-span-2" />
              
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
                  { value: 'UPI', label: 'UPI' }
                ]}
              />
              
              <FormField label="Payment Reference Number" name="paymentRef" value={formData.paymentRef} onChange={handleChange} required />
              <FormField label="Drawn On" name="drawnOn" type="date" value={formData.drawnOn} onChange={handleChange} />
              <FormField label="Plot No" name="plotNo" value={formData.plotNo} onChange={handleChange} />
              <FormField label="Plot Size" name="plotSize" value={formData.plotSize} onChange={handleChange} required />
              
              <FormField label="On Account Of" name="account" value={formData.account} onChange={handleChange} required className="md:col-span-2" />
            </div>

            <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg glow-gold transition-all cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Generate Receipt
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Live Preview</h2>
          
          <PreviewContainer previewId="receiptPreview" hasPreview={preview}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-brand-gold pb-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-brand-navy">SVI Infra Solutions Pvt. Ltd</h1>
                <p className="text-sm font-sans mt-1">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
                <p className="text-sm font-sans">Cell: +91 9216014579 | Email: info@sviinfrasolutions.com</p>
                <p className="text-sm font-sans">Website: www.sviinfrasolutions.in</p>
              </div>
            </div>
            
            <div className="text-center mt-6 mb-8">
              <h2 className="text-xl font-bold uppercase tracking-widest underline inline-block">Payment Receipt</h2>
            </div>

            <div className="flex justify-between text-sm font-bold font-sans mb-8">
              <p className="bg-gray-50 px-3 py-1.5 rounded border border-gray-200">Receipt No: <span className="text-red-600 ml-1">{formData.receiptNo}</span></p>
              <p className="bg-gray-50 px-3 py-1.5 rounded border border-gray-200">Date: <span className="text-red-600 ml-1">{formData.date}</span></p>
            </div>

            <div className="space-y-6 text-sm leading-relaxed mt-4 font-sans">
              <div className="flex items-end">
                <span className="whitespace-nowrap mr-2">Received with thanks from Mr. / Mrs. / M/s :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.name}</span>
              </div>
              
              <div className="flex items-end">
                <span className="whitespace-nowrap mr-2">Ref. Id :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.refId}</span>
              </div>
              
              <div className="flex items-end">
                <span className="whitespace-nowrap mr-2">The sum of Rupees :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1 text-lg">₹ {formData.amount}</span>
              </div>
              
              <div className="flex items-end">
                <span className="whitespace-nowrap mr-2">Rupees in Words :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1 italic">{formData.amountWords}</span>
              </div>
              
              <div className="flex items-end">
                <span className="whitespace-nowrap mr-2">By {formData.paymentMethod} No :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.paymentRef}</span>
              </div>
              
              <div className="flex justify-between gap-6 pt-2">
                <div className="flex items-end flex-1">
                  <span className="whitespace-nowrap mr-2">Drawn On :</span>
                  <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.drawnOn}</span>
                </div>
                <div className="flex items-end flex-1">
                  <span className="whitespace-nowrap mr-2">Plot No :</span>
                  <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.plotNo}</span>
                </div>
                <div className="flex items-end flex-1">
                  <span className="whitespace-nowrap mr-2">Plot Size :</span>
                  <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.plotSize}</span>
                </div>
              </div>
              
              <div className="flex items-end pt-2">
                <span className="whitespace-nowrap mr-2">On Account of :</span>
                <span className="font-bold border-b border-gray-400 pb-0.5 flex-1">{formData.account}</span>
              </div>
            </div>

            <div className="mt-16 flex justify-between items-end pb-8">
              <div className="text-2xl font-bold px-6 py-3 border-2 border-brand-navy rounded-sm bg-gray-50 shadow-inner">
                ₹ {formData.amount}/-
              </div>
              <div className="text-center border-t border-gray-400 pt-2 w-56">
                <p className="font-bold text-sm">Authorized Signatory</p>
                <p className="text-xs text-gray-500 mt-1">Stamp & Signature</p>
              </div>
            </div>

            <p className="text-xs text-center italic text-gray-500 mt-8 border-t border-gray-200 pt-4">
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