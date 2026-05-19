'use client';

import { useState } from 'react';
import { Calculator, Map } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormField, FormSelect, PreviewContainer, DownloadOptions } from '@/src/components/admin/DocumentGenerator/Shared';

export default function PaymentPlanPage() {
  const [formData, setFormData] = useState({
    unitNo: '',
    plotSize: '',
    propertyType: 'Residential Farm House',
    costPerSqYd: '',
    bookingAmount: '',
    emis: '12',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [preview, setPreview] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totals, setTotals] = useState({ totalCost: 0, balance: 0, emiAmount: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const size = parseFloat(formData.plotSize) || 0;
    const rate = parseFloat(formData.costPerSqYd) || 0;
    const booking = parseFloat(formData.bookingAmount) || 0;
    const emiCount = parseInt(formData.emis) || 1;

    const totalCost = size * rate;
    const balance = totalCost - booking;
    const emiAmount = balance / emiCount;

    const newSchedule = [];
    const start = new Date(formData.startDate);

    for (let i = 1; i <= emiCount; i++) {
       const emiDate = new Date(start);
       emiDate.setMonth(start.getMonth() + i);
       
       newSchedule.push({
         month: i,
         date: emiDate.toLocaleDateString('en-GB'),
         amount: emiAmount.toFixed(2)
       });
    }

    setTotals({ totalCost, balance, emiAmount });
    setSchedule(newSchedule);
    setPreview(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Payment_Plan.pdf');
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('planPreview');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'Payment_Plan.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand-navy dark:text-white tracking-tight mb-2">
            Payment <span className="text-brand-gold italic">Plan Calculator</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download structured payment plans and EMIs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="w-8 h-8 rounded bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Plan Configuration</h2>
          </div>

          <form onSubmit={calculatePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Unit Number" name="unitNo" value={formData.unitNo} onChange={handleChange} required />
              <FormField label="Size of Plot (Sq. Yds.)" name="plotSize" type="number" value={formData.plotSize} onChange={handleChange} required />
              
              <FormSelect 
                label="Property Type" 
                name="propertyType" 
                value={formData.propertyType} 
                onChange={handleChange} 
                className="md:col-span-2"
                options={[
                  { value: 'Residential Farm House', label: 'Residential Farm House' },
                  { value: 'Commercial Plot', label: 'Commercial Plot' },
                  { value: 'Residential Plot', label: 'Residential Plot' }
                ]}
              />
              
              <FormField label="Cost / Sq.Yd (₹)" name="costPerSqYd" type="number" value={formData.costPerSqYd} onChange={handleChange} required />
              <FormField label="Booking Amount (₹)" name="bookingAmount" type="number" value={formData.bookingAmount} onChange={handleChange} required />
              <FormField label="No of EMI's Required" name="emis" type="number" value={formData.emis} onChange={handleChange} required />
              <FormField label="Plan Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>

            <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-lg glow-gold transition-all cursor-pointer">
              <Calculator className="w-4 h-4" /> Calculate & Generate Plan
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-4">Live Preview</h2>
          
          <PreviewContainer previewId="planPreview" hasPreview={preview}>
            <div className="text-center border-b-2 border-brand-gold pb-6 mb-6">
              <h1 className="text-2xl font-bold font-serif text-brand-navy">Payment Plan</h1>
              <p className="font-semibold mt-2 font-sans text-gray-600">{formData.propertyType}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-8 font-medium font-sans">
              <div><span className="text-gray-500">Unit Number:</span> {formData.unitNo}</div>
              <div><span className="text-gray-500">Plot Size:</span> {formData.plotSize} Sq. Yds.</div>
              <div><span className="text-gray-500">Cost/Sq.Yd:</span> ₹ {formData.costPerSqYd}</div>
              <div><span className="text-gray-500">Total Cost:</span> ₹ {totals.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div><span className="text-gray-500">Booking Amount:</span> ₹ {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div><span className="text-gray-500">Balance Amount:</span> ₹ {totals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <table className="w-full text-sm text-left border-collapse border border-gray-300 font-sans">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 font-semibold">Month</th>
                  <th className="border border-gray-300 p-2 font-semibold">Expected Date</th>
                  <th className="border border-gray-300 p-2 font-semibold">Details</th>
                  <th className="border border-gray-300 p-2 font-semibold">Expected Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-semibold bg-green-50">
                  <td className="border border-gray-300 p-2 text-center">0</td>
                  <td className="border border-gray-300 p-2">{new Date(formData.startDate).toLocaleDateString('en-GB')}</td>
                  <td className="border border-gray-300 p-2">Booking Amount</td>
                  <td className="border border-gray-300 p-2 underline">{parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                {schedule.map((row) => (
                  <tr key={row.month}>
                    <td className="border border-gray-300 p-2 text-center">{row.month}</td>
                    <td className="border border-gray-300 p-2">{row.date}</td>
                    <td className="border border-gray-300 p-2 text-gray-600">EMI {row.month}</td>
                    <td className="border border-gray-300 p-2">{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="border border-gray-300 p-2 text-right" colSpan={3}>Grand Total</td>
                  <td className="border border-gray-300 p-2 underline text-red-600">₹ {totals.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-12 pt-8 text-center text-xs text-gray-500 border-t font-sans">
              Disclaimer: This is a computer generated document and does not require physical signature. Dates are approximate and subject to realization.
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