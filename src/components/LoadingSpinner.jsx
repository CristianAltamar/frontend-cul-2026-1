// Spinner inline — usar dentro de botones o secciones pequeñas
export function LoadingSpinner({ size = "md", light = false }) {
    const sizes = {
        sm: "w-4 h-4 border-2",
        md: "w-5 h-5 border-2",
        lg: "w-8 h-8 border-[3px]",
    };
    const colors = light
        ? "border-white/30 border-t-white"
        : "border-neutral-200 border-t-neutral-800";

    return (
        <div className={`${sizes[size]} rounded-full ${colors} animate-spin inline-block shrink-0`} />
    );
}

// Overlay de pantalla completa — usar mientras se carga una página o se guarda algo importante
export function LoadingOverlay({ message = "Cargando..." }) {
    return (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-neutral-100" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-neutral-900 animate-spin" />
            </div>
            {message && (
                <p className="text-sm text-neutral-500 font-medium tracking-wide animate-pulse">{message}</p>
            )}
        </div>
    );
}
