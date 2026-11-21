import { useEffect, useMemo, useState } from 'react';
import { fetchTickets, fetchUsers } from '../api';
import './TicketList.css';

const VIEWS = [
  { key: 'ALL', label: 'All tickets' },
  { key: 'OPEN', label: 'Open' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'SOLVED', label: 'Solved' },
  { key: 'CLOSED', label: 'Closed' },
];

const STATUS_LABEL = {
  OPEN: 'Open',
  PENDING: 'Pending',
  SOLVED: 'Solved',
  CLOSED: 'Closed',
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [view, setView] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchTickets(), fetchUsers()])
      .then(([ticketData, userData]) => {
        if (cancelled) return;
        setTickets(ticketData);
        setUsersById(Object.fromEntries(userData.map((user) => [user.id, user])));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const countByView = useMemo(
    () =>
      Object.fromEntries(
        VIEWS.map(({ key }) => [
          key,
          key === 'ALL' ? tickets.length : tickets.filter((t) => t.status === key).length,
        ]),
      ),
    [tickets],
  );

  const rows = useMemo(
    () =>
      tickets
        .filter((t) => view === 'ALL' || t.status === view)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [tickets, view],
  );

  const activeView = VIEWS.find((v) => v.key === view);
  const personName = (id) => (id ? usersById[id]?.name ?? 'Unknown' : null);

  return (
    <div className="ticket-layout">
      <aside className="ticket-sidebar">
        <h2>Views</h2>
        <ul>
          {VIEWS.map((v) => (
            <li key={v.key}>
              <button
                type="button"
                className={v.key === view ? 'ticket-view active' : 'ticket-view'}
                onClick={() => setView(v.key)}
              >
                <span>{v.label}</span>
                <span className="ticket-count">{countByView[v.key]}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="ticket-main">
        <header className="ticket-header">
          <h1>{activeView.label}</h1>
          <p>
            {rows.length} {rows.length === 1 ? 'ticket' : 'tickets'}
          </p>
        </header>

        {loading && <p className="ticket-state">Loading tickets…</p>}

        {!loading && error && (
          <p role="alert" className="ticket-state ticket-error">
            Could not load tickets ({error}). Is the backend running on port 8080?
          </p>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="ticket-state">
            <p className="ticket-empty-title">Nothing here</p>
            <p>No tickets match this view right now.</p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Subject</th>
                <th>Requester</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className={`status-badge status-${t.status.toLowerCase()}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td>
                    <span className="ticket-subject">{t.subject}</span>
                    <span className="ticket-id">#{t.id.slice(0, 8)}</span>
                  </td>
                  <td>{personName(t.customer_id)}</td>
                  <td>{personName(t.agent_id) ?? <span className="muted">Unassigned</span>}</td>
                  <td className="muted">{dateFormatter.format(new Date(t.updated_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default TicketList;
