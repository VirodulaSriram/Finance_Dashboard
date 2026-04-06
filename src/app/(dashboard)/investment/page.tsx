'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  Globe, 
  BarChart4, 
  PieChart as PieChartIcon,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function InvestmentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 pb-12">
      
      {/* Animated Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge className="bg-primary/20 text-primary border-primary/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
          <Sparkles className="h-3 w-3 mr-2" /> Release 2.0
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
          Investments <br/> <span className="text-muted-foreground opacity-50 underline decoration-primary decoration-4 underline-offset-8">Coming Soon</span>
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground text-sm font-medium leading-relaxed pt-6">
          A new way to grow your wealth. Advanced portfolio tracking, market insights, 
          and automated investing—built directly into your FncBoard assistant.
        </p>
      </motion.div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[
          { label: 'Global Markets', icon: Globe, color: 'text-primary', desc: 'Trade US and International stocks' },
          { label: 'Asset Allocation', icon: PieChartIcon, color: 'text-amber-400', desc: 'Visual distribution of your portfolio' },
          { label: 'Real-time Analytics', icon: BarChart4, color: 'text-rose-400', desc: 'Live data and smart performance alerts' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="group"
          >
            <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 h-full shadow-2xl relative overflow-hidden transition-all hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/5 ${feature.color}`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button className="h-14 px-10 rounded-2xl bg-primary text-[#0C0E0E] font-black text-base shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          Notify Me When Available
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-4 font-black uppercase tracking-widest opacity-40 flex items-center justify-center gap-2">
          <AlertCircle className="h-3 w-3" /> Alpha testers only
        </p>
      </motion.div>

    </div>
  );
}
