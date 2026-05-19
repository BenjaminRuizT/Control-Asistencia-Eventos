import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLogin } from './components/AdminLogin.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';
import { AmbientMotion } from './components/AmbientMotion.jsx';
import { AccessScreen } from './components/AccessScreen.jsx';
import { DrawScreen } from './components/DrawScreen.jsx';
import { api } from './lib/api.js';
import { themePresets } from './lib/themes.js';

const emptyStats = {
  total: 0,
  present: 0,
  missing: 0,
  percent: 0,
  recent: [],
  byRegion: [],
  byPlaza: []
};

const fallbackEvent = {
  title: 'Control de asistencia para eventos',
  drawPool: 'present',
  theme: themePresets.sports
};

export default function App() {
  const [event, setEvent] = useState(fallbackEvent);
  const [stats, setStats] = useState(emptyStats);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDraw, setShowDraw] = useState(false);
  const [todayKey, setTodayKey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const theme = useMemo(() => ({ ...themePresets.sports, ...event.theme }), [event.theme]);

  const loadEvent = useCallback(async () => {
    try {
      const active = await api.getActiveEvent();
      setEvent({ ...active, theme: { ...themePresets.sports, ...active.theme } });
    } catch (error) {
      setResult({ status: 'error', message: error.message });
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.stats());
    } catch (_error) {
      setStats(emptyStats);
    }
  }, []);

  useEffect(() => {
    loadEvent();
    loadStats();
    api.getTodayKey().then((data) => setTodayKey(data.todayKey)).catch(() => {});
    const timer = window.setInterval(loadStats, 5000);
    return () => window.clearInterval(timer);
  }, [loadEvent, loadStats]);

  useEffect(() => {
    const handler = (keyboardEvent) => {
      if (keyboardEvent.ctrlKey && keyboardEvent.key.toLowerCase() === 'q') {
        keyboardEvent.preventDefault();
        token ? setShowAdmin(true) : setShowLogin(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [token]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--background-image', theme.backgroundImage ? `url("${theme.backgroundImage}")` : 'none');
  }, [theme]);

  const openAdmin = () => {
    token ? setShowAdmin(true) : setShowLogin(true);
  };

  const login = async (credentials) => {
    setLoginError('');
    try {
      const response = await api.login(credentials);
      localStorage.setItem('adminToken', response.token);
      setToken(response.token);
      setShowLogin(false);
      setShowAdmin(true);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setShowAdmin(false);
  };

  const checkIn = async (employeeNumber) => {
    setBusy(true);
    try {
      const response = await api.checkIn(employeeNumber);
      setResult(response);
      await loadStats();
    } catch (error) {
      setResult({ status: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-root">
      <AmbientMotion theme={theme} />
      {showDraw ? (
        <DrawScreen event={{ ...event, theme }} token={token} onBack={() => setShowDraw(false)} />
      ) : (
        <AccessScreen
          event={{ ...event, theme }}
          stats={stats}
          result={result}
          busy={busy}
          onCheckIn={checkIn}
          onOpenAdmin={openAdmin}
          onOpenDraw={() => setShowDraw(true)}
        />
      )}

      {showLogin && (
        <AdminLogin
          todayKey={todayKey}
          onLogin={login}
          onClose={() => setShowLogin(false)}
          error={loginError}
        />
      )}

      {showAdmin && (
        <AdminPanel
          event={{ ...event, theme }}
          stats={stats}
          token={token}
          onClose={() => setShowAdmin(false)}
          onLogout={logout}
          onOpenDraw={() => {
            setShowAdmin(false);
            setShowDraw(true);
          }}
          onEventSaved={(saved) => {
            setEvent({ ...saved, theme: { ...themePresets.sports, ...saved.theme } });
            loadStats();
          }}
        />
      )}
    </div>
  );
}
