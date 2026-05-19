import { ArrowLeft, Crown, Shuffle, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { AmbientMotion } from './AmbientMotion.jsx';
import { ThemeIcon } from './ThemeIcon.jsx';

export function DrawScreen({ event, token, onBack }) {
  const [poolInfo, setPoolInfo] = useState({ count: 0, candidates: [] });
  const [winner, setWinner] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [excludePrevious, setExcludePrevious] = useState(true);
  const [message, setMessage] = useState('');

  const sampleNames = useMemo(() => {
    const names = poolInfo.candidates.map((item) => item.name);
    return names.length ? names : ['Esperando asistentes'];
  }, [poolInfo]);

  const refreshPool = useCallback(async () => {
    const data = await api.drawPool(event.drawPool);
    setPoolInfo(data);
  }, [event.drawPool]);

  useEffect(() => {
    refreshPool().catch((error) => setMessage(error.message));
  }, [refreshPool]);

  const draw = async () => {
    setRolling(true);
    setWinner(null);
    setMessage('');
    window.setTimeout(async () => {
      try {
        const result = await api.drawWinner(token, { pool: event.drawPool, excludePrevious });
        setWinner(result.winner);
        await refreshPool();
      } catch (error) {
        setMessage(error.message);
      } finally {
        setRolling(false);
      }
    }, 1800);
  };

  return (
    <main className="draw-screen">
      <AmbientMotion theme={event.theme} />
      <header className="draw-header">
        <button className="ghost-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div>
          <p className="eyebrow">Modulo dinamico</p>
          <h1>Sorteo de asistentes</h1>
        </div>
        <ThemeIcon name={event.theme.icon} size={42} />
      </header>

      <section className="draw-stage">
        <div className={`winner-orb ${rolling ? 'rolling' : ''}`}>
          {rolling ? <Shuffle size={74} /> : winner ? <Crown size={78} /> : <Sparkles size={78} />}
        </div>
        <div className="name-reel">
          {rolling ? sampleNames.slice(0, 8).map((name, index) => <span key={`${name}-${index}`}>{name}</span>) : (
            <strong>{winner?.name || 'Listo para iniciar'}</strong>
          )}
        </div>
        {winner && (
          <div className="winner-card">
            <span>{winner.employeeNumber}</span>
            <h2>{winner.name}</h2>
            <p>{winner.region} · {winner.plaza} · {winner.store}</p>
          </div>
        )}
        <div className="draw-controls">
          <label className="check-row">
            <input type="checkbox" checked={excludePrevious} onChange={(event) => setExcludePrevious(event.target.checked)} />
            Excluir ganadores previos
          </label>
          <button className="primary-button big" type="button" onClick={draw} disabled={rolling || !token}>
            <Shuffle size={24} />
            Iniciar sorteo
          </button>
        </div>
        <p className="draw-caption">
          Participan {poolInfo.count} personas: {event.drawPool === 'present' ? 'solo presentes registrados' : 'todos los cargados desde Excel'}.
        </p>
        {message && <div className="form-error">{message}</div>}
      </section>
    </main>
  );
}
