import { Download, FileSpreadsheet, ImagePlus, LogOut, Palette, RefreshCcw, Save, Shuffle, Upload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api, downloadBlob } from '../lib/api.js';
import { iconOptions, layoutOptions, motionOptions, themePresets } from '../lib/themes.js';
import { StatsDashboard } from './StatsDashboard.jsx';

export function AdminPanel({ event, stats, token, onClose, onLogout, onEventSaved, onOpenDraw }) {
  const [draft, setDraft] = useState(event);
  const [file, setFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const presets = useMemo(() => Object.values(themePresets), []);

  const updateTheme = (field, value) => {
    setDraft((current) => ({ ...current, theme: { ...current.theme, [field]: value } }));
  };

  const applyPreset = (preset) => {
    setDraft((current) => ({ ...current, theme: { ...preset } }));
  };

  const handleImage = (selectedFile) => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = () => updateTheme('backgroundImage', reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const saved = await api.updateEvent(token, {
        title: draft.title,
        drawPool: draft.drawPool,
        theme: draft.theme
      });
      onEventSaved(saved);
      setMessage('Configuracion guardada.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const importFile = async () => {
    if (!file) {
      setMessage('Selecciona un archivo Excel .xlsx.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const result = await api.importAttendees(token, file, clearExisting);
      setMessage(`Archivo cargado: ${result.imported} registros procesados. Total actual: ${result.total}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const exportReport = async () => {
    setBusy(true);
    setMessage('');
    try {
      const blob = await api.exportReport(token);
      downloadBlob(blob, 'reporte-asistencia-evento.xlsx');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-panel">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Panel privado</p>
          <h2>Configuracion del evento</h2>
        </div>
        <div className="admin-actions">
          <button type="button" className="ghost-button" onClick={onOpenDraw}>
            <Shuffle size={18} />
            Sorteos
          </button>
          <button type="button" className="ghost-button" onClick={onLogout}>
            <LogOut size={18} />
            Salir
          </button>
          <button type="button" className="icon-button" onClick={onClose} title="Cerrar">
            <X size={22} />
          </button>
        </div>
      </header>

      <div className="admin-scroll">
        <StatsDashboard stats={stats} theme={draft.theme} />

        <section className="admin-columns">
          <article className="tool-panel">
            <h3><Palette size={20} /> Diseno y experiencia</h3>
            <label>
              Titulo del evento
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>

            <div className="preset-grid">
              {presets.map((preset) => (
                <button
                  key={preset.preset}
                  type="button"
                  className="preset-card"
                  onClick={() => applyPreset(preset)}
                  style={{ '--preset-a': preset.primary, '--preset-b': preset.secondary, '--preset-c': preset.accent }}
                >
                  <i />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="control-grid">
              {['primary', 'secondary', 'accent', 'background', 'text'].map((field) => (
                <label key={field}>
                  {field}
                  <input type="color" value={draft.theme[field]} onChange={(event) => updateTheme(field, event.target.value)} />
                </label>
              ))}
            </div>

            <div className="control-grid">
              <label>
                Animacion
                <select value={draft.theme.motion} onChange={(event) => updateTheme('motion', event.target.value)}>
                  {motionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                Estructura
                <select value={draft.theme.layout} onChange={(event) => updateTheme('layout', event.target.value)}>
                  {layoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                Icono
                <select value={draft.theme.icon} onChange={(event) => updateTheme('icon', event.target.value)}>
                  {iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                Intensidad
                <input type="range" min="0" max="100" value={draft.theme.intensity} onChange={(event) => updateTheme('intensity', Number(event.target.value))} />
              </label>
            </div>

            <label className="upload-zone">
              <ImagePlus size={22} />
              Subir imagen para fondo
              <input type="file" accept="image/*" onChange={(event) => handleImage(event.target.files?.[0])} />
            </label>
          </article>

          <article className="tool-panel">
            <h3><FileSpreadsheet size={20} /> Base de asistentes</h3>
            <p className="panel-copy">Estructura requerida: Numero de empleado, Nombre, Region, Plaza, Tienda. El numero de empleado es unico por evento.</p>
            <a className="ghost-button" href={api.templateUrl()} download>
              <Download size={18} />
              Descargar template
            </a>
            <label className="upload-zone">
              <Upload size={22} />
              {file ? file.name : 'Seleccionar Excel .xlsx'}
              <input type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            <label className="check-row">
              <input type="checkbox" checked={clearExisting} onChange={(event) => setClearExisting(event.target.checked)} />
              Reemplazar asistentes del evento actual
            </label>
            <button className="primary-button" type="button" onClick={importFile} disabled={busy}>
              <Upload size={18} />
              Cargar asistentes
            </button>
          </article>

          <article className="tool-panel">
            <h3><Shuffle size={20} /> Sorteos y reportes</h3>
            <label>
              Participantes del sorteo
              <select value={draft.drawPool} onChange={(event) => setDraft((current) => ({ ...current, drawPool: event.target.value }))}>
                <option value="present">Solo asistentes presentes</option>
                <option value="all">Todos los cargados desde Excel</option>
              </select>
            </label>
            <button className="ghost-button" type="button" onClick={exportReport} disabled={busy}>
              <Download size={18} />
              Exportar presentes, faltantes y sorteos
            </button>
            <button className="ghost-button" type="button" onClick={onOpenDraw}>
              <Shuffle size={18} />
              Abrir modulo de sorteo
            </button>
          </article>
        </section>
      </div>

      <footer className="admin-footer">
        <div>{message && <span className="admin-message">{message}</span>}</div>
        <button type="button" className="ghost-button" onClick={() => window.location.reload()}>
          <RefreshCcw size={18} />
          Refrescar
        </button>
        <button type="button" className="primary-button" onClick={save} disabled={busy}>
          <Save size={18} />
          Guardar cambios
        </button>
      </footer>
    </section>
  );
}
