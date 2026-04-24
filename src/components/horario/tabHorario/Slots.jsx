export const Slots = ({timeSlots, d, isDisponible}) => {
    return (
        <div className="flex gap-0.5 mt-1.5 justify-center">
            {timeSlots.map((s, i) => {
                const slotDisp = isDisponible(d, s.inicio, s.fin);
                return (
                    <span
                        key={i}
                        title={`${s.inicio}–${s.fin}`}
                        className={`h-1.5 rounded-full flex-1 max-w-3 transition-colors ${
                            slotDisp
                                ? "bg-emerald-400"
                                : "bg-neutral-200"
                        }`}
                    />
                );
            })}
        </div>
    )
}