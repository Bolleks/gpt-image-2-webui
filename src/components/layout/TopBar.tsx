'use client';

import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileNav } from '@/components/MobileNav';

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-40 bg-white/[0.03] backdrop-blur-[12px] border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">GPT Image 2</span>
        </div>

        <div className="hidden lg:block" />

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/60 hover:text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 p-0"
          >
            <MobileNav />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
