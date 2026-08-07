import React from "react";

interface Order {
  id: string;
  date: string;
  title: string;
}

interface OrdersViewProps {
  data: Order[];
}

export default function OrdersView({ data }: OrdersViewProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {Array.isArray(data) && data.map((order: Order, idx: number) => (
        <div key={`${order.id}-${idx}`} className="p-3.5 sm:p-4 rounded-xl border border-brand-border bg-white shadow-xs group">
          <p className="text-[9px] font-bold text-brand-primary uppercase tracking-wider mb-1">
            {String(order.date)}
          </p>
          <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {String(order.title)}
          </h3>
        </div>
      ))}
    </div>
  );
}
