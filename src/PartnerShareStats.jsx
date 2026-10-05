import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { authFetch } from "./session";

const CHANNELS = {
  whatsapp: {
    label: "WhatsApp",
    color: "#22C55E",
    icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  },
  facebook: {
    label: "Facebook",
    color: "#3B82F6",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  x: {
    label: "X",
    color: "#171923",
    icon: <path d="M4 4l16 16M20 4L4 20" />,
  },
  copy: {
    label: "Copy Link",
    color: "#774CFF",
    icon: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  },
};
const CHANNEL_ORDER = ["whatsapp", "facebook", "x", "copy"];
const PAGE_SIZE = 6;
const RING_SIZE = 168;
const RING_STROKE = 14;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

const channelMeta = (key) => CHANNELS[key] || { label: key, color: "#9CA3AF", icon: <circle cx="12" cy="12" r="4" /> };

function ChannelIcon({ channel, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {channelMeta(channel).icon}
    </svg>
  );
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const span = reduce ? 0 : duration;
    const from = fromRef.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now) => {
      const t = span === 0 ? 1 : Math.min(1, (now - started) / span);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function formatPercent(value) {
  return `${Number(value.toFixed(1))}%`;
}

function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fullDate(iso) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function weeklyDelta(current, previous) {
  if (previous === 0 && current === 0) return { dir: "flat", text: "No change" };
  if (previous === 0) return { dir: "up", text: "New activity" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { dir: "flat", text: "No change" };
  return { dir: pct > 0 ? "up" : "down", text: `${Math.abs(pct)}%` };
}

function TrendBars({ trend }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...trend.map((p) => p.shares), 1);
  const last = trend.length - 1;
  const mid = Math.floor(last / 2);
  const point = hover === null ? null : trend[hover];
  const tipClass = hover !== null && hover <= 1 ? " ps-tip-left" : hover !== null && hover >= last - 1 ? " ps-tip-right" : "";

  return (
    <div className="ps-trend" onMouseLeave={() => setHover(null)}>
      <div className="ps-trend-bars" role="img" aria-label={`Shares per day over the last ${trend.length} days`}>
        {trend.map((p, i) => (
          <div
            key={p.date}
            className={"ps-trend-col" + (hover === i ? " active" : "") + (hover !== null && hover !== i ? " dim" : "")}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            aria-label={`${p.label}: ${p.shares} share${p.shares === 1 ? "" : "s"} by ${p.users} user${p.users === 1 ? "" : "s"}`}
          >
            <span
              className={"ps-trend-bar" + (p.shares === 0 ? " zero" : "")}
              style={{ height: p.shares === 0 ? "3px" : `${Math.max(8, (p.shares / max) * 100)}%`, "--i": i }}
            ></span>
          </div>
        ))}
      </div>
      <div className="ps-trend-axis" aria-hidden="true">
        {trend.map((p, i) => (
          <span key={p.date}>{i === 0 || i === mid || i === last ? p.label : ""}</span>
        ))}
      </div>
      {point && (
        <div className={"ps-tooltip" + tipClass} style={{ left: `${((hover + 0.5) / trend.length) * 100}%` }}>
          <div className="ps-tooltip-label">{point.label}</div>
          <div>{point.shares} share{point.shares === 1 ? "" : "s"}</div>
          <div className="ps-tooltip-sub">{point.users} user{point.users === 1 ? "" : "s"}</div>
        </div>
      )}
    </div>
  );
}

function ShareRing({ percent }) {
  const gradientId = useId();
  const animated = useCountUp(percent, 1100);
  const offset = RING_C * (1 - Math.min(animated, 100) / 100);

  return (
    <div className="ps-ring">
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} role="img" aria-label={`${formatPercent(percent)} of users shared`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7BFF" />
            <stop offset="100%" stopColor="#774CFF" />
          </linearGradient>
        </defs>
        <circle className="ps-ring-track" cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} strokeWidth={RING_STROKE} />
        <circle
          className="ps-ring-fill"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          strokeWidth={RING_STROKE}
          stroke={`url(#${gradientId})`}
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          opacity={percent > 0 ? 1 : 0}
        />
      </svg>
      <div className="ps-ring-center">
        <div className="ps-ring-value">{formatPercent(animated)}</div>
        <div className="ps-ring-sub">shared</div>
      </div>
    </div>
  );
}

function UserRow({ user, index, open, onToggle, color }) {
  const initials = `${user.first_name[0] || ""}${user.last_name[0] || ""}`.toUpperCase();
  const detailsId = useId();

  return (
    <li className={"ps-user" + (open ? " open" : "")} style={{ "--i": Math.min(index, 8) }}>
      <button type="button" className="ps-user-main" onClick={onToggle} aria-expanded={open} aria-controls={detailsId}>
        <span className="ps-avatar" style={{ background: color }}>{initials}</span>
        <span className="ps-user-id">
          <span className="ps-user-name">{user.first_name} {user.last_name}</span>
          <span className="ps-user-email">{user.email}</span>
        </span>
        <span className={"arch-pill ps-user-arch arch-" + user.archetype}>{user.archetype}</span>
        <span className="ps-user-channels">
          {user.channels.map((c) => (
            <span key={c} className="ps-chip-icon" style={{ "--c": channelMeta(c).color }} title={channelMeta(c).label}>
              <ChannelIcon channel={c} size={13} />
            </span>
          ))}
        </span>
        <span className="ps-user-count">
          <strong>{user.share_count}</strong>
          <span>{user.share_count === 1 ? "share" : "shares"}</span>
        </span>
        <span className="ps-user-time" title={fullDate(user.last_shared_at)}>{timeAgo(user.last_shared_at)}</span>
        <svg className="ps-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="ps-user-details" id={detailsId} inert={!open}>
        <div className="ps-user-details-inner">
          <div className="ps-detail-meta">
            <div><span>Trust ID</span><code>{user.trust_id}</code></div>
            <div><span>First shared</span>{fullDate(user.first_shared_at)}</div>
            <div><span>Last shared</span>{fullDate(user.last_shared_at)}</div>
          </div>
          <ol className="ps-timeline">
            {user.events.map((e, i) => (
              <li key={`${e.shared_at}-${i}`}>
                <span className="ps-timeline-dot" style={{ background: channelMeta(e.channel).color }}></span>
                <span className="ps-timeline-channel">{channelMeta(e.channel).label}</span>
                <span className="ps-timeline-time">{fullDate(e.shared_at)}</span>
              </li>
            ))}
          </ol>
          {user.share_count > user.events.length && (
            <div className="ps-timeline-more">Showing the latest {user.events.length} of {user.share_count} shares</div>
          )}
        </div>
      </div>
    </li>
  );
}

function Skeleton() {
  return (
    <div className="ps-skeleton" aria-hidden="true">
      <div className="ps-grid">
        <div className="ps-panel ps-shimmer ps-skeleton-panel"></div>
        <div className="ps-panel ps-shimmer ps-skeleton-panel"></div>
        <div className="ps-panel ps-shimmer ps-skeleton-panel"></div>
      </div>
      <div className="ps-panel ps-shimmer ps-skeleton-list"></div>
    </div>
  );
}

export default function PartnerShareStats({ colors, version, onError }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authFetch("/stats/shares")
      .then((res) => res.json())
      .then(
        (json) => { if (!cancelled) { setData(json); setFailed(false); setRefreshing(false); } },
        (err) => { if (!cancelled) { setFailed(true); setRefreshing(false); onError?.(err); } }
      );
    return () => { cancelled = true; };
  }, [version, refreshTick, onError]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRefreshTick((t) => t + 1);
  }, []);

  const sharedUsers = data?.shared_users ?? 0;
  const totalUsers = data?.total_users ?? 0;
  const animatedUsers = useCountUp(sharedUsers, 1000);
  const animatedShares = useCountUp(data?.total_shares ?? 0, 1000);

  const channelStats = useMemo(() => {
    const byKey = Object.fromEntries((data?.channels ?? []).map((c) => [c.channel, c]));
    const keys = [...CHANNEL_ORDER, ...Object.keys(byKey).filter((k) => !CHANNEL_ORDER.includes(k))];
    return keys.map((k) => byKey[k] || { channel: k, shares: 0, users: 0 });
  }, [data]);

  const maxChannelShares = Math.max(...channelStats.map((c) => c.shares), 1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data?.users ?? []).filter((u) => {
      if (channel !== "all" && !u.channels.includes(channel)) return false;
      if (!q) return true;
      return `${u.first_name} ${u.last_name} ${u.email} ${u.trust_id} ${u.archetype}`.toLowerCase().includes(q);
    });
    if (sort === "count") {
      return [...list].sort((a, b) => b.share_count - a.share_count || (a.last_shared_at < b.last_shared_at ? 1 : -1));
    }
    return list;
  }, [data, query, channel, sort]);

  const shown = filtered.slice(0, visible);
  const delta = data ? weeklyDelta(data.shares_last_7d, data.shares_previous_7d) : null;
  const hasUsers = (data?.users.length ?? 0) > 0;
  const colorOf = (name) => colors?.[name] || "#9CA3AF";

  function pickChannel(key) {
    setChannel((current) => (current === key ? "all" : key));
    setVisible(PAGE_SIZE);
    setOpenId(null);
  }

  return (
    <section className="ps-section" aria-labelledby="ps-title">
      <div className="section-header">
        <div>
          <div className="section-title" id="ps-title">Find Your Idea Partner</div>
          <div className="ps-subtitle">Who shared their partner link, and how</div>
        </div>
        <button type="button" className={"view-all-btn ps-refresh" + (refreshing ? " spinning" : "")} onClick={refresh} disabled={refreshing} aria-label="Refresh sharing stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {!data && !failed && <Skeleton />}

      {failed && !data && (
        <div className="chart-card ps-card ps-state">
          Couldn't load the sharing stats.
          <button type="button" className="filter-btn" onClick={refresh}>Retry</button>
        </div>
      )}

      {data && (
        <>
          <div className="ps-grid">
            <div className="chart-card ps-card ps-panel ps-enter" style={{ "--d": "0ms" }}>
              <div className="ps-eyebrow"><span className="ps-step">1</span>Total Users Who Shared</div>
              <div className="ps-kpi-row">
                <div className="ps-kpi-value">{Math.round(animatedUsers).toLocaleString()}</div>
                {delta && (
                  <span className={"ps-delta ps-delta-" + delta.dir} title="Shares in the last 7 days vs the 7 days before">
                    {delta.dir === "up" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>}
                    {delta.dir === "down" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>}
                    {delta.text}
                  </span>
                )}
              </div>
              <div className="ps-kpi-sub">
                {sharedUsers === 1 ? "user" : "users"} clicked Share or Copy · {Math.round(animatedShares).toLocaleString()} total click{data.total_shares === 1 ? "" : "s"}
              </div>
              <div className="ps-trend-head">
                <span>Share activity · last {data.trend.length} days</span>
                <span>{data.shares_last_7d} this week</span>
              </div>
              <TrendBars trend={data.trend} />
            </div>

            <div className="chart-card ps-card ps-panel ps-enter ps-link" style={{ "--d": "90ms" }}>
              <div className="ps-eyebrow"><span className="ps-step">2</span>Sharing Percentage</div>
              <div className="ps-ring-wrap">
                <ShareRing percent={data.percent} />
              </div>
              <div className="ps-ring-caption">
                <strong>{formatPercent(data.percent)}</strong> of users shared
              </div>
              <div className="ps-ring-foot">
                {sharedUsers.toLocaleString()} of {totalUsers.toLocaleString()} user{totalUsers === 1 ? "" : "s"}
              </div>
            </div>

            <div className="chart-card ps-card ps-panel ps-enter" style={{ "--d": "180ms" }}>
              <div className="ps-eyebrow">Where they share</div>
              <ul className="ps-channels">
                {channelStats.map((c) => {
                  const meta = channelMeta(c.channel);
                  const active = channel === c.channel;
                  return (
                    <li key={c.channel}>
                      <button
                        type="button"
                        className={"ps-channel" + (active ? " active" : "") + (c.shares === 0 ? " empty" : "")}
                        style={{ "--c": meta.color }}
                        onClick={() => pickChannel(c.channel)}
                        aria-pressed={active}
                        title={active ? "Show all users" : `Show users who used ${meta.label}`}
                      >
                        <span className="ps-chip-icon"><ChannelIcon channel={c.channel} size={14} /></span>
                        <span className="ps-channel-body">
                          <span className="ps-channel-top">
                            <span className="ps-channel-name">{meta.label}</span>
                            <span className="ps-channel-num">{c.shares.toLocaleString()}</span>
                          </span>
                          <span className="ps-channel-bar"><span style={{ width: `${(c.shares / maxChannelShares) * 100}%` }}></span></span>
                          <span className="ps-channel-sub">{c.users.toLocaleString()} user{c.users === 1 ? "" : "s"}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="chart-card ps-card ps-list-card ps-enter" style={{ "--d": "270ms" }}>
            <div className="ps-list-head">
              <div>
                <div className="ps-eyebrow"><span className="ps-step">3</span>Users Who Shared</div>
                <div className="ps-list-count">
                  {filtered.length === data.users.length
                    ? `${data.users.length.toLocaleString()} user${data.users.length === 1 ? "" : "s"}`
                    : `${filtered.length.toLocaleString()} of ${data.users.length.toLocaleString()} users`}
                </div>
              </div>
              {hasUsers && (
                <div className="ps-controls">
                  <div className="ps-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                      type="search"
                      aria-label="Search users who shared"
                      placeholder="Search name, email, Trust ID…"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
                    />
                  </div>
                  <div className="growth-range-toggle" role="group" aria-label="Sort users">
                    <button type="button" className={"growth-range-btn" + (sort === "recent" ? " active" : "")} onClick={() => setSort("recent")}>Latest</button>
                    <button type="button" className={"growth-range-btn" + (sort === "count" ? " active" : "")} onClick={() => setSort("count")}>Most shares</button>
                  </div>
                </div>
              )}
            </div>

            {hasUsers && (
              <div className="ps-filter-row" role="group" aria-label="Filter by sharing method">
                <button type="button" className={"ps-filter" + (channel === "all" ? " active" : "")} onClick={() => { setChannel("all"); setVisible(PAGE_SIZE); }}>
                  All<span>{data.users.length}</span>
                </button>
                {channelStats.filter((c) => c.users > 0 || c.channel === channel).map((c) => (
                  <button
                    key={c.channel}
                    type="button"
                    className={"ps-filter" + (channel === c.channel ? " active" : "")}
                    style={{ "--c": channelMeta(c.channel).color }}
                    onClick={() => pickChannel(c.channel)}
                  >
                    <span className="ps-filter-dot"></span>
                    {channelMeta(c.channel).label}<span>{c.users}</span>
                  </button>
                ))}
              </div>
            )}

            {!hasUsers && (
              <div className="ps-empty">
                <div className="ps-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                </div>
                <div className="ps-empty-title">No shares yet</div>
                <div>Users appear here the moment they tap Share or Copy on their Idea Partner result.</div>
              </div>
            )}

            {hasUsers && filtered.length === 0 && (
              <div className="ps-empty">
                <div className="ps-empty-title">No users match</div>
                <button type="button" className="filter-btn" onClick={() => { setQuery(""); setChannel("all"); }}>Clear filters</button>
              </div>
            )}

            {shown.length > 0 && (
              <ul className="ps-users">
                {shown.map((u, i) => (
                  <UserRow
                    key={`${u.id}-${channel}-${sort}`}
                    user={u}
                    index={i}
                    color={colorOf(u.archetype)}
                    open={openId === u.id}
                    onToggle={() => setOpenId((cur) => (cur === u.id ? null : u.id))}
                  />
                ))}
              </ul>
            )}

            {filtered.length > PAGE_SIZE && (
              <div className="ps-more">
                {visible < filtered.length && (
                  <button type="button" className="filter-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Show {Math.min(PAGE_SIZE, filtered.length - visible)} more · {filtered.length - visible} remaining
                  </button>
                )}
                {visible > PAGE_SIZE && (
                  <button type="button" className="filter-btn" onClick={() => { setVisible(PAGE_SIZE); setOpenId(null); }}>Show less</button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
