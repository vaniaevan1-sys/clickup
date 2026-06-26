'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './dashboard.module.css'

interface Assignee {
  username?: string
  email?: string
}

interface Task {
  id: string
  name: string
  status: { status: string; color?: string }
  due_date: string | null
  assignees: Assignee[]
  priority?: { priority: string } | null
}

interface ListData {
  listId: string
  listName: string
  tasks: Task[]
}

interface ApiResponse {
  lists: ListData[]
  updatedAt: string
  error?: string
}

function getStatusStyle(status: string): { label: string; cls: string } {
  const s = status.toLowerCase()
  if (s.includes('complet') || s.includes('done') || s.includes('closed')) return { label: 'Selesai', cls: styles.badgeDone }
  if (s.includes('progress') || s.includes('review') || s.includes('active') || s.includes('in progress')) return { label: 'Dalam proses', cls: styles.badgeProgress }
  if (s.includes('block')) return { label: 'Blocked', cls: styles.badgeBlocked }
  if (s.includes('todo') || s.includes('open') || s.includes('backlog')) return { label: 'Belum mulai', cls: styles.badgePending }
  return { label: status, cls: styles.badgePending }
}

function formatDate(ts: string | null): string {
  if (!ts) return '—'
  const d = new Date(parseInt(ts))
  const now = new Date()
  const isOverdue = d < now
  return isOverdue
    ? `⚠ ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(ts: string | null): boolean {
  if (!ts) return false
  return new Date(parseInt(ts)) < new Date()
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Project'

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/clickup')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setLastRefresh(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  const allTasks = data?.lists.flatMap(l => l.tasks) ?? []
  const done = allTasks.filter(t => {
    const s = t.status.status.toLowerCase()
    return s.includes('complet') || s.includes('done') || s.includes('closed')
  }).length
  const inProgress = allTasks.filter(t => {
    const s = t.status.status.toLowerCase()
    return s.includes('progress') || s.includes('review') || s.includes('active')
  }).length
  const overdue = allTasks.filter(t => isOverdue(t.due_date)).length
  const pct = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark} aria-hidden="true" />
          <div>
            <h1 className={styles.title}>{companyName} — Project Tracker</h1>
            <p className={styles.subtitle}>
              {loading
                ? 'Memuat data...'
                : `Diperbarui ${lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading} aria-label="Refresh data">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          Refresh
        </button>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorBox}>
            <strong>Tidak dapat memuat data:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total tasks</div>
                <div className={styles.statValue}>{allTasks.length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Selesai</div>
                <div className={styles.statValue} style={{ color: 'var(--accent)' }}>{done}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Dalam proses</div>
                <div className={styles.statValue} style={{ color: 'var(--blue)' }}>{inProgress}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Overdue</div>
                <div className={styles.statValue} style={{ color: overdue > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{overdue}</div>
              </div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Progress keseluruhan</span>
                <span className={styles.progressPct}>{pct}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {data?.lists.map((list) => (
              <section key={list.listId} className={styles.listSection}>
                <h2 className={styles.listName}>{list.listName}</h2>

                {list.tasks.length === 0 ? (
                  <p className={styles.empty}>Tidak ada tasks di list ini.</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nama task</th>
                          <th>Status</th>
                          <th>Due date</th>
                          <th>Assignee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.tasks.map((task) => (
                          <tr key={task.id} className={isOverdue(task.due_date) ? styles.rowOverdue : ''}>
                            <td className={styles.taskName}>{task.name}</td>
                            <td>
                              <span className={`${styles.badge} ${getStatusStyle(task.status.status).cls}`}>
                                {getStatusStyle(task.status.status).label}
                              </span>
                            </td>
                            <td className={isOverdue(task.due_date) ? styles.dateOverdue : styles.date}>
                              {formatDate(task.due_date)}
                            </td>
                            <td className={styles.assignee}>
                              {task.assignees.length > 0
                                ? task.assignees.map(a => a.username || a.email || '?').join(', ')
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </>
        )}

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Memuat data dari ClickUp...</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        Data ditarik langsung dari ClickUp · Otomatis refresh setiap 5 menit
      </footer>
    </div>
  )
}
