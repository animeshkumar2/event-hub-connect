import React from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<PaymentStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
}> = {
  PENDING: {
    label: 'Payment Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: Clock,
  },
  PARTIAL: {
    label: 'Partially Paid',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: AlertCircle,
  },
  PAID: {
    label: 'Fully Paid',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: RefreshCw,
  },
  FAILED: {
    label: 'Payment Failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;
