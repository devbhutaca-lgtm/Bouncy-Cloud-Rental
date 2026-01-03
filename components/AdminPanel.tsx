
import React, { useState } from 'react';
import { Booking } from '../types';
import { Trash2, Clock, MapPin, Phone, Mail, Calendar as CalendarIcon, Search, Wallet, ExternalLink, Download, FileText, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AdminPanelProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  onSyncWithSheets: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onCancelBooking, onSyncWithSheets }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1z34r7YxyH8ooATD6dhfcWAPJG3LA0z9N5QOg3ekU2yM/edit?gid=0#gid=0";

  const filteredBookings = bookings
    .filter(b => 
      b.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncWithSheets();
    setIsSyncing(false);
  };

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Address", "Start Date", "End Date", "Total Price", "Deposit", "Status"];
    const rows = filteredBookings.map(b => [
      b.id, b.firstName, b.lastName, b.email, b.phone, b.address, b.startDate, b.endDate, b.totalPrice, b.deposit, b.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bouncy_bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-slate-500 mt-1">Manage rentals and sync with your business tools.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Sheets'}
          </button>
          <a 
            href={SHEET_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-green-100"
          >
            <ExternalLink size={16} />
            View Google Sheet
          </a>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10 pr-4 py-2 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-full" 
          />
        </div>
        <div className="flex items-center gap-4 text-sm font-bold text-slate-600 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {filteredBookings.filter(b => b.status === 'confirmed').length} Active
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            {filteredBookings.filter(b => b.status === 'cancelled').length} Cancelled
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Clock size={32} /></div>
          <h3 className="text-lg font-semibold text-slate-900">No bookings match your search</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${booking.status === 'confirmed' ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><CalendarIcon size={24} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{booking.firstName} {booking.lastName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{booking.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <CalendarIcon size={14} className="text-blue-500" />
                        {format(parseISO(booking.startDate), 'MMM d')} - {format(parseISO(booking.endDate), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5"><MapPin size={14} />{booking.address}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={14} /> {booking.phone}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold text-blue-600"><Wallet size={14} /> Total: ${booking.totalPrice + booking.deposit}</div>
                  </div>
                  
                  <div className="flex-1 lg:max-w-xs bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100 flex items-start gap-2">
                    <FileText size={14} className="shrink-0 mt-0.5 text-slate-400" />
                    <span className="italic">{booking.comments || "No instructions."}</span>
                  </div>

                  {booking.status === 'confirmed' && (
                    <button onClick={() => onCancelBooking(booking.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100" title="Cancel Booking"><Trash2 size={20} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
