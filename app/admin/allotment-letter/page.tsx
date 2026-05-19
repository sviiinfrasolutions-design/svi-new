'use client';

import {
  DownloadOptions,
  FormField,
  FormSelect,
  PreviewContainer,
} from '@/src/components/admin/DocumentGenerator/Shared';
import { FileText, RefreshCw } from 'lucide-react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function AllotmentLetterPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    address: '',
    ticketId: '',
    projectName: 'Shyam Aangan',
    unitNumber: '',
    area: '',
    bsp: '',
    plc: '',
    paymentPlan: '12',
    bookingDate: '',
    secondPaymentDays: '15',
    advisorName: '',
    advisorNumber: '',
  });

  const [preview, setPreview] = useState(false);

  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;

    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount;
  };

  const totalCost = calculateTotalCost();
  const initialPayment = totalCost * 0.1;

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
    const element = document.getElementById('allotmentPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Allotment_Letter.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('allotmentPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Allotment_Letter.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Allotment <span className="text-brand-gold italic">Letter</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download official allotment letters for clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Form Section */}
        <div className="relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
              <FileText className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Document Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <FormField
                label="Ticket ID"
                name="ticketId"
                value={formData.ticketId}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                options={[
                  { value: 'Shyam Aangan', label: 'Shyam Aangan' },
                  { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
                ]}
              />

              <FormField
                label="Unit Number"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                required
              />
              <FormField
                label="Area (Sq. Yds.)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                required
              />
              <FormField
                label="BSP (Per Sq.Yd)"
                name="bsp"
                type="number"
                value={formData.bsp}
                onChange={handleChange}
                required
              />
              <FormField
                label="PLC (%)"
                name="plc"
                type="number"
                value={formData.plc}
                onChange={handleChange}
              />

              <FormSelect
                label="Payment Plan"
                name="paymentPlan"
                value={formData.paymentPlan}
                onChange={handleChange}
                options={[
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' },
                  { value: '18', label: '18 Months' },
                  { value: '24', label: '24 Months' },
                ]}
              />

              <FormField
                label="Booking Date"
                name="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={handleChange}
                required
              />

              <FormSelect
                label="Second Payment Days"
                name="secondPaymentDays"
                value={formData.secondPaymentDays}
                onChange={handleChange}
                options={[
                  { value: '15', label: '15 days' },
                  { value: '28', label: '28 days' },
                ]}
              />

              <FormField
                label="Advisor Name"
                name="advisorName"
                value={formData.advisorName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Advisor Number"
                name="advisorNumber"
                value={formData.advisorNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-brand-navy/5 dark:bg-brand-gold/5 border-brand-navy/10 dark:border-brand-gold/10 mt-6 flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Total Cost
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹
                  {totalCost.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Initial Payment (10%)
                </p>
                <p className="text-brand-gold text-lg font-bold">
                  ₹
                  {initialPayment.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Generate Letter
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="relative flex h-[calc(100vh-140px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          <h2 className="mb-4 border-b border-gray-100 pb-4 text-lg font-bold text-gray-900 dark:border-white/10 dark:text-white">
            Live Preview
          </h2>

          <PreviewContainer previewId="allotmentPreview" hasPreview={preview}>
            <div className="border-brand-gold border-b-2 pb-4 text-center">
              <h1 className="text-brand-navy font-serif text-2xl font-bold">
                SVI Infra Solutions Pvt. Ltd
              </h1>
              <p className="font-sans text-sm">A-61 Sector 65 Noida Uttar Pradesh 201309</p>
              <h2 className="mt-4 mb-4 border-b pb-2 text-xl font-bold tracking-widest uppercase">
                Allotment Letter
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 font-sans text-sm">
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Client Name:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.clientName}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Project:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.projectName}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Ticket ID:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.ticketId}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Unit Number:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.unitNumber}</span>
              </div>
              <div className="col-span-2 border-b border-gray-100 pb-2">
                <span className="text-gray-500">Address:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.address}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Area:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.area} Sq. Yds.</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">BSP:</span>{' '}
                <span className="mt-1 block font-semibold">₹{formData.bsp} / Sq.Yd</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">PLC:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.plc || 0}%</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500">Plan:</span>{' '}
                <span className="mt-1 block font-semibold">{formData.paymentPlan} Months</span>
              </div>
            </div>

            <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700">Total Cost:</span>{' '}
                <span className="font-bold">
                  ₹
                  {totalCost.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700">Initial Payment (10%):</span>{' '}
                <span className="font-bold">
                  ₹
                  {initialPayment.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700">Booking Date:</span>{' '}
                <span className="font-bold">{formData.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Second Payment:</span>{' '}
                <span className="font-bold">{formData.secondPaymentDays} days after booking</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 pt-8 font-sans text-sm">
              <div className="w-48 border-t border-gray-300 pt-2 text-center">
                <span className="font-bold text-gray-800">Client Signature</span>
              </div>
              <div className="flex flex-col items-end text-right">
                <div className="w-48 border-t border-gray-300 pt-2 text-center">
                  <span className="font-bold text-gray-800">Authorized Signatory</span>
                  <div className="mt-1 text-xs text-gray-500">SVI Infra Solutions</div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 font-sans text-xs text-gray-500">
              <div>Advisor: {formData.advisorName}</div>
              <div className="text-right">Contact: {formData.advisorNumber}</div>
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
