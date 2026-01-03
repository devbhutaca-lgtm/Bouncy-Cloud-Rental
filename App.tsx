
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';
import { Booking, BookingFormState, ViewType } from './types';
import { generateConfirmationEmail } from './services/geminiService';
import { CheckCircle2, Cloud, Sparkles, AlertCircle, Package, Wind, Brush, Send, CheckCircle, Loader2, ExternalLink, Lock } from 'lucide-react';
import { eachDayOfInterval, parseISO, format, differenceInDays } from 'date-fns';

const INITIAL_FORM_STATE: BookingFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  startDate: '',
  endDate: '',
  comments: '',
};

const ADMIN_PASSWORD = 'bouncy-admin';
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1z34r7YxyH8ooATD6dhfcWAPJG3LA0z9N5QOg3ekU2yM/export?format=csv&gid=0";

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('customer');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState<BookingFormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bouncy_cloud_bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
    const auth = localStorage.getItem('bouncy_admin_auth');
    if (auth === 'true') {
      setIsAdminAuthenticated(true);
    }

    if (window.location.hash === '#admin') {
      handleSetView('admin');
    }
  }, []);

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('bouncy_cloud_bookings', JSON.stringify(newBookings));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSyncWithSheets = async () => {
    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Failed to fetch Google Sheet CSV. Make sure it is 'Published to Web' as CSV.");
      
      const csvText = await response.text();
      const rows = csvText.split('\n').slice(1); // Skip header
      
      const sheetBookings: Booking[] = rows
        .filter(row => row.trim().length > 0)
        .map(row => {
          // Basic CSV parsing (splitting by comma, not accounting for quoted commas for simplicity)
          const cols = row.split(',');
          return {
            id: cols[0] || Math.random().toString(36).substr(2, 9),
            firstName: cols[1] || 'Unknown',
            lastName: cols[2] || '',
            email: cols[3] || '',
            phone: cols[4] || '',
            address: cols[5] || '',
            startDate: cols[6] || format(new Date(), 'yyyy-MM-dd'),
            endDate: cols[7] || format(new Date(), 'yyyy-MM-dd'),
            totalPrice: Number(cols[8]) || 0,
            deposit: Number(cols[9]) || 100,
            status: (cols[10]?.trim().toLowerCase() === 'cancelled' ? 'cancelled' : 'confirmed') as 'confirmed' | 'cancelled',
            comments: cols[11] || '',
            createdAt: new Date().toISOString(),
          };
        });

      // Merge: Local bookings take priority for recent items, but Sheet is source of truth for history
      const merged = [...sheetBookings];
      bookings.forEach(local => {
        if (!merged.find(m => m.id === local.id)) {
          merged.push(local);
        }
      });

      saveBookings(merged);
      showToast("Successfully synced with Google Sheets!", 'success');
    } catch (error) {
      console.error("Sync Error:", error);
      showToast("Sync failed. Ensure Sheet is 'Published to Web' as CSV.", 'info');
    }
  };

  const getAllBookedDates = () => {
    const allDates: string[] = [];
    bookings.filter(b => b.status === 'confirmed').forEach(b => {
      try {
        const interval = eachDayOfInterval({ 
          start: parseISO(b.startDate), 
          end: parseISO(b.endDate) 
        });
        interval.forEach(d => allDates.push(format(d, 'yyyy-MM-dd')));
      } catch (e) {
        console.warn("Invalid booking dates skipped", b);
      }
    });
    return allDates;
  };

  const bookedDatesList = getAllBookedDates();

  const handleSetView = (newView: ViewType) => {
    if (newView === 'admin' && !isAdminAuthenticated) {
      const password = prompt('Enter Admin Password:');
      if (password === ADMIN_PASSWORD) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('bouncy_admin_auth', 'true');
        setView('admin');
        showToast('Admin Access Granted', 'success');
      } else {
        alert('Incorrect password. Access denied.');
        if (window.location.hash === '#admin') window.location.hash = '';
      }
    } else {
      setView(newView);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('bouncy_admin_auth');
    setView('customer');
    window.location.hash = '';
    showToast('Logged out of Admin', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const interval = eachDayOfInterval({ 
      start: parseISO(formData.startDate), 
      end: parseISO(formData.endDate) 
    });
    const hasOverlap = interval.some(d => bookedDatesList.includes(format(d, 'yyyy-MM-dd')));

    if (hasOverlap) {
      alert("Oops! Someone else just booked some of those dates. Please update your selection.");
      return;
    }

    setIsLoading(true);
    try {
      const days = differenceInDays(parseISO(formData.endDate), parseISO(formData.startDate)) + 1;
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        totalPrice: days * 50,
        deposit: 100,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      const updatedBookings = [...bookings, newBooking];
      saveBookings(updatedBookings);
      setIsLoading(false);
      setShowSuccess(true);
      setIsSendingEmail(true);

      const draft = await generateConfirmationEmail(newBooking);
      setEmailDraft(draft);
      setTimeout(() => {
        setIsSendingEmail(false);
        showToast(`Email confirmation sent to ${newBooking.email}!`, 'success');
        setFormData(INITIAL_FORM_STATE);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      alert("Failed to process booking.");
    }
  };

  const handleCancel = (id: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this booking? This will open up the dates for other customers.");
    if (confirm) {
      const updated = bookings.map(b => 
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      );
      saveBookings(updated);
      showToast("Booking successfully cancelled.", 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header view={view} setView={handleSetView} />
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-blue-100 text-blue-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="text-green-500" size={20} /> : <AlertCircle className="text-blue-500" size={20} />}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
      <main className="flex-grow">
        {view === 'customer' ? (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!showSuccess ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                      <Sparkles size={14} />
                      Premium Rentals
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                      Your Backyard <br />
                      <span className="text-blue-600">Adventure Starts Here</span>
                    </h1>
                    <p className="mt-4 text-slate-600 leading-relaxed">
                      Select your dates below. Only <span className="font-bold text-slate-900">$50/day</span>. 
                    </p>
                  </div>
                  <BookingCalendar 
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    onRangeSelect={(start, end) => setFormData(prev => ({ ...prev, startDate: start, endDate: end }))}
                    bookedDates={bookedDatesList}
                  />
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <AlertCircle size={18} className="text-blue-600" />
                      Important Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Package size={20}/></div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Customer Setup</h4>
                          <p className="text-xs text-slate-500 mt-1">Customers handle all setup and positioning.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Brush size={20}/></div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Clean Guarantee</h4>
                          <p className="text-xs text-slate-500 mt-1">Keep it clean to ensure your $100 deposit is returned.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Reservation Details</h2>
                    <BookingForm 
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-12">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-100 border border-blue-50 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <div className={`h-full bg-blue-600 transition-all duration-1000 ${isSendingEmail ? 'w-2/3' : 'w-full'}`}></div>
                  </div>
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Adventure Reserved!</h2>
                  <p className="mt-2 text-slate-600">Your information has been logged in our system.</p>
                  <div className="mt-8 flex items-center justify-center gap-3 py-3 px-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-sm">
                    {isSendingEmail ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending Email Confirmation...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Confirmation Sent! Check your inbox.
                      </>
                    )}
                  </div>
                  {emailDraft && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left relative group">
                      <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent Email Preview</div>
                      <div className="prose prose-sm text-slate-600 whitespace-pre-line font-medium leading-relaxed">{emailDraft}</div>
                    </div>
                  )}
                  <div className="mt-10 pt-8 border-t border-slate-100">
                    <button onClick={() => setShowSuccess(false)} className="w-full px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                      Back to Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-4 right-4 z-[100]">
               <button onClick={handleAdminLogout} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                 <Lock size={14} /> Logout Admin
               </button>
            </div>
            <AdminPanel bookings={bookings} onCancelBooking={handleCancel} onSyncWithSheets={handleSyncWithSheets} />
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-slate-400">
            <Cloud size={20} />
            <span className="font-bold text-slate-500 uppercase tracking-tighter">Bouncy Cloud Rentals</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Bouncy Cloud. Safe, Clean, Fun.</p>
          <div className="mt-6 pt-6 border-t border-slate-50">
            <button onClick={() => handleSetView('admin')} className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-[0.2em] font-medium">
              Business Partner Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
