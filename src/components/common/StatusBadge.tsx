import React from 'react';
import { OrderStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = () => {
    switch (status) {
      case 'Placed':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'Confirmed':
        return 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]';
      case 'Out for delivery':
        return 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      case 'Delivered':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'Cancelled':
        return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3.5 py-1.5 text-sm font-semibold';
      case 'md':
      default:
        return 'px-2.5 py-1 text-xs font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getColors()} ${getSizeClasses()} tracking-wide select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-80 bg-current" />
      {status}
    </span>
  );
};
