import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ActiveBacklogTable from './ActiveBacklogTable'
import DistributionChart from './DistributionChart'
import KPICards from './KPICards'
import OthersBreakdownChart from './OthersBreakdownChart'
import RoutingMatrix from './RoutingMatrix'

export default function Dashboard() {
  const [version, setVersion] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('dashboardVersion')
    return param === 'new' ? 'new' : 'current'
  })

  const changeVersion = (nextVersion) => {
    setVersion(nextVersion)
    const nextUrl = nextVersion === 'new' ? '/dashboard?dashboardVersion=new' : '/dashboard'
    window.history.replaceState(null, '', nextUrl)
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Query Management - Ops Dashboard</h1>
          <p className="dashboard-sub">
            {version === 'current'
              ? 'Based on 8,772 queries. Phase 1 target metrics shown in green.'
              : 'Dummy Phase 2 view showing routed queues, SLA health, and resolution quality.'}
          </p>
        </div>
        <div className="dashboard-actions">
          <div className="version-switcher" aria-label="Dashboard version">
            <button
              type="button"
              className={version === 'current' ? 'active' : ''}
              onClick={() => changeVersion('current')}
            >
              Current
            </button>
            <button
              type="button"
              className={version === 'new' ? 'active' : ''}
              onClick={() => changeVersion('new')}
            >
              New Version
            </button>
          </div>
          <span className="ref-badge">Engineering Reference</span>
        </div>
      </header>
      {version === 'current' ? <CurrentDashboard /> : <NewVersionDashboard />}
    </main>
  )
}

function CurrentDashboard() {
  return (
    <>
      <KPICards />
      <div className="chart-grid">
        <DistributionChart />
        <OthersBreakdownChart />
      </div>
      <ActiveBacklogTable />
      <RoutingMatrix />
    </>
  )
}

const newKpis = [
  { label: 'OPEN QUERIES', value: '219', sub: '38 breached SLA', tone: 'danger' },
  { label: 'AVG FIRST RESPONSE', value: '18h', sub: 'Target: under 24h', tone: 'success' },
  { label: 'ROUTING ACCURACY', value: '92%', sub: 'Auto-routed from sub-option', tone: 'success' },
  { label: 'RESOLUTION CODE COVERAGE', value: '88%', sub: 'Target: 90%+', tone: 'warning' }
]

const queueHealth = [
  { queue: 'Content QA', open: 112, breached: 22, sla: '48h' },
  { queue: 'Engineering', open: 43, breached: 6, sla: '24h' },
  { queue: 'Educator', open: 31, breached: 4, sla: '72h' },
  { queue: 'Ops Triage', open: 33, breached: 6, sla: '24h' }
]

const resolutionCodes = [
  { code: 'answer_corrected', count: 318 },
  { code: 'rationale_updated', count: 244 },
  { code: 'image_restored', count: 119 },
  { code: 'question_removed', count: 86 },
  { code: 'duplicate_closed', count: 72 },
  { code: 'no_issue_found', count: 64 }
]

const trendData = [
  { metric: 'Others', current: 43.5, target: 5 },
  { metric: 'Blank Text', current: 30.4, target: 3 },
  { metric: 'Duplicates', current: 13.6, target: 3 },
  { metric: 'Need Help', current: 6.2, target: 4 }
]

const newRows = [
  { id: 92306, category: 'Wrong Answer', queue: 'Content QA', age: '42h', sla: 'At risk', code: 'rationale_updated' },
  { id: 33612, category: "Can't See Something", queue: 'Engineering', age: '9h', sla: 'On track', code: 'image_restored' },
  { id: 88764, category: 'Need Help', queue: 'Educator', age: '66h', sla: 'At risk', code: 'no_issue_found' },
  { id: 69212, category: 'Not the Right Question', queue: 'Content QA', age: '51h', sla: 'Breached', code: 'question_removed' },
  { id: 54370, category: 'Wrong Answer', queue: 'Content QA', age: '4h', sla: 'On track', code: 'duplicate_closed' }
]

function NewVersionDashboard() {
  return (
    <>
      <div className="kpi-grid">
        {newKpis.map(kpi => (
          <div className="dash-card" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className={`kpi-value ${kpi.tone === 'danger' ? 'danger' : ''} ${kpi.tone === 'success' ? 'success-value' : ''}`}>
              {kpi.value}
            </div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="new-dashboard-grid">
        <section className="dash-card">
          <h2 className="section-title">Queue Health by Owner</h2>
          <div className="queue-list">
            {queueHealth.map(queue => {
              const breachedPct = Math.round((queue.breached / queue.open) * 100)
              return (
                <div className="queue-row" key={queue.queue}>
                  <div>
                    <strong>{queue.queue}</strong>
                    <span>{queue.open} open | SLA {queue.sla}</span>
                  </div>
                  <div className="queue-meter" aria-label={`${breachedPct}% breached`}>
                    <span style={{ width: `${breachedPct}%` }} />
                  </div>
                  <b>{queue.breached} breached</b>
                </div>
              )
            })}
          </div>
        </section>

        <section className="dash-card">
          <h2 className="section-title">Resolution Code Mix</h2>
          <div className="chart-wrap compact-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionCodes} layout="vertical" margin={{ top: 8, right: 20, left: 48, bottom: 8 }}>
                <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="code" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1A3A5C" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="dash-card full-section">
        <h2 className="section-title">Phase 2 Target Tracker</h2>
        <div className="chart-wrap compact-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="metric" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="current" name="Current" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {trendData.map(row => <Cell key={`${row.metric}-current`} fill={row.current > 20 ? '#EF4444' : '#E07B2A'} />)}
              </Bar>
              <Bar dataKey="target" name="Target" fill="#22C55E" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dash-card full-section">
        <h2 className="section-title">Recently Routed Tickets</h2>
        <p className="card-subtitle">Dummy rows showing the backend fields expected in the next version.</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Question ID</th>
                <th>Category</th>
                <th>Assigned Queue</th>
                <th>Age</th>
                <th>SLA State</th>
                <th>Resolution Code</th>
              </tr>
            </thead>
            <tbody>
              {newRows.map(row => (
                <tr key={row.id}>
                  <td className="qid">#{row.id}</td>
                  <td>{row.category}</td>
                  <td className="team">{row.queue}</td>
                  <td>{row.age}</td>
                  <td><span className={`sla-pill ${row.sla === 'Breached' ? 'breached' : row.sla === 'At risk' ? 'risk' : ''}`}>{row.sla}</span></td>
                  <td><code>{row.code}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
