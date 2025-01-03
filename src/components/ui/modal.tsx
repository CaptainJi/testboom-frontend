import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-50 w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-200">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
                {footer && (
                    <div className="mt-6 flex justify-end space-x-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}; 