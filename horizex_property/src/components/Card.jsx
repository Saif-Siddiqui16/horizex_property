import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, title, action, ...props }) => {
    return (
        <div
            className={clsx(
                'saas-card flex flex-col overflow-hidden',
                className
            )}
            {...props}
        >
            {(title || action) && (
                <div className="py-4 px-5 md:px-6 bg-transparent border-b border-zinc-200 flex items-center justify-between">
                    {title && <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h3>}
                    {action && <div className="flex items-center gap-2">{action}</div>}
                </div>
            )}
            <div className="p-5 md:p-6 flex-1 text-zinc-600 text-sm">
                {children}
            </div>
        </div>
    );
};
