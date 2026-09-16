import React from 'react';
import clsx from 'clsx';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    icon: Icon,
    isLoading,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-[14px] font-sans font-bold cursor-pointer transition-all duration-200 border disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent gap-2 whitespace-nowrap select-none active:scale-[0.98]";

    const variants = {
        primary: "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white shadow-sm hover:translate-y-[-1px] border-transparent",
        secondary: "bg-slate-100 text-slate-800 border-transparent hover:bg-slate-200 hover:translate-y-[-1px]",
        outline: "bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:translate-y-[-1px]",
        ghost: "bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-none",
        danger: "bg-rose-600 text-white border-transparent hover:bg-rose-700 hover:translate-y-[-1px] shadow-sm"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {Icon && <Icon size={18} className="flex items-center" />}
                    {children}
                </>
            )}
        </button>
    );
};
