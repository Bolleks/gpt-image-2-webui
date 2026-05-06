'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MobileNav } from '@/components/MobileNav';

export function MobileHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 h-12 z-40 bg-white/[0.03] backdrop-blur-[12px] border-b border-white/[0.06] lg:hidden">
      <div className="flex items-center justify-end h-full px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 p-0"
          >
            <SheetTitle className="sr-only">Навигация</SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
