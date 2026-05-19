'use client';

import { useState } from 'react';
import { RefreshCw, FileSignature } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormField, PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';

export default function OfferLetterPage() {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    mobileNo: '',
    alternativeNo: '',
    emailId: '',
    designation: '',
    department: '',
    reportingTo: '',
    appointmentDate: '',
    location: '',
    salaryCtc: '',
    target: '',
    offerSlab: ''
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
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Offer_Letter.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Offer_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand-navy dark:text-white tracking-tight mb-2">
            Offer <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official job offer letters for new employees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="w-8 h-8 rounded bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidate Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormField label="Address" name="address" value={formData.address} onChange={handleChange} required className="md:col-span-2" />
              <FormField label="Mobile No" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleChange} required />
              <FormField label="Alternative No" name="alternativeNo" type="tel" value={formData.alternativeNo} onChange={handleChange} />
              <FormField label="Email ID" name="emailId" type="email" value={formData.emailId} onChange={handleChange} required className="md:col-span-2" />
              <FormField label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
              <FormField label="Department" name="department" value={formData.department} onChange={handleChange} required />
              <FormField label="Reporting To" name="reportingTo" value={formData.reportingTo} onChange={handleChange} required />
              <FormField label="Appointment Date" name="appointmentDate" type="date" value={formData.appointmentDate} onChange={handleChange} required />
              <FormField label="Location of Posting" name="location" value={formData.location} onChange={handleChange} required />
              <FormField label="Salary (CTC) Per Month" name="salaryCtc" type="number" value={formData.salaryCtc} onChange={handleChange} required />
              <FormField label="Target" name="target" value={formData.target} onChange={handleChange} required />
              <FormField label="Offer Slab Per Month" name="offerSlab" value={formData.offerSlab} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg glow-gold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Generate Offer Letter
            </button>
          </form>
        </div>

        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Live Preview</h2>

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
            <div className="border-b-2 border-brand-gold pb-4 text-center">
              <h1 className="text-2xl font-bold font-serif text-brand-navy">SVI Infra Solutions Pvt. Ltd</h1>
              <p className="text-sm font-sans mt-1">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
              <p className="text-sm font-sans">Cell: +91 9216014579 | Email: info@sviinfrasolutions.com</p>
              <p className="text-sm font-sans">Website: www.sviinfrasolutions.in</p>
            </div>

            <div className="text-sm space-y-1 mt-6 mb-6 font-sans">
              <p><span className="font-semibold text-gray-600">Date:</span> {formData.date}</p>
              <p><span className="font-semibold text-gray-600">To:</span> {formData.name}</p>
              <p><span className="font-semibold text-gray-600">Address:</span> {formData.address}</p>
              <p><span className="font-semibold text-gray-600">Mobile:</span> {formData.mobileNo}{formData.alternativeNo ? ` / ${formData.alternativeNo}` : ''}</p>
              <p><span className="font-semibold text-gray-600">Email:</span> {formData.emailId}</p>
            </div>

            <div className="text-center mb-6 font-sans border-b border-gray-100 pb-4">
              <h3 className="font-bold uppercase tracking-wider underline text-lg">Subject: Offer Letter - {formData.designation}</h3>
            </div>

            <div className="text-sm leading-relaxed space-y-4 font-sans text-justify text-gray-800">
              <p>Dear <span className="font-semibold">{formData.name}</span>,</p>
              <p>
                We are pleased to offer you the position of <span className="font-bold">{formData.designation}</span> in the
                <span className="font-bold"> {formData.department}</span> department at SVI Infra Solutions Pvt. Ltd.
                You will report to <span className="font-bold">{formData.reportingTo}</span> and be based at
                <span className="font-bold"> {formData.location}</span>.
              </p>
              <p>
                Your appointment date is <span className="font-bold">{formData.appointmentDate}</span>. The monthly CTC offered is
                <span className="font-bold"> ₹{parseFloat(formData.salaryCtc || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> with a target of
                <span className="font-bold"> {formData.target}</span> and offer slab per month of
                <span className="font-bold"> {formData.offerSlab}</span>.
              </p>
              <p>
                Please confirm your acceptance of this offer by signing and returning a copy of this letter.
                We look forward to welcoming you to the team.
              </p>
            </div>

            <div className="mt-16 text-sm font-sans flex justify-between items-end">
              <div>
                <p>Warm regards,</p>
                <p>For <span className="font-bold text-brand-navy">SVI Infra Solutions Pvt. Ltd</span></p>
                <div className="mt-12 pt-2 border-t border-gray-400 w-48 text-center">
                  <p className="font-bold">Authorized Signatory</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mt-12 pt-2 border-t border-gray-400 w-48 text-center">
                  <p className="font-bold">Candidate Signature</p>
                  <p className="text-xs text-gray-500">Accepted</p>
                </div>
              </div>
            </div>
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
