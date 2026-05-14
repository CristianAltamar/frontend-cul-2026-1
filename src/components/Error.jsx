export const Error = ({ message }) => {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <span className="w-5 h-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 font-bold text-xs">
                ✕
            </span>
            {message}
        </div>
    );
}