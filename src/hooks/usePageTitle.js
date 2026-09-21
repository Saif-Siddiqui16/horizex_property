import { useEffect } from 'react';

export const usePageTitle = (title) => {
    useEffect(() => {
        if (!title) return;
        const event = new CustomEvent('pageTitleChange', { detail: title });
        window.dispatchEvent(event);
        document.title = `${title} | Horizex Group`;
    }, [title]);
};
