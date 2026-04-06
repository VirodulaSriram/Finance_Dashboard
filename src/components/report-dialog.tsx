'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  Lock,
  ExternalLink,
  Sparkles,
  Loader2,
  Calendar,
  Table as TableIcon
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';

// Import local generation utilities
import { generateCustomReport } from '@/lib/generateReport';
import { generateExcelWorkbook } from '@/lib/generateExcel';
import * as XLSX from 'xlsx';

// Standard Switch component
function CustomSwitch({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: (v: boolean) => void, disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-white/10"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function ReportDialog({ trigger }: { trigger: React.ReactNode }) {
  const { user, token, updateUser } = useAuthStore();
  const [loadingType, setLoadingType] = useState<'pdf' | 'excel' | 'sharing' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(user?.isSharing || false);
  const [toastMsg, setToastMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const shareLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${user?.shareToken}` 
    : '';

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchTransactions = async () => {
    const res = await fetch(`/api/transactions?from=${fromDate}&to=${toDate}`, {
      headers: {
        'user-id': user?.id || ''
      }
    });
    if (!res.ok) throw new Error('Failed to fetch transaction data');
    const data = await res.json();
    return data;
  };

  const handleDownload = async (type: 'pdf' | 'excel') => {
    setLoadingType(type);
    try {
      const transactions = await fetchTransactions();
      const dateRangeStr = `${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`;
      const userData = { username: user?.username || 'User', email: user?.email || '', currencyCode: user?.currencyCode || 'USD' };

      // Email delivery
      await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, user: userData, dateRange: dateRangeStr, format: type })
      });

      showToast(`${type.toUpperCase()} Report Sent to Email`, 'success');
    } catch (err: any) {
      console.error('Report Generation Error:', err);
      showToast(`Failed to process ${type.toUpperCase()} report`, 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const handleToggleSharing = async (val: boolean) => {
    setLoadingType('sharing');
    setIsSharing(val);
    try {
      const res = await fetch('/api/share/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user-id': user?.id || ''
        },
        body: JSON.stringify({ isSharing: val })
      });
      
      if (!res.ok) throw new Error('Failed to update sharing status');
      const data = await res.json();
      
      updateUser({ isSharing: data.isSharing, shareToken: data.shareToken });
      showToast(val ? 'Sharing Enabled' : 'Sharing Disabled', 'success');
    } catch (err: any) {
      setIsSharing(!val);
      showToast(err.message, 'error');
    } finally {
      setLoadingType(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Link Copied', 'success');
  };

  return (
    <Dialog>
      <DialogTrigger>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-3xl bg-[#0C0E0E] border-white/5 p-10 overflow-hidden shadow-2xl ring-1 ring-white/10">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-bold text-white mb-2">
             Custom Statement
          </DialogTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
             Select a date range to export your professional transaction history.
          </p>
        </DialogHeader>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">From Date</Label>
                <div className="relative group">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                   <Input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-11 bg-white/5 border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary/40 transition-all"
                   />
                </div>
             </div>
             <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">To Date</Label>
                <div className="relative group">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                   <Input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-11 bg-white/5 border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary/40 transition-all"
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <Button 
               onClick={() => handleDownload('pdf')} 
               disabled={!!loadingType}
               className="h-14 bg-white text-black hover:bg-white/90 font-bold rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
             >
                {loadingType === 'pdf' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                Email PDF
             </Button>
             
             <Button 
               onClick={() => handleDownload('excel')} 
               disabled={!!loadingType}
               className="h-14 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
             >
                {loadingType === 'excel' ? <Loader2 className="h-5 w-5 animate-spin" /> : <TableIcon className="h-5 w-5 text-emerald-400" />}
                Email Excel
             </Button>
          </div>

          <div className="h-px bg-white/5 w-full" />

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-5 shadow-inner">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                     isSharing ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-white/5 text-white/20 border border-white/5"
                   )}>
                      {isSharing ? <Globe className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                   </div>
                   <div className="space-y-0.5">
                      <h4 className="font-bold text-white text-base">Public Dashboard</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Live Sync Link</p>
                   </div>
                </div>
                <CustomSwitch 
                  checked={isSharing}
                  onCheckedChange={handleToggleSharing}
                  disabled={!!loadingType}
                />
             </div>

             {isSharing && (
               <div className="flex items-center gap-2 bg-[#0C0E0E] border border-white/5 p-1.5 px-4 rounded-2xl overflow-hidden group shadow-inner">
                  <span className="flex-1 text-[11px] text-white/40 truncate py-2 font-medium">
                     {shareLink}
                  </span>
                  <div className="flex items-center gap-1">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={copyToClipboard}
                        className="h-9 w-9 hover:bg-white/5 text-white/60 rounded-xl"
                     >
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                     </Button>
                     <a href={shareLink} target="_blank" rel="noopener noreferrer">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-9 w-9 hover:bg-white/5 text-white/60 rounded-xl"
                        >
                           <ExternalLink className="h-4 w-4" />
                        </Button>
                     </a>
                  </div>
               </div>
             )}
          </div>
        </div>



        {toastMsg && (
          <div className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] z-[100] animate-in fade-in slide-in-from-bottom-6 shadow-3xl flex items-center gap-4 backdrop-blur-2xl border border-white/10",
            toastMsg.type === 'success' ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"
          )}>
            <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
              {toastMsg.type === 'success' ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            </div>
            {toastMsg.text}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
