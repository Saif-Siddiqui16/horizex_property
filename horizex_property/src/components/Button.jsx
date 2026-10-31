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
    const baseStyles = "saas-btn select-none";

    const variants = {
        primary: "saas-btn-primary",
        accent: "saas-btn-accent",
        secondary: "saas-btn-secondary",
        outline: "saas-btn-outline",
        ghost: "saas-btn-ghost",
        danger: "saas-btn-danger"
    };

    const sizes = {
        sm: "!h-8 !px-3 !text-xs",
        md: "", // Defaults handled by saas-btn
        lg: "!h-12 !px-6 !text-base"
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
