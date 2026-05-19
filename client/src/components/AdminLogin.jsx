import { KeyRound, X } from 'lucide-react';
import { useState } from 'react';

export function AdminLogin({ todayKey, onLogin, onClose, error }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const submit = (event) => {
    event.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="modal-backdrop">
      <form className="login-card" onSubmit={submit}>
        <button type="button" className="close-button" onClick={onClose} title="Cerrar">
          <X size={20} />
        </button>
        <KeyRound size={36} />
        <h2>Configuracion administrativa</h2>
        <p>La contrasena cambia cada dia: admin + fecha local America/Tijuana.</p>
        <div className="hint-pill">Hoy: admin{todayKey || 'AAAAMMDD'}</div>
        <label>
          Usuario
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Contrasena
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button" type="submit">Entrar</button>
      </form>
    </div>
  );
}
