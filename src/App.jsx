import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ClipboardList,
  CalendarClock,
  MessageSquareWarning,
  CalendarDays,
  History,
  LogOut,
  Lock,
  User,
  BellRing,
  BedDouble,
  Sparkles,
  Users,
  CloudRain,
  Utensils,
  ArrowRightCircle,
  Search,
  CheckCheck,
  Crown,
} from 'lucide-react';

const SUPABASE_URL = 'https://wqdxdhfdeudagfbveium.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qo2SlzVJQriNXIdXrLR7GQ_N7gT_Lg1';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const OUTLETS = ['Todo F&B', 'Thalassa', 'Lobby Bar', 'Alborán', 'Pool-Side', 'Chill-Out', 'Salones'];
const SALONS = ['Salón Atlántico', 'Salón Mediterráneo', 'Salón Costa del Sol', 'Terraza Eventos', 'Privado Thalassa'];
const ROLES = ['Todos', 'Maître', '2º Maître', 'Jefe de Sector'];
const SHIFT_PHASES = [
  { id: 'all', label: 'Todo el turno' },
  { id: 'apertura', label: 'Apertura' },
  { id: 'servicio', label: 'Servicio' },
  { id: 'cierre', label: 'Cierre' },
];
const SETUP_STATUSES = ['Pendiente', 'En montaje', 'Listo', 'En servicio', 'Recogido'];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function App() {
  const [session, setSession] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [selectedOutlet, setSelectedOutlet] = useState('Thalassa');
  const [activeTab, setActiveTab] = useState('relevo');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenFilter, setOnlyOpenFilter] = useState(false);
  const [weatherPlanB, setWeatherPlanB] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [banquetEvents, setBanquetEvents] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [handoverType, setHandoverType] = useState('relevo');
  const [handoverPriority, setHandoverPriority] = useState('normal');
  const [handoverTitle, setHandoverTitle] = useState('');
  const [handoverDetails, setHandoverDetails] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [taskPhase, setTaskPhase] = useState('apertura');
  const [taskRole, setTaskRole] = useState('Todos');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [recordType, setRecordType] = useState('queja');
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [managerResponse, setManagerResponse] = useState('');

  const [banquetDate, setBanquetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [salonName, setSalonName] = useState(SALONS[0]);
  const [banquetName, setBanquetName] = useState('');
  const [startTime, setStartTime] = useState('13:30');
  const [paxCount, setPaxCount] = useState('40');
  const [setupType, setSetupType] = useState('Banquete');
  const [allergensNotes, setAllergensNotes] = useState('');
  const [extrasNotes, setExtrasNotes] = useState('');
  const [lastMinuteChange, setLastMinuteChange] = useState(false);

  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDetails, setEventDetails] = useState('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isFirstOfMonth = today.getDate() === 1;
  const dayOfWeek = today.getDay();
  const isOrderDay = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user);
      else setProfileName('');
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (data?.full_name) {
      setProfileName(data.full_name);
    } else {
      const raw = user.email.split('@')[0];
      const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
      await supabase.from('profiles').upsert({ id: user.id, full_name: formatted });
      setProfileName(formatted);
    }
  }

  async function loadAllData() {
    const [tasksRes, complaintsRes, eventsRes, banquetsRes, handoversRes, logsRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: true }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
      supabase.from('banquet_events').select('*').order('start_time', { ascending: true }),
      supabase.from('shift_handovers').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(60),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (complaintsRes.data) setComplaints(complaintsRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (banquetsRes.data) setBanquetEvents(banquetsRes.data);
    if (handoversRes.data) setHandovers(handoversRes.data);
    if (logsRes.data) setLogs(logsRes.data);
  }

  useEffect(() => {
    if (!session) return;
    loadAllData();

    const channel = supabase
      .channel('h10-fyb-control-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banquet_events' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_handovers' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, loadAllData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    setSubmittingAuth(true);

    const formattedEmail = email.includes('@')
      ? email.trim()
      : `${email.trim().toLowerCase()}@fb.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password,
    });

    if (error) setAuthError('Usuario o contraseña incorrectos.');
    setSubmittingAuth(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function addLog(action, target) {
    await supabase.from('audit_logs').insert([
      {
        user_name: profileName || session.user.email,
        action,
        target,
      },
    ]);
  }

  const activeOutletForWrite = selectedOutlet === 'Todo F&B' ? 'Thalassa' : selectedOutlet;

  async function handleAddHandover(e) {
    e.preventDefault();
    if (!handoverTitle.trim()) return;
    const actor = profileName || session.user.email;

    const { error } = await supabase.from('shift_handovers').insert([
      {
        outlet: activeOutletForWrite,
        item_type: handoverType,
        priority: handoverPriority,
        title: handoverTitle.trim(),
        details: handoverDetails.trim() || null,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(`Añadió aviso (${handoverType})`, `${handoverTitle.trim()} [${activeOutletForWrite}]`);
      setHandoverTitle('');
      setHandoverDetails('');
    }
  }

  async function toggleHandover(item) {
    const { error } = await supabase
      .from('shift_handovers')
      .update({ resolved: !item.resolved })
      .eq('id', item.id);
    if (!error) {
      await addLog(item.resolved ? 'Reabrió aviso' : 'Cerró aviso', `${item.title} [${item.outlet}]`);
    }
  }

  async function deleteHandover(item) {
    const { error } = await supabase.from('shift_handovers').delete().eq('id', item.id);
    if (!error) {
      await addLog('Eliminó aviso', `${item.title} [${item.outlet}]`);
    }
  }

  async function handleAddTask(e, section) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    const actor = profileName || session.user.email;
    const { error } = await supabase.from('tasks').insert([
      {
        title,
        outlet: activeOutletForWrite,
        section,
        due_date: selectedDate,
        notes: newTaskNotes.trim() || null,
        priority: taskPriority,
        shift_phase: taskPhase,
        assigned_role: taskRole,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(
        section === 'pending' ? `Añadió pendiente (${selectedDate})` : 'Añadió a checklist',
        `${title} [${activeOutletForWrite}]`
      );
      setNewTaskTitle('');
      setNewTaskNotes('');
    }
  }

  async function toggleTask(task) {
    const actor = profileName || session.user.email;
    const nextCompleted = !task.completed;

    const { error } = await supabase
      .from('tasks')
      .update({
        completed: nextCompleted,
        completed_by: nextCompleted ? actor : null,
        completed_at: nextCompleted ? new Date().toISOString() : null,
      })
      .eq('id', task.id);

    if (!error) {
      await addLog(nextCompleted ? 'Marcó hecho' : 'Reabrió', `${task.title} [${task.outlet}]`);
    }
  }

  async function rollOverTaskToTomorrow(task) {
    const base = new Date(task.due_date || todayStr);
    base.setDate(base.getDate() + 1);
    const nextDate = base.toISOString().split('T')[0];

    const { error } = await supabase
      .from('tasks')
      .update({ due_date: nextDate })
      .eq('id', task.id);

    if (!error) {
      await addLog(`Pasó pendiente al ${nextDate}`, `${task.title} [${task.outlet}]`);
    }
  }

  async function deleteTask(task) {
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (!error) {
      await addLog('Eliminó tarea', `${task.title} [${task.outlet}]`);
    }
  }

  async function handleAddComplaint(e) {
    e.preventDefault();
    if (!roomNumber.trim() || !complaintText.trim() || !managerResponse.trim()) return;

    const actor = profileName || session.user.email;
    const { error } = await supabase.from('complaints').insert([
      {
        outlet: activeOutletForWrite,
        room_number: roomNumber.trim(),
        complaint_text: complaintText.trim(),
        manager_response: managerResponse.trim(),
        record_type: recordType,
        status: 'abierta',
        reported_by: actor,
      },
    ]);

    if (!error) {
      await addLog(`Anotó ${recordType}`, `Hab./Mesa ${roomNumber.trim()} · ${activeOutletForWrite}`);
      setRoomNumber('');
      setComplaintText('');
      setManagerResponse('');
    }
  }

  async function toggleComplaintStatus(c) {
    const nextStatus = c.status === 'cerrada' ? 'abierta' : 'cerrada';
    const { error } = await supabase
      .from('complaints')
      .update({ status: nextStatus })
      .eq('id', c.id);
    if (!error) {
      await addLog(`Marcó ${c.record_type} como ${nextStatus}`, `Hab. ${c.room_number}`);
    }
  }

  async function handleAddBanquetEvent(e) {
    e.preventDefault();
    if (!banquetName.trim()) return;
    const actor = profileName || session.user.email;

    const { error } = await supabase.from('banquet_events').insert([
      {
        event_date: banquetDate,
        salon_name: salonName,
        event_name: banquetName.trim(),
        start_time: startTime,
        pax: Number(paxCount) || 0,
        setup_type: setupType,
        setup_status: 'Pendiente',
        allergens_notes: allergensNotes.trim() || null,
        extras_notes: extrasNotes.trim() || null,
        last_minute_change: lastMinuteChange,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(`Creó evento (${banquetDate})`, `${banquetName.trim()} · ${salonName} (${paxCount} PAX)`);
      setBanquetName('');
      setAllergensNotes('');
      setExtrasNotes('');
      setLastMinuteChange(false);
    }
  }

  async function updateBanquetStatus(ev, newStatus) {
    const { error } = await supabase
      .from('banquet_events')
      .update({ setup_status: newStatus })
      .eq('id', ev.id);
    if (!error) {
      await addLog(`Estado salón: ${newStatus}`, `${ev.event_name} [${ev.salon_name}]`);
    }
  }

  async function deleteBanquetEvent(ev) {
    const { error } = await supabase.from('banquet_events').delete().eq('id', ev.id);
    if (!error) {
      await addLog('Eliminó evento', `${ev.event_name} [${ev.salon_name}]`);
    }
  }

  async function handleAddCalendarEvent(e) {
    e.preventDefault();
    if (!eventTitle.trim() || !calendarDate) return;

    const actor = profileName || session.user.email;
    const { error } = await supabase.from('calendar_events').insert([
      {
        event_date: calendarDate,
        outlet: activeOutletForWrite,
        title: eventTitle.trim(),
        details: eventDetails.trim() || null,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(
        `Añadió en calendario (${calendarDate})`,
        `${eventTitle.trim()} [${activeOutletForWrite}]`
      );
      setEventTitle('');
      setEventDetails('');
    }
  }

  async function deleteCalendarEvent(ev) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', ev.id);
    if (!error) {
      await addLog(`Borró de calendario (${ev.event_date})`, `${ev.title} [${ev.outlet}]`);
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#061124] text-sky-200 flex items-center justify-center text-sm">
        <div className="flex items-center gap-2.5 bg-[#0c1d3d] border border-sky-800/60 px-4 py-3 rounded-2xl shadow-lg">
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>Cargando H10 F&amp;B Control...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#091a38] via-[#061124] to-[#040b18] text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-[#0c1d3d]/95 border border-sky-900/70 rounded-3xl p-6 space-y-5 shadow-2xl shadow-black/60">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center px-3.5 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white font-black text-base tracking-wider shadow-lg shadow-sky-500/25 mb-1">
              H10 · F&amp;B
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">F&amp;B Control</h1>
            <p className="text-xs text-sky-200/70">Operativa de Bares, Restaurantes y Salones</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-sky-400/70 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu usuario"
                  className="w-full bg-[#061124] border border-sky-900/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sky-400/70 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#061124] border border-sky-900/80 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/70 rounded-xl px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-sky-500/25 transition"
            >
              {submittingAuth ? 'Entrando...' : 'Entrar al sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const matchesOutlet = (itemOutlet) =>
    selectedOutlet === 'Todo F&B' || itemOutlet === selectedOutlet;

  const matchesSearch = (text) =>
    !searchQuery.trim() ||
    (text && text.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  const filteredHandovers = handovers.filter(
    (h) =>
      matchesOutlet(h.outlet) &&
      (!onlyOpenFilter || !h.resolved) &&
      matchesSearch(`${h.title} ${h.details || ''} ${h.outlet}`)
  );

  const outletChecklist = tasks.filter(
    (t) =>
      matchesOutlet(t.outlet) &&
      t.section === 'checklist' &&
      (phaseFilter === 'all' || t.shift_phase === phaseFilter) &&
      (!onlyOpenFilter || !t.completed) &&
      matchesSearch(`${t.title} ${t.notes || ''} ${t.outlet}`)
  );

  const completedCount = outletChecklist.filter((t) => t.completed).length;
  const progressPercent =
    outletChecklist.length > 0 ? Math.round((completedCount / outletChecklist.length) * 100) : 0;

  const outletPending = tasks.filter(
    (t) =>
      matchesOutlet(t.outlet) &&
      t.section === 'pending' &&
      t.due_date === selectedDate &&
      (!onlyOpenFilter || !t.completed) &&
      matchesSearch(`${t.title} ${t.notes || ''} ${t.outlet}`)
  );

  const outletComplaints = complaints.filter(
    (c) =>
      matchesOutlet(c.outlet) &&
      (!onlyOpenFilter || c.status !== 'cerrada') &&
      matchesSearch(`${c.room_number} ${c.complaint_text} ${c.manager_response} ${c.outlet}`)
  );

  const banquetsForDate = banquetEvents.filter(
    (b) =>
      b.event_date === banquetDate &&
      matchesSearch(`${b.salon_name} ${b.event_name} ${b.allergens_notes || ''}`)
  );

  const eventsForSelectedDate = events.filter((ev) => ev.event_date === calendarDate);

  const openComplaintsCount = complaints.filter((c) => c.status !== 'cerrada').length;
  const openHandoversCount = handovers.filter((h) => !h.resolved).length;
  const todayBanquetsCount = banquetEvents.filter((b) => b.event_date === todayStr).length;
  const urgentPendingCount = tasks.filter(
    (t) => t.section === 'pending' && !t.completed && t.priority === 'urgente'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#091a38] via-[#061124] to-[#040b18] text-slate-100 pb-16">
      <header className="sticky top-0 z-20 bg-[#081630]/95 backdrop-blur-md border-b border-sky-900/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="px-2.5 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-sky-500/25">
              H10
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                F&amp;B Control
              </h1>
              <p className="text-[11px] text-sky-200/70">
                {DAY_NAMES[dayOfWeek]} {today.toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeatherPlanB(!weatherPlanB)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition ${
                weatherPlanB
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-[#0c1d3d] border-sky-900/70 text-sky-300/80 hover:text-white'
              }`}
              title="Activar aviso Plan B por lluvia/viento en terrazas"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plan B Clima</span>
            </button>

            <span className="text-xs bg-sky-500/15 px-3 py-1.5 rounded-xl border border-sky-400/30 text-sky-200 font-semibold">
              {profileName}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#0c1d3d] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 text-sky-200 border border-sky-900/70 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {(isFirstOfMonth || isOrderDay || weatherPlanB) && (
          <div className="space-y-2">
            {weatherPlanB && (
              <div className="bg-gradient-to-r from-amber-500/25 to-orange-600/15 border border-amber-400/50 rounded-2xl p-3.5 flex items-start gap-3">
                <CloudRain className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-200 uppercase tracking-wide">
                    PLAN B CLIMA ACTIVADO · Terrazas / Pool-Side / Chill-Out
                  </p>
                  <p className="text-amber-100/90 mt-0.5">
                    Revisar traslado de montajes exteriores a salones interiores y recoger cojines/parasoles.
                  </p>
                </div>
              </div>
            )}

            {isFirstOfMonth && (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-300 uppercase tracking-wide">
                    Día 1 de Mes · {selectedOutlet}
                  </p>
                  <p className="text-amber-100/90 mt-0.5">
                    Cambiar <strong>hojas de temperaturas APPCC</strong> y <strong>hojas de traspasos</strong>.
                  </p>
                </div>
              </div>
            )}

            {isOrderDay && (
              <div className="bg-gradient-to-r from-sky-500/20 to-blue-500/10 border border-sky-400/40 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sky-200 uppercase tracking-wide">
                    Hoy es {DAY_NAMES[dayOfWeek]} · Día de Pedidos
                  </p>
                  <p className="text-sky-100/90 mt-0.5">
                    Revisar stock bajo / 86&apos;d y lanzar <strong>pedidos</strong> (Domingo, Martes y Jueves).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {OUTLETS.map((outlet) => {
            const active = selectedOutlet === outlet;
            return (
              <button
                key={outlet}
                onClick={() => setSelectedOutlet(outlet)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                  active
                    ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white border-sky-300 shadow-md shadow-sky-500/25'
                    : 'bg-[#0c1d3d]/90 text-sky-200/80 border-sky-900/70 hover:border-sky-700 hover:text-white'
                }`}
              >
                {outlet}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sky-400/70 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar habitación, salón, cliente, producto..."
              className="w-full bg-[#0c1d3d]/90 border border-sky-900/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-sky-300/40 focus:outline-none focus:border-sky-400"
            />
          </div>
          <button
            onClick={() => setOnlyOpenFilter(!onlyOpenFilter)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
              onlyOpenFilter
                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                : 'bg-[#0c1d3d]/90 border-sky-900/70 text-sky-300/70 hover:text-white'
            }`}
          >
            {onlyOpenFilter ? 'Mostrando solo pendientes' : 'Ver todos (abiertos y hechos)'}
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1 bg-[#0c1d3d]/95 p-1.5 rounded-2xl border border-sky-900/70 shadow-inner">
          <button
            onClick={() => setActiveTab('relevo')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'relevo'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <ArrowRightCircle className="w-4 h-4 text-sky-400" />
            <span>Relevo</span>
          </button>

          <button
            onClick={() => setActiveTab('salones')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'salones'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4 text-cyan-400" />
            <span>Eventos</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'checklist'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <CalendarClock className="w-4 h-4 text-blue-400" />
            <span>Pendientes</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'complaints'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <span>Quejas/VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition ${
              activeTab === 'calendar'
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/40'
                : 'text-sky-300/60 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span>Agenda</span>
          </button>
        </div>

        {activeTab === 'relevo' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#0c1d3d] border border-sky-900/80 rounded-2xl p-3">
                <p className="text-[11px] text-sky-300/70">Avisos relevo activos</p>
                <p className="text-xl font-black text-sky-300 mt-0.5">{openHandoversCount}</p>
              </div>
              <div className="bg-[#0c1d3d] border border-sky-900/80 rounded-2xl p-3">
                <p className="text-[11px] text-sky-300/70">Eventos hoy en salones</p>
                <p className="text-xl font-black text-cyan-300 mt-0.5">{todayBanquetsCount}</p>
              </div>
              <div className="bg-[#0c1d3d] border border-sky-900/80 rounded-2xl p-3">
                <p className="text-[11px] text-sky-300/70">Quejas / VIP abiertos</p>
                <p className="text-xl font-black text-amber-300 mt-0.5">{openComplaintsCount}</p>
              </div>
              <div className="bg-[#0c1d3d] border border-sky-900/80 rounded-2xl p-3">
                <p className="text-[11px] text-sky-300/70">Pendientes urgentes</p>
                <p className="text-xl font-black text-rose-400 mt-0.5">{urgentPendingCount}</p>
              </div>
            </div>

            <form
              onSubmit={handleAddHandover}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Nuevo parte para relevo / día libre ({activeOutletForWrite})
                </h2>
                <div className="flex gap-1.5">
                  <select
                    value={handoverType}
                    onChange={(e) => setHandoverType(e.target.value)}
                    className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-1 text-xs text-sky-100"
                  >
                    <option value="relevo">Parte de relevo</option>
                    <option value="stock_86">Stock bajo / 86&apos;d</option>
                    <option value="depto">Cocina / SAT / Recepción</option>
                    <option value="vip">Aviso VIP / Grupo</option>
                  </select>
                  <select
                    value={handoverPriority}
                    onChange={(e) => setHandoverPriority(e.target.value)}
                    className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-1 text-xs text-sky-100"
                  >
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={handoverTitle}
                onChange={(e) => setHandoverTitle(e.target.value)}
                placeholder="Ej. Sin stock de tónica Schweppes / Lavavajillas bar avisado a SAT..."
                className="w-full bg-[#061124] border border-sky-900/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={handoverDetails}
                  onChange={(e) => setHandoverDetails(e.target.value)}
                  placeholder="Detalle o acción acordada..."
                  className="flex-1 bg-[#061124]/80 border border-sky-900/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-sky-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Publicar
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {filteredHandovers.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-8 text-center text-xs text-sky-300/60">
                  No hay avisos de relevo activos en esta vista.
                </div>
              ) : (
                filteredHandovers.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-[#0c1d3d]/95 border rounded-2xl p-3.5 flex items-start justify-between gap-3 ${
                      item.resolved
                        ? 'border-sky-900/40 opacity-60'
                        : item.priority === 'urgente'
                        ? 'border-rose-500/60'
                        : item.priority === 'importante'
                        ? 'border-amber-400/50'
                        : 'border-sky-900/80'
                    }`}
                  >
                    <button
                      onClick={() => toggleHandover(item)}
                      className="flex items-start gap-3 text-left flex-1"
                    >
                      {item.resolved ? (
                        <CheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-200 border border-sky-400/30">
                            {item.outlet}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {item.item_type === 'stock_86'
                              ? 'Stock / 86'
                              : item.item_type === 'depto'
                              ? 'Interdepartamental'
                              : item.item_type === 'vip'
                              ? 'VIP / Grupo'
                              : 'Relevo'}
                          </span>
                          {item.priority !== 'normal' && (
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                item.priority === 'urgente'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            item.resolved ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.details && <p className="text-xs text-sky-100/75">{item.details}</p>}
                        <p className="text-[11px] text-sky-300/60">
                          Por {item.created_by} ·{' '}
                          {new Date(item.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteHandover(item)}
                      className="text-slate-500 hover:text-rose-400 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'salones' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddBanquetEvent}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Programar Evento / Montaje de Salón
                </h2>
                <input
                  type="date"
                  value={banquetDate}
                  onChange={(e) => setBanquetDate(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {SALONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paxCount}
                    onChange={(e) => setPaxCount(e.target.value)}
                    placeholder="PAX"
                    className="w-24 bg-[#061124] border border-sky-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={setupType}
                    onChange={(e) => setSetupType(e.target.value)}
                    className="flex-1 bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Banquete">Banquete</option>
                    <option value="Escuela">Escuela</option>
                    <option value="Cóctel">Cóctel</option>
                    <option value="Coffee Break">Coffee Break</option>
                    <option value="Imperial">Imperial</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                required
                value={banquetName}
                onChange={(e) => setBanquetName(e.target.value)}
                placeholder="Nombre del grupo, empresa o evento..."
                className="w-full bg-[#061124] border border-sky-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={allergensNotes}
                  onChange={(e) => setAllergensNotes(e.target.value)}
                  placeholder="Alérgenos / dietas especiales (ej. 2 celíacos, 1 vegano)..."
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  value={extrasNotes}
                  onChange={(e) => setExtrasNotes(e.target.value)}
                  placeholder="Material, medios técnicos o extras autorizados..."
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lastMinuteChange}
                    onChange={(e) => setLastMinuteChange(e.target.checked)}
                    className="rounded border-sky-700"
                  />
                  <span>Marcar como cambio de última hora</span>
                </label>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md"
                >
                  Guardar evento
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {banquetsForDate.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-8 text-center text-xs text-sky-300/60">
                  No hay eventos cargados para el {banquetDate}.
                </div>
              ) : (
                banquetsForDate.map((ev) => (
                  <div
                    key={ev.id}
                    className={`bg-[#0c1d3d]/95 border rounded-2xl p-4 space-y-2.5 ${
                      ev.last_minute_change ? 'border-amber-400/70' : 'border-sky-900/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                          {ev.start_time} · {ev.salon_name}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-200 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {ev.pax} PAX · {ev.setup_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={ev.setup_status}
                          onChange={(e) => updateBanquetStatus(ev, e.target.value)}
                          className="bg-[#061124] border border-sky-700 rounded-lg px-2 py-1 text-xs font-semibold text-sky-200"
                        >
                          {SETUP_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteBanquetEvent(ev)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{ev.event_name}</h3>
                      {ev.last_minute_change && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          ¡Cambio última hora!
                        </span>
                      )}
                    </div>

                    {ev.allergens_notes && (
                      <p className="text-xs text-rose-200 bg-rose-950/40 border border-rose-800/50 rounded-xl px-3 py-1.5">
                        <strong>Alérgenos / Dietas:</strong> {ev.allergens_notes}
                      </p>
                    )}

                    {ev.extras_notes && (
                      <p className="text-xs text-sky-100/85 bg-[#061124]/80 border border-sky-900/60 rounded-xl px-3 py-1.5">
                        <strong>Material / Extras:</strong> {ev.extras_notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-3.5">
            <form
              onSubmit={(e) => handleAddTask(e, 'checklist')}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-2.5 shadow-lg"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Añadir tarea a ${activeOutletForWrite}...`}
                  className="flex-1 min-w-[200px] bg-[#061124] border border-sky-900/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                />
                <select
                  value={taskPhase}
                  onChange={(e) => setTaskPhase(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-2 text-xs text-sky-100"
                >
                  <option value="apertura">Apertura</option>
                  <option value="servicio">Servicio</option>
                  <option value="cierre">Cierre</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
              <input
                type="text"
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Nota opcional (APPCC, temperaturas, mise en place...)"
                className="w-full bg-[#061124]/70 border border-sky-900/70 rounded-xl px-3.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none"
              />
            </form>

            <div className="flex gap-1.5 overflow-x-auto">
              {SHIFT_PHASES.map((ph) => (
                <button
                  key={ph.id}
                  onClick={() => setPhaseFilter(ph.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    phaseFilter === ph.id
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                      : 'bg-[#0c1d3d]/80 border-sky-900/60 text-sky-300/70'
                  }`}
                >
                  {ph.label}
                </button>
              ))}
            </div>

            <div className="bg-[#0c1d3d]/80 border border-sky-900/70 rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-sky-100">
                  Checklist · <span className="text-sky-300">{selectedOutlet}</span>
                </span>
                <span className="text-sky-200/70">
                  Hechas: <strong className="text-emerald-400">{completedCount}</strong> /{' '}
                  {outletChecklist.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#061124] rounded-full overflow-hidden border border-sky-900/80">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {outletChecklist.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-8 text-center text-xs text-sky-300/60">
                  Sin tareas en esta vista.
                </div>
              ) : (
                outletChecklist.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task)}
                    onDelete={() => deleteTask(task)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-3.5">
            <div className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-sky-200">
                Pendientes del día ({selectedOutlet}):
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>

            <form
              onSubmit={(e) => handleAddTask(e, 'pending')}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-2.5 shadow-lg"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Pendiente para el ${selectedDate}...`}
                  className="flex-1 min-w-[200px] bg-[#061124] border border-sky-900/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <select
                  value={taskRole}
                  onChange={(e) => setTaskRole(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-2 text-xs text-sky-100"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      Para: {r}
                    </option>
                  ))}
                </select>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-2 text-xs text-sky-100"
                >
                  <option value="normal">Normal</option>
                  <option value="importante">Importante</option>
                  <option value="urgente">Urgente</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Guardar
                </button>
              </div>
              <input
                type="text"
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Detalle opcional..."
                className="w-full bg-[#061124]/70 border border-sky-900/70 rounded-xl px-3.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-500"
              />
            </form>

            <div className="space-y-2">
              {outletPending.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-8 text-center text-xs text-sky-300/60">
                  No hay pendientes para el {selectedDate}.
                </div>
              ) : (
                outletPending.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showRollover
                    onRollover={() => rollOverTaskToTomorrow(task)}
                    onToggle={() => toggleTask(task)}
                    onDelete={() => deleteTask(task)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddComplaint}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Registro de Cliente ({activeOutletForWrite})
                </h2>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-2.5 py-1 text-xs text-sky-100"
                >
                  <option value="queja">Queja / Incidencia</option>
                  <option value="solicitud">Solicitud especial</option>
                  <option value="vip">VIP / Celebración</option>
                  <option value="cortesia">Cortesía / Invitación</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Habitación, Mesa o Nombre del cliente (ej. Hab. 208)"
                  className="w-full bg-[#061124] border border-sky-900/80 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
              </div>

              <textarea
                required
                rows={2}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Qué ocurrió, qué solicita el cliente o detalle VIP..."
                className="w-full bg-[#061124] border border-sky-900/80 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />

              <textarea
                required
                rows={2}
                value={managerResponse}
                onChange={(e) => setManagerResponse(e.target.value)}
                placeholder="Solución dada por el Maître / 2º Maître / Jefe de Sector..."
                className="w-full bg-[#061124] border border-sky-900/80 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm shadow-md"
              >
                Guardar en ficha de cliente
              </button>
            </form>

            <div className="space-y-2.5">
              {outletComplaints.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-8 text-center text-xs text-sky-300/60">
                  Sin registros de clientes en esta vista.
                </div>
              ) : (
                outletComplaints.map((c) => (
                  <div
                    key={c.id}
                    className={`bg-[#0c1d3d]/95 border rounded-2xl p-4 space-y-2 ${
                      c.status === 'cerrada' ? 'border-sky-900/40 opacity-65' : 'border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                          {c.record_type === 'vip' ? (
                            <Crown className="w-3.5 h-3.5" />
                          ) : (
                            <BedDouble className="w-3.5 h-3.5" />
                          )}
                          {c.room_number}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-200">
                          {c.record_type || 'queja'} · {c.outlet}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleComplaintStatus(c)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                          c.status === 'cerrada'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {c.status === 'cerrada' ? 'Cerrada ✓' : 'Abierta · Cerrar'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-100">
                      <strong className="text-amber-300">Detalle:</strong> {c.complaint_text}
                    </p>
                    <p className="text-xs text-slate-100 bg-[#061124]/90 border border-sky-900/70 rounded-xl p-2.5">
                      <strong className="text-emerald-400">Gestión / Respuesta:</strong>{' '}
                      {c.manager_response}
                    </p>
                    <p className="text-[11px] text-sky-300/60">
                      Por {c.reported_by} ·{' '}
                      {new Date(c.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddCalendarEvent}
              className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Calendario operativo editable
                </h2>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="bg-[#061124] border border-sky-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={`Anotación para el ${calendarDate} (${activeOutletForWrite})...`}
                className="w-full bg-[#061124] border border-sky-900/80 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />

              <input
                type="text"
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Detalle opcional (refuerzos, inventario, proveedores...)"
                className="w-full bg-[#061124]/70 border border-sky-900/70 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-md"
              >
                Añadir al calendario
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs text-sky-200/70 px-1">
                Anotaciones del <strong className="text-white">{calendarDate}</strong>:
              </p>
              {eventsForSelectedDate.length === 0 ? (
                <div className="bg-[#0c1d3d]/40 border border-dashed border-sky-900/70 rounded-2xl p-6 text-center text-xs text-sky-300/60">
                  No hay notas en el calendario para esta fecha.
                </div>
              ) : (
                eventsForSelectedDate.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl p-3.5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="inline-block text-[11px] font-bold text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 rounded-md mb-1">
                        {ev.outlet}
                      </span>
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      {ev.details && <p className="text-xs text-sky-100/75 mt-0.5">{ev.details}</p>}
                      <p className="text-[11px] text-sky-300/60 mt-1">Por {ev.created_by}</p>
                    </div>
                    <button
                      onClick={() => deleteCalendarEvent(ev)}
                      className="text-slate-500 hover:text-rose-400 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 px-1">
                <History className="w-4 h-4" />
                <span>Registro reciente del equipo</span>
              </div>
              <div className="bg-[#0c1d3d]/95 border border-sky-900/80 rounded-2xl divide-y divide-sky-900/50">
                {logs.length === 0 ? (
                  <p className="p-6 text-center text-xs text-sky-300/60">Sin movimientos todavía.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 text-xs flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-sky-300">{log.user_name}</span>{' '}
                        <span className="text-slate-300">{log.action}</span>{' '}
                        <span className="text-cyan-300 font-semibold">{log.target}</span>
                      </div>
                      <span className="text-sky-300/60 shrink-0 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, showRollover, onRollover }) {
  return (
    <div
      className={`bg-[#0c1d3d]/95 border rounded-2xl p-3.5 flex items-start justify-between gap-3 transition ${
        task.completed
          ? 'border-emerald-500/25 opacity-65'
          : task.priority === 'urgente'
          ? 'border-rose-500/60'
          : 'border-sky-900/80 hover:border-sky-700'
      }`}
    >
      <button onClick={onToggle} className="flex items-start gap-3 text-left flex-1">
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-200">
              {task.outlet}
            </span>
            {task.shift_phase && task.shift_phase !== 'general' && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                {task.shift_phase}
              </span>
            )}
            {task.assigned_role && task.assigned_role !== 'Todos' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                {task.assigned_role}
              </span>
            )}
            {task.priority === 'urgente' && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                Urgente
              </span>
            )}
          </div>
          <p
            className={`text-sm font-medium ${
              task.completed ? 'line-through text-slate-400' : 'text-white'
            }`}
          >
            {task.title}
          </p>
          {task.notes && <p className="text-xs text-sky-100/75">{task.notes}</p>}
          <p className="text-[11px] text-sky-300/60">
            Creado por <span className="text-sky-100">{task.created_by}</span>
            {task.completed && task.completed_by ? ` · Hecho por ${task.completed_by}` : ''}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        {showRollover && !task.completed && (
          <button
            onClick={onRollover}
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-500/15 text-sky-200 border border-sky-400/30 hover:bg-sky-500/25"
            title="Pasar pendiente al día siguiente"
          >
            +1 día
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
