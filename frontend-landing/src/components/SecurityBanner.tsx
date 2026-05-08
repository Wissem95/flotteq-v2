import { ShieldCheck } from '@/icons/ShieldCheck';
import { LockTLS } from '@/icons/LockTLS';
import { FlagFR } from '@/icons/FlagFR';
import { Backup } from '@/icons/Backup';
import { securityItems } from '@/data/security';
import type { ComponentType, SVGProps } from 'react';

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  shield: ShieldCheck,
  lock: LockTLS,
  flag: FlagFR,
  backup: Backup,
};

export function SecurityBanner() {
  return (
    <section className="py-12 bg-flotteq-navy text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold">
          Vos données, en sécurité, en France.
        </h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {securityItems.map((item) => {
            const Icon = ICONS[item.iconKey];
            return (
              <div key={item.label} className="text-center">
                <div className="inline-flex h-14 w-14 rounded-xl bg-white/10 items-center justify-center text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="mt-3 font-bold">{item.label}</div>
                <div className="mt-1 text-sm text-white/70">{item.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
