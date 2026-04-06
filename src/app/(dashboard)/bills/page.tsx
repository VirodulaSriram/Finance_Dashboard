'use client';

import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Zap, 
  Droplet, 
  Wifi, 
  Tv, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockBills = [
  { label: 'Electricity Bill', icon: Zap, color: 'text-amber-400', amount: '$120.00', date: 'Due in 3 days', progress: 45 },
  { label: 'Internet (Fiber)', icon: Wifi, color: 'text-primary', amount: '$59.00', date: 'Paid yesterday', progress: 100 },
  { label: 'Water & Gas', icon: Droplet, color: 'text-blue-400', amount: '$45.00', date: 'Due in 12 days', progress: 10 },
];

export default function BillsPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh] pb-12">
      
      {/* Left Column: Hero & Promo */}
      <div className="lg:w-1/2 space-y-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <Clock className="h-3 w-3 mr-2" /> In Development
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            Bills <br/> <span className="opacity-40">& Payments</span>
          </h1>
          <p className="max-w-md text-muted-foreground text-sm font-medium leading-relaxed pt-2">
            Automate your overhead. Schedule recurring payments, set budget limits for subscriptions, 
            and get predicted insights before your bills even arrive.
          </p>
          <div className="pt-6">
            <Button className="h-14 px-10 rounded-2xl bg-white text-[#0C0E0E] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Early Access Program <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Feature List */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-[#161818] border-none rounded-[2rem] p-6 shadow-xl border border-white/5">
            <Sparkles className="h-6 w-6 text-primary mb-4" />
            <h4 className="font-bold text-white text-sm">Smart Autosnap</h4>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-black opacity-50">Capture bills from email</p>
          </Card>
          <Card className="bg-[#161818] border-none rounded-[2rem] p-6 shadow-xl border border-white/5">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mb-4" />
            <h4 className="font-bold text-white text-sm">SafeVault Pay</h4>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-black opacity-50">Secured bank transfers</p>
          </Card>
        </div>
      </div>

      {/* Right Column: Visual Preview */}
      <div className="lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <h3 className="text-xl font-black text-white tracking-tight mb-8">Interface Preview</h3>
            
            <div className="space-y-8 relative z-10 opacity-60">
              {mockBills.map((bill, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5 ${bill.color}`}>
                      <bill.icon className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="font-bold text-white text-sm">{bill.label}</h4>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{bill.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="font-black text-white">{bill.amount}</span>
                     <Progress value={bill.progress} className="h-1.5 w-24 bg-white/10 mt-2" indicatorClassName={bill.progress === 100 ? "bg-emerald-400" : ""} />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-[0.2em]">Total Upcoming</span>
                <span className="text-xl font-black text-white">$165.00</span>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 transition-all group-hover:backdrop-blur-0 group-hover:bg-transparent">
               <div className="bg-[#EEB58F] text-[#402D21] font-black px-6 py-2 rounded-full text-xs uppercase tracking-[0.3em] shadow-2xl group-hover:scale-110 transition-transform">
                 Coming Soon
               </div>
            </div>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
