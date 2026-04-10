export const parseTime = (time) => {
    if (typeof time === 'number') {
        return time;
    }

    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const minute = Number(minuteString);
    return hour * 60 + minute;
};

const padNumber = (value) => value.toString().padStart(2, '0');

const formatTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${padNumber(hour)}:${padNumber(minute)}`;
};

export const formatTimeForApi = (time) => {
    const parts = time.split(":");
    const hour = padNumber(Number(parts[0]));
    const minute = padNumber(Number(parts[1] || 0));
    const second = padNumber(Number(parts[2] || 0));
    return `${hour}:${minute}:${second}`;
};

export const createSchedule = (start, end, durationMinutes) => {
    const scheduleStart = [];
    const scheduleEnd = [];
    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || Number.isNaN(durationMinutes)) {
        return { scheduleStart, scheduleEnd };
    }

    for (let current = startMinutes; current + durationMinutes <= endMinutes; current += durationMinutes) {
        scheduleStart.push(formatTime(current));
        scheduleEnd.push(formatTime(current + durationMinutes));
    }

    return { scheduleStart, scheduleEnd };
};

export const mergeContiguousSlots = (slots) => {
    const merged = [];

    slots.forEach((slot) => {
        if (merged.length === 0) {
            merged.push({ ...slot });
            return;
        }

        const previous = merged[merged.length - 1];
        const previousEnd = parseTime(previous.hora_fin);
        const currentStart = parseTime(slot.hora_inicio);

        if (previous.dia_semana === slot.dia_semana && previousEnd === currentStart) {
            previous.hora_fin = slot.hora_fin;
        } else {
            merged.push({ ...slot });
        }
    });

    return merged;
};

const daysOfWeek ={
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo"
}

const DURATION_MINUTES = 45;

export const expandDisponibilidadSlots = (item) => {
    const startMinutes = parseTime(item.hora_inicio);
    const endMinutes = parseTime(item.hora_fin);
    const diaName = daysOfWeek[item.dia_semana] || "Desconocido";
    
    const expandedSlots = [];
    
    for (let current = startMinutes; current + DURATION_MINUTES <= endMinutes; current += DURATION_MINUTES) {
        const slotStart = formatTime(current);
        const slotEnd = formatTime(current + DURATION_MINUTES);
        const key = `${diaName}-${slotStart}-${slotEnd}`;
        expandedSlots.push(key);
    }
    
    return expandedSlots;
};

export const procesoDisponibilidad = (disponibilidad) => {
    const processed = {};

    disponibilidad.forEach(item => {
        const expandedKeys = expandDisponibilidadSlots(item);
        expandedKeys.forEach(key => {
            processed[key] = true;
        });
    });

    return processed;
};