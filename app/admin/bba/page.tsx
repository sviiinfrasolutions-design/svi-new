'use client';

import {
  DownloadOptions,
  FormField,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { FileText, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

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
    admissionDate: '',
  });

  const [preview, setPreview] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            BBA Document <span className="text-brand-gold italic">Generator</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official BBA enrollment documents.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileText className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enrollment Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <FormField
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Mobile No"
                name="mobileNo"
                type="tel"
                value={formData.mobileNo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email ID"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                required
              />
              <FormField
                label="Course Name"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
              <FormField
                label="Semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              />
              <FormField
                label="Total Fees"
                name="fees"
                type="number"
                value={formData.fees}
                onChange={handleChange}
                required
              />
              <FormField
                label="Admission Date"
                name="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate BBA Document
            </button>
          </form>
        </div>

        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <h2 className="mb-4 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900 dark:border-white/10 dark:text-white">
            Live Preview
          </h2>

          <PreviewContainer previewId="bbaPreview" hasPreview={preview}>
            <div className="border-brand-gold border-b-2 pb-4 text-center">
              <h1 className="text-brand-navy font-serif text-2xl font-bold">
                SVI Infra Solutions Pvt. Ltd
              </h1>
              <p className="mt-1 font-sans text-sm">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
              <p className="font-sans text-sm">
                Cell: +91 9216014579 | Email: info@sviinfrasolutions.com
              </p>
              <p className="font-sans text-sm">Website: www.sviinfrasolutions.in</p>
            </div>

            <div className="mt-6 mb-6 space-y-1 font-sans text-sm">
              <p>
                <span className="font-semibold text-gray-600">Date:</span> {formData.date}
              </p>
              <p>
                <span className="font-semibold text-gray-600">To:</span> {formData.name}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Address:</span> {formData.address}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Mobile:</span> {formData.mobileNo}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Email:</span> {formData.emailId}
              </p>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-4 text-center font-sans">
              <h3 className="text-lg font-bold tracking-wider uppercase underline">
                Subject: BBA Course Enrollment - {formData.courseName}
              </h3>
            </div>

            <div className="space-y-4 text-justify font-sans text-sm leading-relaxed text-gray-800">
              <p>
                Dear <span className="font-semibold">{formData.name}</span>,
              </p>
              <p>
                We are pleased to confirm your enrollment in the{' '}
                <span className="font-bold">{formData.courseName}</span> program at SVI Infra
                Solutions Pvt. Ltd. This is a <span className="font-bold">{formData.duration}</span>{' '}
                course.
              </p>
              <p>
                You are currently enrolled in <span className="font-bold">{formData.semester}</span>
                . Your admission date was
                <span className="font-bold">
                  {' '}
                  {new Date(formData.admissionDate).toLocaleDateString('en-GB')}
                </span>
                . The total course fees amount to
                <span className="font-bold">
                  {' '}
                  ₹
                  {parseFloat(formData.fees || '0').toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                .
              </p>
              <p>
                Please ensure all fee payments are made on time to continue your studies without
                interruption. For any queries regarding your course, please contact the
                administration office.
              </p>
            </div>

            <div className="mt-16 flex items-end justify-between font-sans text-sm">
              <div>
                <p>Warm regards,</p>
                <p>
                  For{' '}
                  <span className="text-brand-navy font-bold">SVI Infra Solutions Pvt. Ltd</span>
                </p>
                <div className="mt-12 w-48 border-t border-gray-400 pt-2 text-center">
                  <p className="font-bold">Authorized Signatory</p>
                </div>
              </div>

              <div className="text-center">
                <div className="mt-12 w-48 border-t border-gray-400 pt-2 text-center">
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
