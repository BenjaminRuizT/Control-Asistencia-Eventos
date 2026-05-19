import { CheckCircle2, CircleAlert, Eraser, LogIn, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ThemeIcon } from './ThemeIcon.jsx';

export function AccessScreen({ event, stats, onCheckIn, onOpenAdmin, onOpenDraw, result, busy }) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  const submit = async (formEvent) => {
    formEvent.preventDefault();
    const value = employeeNumber.trim();
    if (!value) return;
    await onCheckIn(value);
    setEmployeeNumber('');
  };

  const statusTone = result?.status === 'registered' ? 'success' : result?.status === 'already-registered' ? 'warning' : 'error';

  return (
    <main className={`access-screen layout-${event.theme.layout}`}>
      <section className="access-shell">
        <div className="event-mark">
          <ThemeIcon name={event.theme.icon} size={32} />
          <span>{event.theme.preset || 'evento'}</span>
        </div>

        <div className="event-title-block">
          <p className="eyebrow">Control de acceso</p>
          <h1>{event.title}</h1>
          <p className="event-subtitle">Ingrese el numero de empleado para registrar asistencia.</p>
        </div>

        <form className="checkin-panel" onSubmit={submit}>
          <label htmlFor="employeeNumber">Numero de empleado</label>
          <div className="checkin-row">
            <input
              ref={inputRef}
              id="employeeNumber"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ej. 10001"
              value={employeeNumber}
              onChange={(event) => setEmployeeNumber(event.target.value)}
            />
            <button className="primary-button" type="submit" disabled={busy}>
              <LogIn size={22} />
              Registrar
            </button>
            <button className="icon-button" type="button" onClick={() => setEmployeeNumber('')} title="Limpiar">
              <Eraser size={22} />
            </button>
          </div>
        </form>

        {result && (
          <section className={`result-card ${statusTone}`}>
            {statusTone === 'success' ? <CheckCircle2 size={42} /> : <CircleAlert size={42} />}
            <div>
              <p className="result-status">
                {result.status === 'registered' && 'Registro exitoso'}
                {result.status === 'already-registered' && 'Asistencia ya registrada'}
                {result.status === 'error' && 'No se pudo registrar'}
              </p>
              <h2>{result.attendee?.name || result.message}</h2>
              {result.attendee && (
                <p>
                  {result.attendee.region} · {result.attendee.plaza} · {result.attendee.store}
                </p>
              )}
            </div>
          </section>
        )}

        <div className="access-stats">
          <div>
            <span>{stats.present}</span>
            <small>Presentes</small>
          </div>
          <div>
            <span>{stats.total}</span>
            <small>Invitados</small>
          </div>
          <div>
            <span>{stats.percent}%</span>
            <small>Avance</small>
          </div>
        </div>
      </section>

      <button className="draw-entry" type="button" onClick={onOpenDraw}>
        <ThemeIcon name={event.theme.icon} size={18} />
        Sorteo
      </button>

      <button className="stealth-gear" type="button" onClick={onOpenAdmin} title="Configuracion">
        <Settings size={18} />
      </button>
    </main>
  );
}
