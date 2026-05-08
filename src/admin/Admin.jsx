// src/admin/Admin.jsx
import { useState, useEffect, useMemo } from "react";
import { useI18n } from "../lib/i18n";
import {
  useLocalStorage, useAuth, ADMIN_CREDENTIALS, useToasts, toast,
  downloadCSV, fileToBase64, DEFAULT_SOLAR, DEFAULT_SETTINGS
} from "../lib/store";

const ICONS = { dashboard:"📊", quotes:"📩", transforms:"🛁", products:"🏷️", blog:"✍️", projects:"🏗️", solar:"☀️", testimonials:"⭐", consultations:"📅", settings:"⚙️" };

export default function Admin({ navigate, dark, setDark }) {
  const { t, lang, setLang } = useI18n();
  const [user, setUser] = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [sbOpen, setSbOpen] = useState(false);
  const toasts = useToasts();

  if (!user) return <Login t={t} setUser={setUser} navigate={navigate} />;

  const tabs = [
    ["dashboard", t.admin.dashboard],
    ["quotes", t.admin.quotes],
    ["transforms", t.admin.transforms],
    ["products", t.admin.products],
    ["blog", t.admin.blog],
    ["projects", t.admin.projects],
    ["solar", t.admin.solar],
    ["testimonials", t.admin.testimonials],
    ["consultations", t.admin.consultations],
    ["settings", t.admin.settings],
  ];

  return (
    <div className="admin-shell">
      <div className={`mobile-menu-backdrop ${sbOpen ? "open" : ""}`} onClick={() => setSbOpen(false)} />
      <aside className={`admin-sidebar ${sbOpen ? "open" : ""}`}>
        <div className="admin-sb-top">
          <div style={{fontFamily:"var(--fd)",fontSize:"22px",fontWeight:600}}>Dervishi <span style={{color:"var(--gold)"}}>Group</span></div>
          <div style={{fontSize:"11px",letterSpacing:"2px",color:"var(--mgray)",marginTop:"4px",textTransform:"uppercase"}}>Admin</div>
        </div>
        <nav className="admin-sb-nav">
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => { setTab(k); setSbOpen(false); }}>
              <span>{ICONS[k]}</span>{label}
            </button>
          ))}
        </nav>
        <div className="admin-sb-bottom">
          <div className="admin-user">
            <div className="admin-user-avatar">{user.email[0].toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="admin-user-mail">{user.email}</div>
              <span className="admin-role-badge">{t.admin.role}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button className="theme-toggle" onClick={() => setDark(!dark)} title="Theme">{dark ? "☀️" : "🌙"}</button>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)} style={{flex:1}}>
              <option value="sq">SQ</option><option value="en">EN</option><option value="it">IT</option>
              <option value="de">DE</option><option value="el">EL</option><option value="tr">TR</option><option value="fr">FR</option>
            </select>
          </div>
          <button className="btn-secondary" style={{width:"100%"}} onClick={() => navigate("/")}>← {t.admin.back}</button>
          <button className="btn-secondary" style={{width:"100%",marginTop:8,color:"#dc2626"}} onClick={() => setUser(null)}>{t.admin.logout}</button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="hamburger admin-mobile-toggle" onClick={() => setSbOpen(true)}><span/><span/><span/></button>
          <h1>{tabs.find(x => x[0] === tab)[1]}</h1>
          <div className="admin-topbar-right">{new Date().toLocaleDateString()}</div>
        </div>
        {tab === "dashboard" && <Dashboard t={t} />}
        {tab === "quotes" && <Quotes t={t} />}
        {tab === "transforms" && <Transforms t={t} />}
        {tab === "products" && <Products t={t} />}
        {tab === "blog" && <Blog t={t} />}
        {tab === "projects" && <Projects t={t} />}
        {tab === "solar" && <SolarConfig t={t} />}
        {tab === "testimonials" && <Testimonials t={t} />}
        {tab === "consultations" && <Consultations t={t} />}
        {tab === "settings" && <Settings t={t} />}
      </main>
      <div className="toast-stack">
        {toasts.map(x => <div key={x.id} className={`toast ${x.type}`}>{x.msg}</div>)}
      </div>
    </div>
  );
}

