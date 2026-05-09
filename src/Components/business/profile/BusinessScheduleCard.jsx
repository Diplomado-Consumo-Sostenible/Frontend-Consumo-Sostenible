const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS = {
  monday:    'Lunes',
  tuesday:   'Martes',
  wednesday: 'Miércoles',
  thursday:  'Jueves',
  friday:    'Viernes',
  saturday:  'Sábado',
  sunday:    'Domingo',
};

const timeCls =
  'px-2.5 py-1.5 border border-edge rounded-xl text-sm text-body bg-card-bg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-colors w-[7.5rem]';

function parseDay(val) {
  if (!val || val === 'Cerrado') return { closed: true, open: '08:00', close: '18:00' };
  const parts = val.split(' - ');
  return { closed: false, open: parts[0] ?? '08:00', close: parts[1] ?? '18:00' };
}

function formatDay({ closed, open, close }) {
  return closed ? 'Cerrado' : `${open} - ${close}`;
}

export function ScheduleDisplay({ schedule }) {
  if (!schedule || Object.keys(schedule).length === 0) {
    return <p className="text-sm text-muted">Sin horario registrado.</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        Horario de Atención
      </p>
      {DAY_KEYS.filter((d) => schedule[d] !== undefined).map((day) => (
        <div key={day} className="flex items-center justify-between text-sm py-0.5">
          <span className="text-body">{DAY_LABELS[day]}</span>
          <span className={schedule[day] === 'Cerrado' ? 'text-muted' : 'text-body font-medium'}>
            {schedule[day]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ScheduleForm({ values, onChange }) {
  function setDay(day, patch) {
    const current = parseDay(values.schedule?.[day]);
    onChange({
      ...values,
      schedule: {
        ...values.schedule,
        [day]: formatDay({ ...current, ...patch }),
      },
    });
  }

  return (
    <div className="space-y-1">
      {DAY_KEYS.map((day) => {
        const { closed, open, close } = parseDay(values.schedule?.[day]);

        return (
          <div key={day} className="flex items-center gap-3 py-1.5 border-b border-edge/30 last:border-0">
            <span className="text-sm text-body w-24 shrink-0">{DAY_LABELS[day]}</span>

            <label className="flex items-center gap-1.5 cursor-pointer shrink-0 select-none">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setDay(day, { closed: e.target.checked })}
                className="w-3.5 h-3.5 accent-green-600 cursor-pointer"
              />
              <span className="text-xs text-muted">Cerrado</span>
            </label>

            {!closed && (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={open}
                  onChange={(e) => setDay(day, { open: e.target.value })}
                  className={timeCls}
                />
                <span className="text-muted text-xs">—</span>
                <input
                  type="time"
                  value={close}
                  onChange={(e) => setDay(day, { close: e.target.value })}
                  className={timeCls}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
