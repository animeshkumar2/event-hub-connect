import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Phone, Loader2, CheckCircle2, CalendarIcon, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api';
import { cn } from '@/shared/lib/utils';

interface RequestCallbackModalProps {
  listingId: string;
  listingName: string;
  vendorId: string;
  vendorName: string;
  category?: string;
}

export function RequestCallbackModal({
  listingId,
  listingName,
  vendorId,
  vendorName,
  category,
}: RequestCallbackModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [dateFlexible, setDateFlexible] = useState(false);
  const [requirement, setRequirement] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  const checkForFakeNumber = (phone: string): string | null => {
    if (new Set(phone).size === 1) return "Please enter a real phone number";
    const isSeq = (s: string, asc: boolean): boolean => {
      for (let i = 1; i < s.length; i++) {
        if (asc ? s.charCodeAt(i) - s.charCodeAt(i-1) !== 1 : s.charCodeAt(i) - s.charCodeAt(i-1) !== -1) return false;
      }
      return true;
    };
    if (isSeq(phone, true) || isSeq(phone, false)) return "Please enter a real phone number";
    const fakes = ['1234567890', '0123456789', '9876543210', '9999999999', '8888888888', '7777777777', '6666666666'];
    if (fakes.includes(phone)) return "Please enter a real phone number";
    const pair = phone.substring(0, 2);
    if (pair[0] !== pair[1] && phone === pair.repeat(5)) return "Please enter a real phone number";
    const counts: Record<string, number> = {};
    for (const d of phone) counts[d] = (counts[d] || 0) + 1;
    if (Object.values(counts).some(c => c >= 7)) return "Please enter a real phone number";
    return null;
  };

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned) && !checkForFakeNumber(cleaned);
  };
  
  const getPhoneError = (phone: string): string | undefined => {
    if (!phone) return undefined;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length > 0 && cleaned.length < 10) return `${10 - cleaned.length} more digits`;
    if (cleaned.length === 10 && !/^[6-9]/.test(cleaned)) return "Start with 6, 7, 8 or 9";
    return checkForFakeNumber(cleaned) || undefined;
  };

  const isFormValid = name.trim().length > 0 && isValidPhone(mobile) && (eventDate !== undefined || dateFlexible);

  const handleSubmit = async () => {
    const newErrors: { name?: string; mobile?: string } = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!mobile.trim()) newErrors.mobile = 'Required';
    else if (!isValidPhone(mobile)) newErrors.mobile = 'Invalid number';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      await apiClient.post('/public/callback-request', {
        name: name.trim(),
        mobile: mobile.replace(/\D/g, ''),
        eventDate: eventDate ? format(eventDate, 'yyyy-MM-dd') : null,
        dateFlexible,
        requirement: requirement.trim() || null,
        listingId,
        listingName,
        vendorId,
        vendorName,
        category: category || null,
      });
      
      setSuccess(true);
      toast.success('We\'ll call you soon!');
      
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName('');
        setMobile('');
        setEventDate(undefined);
        setDateFlexible(false);
        setRequirement('');
      }, 2500);
      
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = [name.trim(), isValidPhone(mobile), eventDate || dateFlexible].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all h-12 font-semibold bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] relative overflow-hidden group"
          size="sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm font-semibold">Request a Callback</span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden">

        {success ? (
          /* Success State */
          <div className="relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5950b3] via-[#6a5fc0] to-[#7867dc]">
              {/* Floating circles animation */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute top-20 right-16 w-12 h-12 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '3.5s' }} />
              
              {/* Confetti-like dots */}
              <div className="absolute top-16 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full" />
              <div className="absolute top-24 right-1/4 w-2 h-2 bg-pink-300/60 rounded-full" />
              <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-green-300/60 rounded-full" />
              <div className="absolute bottom-24 right-1/3 w-2 h-2 bg-blue-300/60 rounded-full" />
            </div>
            
            <div className="relative py-16 px-8 text-center">
              {/* Success icon with ring animation */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-[#5950b3]" />
                  </div>
                </div>
              </div>
              
              {/* Text content */}
              <h3 className="text-2xl font-bold text-white mb-2">We've got your request!</h3>
              <p className="text-white/80 text-sm mb-8 max-w-xs mx-auto">
                Our team will call you shortly to understand your needs and help you plan your perfect event.
              </p>
              
              {/* What happens next */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-xs mx-auto">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-3 font-medium">What happens next</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                    <p className="text-white/90 text-sm">We'll call you within a few hours</p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                    <p className="text-white/90 text-sm">Discuss your requirements in detail</p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                    <p className="text-white/90 text-sm">Connect you with the right vendor</p>
                  </div>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="mt-6 px-8 py-3 bg-white text-[#5950b3] font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-[#5950b3] via-[#6a5fc0] to-[#7867dc] pt-8 pb-12 px-6">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              {/* Curved bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2.5rem] pointer-events-none" />
              
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">Request a Callback</h2>
                  <p className="text-white/70 text-sm mt-0.5">Share your details, we'll reach out to you</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pb-6 -mt-4 space-y-4">
              {/* Listing Card */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#5950b3]/5 via-[#6a5fc0]/5 to-[#7867dc]/5 rounded-xl border border-[#5950b3]/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5950b3] to-[#7867dc] flex items-center justify-center text-white font-bold shadow-lg shadow-[#5950b3]/30">
                  {listingName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[#5950b3] font-semibold">Enquiry for</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{listingName}</p>
                </div>
              </div>

              {/* Two column layout for name and phone */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Your name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border-2 text-sm transition-all",
                        "focus:outline-none focus:border-[#5950b3] focus:ring-4 focus:ring-[#5950b3]/10",
                        errors.name ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300",
                        name.trim() && "border-[#5950b3]/40 bg-gradient-to-r from-[#5950b3]/5 to-[#7867dc]/5"
                      )}
                    />
                    {name.trim() && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <div className={cn(
                    "flex items-center h-12 rounded-xl border-2 transition-all overflow-hidden",
                    "focus-within:border-[#5950b3] focus-within:ring-4 focus-within:ring-[#5950b3]/10",
                    errors.mobile ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300",
                    isValidPhone(mobile) && "border-[#5950b3]/40 bg-gradient-to-r from-[#5950b3]/5 to-[#7867dc]/5"
                  )}>
                    <span className="px-3 text-xs text-gray-500 font-medium bg-gray-50/80 h-full flex items-center border-r border-gray-200">+91</span>
                    <input
                      type="tel"
                      placeholder="10 digits"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                        if (errors.mobile) setErrors(prev => ({ ...prev, mobile: undefined }));
                      }}
                      className="flex-1 h-full px-3 bg-transparent text-sm focus:outline-none"
                    />
                    {mobile && (
                      <div className="pr-3">
                        {isValidPhone(mobile) ? (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">{mobile.length}/10</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {mobile && !isValidPhone(mobile) && (
                <p className="text-xs text-amber-600 -mt-2">{getPhoneError(mobile)}</p>
              )}

              {/* Date Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event date</label>
                <div className="flex gap-3">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={dateFlexible}
                        className={cn(
                          "flex-1 h-12 px-4 rounded-xl border-2 flex items-center gap-3 text-sm transition-all",
                          "hover:border-gray-300 focus:outline-none",
                          calendarOpen && "border-[#5950b3] ring-4 ring-[#5950b3]/10",
                          eventDate && "border-[#5950b3]/40 bg-gradient-to-r from-[#5950b3]/5 to-[#7867dc]/5",
                          dateFlexible && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className={eventDate ? "text-gray-800 font-medium" : "text-gray-400"}>
                          {eventDate ? format(eventDate, "d MMM yyyy") : "Pick a date"}
                        </span>
                        {eventDate && !dateFlexible && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventDate(undefined);
                              }}
                              className="ml-auto text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          </>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={(date) => {
                          setEventDate(date);
                          setCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="p-3"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {/* Not decided button */}
                  <button
                    type="button"
                    onClick={() => {
                      setDateFlexible(!dateFlexible);
                      if (!dateFlexible) setEventDate(undefined);
                    }}
                    className={cn(
                      "px-4 h-12 rounded-xl border-2 text-sm font-medium transition-all whitespace-nowrap",
                      dateFlexible 
                        ? "border-[#5950b3] bg-gradient-to-r from-[#5950b3] to-[#7867dc] text-white" 
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    Not decided
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  Anything specific? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Budget, guest count, special requests..."
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm resize-none transition-all hover:border-gray-300 focus:outline-none focus:border-[#5950b3] focus:ring-4 focus:ring-[#5950b3]/10"
                />
              </div>

              {/* Progress & Submit */}
              <div className="pt-3 space-y-4">
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5950b3] to-[#7867dc] transition-all duration-500 rounded-full"
                      style={{ width: `${(completedSteps / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#5950b3]">{completedSteps}/3</span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid}
                  className={cn(
                    "w-full h-14 rounded-xl font-semibold text-base transition-all",
                    isFormValid 
                      ? "bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] text-white shadow-xl shadow-[#5950b3]/30 hover:shadow-2xl hover:shadow-[#5950b3]/40 hover:scale-[1.02]" 
                      : "bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-5 w-5" />
                      Request Callback
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  100% free · No spam calls · We respect your privacy
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
