import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function StatsDashboard({ stats, theme }) {
  const attendanceData = [
    { name: 'Presentes', value: stats.present, color: theme.accent },
    { name: 'Faltantes', value: stats.missing, color: theme.secondary }
  ];

  return (
    <section className="dashboard-grid">
      <article className="metric-card">
        <span>Avance</span>
        <strong>{stats.percent}%</strong>
        <div className="progress-track">
          <i style={{ width: `${stats.percent}%` }} />
        </div>
      </article>
      <article className="metric-card">
        <span>Presentes</span>
        <strong>{stats.present}</strong>
        <small>de {stats.total} invitados</small>
      </article>
      <article className="metric-card">
        <span>Faltantes</span>
        <strong>{stats.missing}</strong>
        <small>pendientes por registrar</small>
      </article>

      <article className="chart-card wide">
        <h3>Asistencia por region</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.byRegion || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
            <XAxis dataKey="label" stroke="currentColor" />
            <YAxis stroke="currentColor" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.18)' }} />
            <Bar dataKey="total" fill={theme.secondary} radius={[8, 8, 0, 0]} />
            <Bar dataKey="present" fill={theme.accent} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>

      <article className="chart-card">
        <h3>Estado general</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
              {attendanceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.18)' }} />
          </PieChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}
