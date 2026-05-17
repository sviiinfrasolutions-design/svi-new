"use client";

import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Landmark, X, Copy, Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Payment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Redirecting to secure payment gateway...");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif text-brand-navy mb-4">Secure Online Payment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pay your booking amount or installment securely through our integrated payment portal. All transactions are encrypted.
          </p>
        </motion.div>

        <div className="bg-white shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-brand-navy p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-serif mb-6">Payment Guidelines</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3"><ShieldCheck className="shrink-0 text-brand-gold" size={20} /> 100% Secure & Encrypted Transaction</li>
                <li className="flex gap-3"><CreditCard className="shrink-0 text-brand-gold" size={20} /> Credit/Debit Cards & Net Banking Accepted</li>
                <li className="flex gap-3"><Landmark className="shrink-0 text-brand-gold" size={20} /> RTGS/NEFT options available on request</li>
              </ul>
            </div>
            <div className="mt-12 text-xs text-gray-400">
              For payment related queries, please contact:<br/>
              <span className="text-brand-gold mt-1 block">accounts@sviinfrasolutions.com</span>
            </div>
          </div>

          <div className="md:w-2/3 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="As per records" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Phone Number</label>
                  <input type="tel" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="+91" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="For payment receipt" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Project Name</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors appearance-none">
                    <option value="">Select Project</option>
                    <option value="shyam-aangan">Shyam Aangan</option>
                    <option value="shivani-vatika">Shivani Vatika</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Unit / Plot Number</label>
                  <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" placeholder="If known" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-navy">Payment Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input type="number" required min="1" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors text-lg" placeholder="0.00" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-gold text-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-navy hover:text-brand-gold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Proceed to Pay"
                )}
              </button>

              <div className="pt-4 border-t border-gray-200 mt-6 text-center">
                <span className="text-sm text-gray-500 mb-4 block">Alternatively, pay directly to our bank account</span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-white text-brand-navy border border-brand-navy py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Landmark size={18} />
                  Pay via UPI / Bank Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Payment Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-[2rem] w-full max-w-[600px] overflow-hidden relative shadow-2xl p-8"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="mb-8 mt-2">
              <h2 className="text-[28px] font-serif text-[#1e293b] mb-1">For Application Amount</h2>
              <p className="text-gray-500 text-sm">Payment Details</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column: QR Code */}
              <div className="md:w-5/12 flex flex-col items-center justify-start">
                <div className="bg-[#fcfbf9] rounded-2xl p-5 w-full border border-gray-50 flex flex-col items-center justify-center mb-4 shadow-sm">
                  {/* Dynamic QR code generated with the official SVI Infra Solutions UPI details */}
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=1000221207001410.7300007643@idbi&pn=SVI%20INFRA%20SOLUTIONS%20PVT.%20LTD." 
                    alt="UPI QR Code" 
                    className="w-full h-auto aspect-square object-contain mix-blend-multiply"
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium text-center">Scan to pay with any UPI app</p>
              </div>

              {/* Right Column: Bank Details */}
              <div className="md:w-7/12 flex flex-col space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Account Name</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider break-words mr-2 uppercase leading-tight">Svi Infra Solutions Pvt. Ltd</span>
                    <button 
                      onClick={() => handleCopy("Svi Infra Solutions Pvt. Ltd", "name")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "name" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Account Number</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">0894102000013837</span>
                    <button 
                      onClick={() => handleCopy("0894102000013837", "account")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "account" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">IFSC Code</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">IBKL0000894</span>
                    <button 
                      onClick={() => handleCopy("IBKL0000894", "ifsc")}
                      className="text-brand-navy hover:text-brand-gold transition-colors p-1 shrink-0"
                      title="Copy"
                    >
                      {copiedField === "ifsc" ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <span className="text-sm text-gray-500 font-medium">Bank / Branch</span>
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
                    <span className="text-[13px] font-mono text-[#1e293b] tracking-wider">IDBI BANK</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
