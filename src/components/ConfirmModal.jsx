import { useEffect, useState } from "react";

/**
 * Componente Modal de confirmación reutilizable
 * @param {boolean} isOpen - Estado del modal
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje a mostrar
 * @param {function} onConfirm - Callback al hacer clic en Aceptar
 * @param {function} onCancel - Callback al hacer clic en Cancelar
 * @param {boolean} isLoading - Estado de carga (deshabilita botones)
 * @param {string} confirmText - Texto del botón Aceptar (default: "Aceptar")
 * @param {string} cancelText - Texto del botón Cancelar (default: "Cancelar")
 * @param {string} type - Tipo de modal: 'info', 'warning', 'error', 'success' (default: 'info')
 */
export function ConfirmModal({
    isOpen,
    title = "Confirmación",
    message = "¿Está seguro de continuar?",
    onConfirm,
    onCancel,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    type = "info"
}) {
    const [isLoading, setIsLoading] = useState(false);
    // Cerrar modal con tecla Escape
    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onCancel?.();
        };
        
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm?.();
        } catch (error) {
            console.error("Error en acción de confirmación:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Estilos por tipo de modal
    const typeStyles = {
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "bg-blue-100 text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700"
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            icon: "bg-amber-100 text-amber-600",
            button: "bg-amber-600 hover:bg-amber-700"
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-200",
            icon: "bg-red-100 text-red-600",
            button: "bg-red-600 hover:bg-red-700"
        },
        success: {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: "bg-green-100 text-green-600",
            button: "bg-green-600 hover:bg-green-700"
        }
    };

    const style = typeStyles[type] || typeStyles.info;

    // Iconos por tipo
    const icons = {
        info: "ℹ️",
        warning: "⚠️",
        error: "❌",
        success: "✅"
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-xl shadow-2xl border border-neutral-100 max-w-sm w-full pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className={`${style.bg} ${style.border} border-b px-6 py-4 flex items-center gap-3`}>
                        <div className={`${style.icon} w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0`}>
                            {icons[type]}
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900 flex-1">{title}</h2>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50 transition-colors"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        <p className="text-neutral-600 text-sm leading-relaxed">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg ${style.button} text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer`}
                        >
                            {isLoading && (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
