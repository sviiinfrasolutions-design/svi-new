'use client';

import {
  DownloadOptions,
  FormField,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { useAdminSession } from '@/src/components/admin/AdminSessionProvider';
import { FileSignature, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function OfferLetterPage() {
  const { token } = useAdminSession();
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
    offerSlab: '',
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
            document_type: 'offer_letter',
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
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Offer_Letter.pdf');

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
    const element = document.getElementById('offerPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Offer_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Offer <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official job offer letters for new employees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileSignature className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidate Details</h2>
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
                label="Name"
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
                label="Alternative No"
                name="alternativeNo"
                type="tel"
                value={formData.alternativeNo}
                onChange={handleChange}
              />
              <FormField
                label="Email ID"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
              <FormField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <FormField
                label="Reporting To"
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleChange}
                required
              />
              <FormField
                label="Appointment Date"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
              <FormField
                label="Location of Posting"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <FormField
                label="Salary (CTC) Per Month"
                name="salaryCtc"
                type="number"
                value={formData.salaryCtc}
                onChange={handleChange}
                required
              />
              <FormField
                label="Target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                required
              />
              <FormField
                label="Offer Slab Per Month"
                name="offerSlab"
                value={formData.offerSlab}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Offer Letter
            </button>
          </form>
        </div>

        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <h2 className="mb-4 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900 dark:border-white/10 dark:text-white">
            Live Preview
          </h2>

          <PreviewContainer previewId="offerPreview" hasPreview={preview}>
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
                {formData.alternativeNo ? ` / ${formData.alternativeNo}` : ''}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Email:</span> {formData.emailId}
              </p>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-4 text-center font-sans">
              <h3 className="text-lg font-bold tracking-wider uppercase underline">
                Subject: Offer Letter - {formData.designation}
              </h3>
            </div>

            <div className="space-y-4 text-justify font-sans text-sm leading-relaxed text-gray-800">
              <p>
                Dear <span className="font-semibold">{formData.name}</span>,
              </p>
              <p>
                We are pleased to offer you the position of{' '}
                <span className="font-bold">{formData.designation}</span> in the
                <span className="font-bold"> {formData.department}</span> department at SVI Infra
                Solutions Pvt. Ltd. You will report to{' '}
                <span className="font-bold">{formData.reportingTo}</span> and be based at
                <span className="font-bold"> {formData.location}</span>.
              </p>
              <p>
                Your appointment date is{' '}
                <span className="font-bold">{formData.appointmentDate}</span>. The monthly CTC
                offered is
                <span className="font-bold">
                  {' '}
                  ₹
                  {parseFloat(formData.salaryCtc || '0').toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>{' '}
                with a target of
                <span className="font-bold"> {formData.target}</span> and offer slab per month of
                <span className="font-bold"> {formData.offerSlab}</span>.
              </p>
              <p>
                Please confirm your acceptance of this offer by signing and returning a copy of this
                letter. We look forward to welcoming you to the team.
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
