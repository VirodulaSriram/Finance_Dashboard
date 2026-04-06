'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  FileSpreadsheet, 
  Mail, 
  Loader2, 
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { user } = useAuthStore();
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/monthly?format=${format}`, {
        headers: {
          'user-id': user.id,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send report');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-[#0C0E0E]/95 backdrop-blur-2xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8"
            >
              <DialogHeader className="mb-8">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight">
                  Generate <br /> Financial Report
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">
                  Requested by {user?.username}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Select Format
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormat('pdf')}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 gap-3 group",
                        format === 'pdf' 
                          ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/10" 
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/[0.08] hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl transition-colors",
                        format === 'pdf' ? "bg-primary text-white" : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">PDF Document</span>
                    </button>
                    
                    <button
                      onClick={() => setFormat('excel')}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 gap-3 group",
                        format === 'excel' 
                          ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10" 
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/[0.08] hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl transition-colors",
                        format === 'excel' ? "bg-emerald-500 text-white" : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Excel Sheet</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center gap-4 group/mail">
                  <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground group-hover/mail:text-white transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Delivery Email</span>
                    <span className="text-sm font-bold text-white truncate">{user?.email}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center px-4">
                    {error}
                  </p>
                )}

                <Button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Generate & Send <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in zoom-in duration-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">Report was generated to mail</h3>
                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase px-4 leading-relaxed">
                  Your financial breakdown for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} has been sent to <span className="text-white">{user?.email}</span>
                </p>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pt-4 opacity-50">
                Closing in 3 seconds...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
