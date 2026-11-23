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
} from 'lucide-react';

const SUPABASE_URL = 'https://wqdxdhfdeudagfbveium.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qo2SlzVJQriNXIdXrLR7GQ_N7gT_Lg1';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const OUTLETS = ['Thalassa', 'Lobby Bar', 'Alborán', 'Pool-Side', 'Chill-Out'];
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
  const [activeTab, setActiveTab] = useState('checklist');

  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [roomNumber, setRoomNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [managerResponse, setManagerResponse] = useState('');

  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDetails, setEventDetails] = useState('');

  const today = new Date();
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
    const [tasksRes, complaintsRes, eventsRes, logsRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: true }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (complaintsRes.data) setComplaints(complaintsRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (logsRes.data) setLogs(logsRes.data);
  }

  useEffect(() => {
    if (!session) return;
    loadAllData();

    const channel = supabase
      .channel('fyb-control-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, loadAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, loadAllData)
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

  async function handleAddTask(e, section) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    const actor = profileName || session.user.email;
    const { error } = await supabase.from('tasks').insert([
      {
        title,
        outlet: selectedOutlet,
        section,
        due_date: selectedDate,
        notes: newTaskNotes.trim() || null,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(
        section === 'pending' ? `Añadió pendiente (${selectedDate})` : 'Añadió a checklist',
        `${title} [${selectedOutlet}]`
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
        outlet: selectedOutlet,
        room_number: roomNumber.trim(),
        complaint_text: complaintText.trim(),
        manager_response: managerResponse.trim(),
        reported_by: actor,
      },
    ]);

    if (!error) {
      await addLog('Anotó queja cliente', `Hab. ${roomNumber.trim()} · ${selectedOutlet}`);
      setRoomNumber('');
      setComplaintText('');
      setManagerResponse('');
    }
  }

  async function handleAddCalendarEvent(e) {
    e.preventDefault();
    if (!eventTitle.trim() || !calendarDate) return;

    const actor = profileName || session.user.email;
    const { error } = await supabase.from('calendar_events').insert([
      {
        event_date: calendarDate,
        outlet: selectedOutlet,
        title: eventTitle.trim(),
        details: eventDetails.trim() || null,
        created_by: actor,
      },
    ]);

    if (!error) {
      await addLog(
        `Añadió en calendario (${calendarDate})`,
        `${eventTitle.trim()} [${selectedOutlet}]`
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
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center text-sm">
        Cargando F&amp;B Control...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white">F&amp;B Control</h1>
            <p className="text-xs text-slate-400">Acceso interno del departamento</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu usuario"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition"
            >
              {submittingAuth ? 'Entrando...' : 'Entrar al sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const outletChecklist = tasks.filter(
    (t) => t.outlet === selectedOutlet && t.section === 'checklist'
  );
  const outletPending = tasks.filter(
    (t) => t.outlet === selectedOutlet && t.section === 'pending' && t.due_date === selectedDate
  );
  const outletComplaints = complaints.filter((c) => c.outlet === selectedOutlet);
  const eventsForSelectedDate = events.filter((ev) => ev.event_date === calendarDate);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold tracking-tight">F&amp;B Control</h1>
            <p className="text-[11px] text-slate-400">
              {DAY_NAMES[dayOfWeek]} {today.toLocaleDateString('es-ES')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-emerald-400 font-medium">
              {profileName}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {(isFirstOfMonth || isOrderDay) && (
          <div className="space-y-2">
            {isFirstOfMonth && (
              <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-300 uppercase">
                    Día 1 de Mes · {selectedOutlet}
                  </p>
                  <p className="text-amber-100/90 mt-0.5">
                    Cambiar <strong>hojas de temperaturas</strong> y <strong>hojas de traspasos</strong>.
                  </p>
                </div>
              </div>
            )}

            {isOrderDay && (
              <div className="bg-sky-500/15 border border-sky-500/40 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sky-300 uppercase">
                    Hoy es {DAY_NAMES[dayOfWeek]} · Día de Pedidos
                  </p>
                  <p className="text-sky-100/90 mt-0.5">
                    Recordatorio operativo: hacer <strong>pedidos</strong> (Domingo, Martes y Jueves).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {OUTLETS.map((outlet) => (
            <button
              key={outlet}
              onClick={() => setSelectedOutlet(outlet)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                selectedOutlet === outlet
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {outlet}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium ${
              activeTab === 'checklist' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span>Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium ${
              activeTab === 'pending' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <CalendarClock className="w-4 h-4 text-sky-400" />
            <span>Pendientes</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium ${
              activeTab === 'complaints' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <span>Quejas</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium ${
              activeTab === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span>Calendario</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium ${
              activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Registro</span>
          </button>
        </div>

        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <form
              onSubmit={(e) => handleAddTask(e, 'checklist')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Añadir tarea a ${selectedOutlet}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
              <input
                type="text"
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Nota opcional (ej. cambio hojas temperaturas/traspasos...)"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              />
            </form>

            <div className="flex justify-between items-center text-xs text-slate-400 px-1">
              <span>Checklist · {selectedOutlet}</span>
              <span>
                Hechas:{' '}
                <strong className="text-emerald-400">
                  {outletChecklist.filter((t) => t.completed).length}
                </strong>{' '}
                / {outletChecklist.length}
              </span>
            </div>

            <div className="space-y-2">
              {outletChecklist.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Sin tareas en {selectedOutlet}. Escribe una arriba para empezar.
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
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-300">
                Día de pendientes ({selectedOutlet}):
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <form
              onSubmit={(e) => handleAddTask(e, 'pending')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Pendiente para el ${selectedDate}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0"
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              />
            </form>

            <div className="space-y-2">
              {outletPending.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  No hay pendientes para el {selectedDate} en {selectedOutlet}.
                </div>
              ) : (
                outletPending.map((task) => (
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

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddComplaint}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Queja de cliente en {selectedOutlet}
              </h2>

              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Número de habitación (ej. 208)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <textarea
                required
                rows={2}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Queja del cliente..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />

              <textarea
                required
                rows={2}
                value={managerResponse}
                onChange={(e) => setManagerResponse(e.target.value)}
                placeholder="Qué le ha dicho / resuelto el jefe de turno..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Registrar queja
              </button>
            </form>

            <div className="space-y-2.5">
              {outletComplaints.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Sin quejas registradas en {selectedOutlet}.
                </div>
              ) : (
                outletComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                        <BedDouble className="w-3.5 h-3.5" />
                        Hab. {c.room_number}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(c.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">
                      <strong className="text-rose-400">Queja:</strong> {c.complaint_text}
                    </p>
                    <p className="text-xs text-slate-200 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                      <strong className="text-emerald-400">Respuesta Jefe de Turno:</strong>{' '}
                      {c.manager_response}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Registrado por <span className="text-slate-300">{c.reported_by}</span>
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
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Calendario operativo editable
                </h2>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={`Anotación para el ${calendarDate} (${selectedOutlet})...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />

              <input
                type="text"
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Detalle opcional (ej. evento privado, refuerzo de sala...)"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Añadir al calendario
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 px-1">
                Anotaciones del <strong className="text-white">{calendarDate}</strong>:
              </p>
              {eventsForSelectedDate.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                  No hay notas en el calendario para esta fecha.
                </div>
              ) : (
                eventsForSelectedDate.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-400">
                        {ev.outlet}
                      </span>
                      <p className="text-sm font-medium text-white">{ev.title}</p>
                      {ev.details && <p className="text-xs text-slate-400 mt-0.5">{ev.details}</p>}
                      <p className="text-[11px] text-slate-500 mt-1">Por {ev.created_by}</p>
                    </div>
                    <button
                      onClick={() => deleteCalendarEvent(ev)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
            {logs.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Sin movimientos todavía.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 text-xs flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-white">{log.user_name}</span>{' '}
                    <span className="text-slate-400">{log.action}</span>{' '}
                    <span className="text-emerald-400 font-medium">{log.target}</span>
                  </div>
                  <span className="text-slate-500 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-3.5 flex items-start justify-between gap-3 transition ${
        task.completed ? 'border-emerald-900/50 opacity-70' : 'border-slate-800'
      }`}
    >
      <button onClick={onToggle} className="flex items-start gap-3 text-left flex-1">
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p
            className={`text-sm font-medium ${
              task.completed ? 'line-through text-slate-400' : 'text-white'
            }`}
          >
            {task.title}
          </p>
          {task.notes && <p className="text-xs text-slate-400 mt-0.5">{task.notes}</p>}
          <p className="text-[11px] text-slate-500 mt-1">
            Creado por {task.created_by}
            {task.completed && task.completed_by ? ` · Hecho por ${task.completed_by}` : ''}
          </p>
        </div>
      </button>
      <button
        onClick={onDelete}
        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
