
import React from 'react';
import { BookingFormState } from '../types';
import { User, Mail, Phone, MapPin, MessageSquare, ArrowRight, Wallet, Info } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

interface BookingFormProps {
  formData: BookingFormState;
  setFormData: (data: BookingFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getDayCount = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    // differenceInDays is end - start, so +1 to include both days
    return differenceInDays(parseISO(formData.endDate), parseISO(formData.startDate)) + 1;
  };

  const days = getDayCount();
  const totalPrice = days * 50;
  const deposit = 100;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            First Name
          </label>
          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            Last Name
          </label>
          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail size={16} className="text-slate-400" />
            Email Address
          </label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            Phone Number
          </label>
          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 000-0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MapPin size={16} className="text-slate-400" />
          Full Street Address
        </label>
        <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Bouncy Lane, Inflatable City" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MessageSquare size={16} className="text-slate-400" />
          Comments or Remarks
        </label>
        <textarea name="comments" value={formData.comments} onChange={handleChange} rows={3} placeholder="Special requirements, etc." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"></textarea>
      </div>

      {days > 0 && (
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
          <div className="flex items-center justify-between text-blue-900">
            <span className="text-sm font-semibold flex items-center gap-2"><Wallet size={16}/> Price ($50 x {days} days)</span>
            <span className="font-bold text-lg">${totalPrice}</span>
          </div>
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-medium">Refundable Security Deposit</span>
            <span className="font-bold">${deposit}</span>
          </div>
          <div className="pt-2 border-t border-blue-200 flex items-center justify-between text-blue-900">
            <span className="font-bold">Total Due at Delivery</span>
            <span className="font-extrabold text-xl">${totalPrice + deposit}</span>
          </div>
          <div className="flex items-start gap-2 text-[10px] text-blue-600 font-medium">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Deposit will be refunded upon inspection if unit is returned clean and undamaged.</span>
          </div>
        </div>
      )}

      <button
        disabled={isLoading || !formData.startDate || !formData.endDate}
        type="submit"
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isLoading || !formData.startDate || !formData.endDate ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0'}`}
      >
        {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><ArrowRight size={20} /> Complete Booking</>}
      </button>
      
      {(!formData.startDate || !formData.endDate) && (
        <p className="text-center text-xs font-medium text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100">
          Select a start and end date on the calendar.
        </p>
      )}
    </form>
  );
};
