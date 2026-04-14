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
  const [loadingType, setLoadingType] = useState<'download' | 'email' | 'sharing' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(user?.isSharing || false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
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

  const handleExecuteAction = async (action: 'download' | 'email') => {
    setLoadingType(action);
    const type = selectedFormat;
    try {
      const transactions = await fetchTransactions();
      const dateRangeStr = `${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}`;
      const userData = { username: user?.username || 'User', email: user?.email || '', currencyCode: user?.currencyCode || 'USD' };

      if (action === 'download') {
        if (type === 'pdf') {
          const doc = generateCustomReport(transactions, userData, dateRangeStr);
          doc.save(`FncBoard_Statement_${fromDate}_to_${toDate}.pdf`);
        } else {
          const wb = generateExcelWorkbook(transactions, userData, dateRangeStr);
          XLSX.writeFile(wb, `FncBoard_Statement_${fromDate}_to_${toDate}.xlsx`);
        }
        showToast(`${type.toUpperCase()} Report Downloaded`, 'success');
      } else {
        await fetch('/api/reports/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions, user: userData, dateRange: dateRangeStr, format: type })
        });
        showToast(`${type.toUpperCase()} Report Sent to Email`, 'success');
      }
    } catch (err: any) {
      console.error(`Report ${action} Error:`, err);
      showToast(`Failed to ${action} ${type.toUpperCase()} report`, 'error');
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
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-0 overflow-hidden shadow-2xl ring-1 ring-border/50 custom-scrollbar">
        <div className="p-10 space-y-8">
        <DialogHeader className="mb-0">
          <DialogTitle className="text-3xl font-bold text-foreground mb-2">
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
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                       type="date" 
                       value={fromDate}
                       onChange={(e) => setFromDate(e.target.value)}
                       className="h-11 bg-background border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:ring-1 focus:ring-primary/40 transition-all"
                    />
                 </div>
              </div>
              <div className="space-y-2.5">
                 <Label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">To Date</Label>
                 <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                       type="date" 
                       value={toDate}
                       onChange={(e) => setToDate(e.target.value)}
                       className="h-11 bg-background border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:ring-1 focus:ring-primary/40 transition-all"
                    />
                 </div>
              </div>
          </div>

          <div className="space-y-4">
             <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Select Export Format</Label>
             <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-2xl border border-border">
                <Button 
                   variant="ghost" 
                   onClick={() => setSelectedFormat('pdf')}
                   className={cn(
                     "h-12 rounded-xl transition-all gap-2 text-xs font-bold",
                     selectedFormat === 'pdf' ? "bg-card text-foreground shadow-sm" : "hover:bg-card/50 text-muted-foreground"
                   )}
                >
                   <FileText className={cn("h-4 w-4", selectedFormat === 'pdf' ? "text-primary" : "text-muted-foreground")} />
                   PDF Document
                </Button>
                <Button 
                   variant="ghost" 
                   onClick={() => setSelectedFormat('excel')}
                   className={cn(
                     "h-12 rounded-xl transition-all gap-2 text-xs font-bold",
                     selectedFormat === 'excel' ? "bg-card text-foreground shadow-sm" : "hover:bg-card/50 text-muted-foreground"
                   )}
                >
                   <TableIcon className={cn("h-4 w-4", selectedFormat === 'excel' ? "text-emerald-500" : "text-muted-foreground")} />
                   Excel Sheet
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Button 
               onClick={() => handleExecuteAction('download')} 
               disabled={!!loadingType}
               className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
                {loadingType === 'download' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Download Now
             </Button>
             
             <Button 
               onClick={() => handleExecuteAction('email')} 
               disabled={!!loadingType}
               className="h-14 bg-background border border-border text-foreground hover:bg-muted font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
                {loadingType === 'email' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
                Email Report
             </Button>
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div className="p-6 bg-muted/30 border border-border rounded-[2.5rem] space-y-6 shadow-sm overflow-hidden relative">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                      isSharing ? "bg-emerald-500 text-white" : "bg-background text-muted-foreground border border-border"
                   )}>
                      {isSharing ? <Globe className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                   </div>
                   <div className="space-y-0.5">
                      <h4 className="font-bold text-foreground text-base">Public Dashboard</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Real-time Sharing</p>
                   </div>
                </div>
                <CustomSwitch 
                  checked={isSharing}
                  onCheckedChange={handleToggleSharing}
                  disabled={!!loadingType}
                />
             </div>

             {isSharing && (
               <div className="flex items-center gap-2 bg-background border border-border p-2 px-4 rounded-2xl overflow-hidden group shadow-inner relative z-10 animate-in slide-in-from-top-4 duration-300">
                  <span className="flex-1 text-[11px] text-foreground/70 truncate py-2 font-semibold">
                     {shareLink}
                  </span>
                  <div className="flex items-center gap-1">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={copyToClipboard}
                        className="h-10 w-10 hover:bg-muted text-muted-foreground hover:text-primary rounded-xl transition-all"
                     >
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                     </Button>
                     <a href={shareLink} target="_blank" rel="noopener noreferrer">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-10 w-10 hover:bg-muted text-muted-foreground hover:text-primary rounded-xl transition-all"
                        >
                           <ExternalLink className="h-4 w-4" />
                        </Button>
                     </a>
                  </div>
               </div>
             )}
          </div>
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