// ===== LOGIN =====
function Login({ t, setUser, navigate }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const submit = () => {
    if (form.email === ADMIN_CREDENTIALS.email && form.password === ADMIN_CREDENTIALS.password) {
      setUser({ email: form.email, role: "admin" });
    } else setErr(t.admin.err);
  };
  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <h2>{t.admin.loginTitle}</h2>
        <div className="fg">
          <label>{t.admin.email}</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
        </div>
        <div className="fg">
          <label>{t.admin.password}</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {err && <div className="admin-err">{err}</div>}
        <button className="btn-admin" style={{width:"100%",justifyContent:"center"}} onClick={submit}>{t.admin.login}</button>
        <button className="btn-secondary" style={{width:"100%",marginTop:10}} onClick={() => navigate("/")}>{t.admin.back}</button>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function Dashboard({ t }) {
  const get = (k) => { try { return JSON.parse(localStorage.getItem(k) || "[]").length; } catch { return 0; } };
  const cards = [
    { icon:"📩", n:get("dg_quotes"), l:t.admin.quotes },
    { icon:"🛁", n:get("dg_transforms"), l:t.admin.transforms },
    { icon:"🏷️", n:get("dg_products"), l:t.admin.products },
    { icon:"✍️", n:get("dg_blogs"), l:t.admin.blog },
    { icon:"🏗️", n:get("dg_projects"), l:t.admin.projects },
    { icon:"⭐", n:get("dg_testimonials"), l:t.admin.testimonials },
    { icon:"📅", n:get("dg_consultations"), l:t.admin.consultations },
    { icon:"☀️", n:localStorage.getItem("dg_solar_config") ? "✓" : "•", l:t.admin.solar },
  ];
  return <div className="admin-stats">{cards.map((c, i) => (
    <div className="admin-stat-card" key={i}>
      <div className="admin-stat-icon">{c.icon}</div>
      <div className="admin-stat-num">{c.n}</div>
      <div className="admin-stat-lbl">{c.l}</div>
    </div>
  ))}</div>;
}

// ===== Confirm modal hook =====
function useConfirm() {
  const [pending, setPending] = useState(null);
  const ask = (msg, fn) => setPending({ msg, fn });
  const Modal = ({ t }) => pending && (
    <div className="modal-backdrop" onClick={() => setPending(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>{t.admin.confirm}</h3>
        <p>{pending.msg}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setPending(null)}>{t.admin.cancel}</button>
          <button className="btn-danger" onClick={() => { pending.fn(); setPending(null); }}>{t.admin.delete}</button>
        </div>
      </div>
    </div>
  );
  return { ask, Modal };
}

// ===== QUOTES =====
function Quotes({ t }) {
  const [items, setItems] = useLocalStorage("dg_quotes", []);
  const [search, setSearch] = useState("");
  const { ask, Modal } = useConfirm();
  const filtered = useMemo(() =>
    items.filter(x => !search || `${x.name} ${x.phone} ${x.email}`.toLowerCase().includes(search.toLowerCase()))
         .sort((a, b) => (b.date || 0) > (a.date || 0) ? 1 : -1),
    [items, search]);
  const setStatus = (id, status) => { setItems(items.map(x => x.id === id ? { ...x, status } : x)); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  return (
    <div className="admin-table-wrap">
      <Modal t={t} />
      <div className="admin-table-controls">
        <input placeholder={t.admin.search} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-admin" onClick={() => downloadCSV("quotes.csv", filtered)}>{t.admin.export}</button>
      </div>
      {filtered.length === 0 ? <div className="admin-empty"><div className="icon">📭</div>{t.admin.empty}</div> : (
        <div style={{overflowX:"auto"}}><table className="admin-table">
          <thead><tr><th>{t.admin.date}</th><th>{t.admin.name}</th><th>Email</th><th>{t.admin.phone}</th><th>{t.admin.message}</th><th>{t.admin.status}</th><th></th></tr></thead>
          <tbody>{filtered.map(x => (
            <tr key={x.id}>
              <td>{new Date(x.date).toLocaleDateString()}</td>
              <td>{x.name}</td><td>{x.email}</td><td>{x.phone}</td>
              <td style={{maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.message}</td>
              <td><select className="admin-status-select" value={x.status || "new"} onChange={e => setStatus(x.id, e.target.value)}>
                <option value="new">{t.admin.statusNew}</option>
                <option value="progress">{t.admin.statusProgress}</option>
                <option value="done">{t.admin.statusDone}</option>
              </select></td>
              <td><button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ===== TRANSFORMS =====
function Transforms({ t }) {
  const [items, setItems] = useLocalStorage("dg_transforms", []);
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const { ask, Modal } = useConfirm();
  const setStatus = (id, status) => { setItems(items.map(x => x.id === id ? { ...x, status } : x)); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  const sorted = [...items].sort((a, b) => (b.date || 0) > (a.date || 0) ? 1 : -1);
  return (
    <div className="admin-table-wrap">
      <Modal t={t} />
      {lightbox && <div className="modal-backdrop" onClick={() => setLightbox(null)}><img src={lightbox} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:"12px"}} /></div>}
      {sorted.length === 0 ? <div className="admin-empty"><div className="icon">🛁</div>{t.admin.empty}</div> : (
        <div style={{overflowX:"auto"}}><table className="admin-table">
          <thead><tr><th>{t.admin.date}</th><th>{t.admin.name}</th><th>{t.admin.phone}</th><th>📷</th><th>{t.admin.status}</th><th></th></tr></thead>
          <tbody>{sorted.map(x => (
            <>
              <tr key={x.id} onClick={() => setExpanded(expanded === x.id ? null : x.id)} style={{cursor:"pointer"}}>
                <td>{new Date(x.date).toLocaleDateString()}</td>
                <td>{x.name}</td><td>{x.phone}</td>
                <td>{(x.photos || []).length}</td>
                <td onClick={e => e.stopPropagation()}><select className="admin-status-select" value={x.status || "new"} onChange={e => setStatus(x.id, e.target.value)}>
                  <option value="new">{t.admin.statusNew}</option>
                  <option value="progress">{t.admin.statusProgress}</option>
                  <option value="sent">{t.admin.statusSent}</option>
                  <option value="done">{t.admin.statusDone}</option>
                </select></td>
                <td onClick={e => e.stopPropagation()}><button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button></td>
              </tr>
              {expanded === x.id && (
                <tr key={x.id + "-x"}><td colSpan={6} style={{background:"var(--bg)",padding:"20px"}}>
                  <p style={{marginBottom:12}}><strong>{x.email}</strong></p>
                  <p style={{marginBottom:14}}>{x.vision}</p>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {(x.photos || []).map((p, i) => (
                      <img key={i} src={p} onClick={() => setLightbox(p)} alt="" style={{width:120,height:120,objectFit:"cover",borderRadius:10,cursor:"pointer"}} />
                    ))}
                  </div>
                </td></tr>
              )}
            </>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ===== Generic CRUD form helper =====
function CrudForm({ t, fields, value, onSave, onCancel }) {
  const [data, setData] = useState(value || {});
  const handleFile = async (k, file) => { if (file) setData({ ...data, [k]: await fileToBase64(file) }); };
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card modal-card-lg" onClick={e => e.stopPropagation()}>
        <h3>{value?.id ? t.admin.edit : t.admin.add}</h3>
        <div className="admin-form-grid">
          {fields.map(f => (
            <div className="fg" key={f.k}>
              <label>{f.label}{f.required && " *"}</label>
              {f.type === "textarea" && <textarea value={data[f.k] || ""} onChange={e => setData({...data, [f.k]:e.target.value})} rows={4} />}
              {f.type === "select" && <select value={data[f.k] || ""} onChange={e => setData({...data, [f.k]:e.target.value})}>
                <option value="">—</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>}
              {f.type === "image" && <>
                <input type="file" accept="image/*" onChange={e => handleFile(f.k, e.target.files[0])} />
                {data[f.k] && <img src={data[f.k]} style={{maxWidth:160,marginTop:8,borderRadius:8}} alt="" />}
              </>}
              {f.type === "checkbox" && <label style={{display:"flex",alignItems:"center",gap:8,textTransform:"none",letterSpacing:0}}>
                <input type="checkbox" checked={!!data[f.k]} onChange={e => setData({...data, [f.k]:e.target.checked})} style={{width:"auto",minHeight:0}} /> {f.label}
              </label>}
              {(!f.type || f.type === "text" || f.type === "number" || f.type === "date") && <input type={f.type || "text"} value={data[f.k] || ""} onChange={e => setData({...data, [f.k]:e.target.value})} />}
            </div>
          ))}
        </div>
        <div className="modal-actions" style={{marginTop:20}}>
          <button className="btn-secondary" onClick={onCancel}>{t.admin.cancel}</button>
          <button className="btn-admin" onClick={() => {
            for (const f of fields) if (f.required && !data[f.k]) { toast("Missing: " + f.label, "error"); return; }
            onSave({ id: data.id || Date.now(), ...data, _updated: new Date().toISOString() });
          }}>{t.admin.save}</button>
        </div>
      </div>
    </div>
  );
}

// ===== PRODUCTS =====
function Products({ t }) {
  const [items, setItems] = useLocalStorage("dg_products", []);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const { ask, Modal } = useConfirm();
  const cats = ["Pllaka","Hidrosanitare","Mobilje Banje","Ndriçim","Kuzhinë","Aksesore"];
  const rooms = ["Banjë","Kuzhinë","Dhomë ndenjeje"];
  const fields = [
    { k:"name", label:t.admin.name, required:true },
    { k:"category", label:t.admin.category, type:"select", options:cats, required:true },
    { k:"room", label:"Room", type:"select", options:rooms },
    { k:"brand", label:t.admin.brand },
    { k:"description", label:t.admin.description, type:"textarea" },
    { k:"image", label:t.admin.image, type:"image" },
    { k:"featured", label:t.admin.featured, type:"checkbox" },
  ];
  const filtered = items.filter(x =>
    (!search || x.name?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || x.category === filterCat));
  const save = (data) => {
    setItems(editing?.id ? items.map(x => x.id === data.id ? data : x) : [...items, data]);
    setEditing(null); toast(t.admin.saved);
  };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  return (
    <>
      <Modal t={t} />
      {editing && <CrudForm t={t} fields={fields} value={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="admin-table-wrap" style={{marginBottom:16}}>
        <div className="admin-table-controls">
          <input placeholder={t.admin.search} value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}><option value="">{t.admin.category}</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button className="btn-admin" onClick={() => setEditing({})}>+ {t.admin.add}</button>
        </div>
      </div>
      {filtered.length === 0 ? <div className="admin-empty"><div className="icon">🏷️</div>{t.admin.empty}</div> : (
        <div className="admin-grid-cards">{filtered.map(x => (
          <div className="admin-card-item" key={x.id}>
            {x.image && <img className="admin-card-img" src={x.image} alt="" />}
            <div className="admin-card-body">
              <h4 style={{marginBottom:4}}>{x.name}</h4>
              <p style={{fontSize:12,color:"var(--mgray)",marginBottom:4}}>{x.category} · {x.brand}</p>
              {x.featured && <span className="admin-badge published">★ {t.admin.featured}</span>}
              <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
                <button className="btn-icon" onClick={() => setEditing(x)}>✏️</button>
                <button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </>
  );
}

// ===== BLOG =====
function Blog({ t }) {
  const [items, setItems] = useLocalStorage("dg_blogs", []);
  const [editing, setEditing] = useState(null);
  const { ask, Modal } = useConfirm();
  const cats = ["Rinovime","Trende","Produkte","Solar","Këshilla"];
  const fields = [
    { k:"title", label:t.admin.title, required:true },
    { k:"category", label:t.admin.category, type:"select", options:cats },
    { k:"image", label:t.admin.image, type:"image" },
    { k:"excerpt", label:"Excerpt", type:"textarea" },
    { k:"content", label:t.admin.description, type:"textarea" },
    { k:"published", label:t.admin.published, type:"checkbox" },
    { k:"date", label:t.admin.date, type:"date" },
  ];
  const save = (d) => { setItems(editing?.id ? items.map(x => x.id === d.id ? d : x) : [...items, d]); setEditing(null); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  return (
    <>
      <Modal t={t} />
      {editing && <CrudForm t={t} fields={fields} value={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="admin-table-wrap" style={{marginBottom:16}}><div className="admin-table-controls">
        <button className="btn-admin" onClick={() => setEditing({})}>+ {t.admin.add}</button>
      </div></div>
      {items.length === 0 ? <div className="admin-empty"><div className="icon">✍️</div>{t.admin.empty}</div> : (
        <div className="admin-grid-cards">{items.map(x => (
          <div className="admin-card-item" key={x.id}>
            {x.image && <img className="admin-card-img" src={x.image} alt="" />}
            <div className="admin-card-body">
              <span className={`admin-badge ${x.published ? "published" : "draft"}`}>{x.published ? t.admin.published : t.admin.draft}</span>
              <h4 style={{margin:"8px 0 4px"}}>{x.title}</h4>
              <p style={{fontSize:12,color:"var(--mgray)"}}>{x.category} · {x.date}</p>
              <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
                <button className="btn-icon" onClick={() => setEditing(x)}>✏️</button>
                <button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </>
  );
}

// ===== PROJECTS =====
function Projects({ t }) {
  const [items, setItems] = useLocalStorage("dg_projects", []);
  const [editing, setEditing] = useState(null);
  const { ask, Modal } = useConfirm();
  const cats = ["Banjë","Kuzhinë","Komerciale","Rezidenciale"];
  const fields = [
    { k:"title", label:t.admin.title, required:true },
    { k:"description", label:t.admin.description, type:"textarea" },
    { k:"category", label:t.admin.category, type:"select", options:cats },
    { k:"location", label:t.admin.location },
    { k:"duration", label:t.admin.duration },
    { k:"before", label:t.admin.before, type:"image" },
    { k:"after", label:t.admin.after, type:"image" },
  ];
  const save = (d) => { setItems(editing?.id ? items.map(x => x.id === d.id ? d : x) : [...items, d]); setEditing(null); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  return (
    <>
      <Modal t={t} />
      {editing && <CrudForm t={t} fields={fields} value={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="admin-table-wrap" style={{marginBottom:16}}><div className="admin-table-controls">
        <button className="btn-admin" onClick={() => setEditing({})}>+ {t.admin.add}</button>
      </div></div>
      {items.length === 0 ? <div className="admin-empty"><div className="icon">🏗️</div>{t.admin.empty}</div> : (
        <div className="admin-grid-cards">{items.map(x => (
          <div className="admin-card-item" key={x.id}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
              {x.before && <img src={x.before} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover"}} />}
              {x.after && <img src={x.after} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover"}} />}
            </div>
            <div className="admin-card-body">
              <h4>{x.title}</h4>
              <p style={{fontSize:12,color:"var(--mgray)"}}>{x.category} · {x.location} · {x.duration}</p>
              <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
                <button className="btn-icon" onClick={() => setEditing(x)}>✏️</button>
                <button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button>
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </>
  );
}

// ===== SOLAR CONFIG =====
function SolarConfig({ t }) {
  const [cfg, setCfg] = useLocalStorage("dg_solar_config", DEFAULT_SOLAR);
  const [draft, setDraft] = useState(cfg);
  return (
    <div className="admin-table-wrap" style={{padding:24}}>
      <div className="admin-form-grid" style={{maxWidth:520}}>
        {Object.keys(DEFAULT_SOLAR).map(k => (
          <div className="fg" key={k}>
            <label>{k}</label>
            <input type="number" step="0.0001" value={draft[k]} onChange={e => setDraft({...draft, [k]: parseFloat(e.target.value) || 0})} />
          </div>
        ))}
        <p style={{fontSize:12,color:"var(--mgray)"}}>{t.admin.lastUpdated}: {cfg._updated || "—"}</p>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-admin" onClick={() => { const n = {...draft, _updated: new Date().toISOString()}; setCfg(n); setDraft(n); toast(t.admin.saved); }}>{t.admin.save}</button>
          <button className="btn-secondary" onClick={() => { setDraft(DEFAULT_SOLAR); setCfg(DEFAULT_SOLAR); toast(t.admin.saved); }}>{t.admin.reset}</button>
        </div>
      </div>
    </div>
  );
}

// ===== TESTIMONIALS =====
function Testimonials({ t }) {
  const [items, setItems] = useLocalStorage("dg_testimonials", []);
  const [editing, setEditing] = useState(null);
  const { ask, Modal } = useConfirm();
  const fields = [
    { k:"name", label:t.admin.name, required:true },
    { k:"location", label:t.admin.location },
    { k:"rating", label:t.admin.stars, type:"number" },
    { k:"text", label:t.admin.review, type:"textarea", required:true },
    { k:"date", label:t.admin.date, type:"date" },
  ];
  const save = (d) => { setItems(editing?.id ? items.map(x => x.id === d.id ? d : x) : [...items, d]); setEditing(null); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  return (
    <>
      <Modal t={t} />
      {editing && <CrudForm t={t} fields={fields} value={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="admin-table-wrap" style={{marginBottom:16}}><div className="admin-table-controls">
        <button className="btn-admin" onClick={() => setEditing({})}>+ {t.admin.add}</button>
      </div></div>
      {items.length === 0 ? <div className="admin-empty"><div className="icon">⭐</div>{t.admin.empty}</div> : (
        <div className="admin-grid-cards">{items.map(x => (
          <div className="admin-card-item" key={x.id}><div className="admin-card-body">
            <div style={{color:"var(--gold)",marginBottom:6}}>{"★".repeat(parseInt(x.rating) || 5)}</div>
            <p style={{marginBottom:10,fontStyle:"italic"}}>"{x.text}"</p>
            <p style={{fontSize:12,color:"var(--mgray)"}}>— {x.name}, {x.location}</p>
            <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
              <button className="btn-icon" onClick={() => setEditing(x)}>✏️</button>
              <button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button>
            </div>
          </div></div>
        ))}</div>
      )}
    </>
  );
}

// ===== CONSULTATIONS =====
function Consultations({ t }) {
  const [items, setItems] = useLocalStorage("dg_consultations", []);
  const { ask, Modal } = useConfirm();
  const setStatus = (id, status) => { setItems(items.map(x => x.id === id ? { ...x, status } : x)); toast(t.admin.saved); };
  const del = (id) => ask(t.admin.confirmDelete, () => { setItems(items.filter(x => x.id !== id)); toast(t.admin.deleted); });
  const sorted = [...items].sort((a, b) => (b.date || 0) > (a.date || 0) ? 1 : -1);
  return (
    <div className="admin-table-wrap"><Modal t={t} />
      {sorted.length === 0 ? <div className="admin-empty"><div className="icon">📅</div>{t.admin.empty}</div> : (
        <div style={{overflowX:"auto"}}><table className="admin-table">
          <thead><tr><th>{t.admin.date}</th><th>{t.admin.name}</th><th>{t.admin.phone}</th><th>Pref. Date</th><th>{t.admin.message}</th><th>{t.admin.status}</th><th></th></tr></thead>
          <tbody>{sorted.map(x => (
            <tr key={x.id}>
              <td>{new Date(x.date).toLocaleDateString()}</td>
              <td>{x.name}</td><td>{x.phone}</td><td>{x.preferredDate}</td>
              <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{x.message}</td>
              <td><select className="admin-status-select" value={x.status || "new"} onChange={e => setStatus(x.id, e.target.value)}>
                <option value="new">{t.admin.statusNew}</option>
                <option value="confirmed">{t.admin.statusConfirmed}</option>
                <option value="done">{t.admin.statusDone}</option>
                <option value="cancelled">{t.admin.statusCancelled}</option>
              </select></td>
              <td><button className="btn-icon danger" onClick={() => del(x.id)}>🗑</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ===== SETTINGS =====
function Settings({ t }) {
  const [s, setS] = useLocalStorage("dg_settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState(s);
  return (
    <div className="admin-table-wrap" style={{padding:24}}>
      <div className="admin-form-grid" style={{maxWidth:560}}>
        {Object.keys(DEFAULT_SETTINGS).map(k => (
          <div className="fg" key={k}>
            <label>{k}</label>
            <input value={draft[k] || ""} onChange={e => setDraft({...draft, [k]:e.target.value})} />
          </div>
        ))}
        <button className="btn-admin" style={{justifySelf:"start"}} onClick={() => { setS(draft); toast(t.admin.saved); }}>{t.admin.save}</button>
      </div>
    </div>
  );
}