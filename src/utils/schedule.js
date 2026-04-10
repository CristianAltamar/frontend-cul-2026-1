const parseTime = (time) => {
    if (typeof time === 'number') {
        return time;
    }

    const [hourString, minuteString] = time.split(':');
    const hour = Number(hourString);
    const minute = Number(minuteString);
    return hour * 60 + minute;
};

const formatTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour}:${minute.toString().padStart(2, '0')}`;
};

export const createSchedule = (start, end, durationMinutes) => {
    const scheduleStart = [];
    const scheduleEnd = [];
    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || Number.isNaN(durationMinutes)) {
        return scheduleStart, scheduleEnd;
    }

    for (let current = startMinutes; current + durationMinutes <= endMinutes; current += durationMinutes) {
        scheduleStart.push(formatTime(current));
        scheduleEnd.push(formatTime(current + durationMinutes));
    }

    return { scheduleStart, scheduleEnd };
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

export const procesoDisponibilidad = (disponibilidad) => {
    const processed = {};

    disponibilidad.forEach(item => {
        const key = `${daysOfWeek[item.dia_semana]}-${formatTime(parseTime(item.hora_inicio))} a ${formatTime(parseTime(item.hora_fin))}`;
        processed[key] = true;
    });

    return processed;
};