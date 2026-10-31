import React from 'react';
import { Users, UserCheck, CheckCircle, XCircle, Calendar, Clock, DollarSign, Zap } from 'lucide-react';

export const PayrollKPICards = ({ kpis = {} }) => {
  const {
    totalEmployees = 0,
    activeEmployees = 0,
    presentToday = 0,
    absentToday = 0,
    employeesOnLeave = 0,
    lateArrivals = 0,
    payrollThisMonth = 0,
    overtimeCost = 0
  } = kpis;

  const cardData = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: Users,
      color: 'text-blue-500 bg-blue-50/50 border-blue-100',
    },
    {
      title: 'Active Employees',
      value: activeEmployees,
      icon: UserCheck,
      color: 'text-emerald-500 bg-emerald-50/50 border-emerald-100',
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: CheckCircle,
      color: 'text-green-500 bg-green-50/50 border-green-100',
    },
    {
      title: 'Absent Today',
      value: absentToday,
      icon: XCircle,
      color: 'text-rose-500 bg-rose-50/50 border-rose-100',
    },
    {
      title: 'Employees On Leave',
      value: employeesOnLeave,
      icon: Calendar,
      color: 'text-amber-500 bg-amber-50/50 border-amber-100',
    },
    {
      title: 'Late Arrivals',
      value: lateArrivals,
      icon: Clock,
      color: 'text-orange-500 bg-orange-50/50 border-orange-100',
    },
    {
      title: 'Payroll This Month',
      value: `$${payrollThisMonth.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-indigo-500 bg-indigo-50/50 border-indigo-100',
    },
    {
      title: 'Overtime Cost',
      value: `$${overtimeCost.toLocaleString()}`,
      icon: Zap,
      color: 'text-violet-500 bg-violet-50/50 border-violet-100',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-card hover:shadow-md hover:translate-y-[-1px] transition-all duration-300 ease-in-out flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {card.title}
              </span>
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {card.value}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PayrollKPICards;
