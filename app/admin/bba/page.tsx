'use client';

import { useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormField, PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';

export default function BbaPage() {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    mobileNo: '',
    emailId: '',
    courseName: '',
    duration: '',
    semester: '',
    fees: '',
    admissionDate: ''
  });

  const [preview, setPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('bbaPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('BBA_Document.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('bbaPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'BBA_Document.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand-navy dark:text-white tracking-tight mb-2">
            BBA Document <span className="text-brand-gold italic">Generator</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official BBA enrollment documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="w-8 h-8 rounded bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enrollment Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              <FormField label="Student Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormField label="Address" name="address" value={formData.address} onChange={handleChange} required className="md:col-span-2" />
              <FormField label="Mobile No" name="mobileNo" type="tel" value={formData.mobileNo} onChange={handleChange} required />
              <FormField label="Email ID" name="emailId" type="email" value={formData.emailId} onChange={handleChange} required />
              <FormField label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} required />
              <FormField label="Duration" name="duration" value={formData.duration} onChange={handleChange} required />
              <FormField label="Semester" name="semester" value={formData.semester} onChange={handleChange} required />
              <FormField label="Total Fees" name="fees" type="number" value={formData.fees} onChange={handleChange} required />
              <FormField label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg glow-gold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Generate BBA Document
            </button>
          </form>
        </div>

        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Live Preview</h2>

          <PreviewContainer previewId="bbaPreview" hasPreview={preview}>
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
              <p><span className="font-semibold text-gray-600">Mobile:</span> {formData.mobileNo}</p>
              <p><span className="font-semibold text-gray-600">Email:</span> {formData.emailId}</p>
            </div>

            <div className="text-center mb-6 font-sans border-b border-gray-100 pb-4">
              <h3 className="font-bold uppercase tracking-wider underline text-lg">Subject: BBA Course Enrollment - {formData.courseName}</h3>
            </div>

            <div className="text-sm leading-relaxed space-y-4 font-sans text-justify text-gray-800">
              <p>Dear <span className="font-semibold">{formData.name}</span>,</p>
              <p>
                We are pleased to confirm your enrollment in the <span className="font-bold">{formData.courseName}</span> program
                at SVI Infra Solutions Pvt. Ltd. This is a <span className="font-bold">{formData.duration}</span> course.
              </p>
              <p>
                You are currently enrolled in <span className="font-bold">{formData.semester}</span>. Your admission date was
                <span className="font-bold"> {new Date(formData.admissionDate).toLocaleDateString('en-GB')}</span>. The total course fees amount to
                <span className="font-bold"> ₹{parseFloat(formData.fees || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.
              </p>
              <p>
                Please ensure all fee payments are made on time to continue your studies without interruption.
                For any queries regarding your course, please contact the administration office.
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
                  <p className="font-bold">Student Signature</p>
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
