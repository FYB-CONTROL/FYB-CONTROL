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
  Utensils,
  ArrowRightCircle,
  Search,
  CheckCheck,
  Crown,
  Paperclip,
  FileText,
  X,
  AlertOctagon,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sun,
  Calendar as CalendarIcon,
  BarChart3,
} from 'lucide-react';

const SUPABASE_URL = 'https://wqdxdhfdeudagfbveium.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qo2SlzVJQriNXIdXrLR7GQ_N7gT_Lg1';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const OUTLETS = ['Todo F&B', 'Thalassa', 'Lobby Bar', 'Alborán', 'Pool-Side', 'Chill-Out', 'Salones'];
const SALONS = [
  'Salón Ronda',
  'Salón Mistral',
  'Salón Poniente',
  'Salón Sirocco',
  'Salón Garbino',
];
const ROLES = ['Todos', 'Maître', '2º Maître', 'Jefe de Sector'];
const SHIFT_PHASES = [
  { id: 'all', label: 'Todo el turno' },
  { id: 'apertura', label: 'Apertura' },
  { id: 'servicio', label: 'Servicio' },
  { id: 'cierre', label: 'Cierre' },
];
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SHORT_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function isImageUrl(url = '') {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
}

function toLocalDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameLocalDay(isoOrDateStr, targetDayStr) {
  if (!isoOrDateStr) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDateStr)) {
    return isoOrDateStr === targetDayStr;
  }
  const parsed = new Date(isoOrDateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  return toLocalDateStr(parsed) === targetDayStr;
}

function isSalonReady(ev) {
  const st = (ev.setup_status || '').toLowerCase();
  return st.includes('terminado') || st.includes('montado') || st.includes('listo');
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [selectedOutlet, setSelectedOutlet] = useState('Thalassa');
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenFilter, setOnlyOpenFilter] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [banquetEvents, setBanquetEvents] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [incidences, setIncidences] = useState([]);
  const [roomRequests, setRoomRequests] = useState([]);
  const [logs, setLogs] = useState([]);

  // CAMBIOS DE TURNO
  const [cambiosTurno, setCambiosTurno] = useState([]);
  const [cambioEmp1, setCambioEmp1] = useState('');
  const [cambioEmp2, setCambioEmp2] = useState('');
  const [cambioFecha1, setCambioFecha1] = useState('');
  const [cambioHoraEnt1, setCambioHoraEnt1] = useState('');
  const [cambioHoraSal1, setCambioHoraSal1] = useState('');
  const [cambioFecha2, setCambioFecha2] = useState('');
  const [cambioHoraEnt2, setCambioHoraEnt2] = useState('');
  const [cambioHoraSal2, setCambioHoraSal2] = useState('');
  const [cambioObs, setCambioObs] = useState('');
  const [editingCambioId, setEditingCambioId] = useState(null);

  // ESTADÍSTICAS Y HORAS PUNTA
  const [actividadHoraria, setActividadHoraria] = useState([]);
  const [actFecha, setActFecha] = useState(() => toLocalDateStr(new Date()));
  const [actPuntoVenta, setActPuntoVenta] = useState('Thalassa');
  const [actFranjaInicio, setActFranjaInicio] = useState('08:00');
  const [actFranjaFin, setActFranjaFin] = useState('09:00');
  const [actNivel, setActNivel] = useState('medio');
  const [actEmpleados, setActEmpleados] = useState('');
  const [actObs, setActObs] = useState('');
  const [editingActividadId, setEditingActividadId] = useState(null);
  const [actFiltroPunto, setActFiltroPunto] = useState('Todos');
  const [actFiltroFecha, setActFiltroFecha] = useState('');
  const [actFiltroSemana, setActFiltroSemana] = useState('');

  // AVISOS DE ÚLTIMA HORA
  const [avisos, setAvisos] = useState([]);
  const [avisoTitulo, setAvisoTitulo] = useState('');
  const [avisoMensaje, setAvisoMensaje] = useState('');
  const [avisoPrioridad, setAvisoPrioridad] = useState('alta');
  const [avisoFechaExpiracion, setAvisoFechaExpiracion] = useState('');
  const [editingAvisoId, setEditingAvisoId] = useState(null);

  // Relevo
  const [handoverType, setHandoverType] = useState('relevo');
  const [handoverPriority, setHandoverPriority] = useState('normal');
  const [handoverTitle, setHandoverTitle] = useState('');
  const [handoverDetails, setHandoverDetails] = useState('');
  const [handoverFile, setHandoverFile] = useState(null);

  // Tareas / Pendientes
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [taskPhase, setTaskPhase] = useState('apertura');
  const [taskRole, setTaskRole] = useState('Todos');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateStr(new Date()));

  // Quejas / VIP
  const [recordType, setRecordType] = useState('queja');
  const [complaintDate, setComplaintDate] = useState(() => toLocalDateStr(new Date()));
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [managerResponse, setManagerResponse] = useState('');
  const [complaintFile, setComplaintFile] = useState(null);

  // Incidencias
  const [incTitle, setIncTitle] = useState('');
  const [incDetails, setIncDetails] = useState('');
  const [incSeverity, setIncSeverity] = useState('media');
  const [incFile, setIncFile] = useState(null);

  // Peticiones de habitaciones
  const [reqRoom, setReqRoom] = useState('');
  const [reqDate, setReqDate] = useState(() => toLocalDateStr(new Date()));
  const [reqText, setReqText] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  // SALONES
  const [banquetDate, setBanquetDate] = useState(() => toLocalDateStr(new Date()));
  const [openSalonCards, setOpenSalonCards] = useState({ 'Salón Ronda': true });
  const [salonName, setSalonName] = useState(SALONS[0]);
  const [banquetName, setBanquetName] = useState('');
  const [startTime, setStartTime] = useState('13:30');
  const [paxCount, setPaxCount] = useState('40');
  const [setupType, setSetupType] = useState('Banquete');
  const [salonMountState, setSalonMountState] = useState('Falta por montar');
  const [allergensNotes, setAllergensNotes] = useState('');
  const [extrasNotes, setExtrasNotes] = useState('');
  const [lastMinuteChange, setLastMinuteChange] = useState(false);
  const [lastMinuteNotes, setLastMinuteNotes] = useState('');
  const [salonPendingNotes, setSalonPendingNotes] = useState('');
  const [banquetFile, setBanquetFile] = useState(null);

  // Calendario clicable por día
  const nowObj = new Date();
  const [calendarDate, setCalendarDate] = useState(() => toLocalDateStr(nowObj));
  const [calViewYear, setCalViewYear] = useState(nowObj.getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(nowObj.getMonth());
  const [showAllCalendarEvents, setShowAllCalendarEvents] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDetails, setEventDetails] = useState('');

  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toLocalDateStr(tomorrow);

  const isFirstOfMonth = today.getDate() === 1;
  const dayOfWeek = today.getDay();
  const isOrderDay = dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 3;

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
    const [
      tasksRes,
      complaintsRes,
      eventsRes,
      banquetsRes,
      handoversRes,
      incidencesRes,
      roomReqRes,
      logsRes,
    ] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: true }),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('event_date', { ascending: true }),
      supabase.from('banquet_events').select('*').order('start_time', { ascending: true }),
      supabase.from('shift_handovers').select('*').order('created_at', { ascending: false }),
      supabase.from('incidences').select('*').order('created_at', { ascending: false }),
      supabase.from('room_requests').select('*').order('request_date', { ascending: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(60),
    ]);

    setTasks(tasksRes.data || []);
    setComplaints(complaintsRes.data || []);
    setEvents(eventsRes.data || []);
    setBanquetEvents(banquetsRes.data || []);
    setHandovers(handoversRes.data || []);
    setIncidences(incidencesRes.data || []);
    setRoomRequests(roomReqRes.data || []);
    setLogs(logsRes.data || []);
  }

  async function loadCambiosTurno() {
    const { data } = await supabase
      .from('cambios_turno')
      .select('*')
      .order('creado_en', { ascending: false });

    setCambiosTurno(data || []);
  }

  async function loadActividadHoraria() {
    const { data } = await supabase
      .from('actividad_horaria')
      .select('*')
      .order('fecha', { ascending: true })
      .order('franja_horaria', { ascending: true });

    setActividadHoraria(data || []);
  }

  async function loadAvisos() {
    const hoy = toLocalDateStr(new Date());
    const { data } = await supabase
      .from('avisos_ultima_hora')
      .select('*')
      .or(`fecha_expiracion.is.null,fecha_expiracion.gte.${hoy}`)
      .order('creado_en', { ascending: false });

    setAvisos(data || []);
  }

  useEffect(() => {
    if (!session) return;
    loadAllData();
    loadCambiosTurno();
    loadActividadHoraria();
    loadAvisos();

    const channel = supabase
      .channel('h10-fyb-sync-v9')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banquet_events' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_handovers' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidences' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_requests' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => loadAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cambios_turno' }, () => loadCambiosTurno())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividad_horaria' }, () => loadActividadHoraria())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avisos_ultima_hora' }, () => loadAvisos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function uploadAttachment(file, folder = 'general') {
    if (!file) return { url: null, name: null };
    setUploadingFile(true);
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanName}`;

      const { error } = await supabase.storage
        .from('fyb-attachments')
        .upload(filePath, file);

      if (error) {
        alert(`Error al subir archivo: ${error.message}`);
        return { url: null, name: null };
      }

      const { data } = supabase.storage
        .from('fyb-attachments')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, name: file.name };
    } finally {
      setUploadingFile(false);
    }
  }

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
    const { data } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_name: profileName || session.user.email,
          action,
          target,
        },
      ])
      .select()
      .single();

    if (data) {
      setLogs((prev) => [data, ...prev].slice(0, 60));
    }
  }

  const activeOutletForWrite = selectedOutlet === 'Todo F&B' ? 'Thalassa' : selectedOutlet;

  function toggleSalonCard(name) {
    setOpenSalonCards((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  // RELEVO
  async function handleAddHandover(e) {
    e.preventDefault();
    if (!handoverTitle.trim()) return;
    const actor = profileName || session.user.email;
    const attachment = await uploadAttachment(handoverFile, 'relevo');

    const { data, error } = await supabase
      .from('shift_handovers')
      .insert([
        {
          outlet: activeOutletForWrite,
          item_type: handoverType,
          priority: handoverPriority,
          title: handoverTitle.trim(),
          details: handoverDetails.trim() || null,
          attachment_url: attachment.url,
          attachment_name: attachment.name,
          created_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setHandovers((prev) => [data, ...prev]);
      await addLog(`Añadió aviso (${handoverType})`, `${handoverTitle.trim()} [${activeOutletForWrite}]`);
      setHandoverTitle('');
      setHandoverDetails('');
      setHandoverFile(null);
    }
  }

  async function toggleHandover(item) {
    const nextResolved = !item.resolved;
    setHandovers((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, resolved: nextResolved } : h))
    );
    const { error } = await supabase
      .from('shift_handovers')
      .update({ resolved: nextResolved })
      .eq('id', item.id);
    if (!error) {
      await addLog(nextResolved ? 'Cerró aviso' : 'Reabrió aviso', `${item.title} [${item.outlet}]`);
    } else {
      loadAllData();
    }
  }

  async function deleteHandover(item) {
    setHandovers((prev) => prev.filter((h) => h.id !== item.id));
    const { error } = await supabase.from('shift_handovers').delete().eq('id', item.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog('Eliminó aviso', `${item.title} [${item.outlet}]`);
    }
  }

  // INCIDENCIAS
  async function handleAddIncidence(e) {
    e.preventDefault();
    if (!incTitle.trim()) return;
    const actor = profileName || session.user.email;
    const attachment = await uploadAttachment(incFile, 'incidencias');

    const { data, error } = await supabase
      .from('incidences')
      .insert([
        {
          outlet: activeOutletForWrite,
          title: incTitle.trim(),
          details: incDetails.trim() || null,
          severity: incSeverity,
          status: 'abierta',
          attachment_url: attachment.url,
          attachment_name: attachment.name,
          reported_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setIncidences((prev) => [data, ...prev]);
      await addLog('Registró incidencia', `${incTitle.trim()} [${activeOutletForWrite}]`);
      setIncTitle('');
      setIncDetails('');
      setIncFile(null);
    }
  }

  async function toggleIncidenceStatus(inc) {
    const nextStatus = inc.status === 'resuelta' ? 'abierta' : 'resuelta';
    setIncidences((prev) =>
      prev.map((i) => (i.id === inc.id ? { ...i, status: nextStatus } : i))
    );
    const { error } = await supabase
      .from('incidences')
      .update({ status: nextStatus })
      .eq('id', inc.id);
    if (!error) {
      await addLog(`Incidencia ${nextStatus}`, `${inc.title} [${inc.outlet}]`);
    } else {
      loadAllData();
    }
  }

  async function deleteIncidence(inc) {
    setIncidences((prev) => prev.filter((i) => i.id !== inc.id));
    const { error } = await supabase.from('incidences').delete().eq('id', inc.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog('Eliminó incidencia', `${inc.title} [${inc.outlet}]`);
    }
  }

  // PETICIONES DE HABITACIONES
  async function handleAddRoomRequest(e) {
    e.preventDefault();
    if (!reqRoom.trim() || !reqText.trim()) return;
    const actor = profileName || session.user.email;

    const { data, error } = await supabase
      .from('room_requests')
      .insert([
        {
          room_number: reqRoom.trim(),
          outlet: activeOutletForWrite,
          request_date: reqDate,
          request_text: reqText.trim(),
          notes: reqNotes.trim() || null,
          status: 'pendiente',
          created_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setRoomRequests((prev) => [...prev, data]);
      await addLog('Anotó petición habitación', `Hab. ${reqRoom.trim()} · ${reqText.trim()}`);
      setReqRoom('');
      setReqText('');
      setReqNotes('');
    }
  }

  async function toggleRoomRequest(reqItem) {
    const nextStatus = reqItem.status === 'atendida' ? 'pendiente' : 'atendida';
    setRoomRequests((prev) =>
      prev.map((r) => (r.id === reqItem.id ? { ...r, status: nextStatus } : r))
    );
    const { error } = await supabase
      .from('room_requests')
      .update({ status: nextStatus })
      .eq('id', reqItem.id);
    if (!error) {
      await addLog(`Petición hab. ${reqItem.room_number} -> ${nextStatus}`, reqItem.request_text);
    } else {
      loadAllData();
    }
  }

  async function deleteRoomRequest(reqItem) {
    setRoomRequests((prev) => prev.filter((r) => r.id !== reqItem.id));
    const { error } = await supabase.from('room_requests').delete().eq('id', reqItem.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog('Borró petición habitación', `Hab. ${reqItem.room_number}`);
    }
  }

  // TAREAS / PENDIENTES
  async function handleAddTask(e, section) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    const actor = profileName || session.user.email;
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          outlet: selectedOutlet,
          section,
          due_date: selectedDate,
          notes: newTaskNotes.trim() || null,
          priority: taskPriority,
          shift_phase: taskPhase,
          assigned_role: taskRole,
          created_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data]);
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

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              completed_by: nextCompleted ? actor : null,
              completed_at: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

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
    } else {
      loadAllData();
    }
  }

  async function rollOverTaskToTomorrow(task) {
    const base = new Date(`${task.due_date || todayStr}T12:00:00`);
    base.setDate(base.getDate() + 1);
    const nextDate = toLocalDateStr(base);

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_date: nextDate } : t)));
    const { error } = await supabase
      .from('tasks')
      .update({ due_date: nextDate })
      .eq('id', task.id);

    if (!error) {
      await addLog(`Pasó pendiente al ${nextDate}`, `${task.title} [${task.outlet}]`);
    } else {
      loadAllData();
    }
  }

  async function deleteTask(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog('Eliminó tarea', `${task.title} [${task.outlet}]`);
    }
  }

  // QUEJAS / VIP
  async function handleAddComplaint(e) {
    e.preventDefault();
    if (!roomNumber.trim() || !complaintText.trim()) return;

    const actor = profileName || session.user.email;
    const attachment = await uploadAttachment(complaintFile, 'quejas');
    const chosenDate = complaintDate || todayStr;

    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          outlet: activeOutletForWrite,
          complaint_date: chosenDate,
          room_number: roomNumber.trim(),
          complaint_text: complaintText.trim(),
          manager_response: managerResponse.trim() || 'Aviso registrado para seguimiento',
          record_type: recordType,
          status: 'abierta',
          attachment_url: attachment.url,
          attachment_name: attachment.name,
          reported_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setComplaints((prev) => [data, ...prev]);
      await addLog(
        `Anotó ${recordType} (${chosenDate})`,
        `Hab. ${roomNumber.trim()} · ${activeOutletForWrite}`
      );
      setRoomNumber('');
      setComplaintText('');
      setManagerResponse('');
      setComplaintFile(null);
    }
  }

  async function toggleComplaintStatus(c) {
    const nextStatus = c.status === 'cerrada' ? 'abierta' : 'cerrada';
    setComplaints((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
    );
    const { error } = await supabase
      .from('complaints')
      .update({ status: nextStatus })
      .eq('id', c.id);
    if (!error) {
      await addLog(`Marcó ${c.record_type} como ${nextStatus}`, `Hab. ${c.room_number}`);
    } else {
      loadAllData();
    }
  }

  async function deleteComplaint(c) {
    setComplaints((prev) => prev.filter((item) => item.id !== c.id));
    const { error } = await supabase.from('complaints').delete().eq('id', c.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog(`Eliminó ${c.record_type}`, `Hab. ${c.room_number}`);
    }
  }

  // SALONES -> SE AÑADE DIRECTAMENTE AL CALENDARIO PARA EL DÍA DEL EVENTO
  async function handleAddBanquetEvent(e) {
    e.preventDefault();
    if (!banquetName.trim()) return;
    const actor = profileName || session.user.email;
    const attachment = await uploadAttachment(banquetFile, 'eventos');

    const hasLastMinute = lastMinuteChange || !!lastMinuteNotes.trim();
    const pendingExtra = salonPendingNotes.trim();
    const combinedStatus =
      salonMountState === 'Terminado / Montado'
        ? pendingExtra
          ? `Terminado / Montado · Pendiente: ${pendingExtra}`
          : 'Terminado / Montado'
        : pendingExtra
        ? `Falta por montar · Pendiente: ${pendingExtra}`
        : 'Falta por montar';

    const cleanEventName = banquetName.trim();
    const cleanPax = Number(paxCount) || 0;

    const { data, error } = await supabase
      .from('banquet_events')
      .insert([
        {
          event_date: banquetDate,
          salon_name: salonName,
          event_name: cleanEventName,
          start_time: startTime,
          pax: cleanPax,
          setup_type: setupType,
          setup_status: combinedStatus,
          allergens_notes: allergensNotes.trim() || null,
          extras_notes: extrasNotes.trim() || null,
          last_minute_change: hasLastMinute,
          last_minute_notes: lastMinuteNotes.trim() || null,
          attachment_url: attachment.url,
          attachment_name: attachment.name,
          created_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setBanquetEvents((prev) => [...prev, data]);

      const calTitle = `${salonName} (${startTime}) · ${cleanEventName} (${cleanPax} PAX)`;
      const calDetailsParts = [`Montaje: ${setupType}`, `Estado: ${combinedStatus}`];
      if (allergensNotes.trim()) calDetailsParts.push(`Alérgenos: ${allergensNotes.trim()}`);
      if (extrasNotes.trim()) calDetailsParts.push(`Extras: ${extrasNotes.trim()}`);
      if (lastMinuteNotes.trim()) calDetailsParts.push(`Última hora: ${lastMinuteNotes.trim()}`);

      const { data: calData, error: calError } = await supabase
        .from('calendar_events')
        .insert([
          {
            event_date: banquetDate,
            outlet: 'Salones',
            title: calTitle,
            details: calDetailsParts.join(' · '),
            created_by: actor,
          },
        ])
        .select()
        .single();

      if (!calError && calData) {
        setEvents((prev) => [...prev, calData]);
      }

      const [evYear, evMonth] = banquetDate.split('-').map(Number);
      if (evYear && evMonth) {
        setCalViewYear(evYear);
        setCalViewMonth(evMonth - 1);
        setCalendarDate(banquetDate);
      }

      await addLog(
        `Creó evento y añadió al calendario (${banquetDate})`,
        `${cleanEventName} · ${salonName} (${cleanPax} PAX)`
      );
      setOpenSalonCards((prev) => ({ ...prev, [salonName]: true }));
      setBanquetName('');
      setAllergensNotes('');
      setExtrasNotes('');
      setLastMinuteChange(false);
      setLastMinuteNotes('');
      setSalonPendingNotes('');
      setBanquetFile(null);
    }
  }

  async function toggleBanquetMountState(ev, nextState) {
    const newStatus =
      nextState === 'terminado' ? 'Terminado / Montado' : 'Falta por montar';

    setBanquetEvents((prev) =>
      prev.map((item) => (item.id === ev.id ? { ...item, setup_status: newStatus } : item))
    );

    const { error } = await supabase
      .from('banquet_events')
      .update({ setup_status: newStatus })
      .eq('id', ev.id);

    if (error) {
      alert(`No se pudo actualizar estado: ${error.message}`);
      loadAllData();
    } else {
      await addLog(`Estado salón (${ev.salon_name})`, `${ev.event_name} -> ${newStatus}`);
    }
  }

  async function updateBanquetSalonItem(ev, field, value) {
    setBanquetEvents((prev) =>
      prev.map((item) => {
        if (item.id !== ev.id) return item;
        if (field === 'last_minute') {
          return {
            ...item,
            last_minute_change: Boolean(value.trim()),
            last_minute_notes: value,
          };
        }
        return {
          ...item,
          setup_status: value,
        };
      })
    );

    const payload =
      field === 'last_minute'
        ? { last_minute_change: Boolean(value.trim()), last_minute_notes: value }
        : { setup_status: value };

    const { error } = await supabase.from('banquet_events').update(payload).eq('id', ev.id);
    if (error) {
      alert(`No se pudo actualizar: ${error.message}`);
      loadAllData();
    }
  }

  async function deleteBanquetEvent(ev) {
    setBanquetEvents((prev) => prev.filter((item) => item.id !== ev.id));

    const matchingCal = events.filter(
      (c) =>
        c.event_date === ev.event_date &&
        c.outlet === 'Salones' &&
        c.title.includes(ev.event_name)
    );

    if (matchingCal.length > 0) {
      const idsToDelete = matchingCal.map((m) => m.id);
      setEvents((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
      await supabase.from('calendar_events').delete().in('id', idsToDelete);
    }

    const { error } = await supabase.from('banquet_events').delete().eq('id', ev.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog('Eliminó evento y su aviso de calendario', `${ev.event_name} [${ev.salon_name}]`);
      await loadAllData();
    }
  }

  // CALENDARIO CLICABLE POR DÍA
  async function handleAddCalendarEvent(e) {
    e.preventDefault();
    if (!eventTitle.trim() || !calendarDate) return;

    const actor = profileName || session.user.email;
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([
        {
          event_date: calendarDate,
          outlet: activeOutletForWrite,
          title: eventTitle.trim(),
          details: eventDetails.trim() || null,
          created_by: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setEvents((prev) => [...prev, data]);
      await addLog(
        `Añadió en calendario (${calendarDate})`,
        `${eventTitle.trim()} [${activeOutletForWrite}]`
      );
      setEventTitle('');
      setEventDetails('');
    }
  }

  async function deleteCalendarEvent(ev) {
    setEvents((prev) => prev.filter((item) => item.id !== ev.id));
    const { error } = await supabase.from('calendar_events').delete().eq('id', ev.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      loadAllData();
    } else {
      await addLog(`Borró de calendario (${ev.event_date})`, `${ev.title} [${ev.outlet}]`);
      await loadAllData();
    }
  }

  // CAMBIOS DE TURNO
  async function handleAddCambioTurno(e) {
    e.preventDefault();
    if (!cambioEmp1.trim() || !cambioEmp2.trim() || !cambioFecha1 || !cambioHoraEnt1 || !cambioHoraSal1 || !cambioFecha2 || !cambioHoraEnt2 || !cambioHoraSal2) return;

    const actor = profileName || session.user.email;

    const { data, error } = await supabase
      .from('cambios_turno')
      .insert([
        {
          empleado_1: cambioEmp1.trim(),
          empleado_2: cambioEmp2.trim(),
          fecha_turno_1: cambioFecha1,
          hora_entrada_1: cambioHoraEnt1,
          hora_salida_1: cambioHoraSal1,
          fecha_turno_2: cambioFecha2,
          hora_entrada_2: cambioHoraEnt2,
          hora_salida_2: cambioHoraSal2,
          observaciones: cambioObs.trim() || null,
          creado_por: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setCambiosTurno((prev) => [data, ...prev]);
      await addLog('Registró cambio de turno', `${cambioEmp1.trim()} ↔ ${cambioEmp2.trim()}`);
      setCambioEmp1('');
      setCambioEmp2('');
      setCambioFecha1('');
      setCambioHoraEnt1('');
      setCambioHoraSal1('');
      setCambioFecha2('');
      setCambioHoraEnt2('');
      setCambioHoraSal2('');
      setCambioObs('');
      setEditingCambioId(null);
    } else if (error) {
      alert(`Error al registrar: ${error.message}`);
    }
  }

  async function handleEditCambioTurno(e) {
    e.preventDefault();
    if (!editingCambioId) return;
    if (!cambioEmp1.trim() || !cambioEmp2.trim() || !cambioFecha1 || !cambioHoraEnt1 || !cambioHoraSal1 || !cambioFecha2 || !cambioHoraEnt2 || !cambioHoraSal2) return;

    const actor = profileName || session.user.email;

    const { error } = await supabase
      .from('cambios_turno')
      .update({
        empleado_1: cambioEmp1.trim(),
        empleado_2: cambioEmp2.trim(),
        fecha_turno_1: cambioFecha1,
        hora_entrada_1: cambioHoraEnt1,
        hora_salida_1: cambioHoraSal1,
        fecha_turno_2: cambioFecha2,
        hora_entrada_2: cambioHoraEnt2,
        hora_salida_2: cambioHoraSal2,
        observaciones: cambioObs.trim() || null,
      })
      .eq('id', editingCambioId);

    if (!error) {
      await loadCambiosTurno();
      await addLog('Editó cambio de turno', `${cambioEmp1.trim()} ↔ ${cambioEmp2.trim()}`);
      setCambioEmp1('');
      setCambioEmp2('');
      setCambioFecha1('');
      setCambioHoraEnt1('');
      setCambioHoraSal1('');
      setCambioFecha2('');
      setCambioHoraEnt2('');
      setCambioHoraSal2('');
      setCambioObs('');
      setEditingCambioId(null);
    }
  }

  async function deleteCambioTurno(item) {
    setCambiosTurno((prev) => prev.filter((c) => c.id !== item.id));
    const { error } = await supabase.from('cambios_turno').delete().eq('id', item.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      await loadCambiosTurno();
    } else {
      await addLog('Eliminó cambio de turno', `${item.empleado_1} ↔ ${item.empleado_2}`);
    }
  }

  // ESTADÍSTICAS Y HORAS PUNTA
  async function handleAddActividad(e) {
    e.preventDefault();
    if (!actFecha || !actPuntoVenta || !actFranjaInicio || !actFranjaFin) return;

    const actor = profileName || session.user.email;
    const franjaHoraria = `${actFranjaInicio} - ${actFranjaFin}`;

    const { data, error } = await supabase
      .from('actividad_horaria')
      .insert([
        {
          fecha: actFecha,
          punto_venta: actPuntoVenta,
          franja_horaria: franjaHoraria,
          nivel_actividad: actNivel,
          num_empleados: actEmpleados ? Number(actEmpleados) : null,
          observaciones: actObs.trim() || null,
          creado_por: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setActividadHoraria((prev) => [data, ...prev]);
      await addLog('Registró actividad horaria', `${actPuntoVenta} · ${franjaHoraria}`);
      setActFecha(toLocalDateStr(new Date()));
      setActPuntoVenta('Thalassa');
      setActFranjaInicio('08:00');
      setActFranjaFin('09:00');
      setActNivel('medio');
      setActEmpleados('');
      setActObs('');
      setEditingActividadId(null);
    } else if (error) {
      alert(`Error al registrar: ${error.message}`);
    }
  }

  async function handleEditActividad(e) {
    e.preventDefault();
    if (!editingActividadId) return;
    if (!actFecha || !actPuntoVenta || !actFranjaInicio || !actFranjaFin) return;

    const actor = profileName || session.user.email;
    const franjaHoraria = `${actFranjaInicio} - ${actFranjaFin}`;

    const { error } = await supabase
      .from('actividad_horaria')
      .update({
        fecha: actFecha,
        punto_venta: actPuntoVenta,
        franja_horaria: franjaHoraria,
        nivel_actividad: actNivel,
        num_empleados: actEmpleados ? Number(actEmpleados) : null,
        observaciones: actObs.trim() || null,
      })
      .eq('id', editingActividadId);

    if (!error) {
      await loadActividadHoraria();
      await addLog('Editó actividad horaria', `${actPuntoVenta} · ${franjaHoraria}`);
      setActFecha(toLocalDateStr(new Date()));
      setActPuntoVenta('Thalassa');
      setActFranjaInicio('08:00');
      setActFranjaFin('09:00');
      setActNivel('medio');
      setActEmpleados('');
      setActObs('');
      setEditingActividadId(null);
    } else if (error) {
      alert(`Error al editar: ${error.message}`);
    }
  }

  async function deleteActividad(item) {
    setActividadHoraria((prev) => prev.filter((a) => a.id !== item.id));
    const { error } = await supabase.from('actividad_horaria').delete().eq('id', item.id);
    if (error) {
      alert(`No se pudo borrar: ${error.message}`);
      await loadActividadHoraria();
    } else {
      await addLog('Eliminó actividad horaria', `${item.punto_venta} · ${item.franja_horaria}`);
    }
  }

  // AVISOS DE ÚLTIMA HORA
  async function handleAddAviso(e) {
    e.preventDefault();
    if (!avisoTitulo.trim() || !avisoMensaje.trim()) return;

    const actor = profileName || session.user.email;

    const { data, error } = await supabase
      .from('avisos_ultima_hora')
      .insert([
        {
          titulo: avisoTitulo.trim(),
          mensaje: avisoMensaje.trim(),
          prioridad: avisoPrioridad,
          fecha_expiracion: avisoFechaExpiracion || null,
          creado_por: actor,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setAvisos((prev) => [data, ...prev]);
      await addLog('Registró aviso última hora', avisoTitulo.trim());
      setAvisoTitulo('');
      setAvisoMensaje('');
      setAvisoPrioridad('alta');
      setAvisoFechaExpiracion('');
      setEditingAvisoId(null);
    } else if (error) {
      alert(`Error al registrar aviso: ${error.message}`);
    }
  }

  async function handleEditAviso(e) {
    e.preventDefault();
    if (!editingAvisoId) return;
    if (!avisoTitulo.trim() || !avisoMensaje.trim()) return;

    const actor = profileName || session.user.email;

    const { error } = await supabase
      .from('avisos_ultima_hora')
      .update({
        titulo: avisoTitulo.trim(),
        mensaje: avisoMensaje.trim(),
        prioridad: avisoPrioridad,
        fecha_expiracion: avisoFechaExpiracion || null,
      })
      .eq('id', editingAvisoId);

    if (!error) {
      await loadAvisos();
      await addLog('Editó aviso última hora', avisoTitulo.trim());
      setAvisoTitulo('');
      setAvisoMensaje('');
      setAvisoPrioridad('alta');
      setAvisoFechaExpiracion('');
      setEditingAvisoId(null);
    } else if (error) {
      alert(`Error al editar aviso: ${error.message}`);
    }
  }

  async function cerrarAviso(item) {
    setAvisos((prev) => prev.filter((a) => a.id !== item.id));
    const { error } = await supabase.from('avisos_ultima_hora').delete().eq('id', item.id);
    if (error) {
      alert(`No se pudo cerrar: ${error.message}`);
      await loadAvisos();
    } else {
      await addLog('Cerró aviso', item.titulo);
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center text-sm">
        <div className="flex items-center gap-2.5 bg-blue-50 border-2 border-blue-600 px-4 py-3 rounded-2xl">
          <Sparkles className="w-4 h-4 text-slate-900 animate-pulse" />
          <span className="font-bold">Cargando F&amp;B Control...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border-2 border-slate-900 rounded-3xl p-6 space-y-5 shadow-md">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center px-3.5 h-12 rounded-2xl bg-blue-600 border-2 border-blue-900 text-white font-black text-base tracking-wider mb-1">
              F&amp;B
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">F&amp;B Control</h1>
            <p className="text-xs text-slate-600">Operativa de Bares, Restaurantes y Salones</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu usuario"
                  className="w-full bg-blue-50/40 border-2 border-slate-900 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-blue-50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-blue-50/40 border-2 border-slate-900 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-blue-50 transition"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-800 bg-rose-100 border border-rose-400 rounded-xl px-3 py-2 font-semibold">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full bg-blue-900 hover:bg-blue-800 text-blue-600 font-black py-2.5 rounded-xl text-sm border-2 border-blue-900 transition"
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

  const tomorrowBanquetsPendingMount = banquetEvents.filter(
    (b) => b.event_date === tomorrowStr && !isSalonReady(b)
  );

  const todayCalendarNotices = events.filter((ev) => ev.event_date === todayStr);
  const tomorrowCalendarNotices = events.filter((ev) => ev.event_date === tomorrowStr);

  const activeDayComplaintsAlerts = complaints.filter((c) => {
    const cDate = c.complaint_date || todayStr;
    return c.status !== 'cerrada' && cDate === todayStr;
  });

  const todayPendingItems = tasks.filter(
    (t) =>
      t.section === 'pending' &&
      matchesOutlet(t.outlet) &&
      (isSameLocalDay(t.due_date, todayStr) || isSameLocalDay(t.created_at, todayStr)) &&
      matchesSearch(`${t.title} ${t.notes || ''} ${t.outlet}`)
  );

  const todayComplaintsItems = complaints.filter(
    (c) =>
      matchesOutlet(c.outlet) &&
      (isSameLocalDay(c.complaint_date, todayStr) || isSameLocalDay(c.created_at, todayStr)) &&
      matchesSearch(`${c.room_number} ${c.complaint_text} ${c.manager_response || ''} ${c.outlet}`)
  );

  const todayIncidencesItems = incidences.filter(
    (inc) =>
      matchesOutlet(inc.outlet) &&
      isSameLocalDay(inc.created_at, todayStr) &&
      matchesSearch(`${inc.title} ${inc.details || ''} ${inc.outlet}`)
  );

  const todayRoomRequestsItems = roomRequests.filter(
    (r) =>
      matchesOutlet(r.outlet) &&
      (isSameLocalDay(r.request_date, todayStr) || isSameLocalDay(r.created_at, todayStr)) &&
      matchesSearch(`${r.room_number} ${r.request_text} ${r.notes || ''} ${r.outlet}`)
  );

  const filteredHandovers = handovers.filter(
    (h) =>
      matchesOutlet(h.outlet) &&
      (!onlyOpenFilter || !h.resolved) &&
      matchesSearch(`${h.title} ${h.details || ''} ${h.outlet}`)
  );

  const filteredIncidences = incidences.filter(
    (inc) =>
      matchesOutlet(inc.outlet) &&
      (!onlyOpenFilter || inc.status !== 'resuelta') &&
      matchesSearch(`${inc.title} ${inc.details || ''} ${inc.outlet}`)
  );

  const filteredRoomRequests = roomRequests.filter(
    (r) =>
      matchesOutlet(r.outlet) &&
      (!onlyOpenFilter || r.status !== 'atendida') &&
      matchesSearch(`${r.room_number} ${r.request_text} ${r.notes || ''} ${r.outlet}`)
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
      matchesSearch(
        `${c.room_number} ${c.complaint_text} ${c.manager_response} ${c.complaint_date || ''} ${c.outlet}`
      )
  );

  const banquetsForDate = banquetEvents.filter(
    (b) =>
      b.event_date === banquetDate &&
      matchesSearch(
        `${b.salon_name} ${b.event_name} ${b.last_minute_notes || ''} ${b.setup_status || ''}`
      )
  );

  const visibleCalendarEvents = events.filter((ev) => {
    const dateMatch = showAllCalendarEvents || ev.event_date === calendarDate;
    return dateMatch && matchesSearch(`${ev.title} ${ev.details || ''} ${ev.outlet} ${ev.event_date}`);
  });

  const overdueTasks = tasks.filter(
    (t) =>
      matchesOutlet(t.outlet) &&
      t.section === 'pending' &&
      !t.completed &&
      t.due_date &&
      t.due_date < todayStr
  );

  const tasksDueTomorrow = tasks.filter(
    (t) =>
      matchesOutlet(t.outlet) &&
      t.section === 'pending' &&
      !t.completed &&
      t.due_date === tomorrowStr
  );

  const highSeverityIncidences = incidences.filter(
    (inc) =>
      matchesOutlet(inc.outlet) &&
      inc.severity === 'alta' &&
      inc.status !== 'resuelta'
  );

  const pendingTasksTotal = tasks.filter(
    (t) =>
      matchesOutlet(t.outlet) &&
      t.section === 'pending' &&
      !t.completed
  );

  const pendingTasksOnTime = pendingTasksTotal.filter(
    (t) => !t.due_date || t.due_date >= todayStr
  );

  const openIncidencesTotal = incidences.filter(
    (inc) => matchesOutlet(inc.outlet) && inc.status !== 'resuelta'
  );

  const openComplaintsTotal = complaints.filter(
    (c) => matchesOutlet(c.outlet) && c.status !== 'cerrada'
  );

  const pendingRoomRequestsTotal = roomRequests.filter(
    (r) => matchesOutlet(r.outlet) && r.status !== 'atendida'
  );

  const upcomingEvents = events
    .filter((ev) => matchesOutlet(ev.outlet) && ev.event_date >= todayStr)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5);

  // ESTADÍSTICAS Y HORAS PUNTA - variables computadas
  const filteredActividad = actividadHoraria.filter((a) => {
    if (actFiltroPunto !== 'Todos' && a.punto_venta !== actFiltroPunto) return false;
    if (actFiltroFecha && a.fecha !== actFiltroFecha) return false;
    return true;
  });

  const actividadPorPunto = {};
  filteredActividad.forEach((a) => {
    if (!actividadPorPunto[a.punto_venta]) actividadPorPunto[a.punto_venta] = 0;
    const nivelPeso = { bajo: 1, medio: 2, alto: 3, muy_alto: 4 }[a.nivel_actividad] || 0;
    actividadPorPunto[a.punto_venta] += nivelPeso;
  });

  const puntoMasActivo = Object.entries(actividadPorPunto).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const actividadPorFranja = {};
  filteredActividad.forEach((a) => {
    if (!actividadPorFranja[a.franja_horaria]) actividadPorFranja[a.franja_horaria] = 0;
    const nivelPeso = { bajo: 1, medio: 2, alto: 3, muy_alto: 4 }[a.nivel_actividad] || 0;
    actividadPorFranja[a.franja_horaria] += nivelPeso;
  });

  const franjaPunta = Object.entries(actividadPorFranja).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const diaNombreIndex = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

  function franjaCubreHora(franjaStr, horaStr) {
    if (!franjaStr) return false;
    const partes = franjaStr.split(' - ');
    if (partes.length !== 2) return false;
    const [hInicio, mInicio] = partes[0].split(':').map(Number);
    const [hFin, mFin] = partes[1].split(':').map(Number);
    const [hCelda, mCelda] = horaStr.split(':').map(Number);
    const inicioMin = hInicio * 60 + mInicio;
    const finMin = hFin * 60 + mFin;
    const celdaMin = hCelda * 60 + mCelda;
    return celdaMin >= inicioMin && celdaMin < finMin;
  }

  function celdaCalorColor(dia, hora) {
    const registrosCelda = filteredActividad.filter((a) => {
      const fechaObj = new Date(a.fecha);
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaObj.getDay()];
      return diaSemana === dia && franjaCubreHora(a.franja_horaria, hora);
    });

    if (registrosCelda.length === 0) return 'bg-slate-50';
    const niveles = registrosCelda.map((a) => ({ bajo: 1, medio: 2, alto: 3, muy_alto: 4 }[a.nivel_actividad] || 0));
    const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;

    if (promedio >= 3.5) return 'bg-rose-200';
    if (promedio >= 2.5) return 'bg-orange-200';
    if (promedio >= 1.5) return 'bg-blue-200';
    return 'bg-green-200';
  }

  function celdaCalorValor(dia, hora) {
    const registrosCelda = filteredActividad.filter((a) => {
      const fechaObj = new Date(a.fecha);
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaObj.getDay()];
      return diaSemana === dia && franjaCubreHora(a.franja_horaria, hora);
    });

    if (registrosCelda.length === 0) return '';
    const niveles = registrosCelda.map((a) => ({ bajo: 1, medio: 2, alto: 3, muy_alto: 4 }[a.nivel_actividad] || 0));
    const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;
    return promedio.toFixed(1);
  }

  const firstDayOfMonthObj = new Date(calViewYear, calViewMonth, 1);
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const startOffset = (firstDayOfMonthObj.getDay() + 6) % 7;
  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const countForDay = events.filter((ev) => ev.event_date === dateStr).length;
    calendarCells.push({ day: d, dateStr, count: countForDay });
  }

  function shiftCalendarMonth(delta) {
    const next = new Date(calViewYear, calViewMonth + delta, 1);
    setCalViewYear(next.getFullYear());
    setCalViewMonth(next.getMonth());
  }

  const showComplaintsInCurrentView = activeTab !== 'salones';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16">
      <header className="sticky top-0 z-20 bg-white border-b-2 border-blue-900/20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="px-2.5 h-9 rounded-xl bg-blue-600 border-2 border-blue-900 flex items-center justify-center text-white font-black text-xs tracking-wider">
              F&amp;B
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                F&amp;B Control
              </h1>
              <p className="text-[11px] font-semibold text-slate-600">
                {DAY_NAMES[dayOfWeek]} {today.toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 px-3 py-1.5 rounded-xl border-2 border-blue-600 text-blue-900 font-black">
              {profileName}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white border-2 border-blue-900 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {(todayCalendarNotices.length > 0 || tomorrowCalendarNotices.length > 0) && (
          <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                <CalendarDays className="w-4 h-4 text-slate-900 shrink-0" />
                <span>Avisos de Calendario Sincronizados</span>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-[11px] font-black bg-blue-900 text-blue-600 px-2.5 py-1 rounded-lg"
              >
                Abrir Calendario
              </button>
            </div>
            <div className="space-y-1">
              {todayCalendarNotices.map((ev) => (
                <p key={ev.id} className="text-xs font-bold text-slate-900">
                  • <strong>HOY ({ev.event_date})</strong> · {ev.title}{' '}
                  {ev.details ? `— ${ev.details}` : ''}
                </p>
              ))}
              {tomorrowCalendarNotices.map((ev) => (
                <p key={ev.id} className="text-xs font-semibold text-slate-900">
                  • <strong>MAÑANA ({ev.event_date})</strong> · {ev.title}{' '}
                  {ev.details ? `— ${ev.details}` : ''}
                </p>
              ))}
            </div>
          </div>
        )}

        {activeDayComplaintsAlerts.length > 0 && activeTab !== 'salones' && (
          <div className="bg-blue-100 border-2 border-blue-900 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                <BellRing className="w-4 h-4 text-slate-900 shrink-0" />
                <span>Aviso Quejas del Día ({todayStr}) · Activo todo el día</span>
              </div>
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-[11px] font-black bg-blue-900 text-blue-600 px-2.5 py-1 rounded-lg"
              >
                Ver Quejas/VIP
              </button>
            </div>
            <div className="space-y-1">
              {activeDayComplaintsAlerts.map((c) => (
                <p key={c.id} className="text-xs font-bold text-slate-900">
                  • Hab. {c.room_number} ({c.outlet}) — {c.complaint_text}
                </p>
              ))}
            </div>
          </div>
        )}

        {tomorrowBanquetsPendingMount.length > 0 && (
          <div className="bg-blue-100 border-2 border-blue-900 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
                <BellRing className="w-4 h-4 text-slate-900 shrink-0" />
                <span>Salones por montar para mañana ({tomorrowStr})</span>
              </div>
              <button
                onClick={() => {
                  setBanquetDate(tomorrowStr);
                  setActiveTab('salones');
                }}
                className="text-[11px] font-black text-blue-600 bg-blue-900 hover:bg-blue-800 px-2.5 py-1 rounded-lg"
              >
                Ver Salones
              </button>
            </div>
            <div className="space-y-1">
              {tomorrowBanquetsPendingMount.map((ev) => (
                <p key={ev.id} className="text-xs font-semibold text-slate-900">
                  • <strong>{ev.salon_name}</strong> ({ev.start_time} · {ev.pax} PAX) —{' '}
                  <span className="font-black underline">{ev.event_name}</span>
                  {ev.last_minute_change ? ' [CAMBIO ÚLTIMA HORA]' : ''}
                </p>
              ))}
            </div>
          </div>
        )}

        {(isFirstOfMonth || isOrderDay) && (
          <div className="space-y-2">
            {isFirstOfMonth && (
              <div className="bg-blue-200 border-2 border-blue-900 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-900">
                  <p className="font-black uppercase tracking-wide">
                    Día 1 de Mes · {selectedOutlet}
                  </p>
                  <p className="font-semibold mt-0.5">
                    Cambiar <strong>hojas de temperaturas APPCC</strong> y <strong>hojas de traspasos</strong>.
                  </p>
                </div>
              </div>
            )}

            {isOrderDay && (
              <div className="bg-blue-100 border-2 border-blue-900 rounded-2xl p-3.5 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-900">
                  <p className="font-black uppercase tracking-wide">
                    Hoy es {DAY_NAMES[dayOfWeek]} · Día de Pedidos
                  </p>
                  <p className="font-semibold mt-0.5">
                    Aviso de pedidos: hoy toca hacer pedidos (los pedidos se hacen los{' '}
                    <strong>domingos, lunes y miércoles</strong>).
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
                onClick={() => {
                  setSelectedOutlet(outlet);
                  if (outlet === 'Salones') setActiveTab('salones');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap border-2 transition ${
                  active
                    ? 'bg-blue-900 text-blue-600 border-blue-900'
                    : 'bg-white text-slate-900 border-blue-900 hover:bg-blue-100'
                }`}
              >
                {outlet}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar habitación, salón, queja, incidencia o evento..."
              className="w-full bg-white border-2 border-blue-900 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-blue-50"
            />
          </div>
          <button
            onClick={() => setOnlyOpenFilter(!onlyOpenFilter)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition shrink-0 ${
              onlyOpenFilter
                ? 'bg-blue-600 border-blue-900 text-slate-900'
                : 'bg-white border-blue-900 text-slate-900 hover:bg-blue-100'
            }`}
          >
            {onlyOpenFilter ? 'Mostrando solo abiertos' : 'Ver todos'}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-blue-50 p-1.5 rounded-2xl border-2 border-blue-900">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'resumen'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('relevo')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'relevo'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <ArrowRightCircle className="w-4 h-4" />
            <span>Relevo</span>
          </button>

          <button
            onClick={() => setActiveTab('salones')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'salones'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Salones</span>
          </button>

          <button
            onClick={() => setActiveTab('incidencias')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'incidencias'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Incidencias</span>
          </button>

          <button
            onClick={() => setActiveTab('habitaciones')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'habitaciones'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Habitaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'complaints'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-blue-100 text-slate-900 border border-blue-900 hover:bg-blue-600'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>Quejas/VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'checklist'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'pending'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Pendientes</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`col-span-4 sm:col-span-8 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-black transition ${
              activeTab === 'calendar'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Calendario</span>
          </button>

          <button
            onClick={() => setActiveTab('cambiosTurno')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'cambiosTurno'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Cambios Turno</span>
          </button>

          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'estadisticas'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('avisos')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-black transition ${
              activeTab === 'avisos'
                ? 'bg-blue-900 text-blue-600'
                : 'bg-white text-slate-900 border border-slate-900 hover:bg-blue-100'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Avisos</span>
          </button>
        </div>

        {showComplaintsInCurrentView && activeTab !== 'complaints' && (
          <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MessageSquareWarning className="w-4 h-4 text-slate-900 shrink-0" />
              <span>
                Apartado <strong>Quejas/VIP</strong> disponible en este punto ({activeDayComplaintsAlerts.length}{' '}
                aviso(s) hoy)
              </span>
            </div>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-xs font-black bg-blue-600 hover:bg-blue-100 text-slate-900 border-2 border-blue-900 px-3 py-1 rounded-xl shrink-0"
            >
              Abrir Quejas/VIP
            </button>
          </div>
        )}

        {/* AVISOS DE ÚLTIMA HORA - PRIMERA LÍNEA */}
        {avisos.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 space-y-2 mb-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                  Avisos de Última Hora ({avisos.length})
                </span>
              </div>
              <button
                onClick={() => setActiveTab('avisos')}
                className="text-[11px] font-black bg-blue-900 text-white px-2.5 py-1 rounded-lg border border-blue-600 hover:bg-blue-800 transition"
              >
                Gestionar Avisos
              </button>
            </div>
            <div className="space-y-1.5">
              {avisos.map((a) => {
                const isAlta = a.prioridad === 'alta';
                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      isAlta
                        ? 'bg-rose-100 border-rose-400 shadow-sm'
                        : 'bg-blue-50 border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            isAlta
                              ? 'bg-rose-200 text-rose-700 border-rose-400 animate-pulse'
                              : 'bg-blue-200 text-blue-700 border-blue-400'
                          }`}
                        >
                          {a.prioridad.toUpperCase()}
                        </span>
                        {isAlta && (
                          <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded">
                            URGENTE
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-600 ml-2">
                          Por {a.creado_por}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{a.titulo}</p>
                      <p className="text-xs font-medium text-slate-700 mt-0.5">{a.mensaje}</p>
                      {a.fecha_expiracion && (
                        <p className="text-[10px] font-black text-slate-500 mt-0.5">
                          Vence: {a.fecha_expiracion}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => cerrarAviso(a)}
                      className={`p-1.5 rounded-lg border ${
                        isAlta
                          ? 'text-rose-600 hover:bg-rose-200 border-rose-300'
                          : 'text-blue-600 hover:bg-blue-100 border-blue-300'
                      } transition`}
                      title="Cerrar aviso"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESUMEN DIARIO */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Resumen Diario del Día ({todayStr}) · {selectedOutlet}
                </p>
                <p className="text-sm text-slate-900 font-bold mt-0.5">
                  Todo lo anotado hoy en Pendientes, Quejas, Incidencias y Habitaciones.
                </p>
              </div>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-100 border-2 border-blue-900 text-xs font-black text-slate-900 shrink-0"
                >
                  + Nueva Queja / VIP
                </button>
              </div>

              {overdueTasks.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-3.5 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>Tareas vencidas ({overdueTasks.length})</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className="text-[11px] font-black bg-blue-900 text-blue-600 px-2.5 py-1 rounded-lg"
                    >
                      Ver Pendientes
                    </button>
                  </div>
                  <div className="space-y-1">
                    {overdueTasks.map((t) => (
                      <p key={t.id} className="text-xs font-bold text-slate-900">
                        • [{t.outlet}] {t.title} · vencida el {t.due_date}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {tasksDueTomorrow.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-3.5 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <CalendarClock className="w-4 h-4 text-slate-900 shrink-0" />
                      <span>Tareas que vencen mañana ({tasksDueTomorrow.length})</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className="text-[11px] font-black bg-blue-900 text-blue-600 px-2.5 py-1 rounded-lg"
                    >
                      Ver Pendientes
                    </button>
                  </div>
                  <div className="space-y-1">
                    {tasksDueTomorrow.map((t) => (
                      <p key={t.id} className="text-xs font-bold text-slate-900">
                        • [{t.outlet}] {t.title} · vence mañana
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {highSeverityIncidences.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-3.5 space-y-1.5 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>Incidencias de gravedad alta abiertas ({highSeverityIncidences.length})</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('incidencias')}
                      className="text-[11px] font-black bg-blue-900 text-blue-600 px-2.5 py-1 rounded-lg"
                    >
                      Ver Incidencias
                    </button>
                  </div>
                  <div className="space-y-1">
                    {highSeverityIncidences.map((inc) => (
                      <p key={inc.id} className="text-xs font-bold text-slate-900">
                        • [{inc.outlet}] {inc.title} · {inc.severity}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <button
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setActiveTab('pending');
                  }}
                  className={`bg-white border-2 rounded-2xl p-3 text-left transition hover:shadow-sm ${
                    overdueTasks.length > 0
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CalendarClock className="w-5 h-5 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        Tareas Pendientes
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {pendingTasksTotal.length}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5 ${
                        overdueTasks.length > 0 ? 'text-rose-700' : 'text-slate-600'
                      }">
                        {pendingTasksOnTime.length} en plazo ·
                        {overdueTasks.length} vencidas
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('incidencias')}
                  className={`bg-white border-2 rounded-2xl p-3 text-left transition hover:shadow-sm ${
                    highSeverityIncidences.length > 0
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertOctagon className="w-5 h-5 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        Incidencias Abiertas
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {openIncidencesTotal.length}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5 ${
                        highSeverityIncidences.length > 0
                          ? 'text-rose-700'
                          : 'text-slate-600'
                      }">
                        {highSeverityIncidences.length} gravedad alta
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`bg-white border-2 rounded-2xl p-3 text-left transition hover:shadow-sm ${
                    openComplaintsTotal.length > 0
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquareWarning className="w-5 h-5 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        Quejas / VIP
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {openComplaintsTotal.length}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5 text-slate-600">
                        Pendientes de respuesta
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('habitaciones')}
                  className={`bg-white border-2 rounded-2xl p-3 text-left transition hover:shadow-sm ${
                    pendingRoomRequestsTotal.length > 0
                      ? 'border-sky-400 bg-sky-50/50'
                      : 'border-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <BedDouble className="w-5 h-5 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        Habitaciones Pendientes
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {pendingRoomRequestsTotal.length}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5 text-slate-600">
                        Por atender
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="bg-white border-2 border-blue-900 rounded-2xl p-3 text-left transition hover:shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-5 h-5 text-slate-900 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                        Próximos Eventos
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">
                        {upcomingEvents.length}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5 text-slate-600">
                        Próximos servicios
                      </p>
                    </div>
                  </div>
                </button>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4" />
                    <span>Pendientes del día ({todayPendingItems.length})</span>
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedDate(todayStr);
                      setActiveTab('pending');
                    }}
                    className="text-[11px] font-black underline text-slate-900"
                  >
                    Ir a Pendientes
                  </button>
                </div>

                {todayPendingItems.length === 0 ? (
                  <p className="text-xs text-slate-600">No hay pendientes escritos hoy.</p>
                ) : (
                  todayPendingItems.map((t) => (
                    <div
                      key={t.id}
                      className={`border-2 border-blue-900 rounded-xl p-2.5 text-xs text-slate-900 ${
                        t.completed ? 'bg-slate-100 opacity-70' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black">
                          [{t.outlet}] {t.title}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {t.completed ? 'Hecho' : 'Pendiente'}
                        </span>
                      </div>
                      {t.notes && <p className="text-slate-700 font-medium mt-0.5">{t.notes}</p>}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <MessageSquareWarning className="w-4 h-4" />
                    <span>Quejas / VIP del día ({todayComplaintsItems.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-[11px] font-black underline text-slate-900"
                  >
                    Ir a Quejas/VIP
                  </button>
                </div>

                {todayComplaintsItems.length === 0 ? (
                  <p className="text-xs text-slate-600">No hay quejas registradas hoy.</p>
                ) : (
                  todayComplaintsItems.map((c) => (
                    <div
                      key={c.id}
                      className={`border-2 border-blue-900 rounded-xl p-2.5 text-xs text-slate-900 ${
                        c.status === 'cerrada' ? 'bg-slate-100 opacity-70' : 'bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black">
                          Hab. {c.room_number} · {c.outlet} ({c.record_type})
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {c.status}
                        </span>
                      </div>
                      <p className="font-bold mt-0.5">{c.complaint_text}</p>
                      {c.manager_response && (
                        <p className="text-[11px] font-semibold mt-0.5">Gestión: {c.manager_response}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>Incidencias del día ({todayIncidencesItems.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('incidencias')}
                    className="text-[11px] font-black underline text-slate-900"
                  >
                    Ir a Incidencias
                  </button>
                </div>

                {todayIncidencesItems.length === 0 ? (
                  <p className="text-xs text-slate-600">No hay incidencias registradas hoy.</p>
                ) : (
                  todayIncidencesItems.map((inc) => (
                    <div
                      key={inc.id}
                      className={`border-2 border-blue-900 rounded-xl p-2.5 text-xs text-slate-900 ${
                        inc.status === 'resuelta' ? 'bg-slate-100 opacity-70' : 'bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black">
                          [{inc.outlet}] {inc.title}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {inc.severity} · {inc.status}
                        </span>
                      </div>
                      {inc.details && <p className="text-slate-800 font-medium mt-0.5">{inc.details}</p>}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4" />
                    <span>Habitaciones del día ({todayRoomRequestsItems.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('habitaciones')}
                    className="text-[11px] font-black underline text-slate-900"
                  >
                    Ir a Habitaciones
                  </button>
                </div>

                {todayRoomRequestsItems.length === 0 ? (
                  <p className="text-xs text-slate-600">No hay peticiones de habitaciones hoy.</p>
                ) : (
                  todayRoomRequestsItems.map((r) => (
                    <div
                      key={r.id}
                      className={`border-2 border-blue-900 rounded-xl p-2.5 text-xs text-slate-900 ${
                        r.status === 'atendida' ? 'bg-slate-100 opacity-70' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black">
                          Hab. {r.room_number} · {r.outlet}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {r.status}
                        </span>
                      </div>
                      <p className="font-bold mt-0.5">{r.request_text}</p>
                      {r.notes && <p className="text-slate-700 font-medium mt-0.5">{r.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* RELEVO */}
        {activeTab === 'relevo' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddHandover}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Nuevo parte para relevo ({activeOutletForWrite})
                </h2>
                <div className="flex gap-1.5">
                  <select
                    value={handoverType}
                    onChange={(e) => setHandoverType(e.target.value)}
                    className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                  >
                    <option value="relevo">Parte de relevo</option>
                    <option value="stock_86">Stock bajo / 86&apos;d</option>
                    <option value="depto">Cocina / SAT / Recepción</option>
                    <option value="vip">Aviso VIP / Grupo</option>
                  </select>
                  <select
                    value={handoverPriority}
                    onChange={(e) => setHandoverPriority(e.target.value)}
                    className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                  >
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={handoverTitle}
                onChange={(e) => setHandoverTitle(e.target.value)}
                placeholder="Ej. Cómo quedó el turno, cierres, pendientes..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />

              <input
                type="text"
                value={handoverDetails}
                onChange={(e) => setHandoverDetails(e.target.value)}
                placeholder="Detalle o acción acordada..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white border-2 border-blue-900 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-blue-100">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{handoverFile ? handoverFile.name : 'Adjuntar foto o archivo'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setHandoverFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 border-2 border-blue-900"
                >
                  <Plus className="w-4 h-4" />
                  {uploadingFile ? 'Subiendo...' : 'Publicar'}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {filteredHandovers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay avisos de relevo en esta vista.
                </div>
              ) : (
                filteredHandovers.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border-2 border-blue-900 rounded-2xl p-3.5 flex items-start justify-between gap-3 ${
                      item.resolved ? 'opacity-60 bg-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button onClick={() => toggleHandover(item)} className="mt-0.5 shrink-0">
                        {item.resolved ? (
                          <CheckCheck className="w-5 h-5 text-slate-900" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-900" />
                        )}
                      </button>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
                            {item.outlet}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                            {item.item_type}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-black ${
                            item.resolved ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.details && <p className="text-xs font-medium text-slate-700">{item.details}</p>}
                        <AttachmentPreview
                          url={item.attachment_url}
                          name={item.attachment_name}
                          onOpenImage={setPreviewImageUrl}
                        />
                        <p className="text-[11px] font-semibold text-slate-600">
                          Por {item.created_by}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHandover(item)}
                      className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                      title="Borrar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SALONES */}
        {activeTab === 'salones' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddBanquetEvent}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Nuevo Evento en Salón (se añade al calendario del día)
                </h2>
                <input
                  type="date"
                  value={banquetDate}
                  onChange={(e) => setBanquetDate(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
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
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paxCount}
                    onChange={(e) => setPaxCount(e.target.value)}
                    placeholder="PAX"
                    className="w-20 bg-white border-2 border-blue-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                  />
                  <select
                    value={setupType}
                    onChange={(e) => setSetupType(e.target.value)}
                    className="flex-1 bg-white border-2 border-blue-900 rounded-xl px-2 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Banquete">Banquete</option>
                    <option value="Escuela">Escuela</option>
                    <option value="Cóctel">Cóctel</option>
                    <option value="Coffee Break">Coffee Break</option>
                    <option value="Imperial">Imperial</option>
                  </select>
                </div>
                <select
                  value={salonMountState}
                  onChange={(e) => setSalonMountState(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-black text-slate-900"
                >
                  <option value="Falta por montar">Falta por montar</option>
                  <option value="Terminado / Montado">Terminado / Montado</option>
                </select>
              </div>

              <input
                type="text"
                required
                value={banquetName}
                onChange={(e) => setBanquetName(e.target.value)}
                placeholder="Nombre del evento, grupo o empresa..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={allergensNotes}
                  onChange={(e) => setAllergensNotes(e.target.value)}
                  placeholder="Alérgenos / dietas especiales..."
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  value={extrasNotes}
                  onChange={(e) => setExtrasNotes(e.target.value)}
                  placeholder="Material o extras..."
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="bg-blue-100/70 border-2 border-blue-900 rounded-xl p-2.5 space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lastMinuteChange}
                      onChange={(e) => setLastMinuteChange(e.target.checked)}
                      className="w-4 h-4 accent-slate-950"
                    />
                    <span>Cambios de última hora</span>
                  </label>
                  <input
                    type="text"
                    value={lastMinuteNotes}
                    onChange={(e) => {
                      setLastMinuteNotes(e.target.value);
                      if (e.target.value.trim()) setLastMinuteChange(true);
                    }}
                    placeholder="Escribe aquí los cambios de última hora..."
                    className="w-full bg-white border-2 border-blue-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div className="bg-white border-2 border-blue-900 rounded-xl p-2.5 space-y-1.5">
                  <span className="block text-xs font-black text-slate-900">Pendiente</span>
                  <input
                    type="text"
                    value={salonPendingNotes}
                    onChange={(e) => setSalonPendingNotes(e.target.value)}
                    placeholder="Escribe aquí las cosas pendientes por hacer..."
                    className="w-full bg-blue-50 border-2 border-blue-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white border-2 border-blue-900 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-blue-100">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{banquetFile ? banquetFile.name : 'Adjuntar archivo o foto'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBanquetFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl text-xs border-2 border-blue-900"
                >
                  {uploadingFile ? 'Subiendo archivo...' : 'Guardar evento y añadir al calendario'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {SALONS.map((salon) => {
                const isOpen = !!openSalonCards[salon];
                const salonEvents = banquetsForDate.filter((b) => b.salon_name === salon);
                const hasLastMinute = salonEvents.some((b) => b.last_minute_change);
                const allReady =
                  salonEvents.length > 0 && salonEvents.every((b) => isSalonReady(b));

                return (
                  <div
                    key={salon}
                    className={`border-2 border-blue-900 rounded-2xl overflow-hidden ${
                      allReady ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSalonCard(salon)}
                      className={`w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left transition ${
                        isOpen
                          ? 'bg-blue-600'
                          : allReady
                          ? 'bg-blue-200 hover:bg-blue-100'
                          : 'bg-white hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                        <span className="text-sm font-black text-slate-900">{salon}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-900 text-blue-600 font-bold">
                          {salonEvents.length} ({banquetDate})
                        </span>
                        {salonEvents.length > 0 && (
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-900 ${
                              allReady
                                ? 'bg-white text-slate-900'
                                : 'bg-blue-100 text-slate-900'
                            }`}
                          >
                            {allReady ? 'Terminado / Montado' : 'Falta por montar'}
                          </span>
                        )}
                        {hasLastMinute && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                            Cambios de última hora
                          </span>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-900" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-900" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 border-t-2 border-blue-900 bg-blue-50/50 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-600 border-2 border-blue-900 rounded-xl px-3 py-2 text-center font-black text-xs text-slate-900">
                            Cambios de última hora
                          </div>
                          <div className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-center font-black text-xs text-slate-900">
                            Pendiente
                          </div>
                        </div>

                        {salonEvents.length === 0 ? (
                          <p className="text-xs font-semibold text-slate-600 py-1">
                            Sin eventos en {salon} para el {banquetDate}.
                          </p>
                        ) : (
                          salonEvents.map((ev) => {
                            const ready = isSalonReady(ev);
                            return (
                              <div
                                key={ev.id}
                                className={`border-2 border-blue-900 rounded-xl p-3 space-y-2.5 ${
                                  ready ? 'bg-blue-100' : 'bg-white'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                                      {ev.start_time}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" />
                                      {ev.pax} PAX · {ev.setup_type}
                                    </span>
                                    <span
                                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-900 ${
                                        ready
                                          ? 'bg-blue-900 text-blue-600'
                                          : 'bg-blue-100 text-slate-900'
                                      }`}
                                    >
                                      {ready ? 'Terminado / Montado' : 'Falta por montar'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleBanquetMountState(
                                          ev,
                                          ready ? 'falta' : 'terminado'
                                        )
                                      }
                                      className="text-[11px] font-black px-2.5 py-1 rounded-lg border-2 border-blue-900 bg-blue-600 hover:bg-blue-100 text-slate-900"
                                    >
                                      {ready
                                        ? 'Marcar: Falta por montar'
                                        : 'Marcar: Terminado / Montado'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteBanquetEvent(ev)}
                                      className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                                      title="Borrar evento"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-sm font-black text-slate-900">{ev.event_name}</p>

                                {ev.allergens_notes && (
                                  <p className="text-xs font-bold text-slate-900 bg-blue-100 border border-blue-900 rounded-lg px-2.5 py-1">
                                    Alérgenos / dietas: {ev.allergens_notes}
                                  </p>
                                )}

                                {ev.extras_notes && (
                                  <p className="text-xs font-semibold text-slate-800 bg-slate-100 border border-blue-900 rounded-lg px-2.5 py-1">
                                    Material / extras: {ev.extras_notes}
                                  </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  <div className="bg-blue-100 border border-blue-900 rounded-lg p-2 space-y-1">
                                    <span className="block text-[11px] font-black text-slate-900">
                                      Cambios de última hora
                                    </span>
                                    <input
                                      type="text"
                                      defaultValue={ev.last_minute_notes || ''}
                                      onBlur={(e) =>
                                        updateBanquetSalonItem(ev, 'last_minute', e.target.value)
                                      }
                                      placeholder="Añadir cambio de última hora..."
                                      className="w-full bg-white border border-blue-900 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                                    />
                                  </div>

                                  <div className="bg-blue-50 border border-blue-900 rounded-lg p-2 space-y-1">
                                    <span className="block text-[11px] font-black text-slate-900">
                                      Pendiente
                                    </span>
                                    <input
                                      type="text"
                                      defaultValue={ev.setup_status || 'Falta por montar'}
                                      onBlur={(e) =>
                                        updateBanquetSalonItem(ev, 'pendiente', e.target.value)
                                      }
                                      placeholder="Añadir pendiente..."
                                      className="w-full bg-white border border-blue-900 rounded px-2 py-1 text-xs font-semibold text-slate-900"
                                    />
                                  </div>
                                </div>

                                <AttachmentPreview
                                  url={ev.attachment_url}
                                  name={ev.attachment_name}
                                  onOpenImage={setPreviewImageUrl}
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INCIDENCIAS */}
        {activeTab === 'incidencias' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddIncidence}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  @Incidencias · {activeOutletForWrite}
                </h2>
                <select
                  value={incSeverity}
                  onChange={(e) => setIncSeverity(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                >
                  <option value="baja">Gravedad baja</option>
                  <option value="media">Gravedad media</option>
                  <option value="alta">Gravedad alta</option>
                </select>
              </div>

              <input
                type="text"
                required
                value={incTitle}
                onChange={(e) => setIncTitle(e.target.value)}
                placeholder="Título de la incidencia..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />

              <textarea
                rows={2}
                value={incDetails}
                onChange={(e) => setIncDetails(e.target.value)}
                placeholder="Detalles de la incidencia..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white border-2 border-blue-900 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-blue-100">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{incFile ? incFile.name : 'Adjuntar foto o archivo'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIncFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl text-xs border-2 border-blue-900"
                >
                  {uploadingFile ? 'Subiendo...' : 'Registrar incidencia'}
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {filteredIncidences.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay incidencias en esta vista.
                </div>
              ) : (
                filteredIncidences.map((inc) => (
                  <div
                    key={inc.id}
                    className={`bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2 ${
                      inc.status === 'resuelta' ? 'opacity-60 bg-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
                          {inc.outlet}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {inc.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleIncidenceStatus(inc)}
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-lg border-2 border-blue-900 bg-blue-100 text-slate-900"
                        >
                          {inc.status === 'resuelta' ? 'Resuelta ✓' : 'Abierta · Resolver'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteIncidence(inc)}
                          className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                          title="Borrar incidencia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p
                      className={`text-sm font-black ${
                        inc.status === 'resuelta' ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {inc.title}
                    </p>
                    {inc.details && <p className="text-xs font-medium text-slate-700">{inc.details}</p>}
                    <AttachmentPreview
                      url={inc.attachment_url}
                      name={inc.attachment_name}
                      onOpenImage={setPreviewImageUrl}
                    />
                    <p className="text-[11px] font-semibold text-slate-600">Por {inc.reported_by}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PETICIONES DE HABITACIONES */}
        {activeTab === 'habitaciones' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddRoomRequest}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  @Peticiones de Habitaciones ({activeOutletForWrite})
                </h2>
                <input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={reqRoom}
                  onChange={(e) => setReqRoom(e.target.value)}
                  placeholder="Nº Habitación (ej. 314)"
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  required
                  value={reqText}
                  onChange={(e) => setReqText(e.target.value)}
                  placeholder="Petición del huésped..."
                  className="sm:col-span-2 bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="flex-1 bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl text-xs border-2 border-blue-900"
                >
                  Añadir petición
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {filteredRoomRequests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay peticiones de habitaciones en esta vista.
                </div>
              ) : (
                filteredRoomRequests.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-white border-2 border-blue-900 rounded-2xl p-4 flex items-start justify-between gap-3 ${
                      r.status === 'atendida' ? 'opacity-60 bg-slate-100' : ''
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-blue-600 text-slate-900 border border-blue-900 px-2.5 py-0.5 rounded-lg text-xs font-black">
                          <BedDouble className="w-3.5 h-3.5" />
                          Hab. {r.room_number}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          {r.outlet} · {r.request_date}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-black ${
                          r.status === 'atendida' ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {r.request_text}
                      </p>
                      {r.notes && <p className="text-xs font-medium text-slate-700">{r.notes}</p>}
                      <p className="text-[11px] font-semibold text-slate-600">Por {r.created_by}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleRoomRequest(r)}
                        className="text-[11px] font-black px-2.5 py-1 rounded-lg border-2 border-blue-900 bg-blue-100 text-slate-900"
                      >
                        {r.status === 'atendida' ? 'Atendida ✓' : 'Pendiente'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRoomRequest(r)}
                        className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                        title="Borrar petición"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* QUEJAS / VIP */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddComplaint}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Casilla de Quejas / VIP ({activeOutletForWrite})
                </h2>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={complaintDate}
                    onChange={(e) => setComplaintDate(e.target.value)}
                    className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                  />
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                  >
                    <option value="queja">Queja</option>
                    <option value="vip">VIP</option>
                    <option value="solicitud">Solicitud</option>
                    <option value="cortesia">Cortesía</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-white border-2 border-blue-900 rounded-xl px-3 py-2">
                  <BedDouble className="w-4 h-4 text-slate-900 shrink-0" />
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Nº Habitación (ej. 205)"
                    className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Escribe la queja o detalle..."
                  className="sm:col-span-2 bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <input
                type="text"
                value={managerResponse}
                onChange={(e) => setManagerResponse(e.target.value)}
                placeholder="Solución o nota de seguimiento (opcional)..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white border-2 border-blue-900 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-blue-100">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{complaintFile ? complaintFile.name : 'Adjuntar foto o archivo'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setComplaintFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl text-xs border-2 border-blue-900"
                >
                  {uploadingFile ? 'Subiendo...' : 'Registrar y activar aviso del día'}
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {outletComplaints.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  Sin quejas registradas en esta vista.
                </div>
              ) : (
                outletComplaints.map((c) => {
                  const cDate = c.complaint_date || todayStr;
                  const isActiveDayNotice = c.status !== 'cerrada' && cDate === todayStr;

                  return (
                    <div
                      key={c.id}
                      className={`border-2 border-blue-900 rounded-2xl p-4 space-y-2 ${
                        c.status === 'cerrada'
                          ? 'bg-slate-100 opacity-60'
                          : isActiveDayNotice
                          ? 'bg-blue-100'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-blue-900 text-blue-600 px-2.5 py-0.5 rounded-lg text-xs font-black">
                            {c.record_type === 'vip' ? (
                              <Crown className="w-3.5 h-3.5" />
                            ) : (
                              <BedDouble className="w-3.5 h-3.5" />
                            )}
                            Hab. {c.room_number}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
                            Día {cDate} · {c.outlet}
                          </span>
                          {isActiveDayNotice && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                              Aviso activo todo el día
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleComplaintStatus(c)}
                            className="text-[11px] font-black px-2.5 py-0.5 rounded-lg border-2 border-blue-900 bg-blue-100 text-slate-900"
                          >
                            {c.status === 'cerrada' ? 'Cerrada ✓' : 'Abierta · Cerrar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteComplaint(c)}
                            className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-white"
                            title="Borrar queja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-black text-slate-900">{c.complaint_text}</p>
                      {c.manager_response && (
                        <p className="text-xs font-semibold text-slate-800 bg-white border border-blue-900 rounded-xl p-2">
                          Gestión: {c.manager_response}
                        </p>
                      )}
                      <AttachmentPreview
                        url={c.attachment_url}
                        name={c.attachment_name}
                        onOpenImage={setPreviewImageUrl}
                      />
                      <p className="text-[11px] font-semibold text-slate-600">Por {c.reported_by}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-3.5">
            <form
              onSubmit={(e) => handleAddTask(e, 'checklist')}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Añadir tarea a ${activeOutletForWrite}...`}
                  className="flex-1 min-w-[200px] bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
                <select
                  value={taskPhase}
                  onChange={(e) => setTaskPhase(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="apertura">Apertura</option>
                  <option value="servicio">Servicio</option>
                  <option value="cierre">Cierre</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0 border-2 border-blue-900"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
              <input
                type="text"
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Nota opcional..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </form>

            <div className="flex gap-1.5 overflow-x-auto">
              {SHIFT_PHASES.map((ph) => (
                <button
                  key={ph.id}
                  onClick={() => setPhaseFilter(ph.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition ${
                    phaseFilter === ph.id
                      ? 'bg-blue-600 border-blue-900 text-slate-900'
                      : 'bg-white border-blue-900 text-slate-900 hover:bg-blue-100'
                  }`}
                >
                  {ph.label}
                </button>
              ))}
            </div>

            <div className="bg-white border-2 border-blue-900 rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-slate-900">Checklist · {selectedOutlet}</span>
                <span className="font-bold text-slate-800">
                  Hechas: {completedCount} / {outletChecklist.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-blue-100 border border-blue-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {outletChecklist.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
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

        {/* PENDIENTES */}
        {activeTab === 'pending' && (
          <div className="space-y-3.5">
            <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <span className="text-xs font-black text-slate-900">
                Pendientes del día ({selectedOutlet}):
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            <form
              onSubmit={(e) => handleAddTask(e, 'pending')}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={`Pendiente para el ${selectedDate}...`}
                  className="flex-1 min-w-[200px] bg-white border-2 border-blue-900 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
                <select
                  value={taskRole}
                  onChange={(e) => setTaskRole(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
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
                  className="bg-white border-2 border-blue-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="normal">Normal</option>
                  <option value="importante">Importante</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl flex items-center gap-1 text-sm shrink-0 border-2 border-blue-900"
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
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </form>

            <div className="space-y-2">
              {outletPending.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
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

        {/* CALENDARIO CLICABLE POR DÍA + AÑADIR EVENTOS */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => shiftCalendarMonth(-1)}
                  className="p-2 rounded-xl bg-blue-100 border-2 border-blue-900 text-slate-900 hover:bg-blue-600"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  {MONTH_NAMES[calViewMonth]} {calViewYear} · Día clicado: {calendarDate}
                </h2>

                <button
                  type="button"
                  onClick={() => shiftCalendarMonth(1)}
                  className="p-2 rounded-xl bg-blue-100 border-2 border-blue-900 text-slate-900 hover:bg-blue-600"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {SHORT_DAYS.map((sd) => (
                  <div key={sd} className="text-[11px] font-black text-slate-700 py-1">
                    {sd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-12 rounded-xl bg-slate-50" />;
                  }
                  const isSelected = cell.dateStr === calendarDate;
                  const isTodayCell = cell.dateStr === todayStr;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => {
                        setCalendarDate(cell.dateStr);
                        setShowAllCalendarEvents(false);
                      }}
                      className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center transition ${
                        isSelected
                          ? 'bg-blue-900 text-blue-600 border-blue-900 font-black'
                          : isTodayCell
                          ? 'bg-blue-100 text-slate-900 border-blue-900 font-black'
                          : 'bg-white text-slate-900 border-slate-900 hover:bg-blue-100 font-bold'
                      }`}
                    >
                      <span className="text-xs">{cell.day}</span>
                      {cell.count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 rounded-full font-black ${
                            isSelected
                              ? 'bg-blue-600 text-slate-900'
                              : 'bg-blue-900 text-blue-600'
                          }`}
                        >
                          {cell.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleAddCalendarEvent}
              className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Añadir en el calendario ({calendarDate})</span>
                </h3>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1 text-xs font-bold text-slate-900"
                />
              </div>

              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder={`Escribe evento o nota para el ${calendarDate}...`}
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />

              <input
                type="text"
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                placeholder="Detalle opcional..."
                className="w-full bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-blue-600 font-black py-2.5 rounded-xl text-sm border-2 border-blue-900"
              >
                Guardar en el día {calendarDate}
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-xs font-black text-slate-900">
                {showAllCalendarEvents
                  ? `Todos los eventos guardados (${visibleCalendarEvents.length})`
                  : `Eventos del día ${calendarDate} (${visibleCalendarEvents.length})`}
              </p>
              <button
                type="button"
                onClick={() => setShowAllCalendarEvents(!showAllCalendarEvents)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-blue-600 text-slate-900 border-2 border-blue-900"
              >
                {showAllCalendarEvents ? 'Ver solo día clicado' : 'Ver todos los guardados'}
              </button>
            </div>

            <div className="space-y-2">
              {visibleCalendarEvents.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-6 text-center text-xs font-semibold text-slate-600">
                  No hay eventos guardados para esta selección.
                </div>
              ) : (
                visibleCalendarEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white border-2 border-blue-900 rounded-2xl p-3.5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-black text-blue-600 bg-blue-900 px-2 py-0.5 rounded-md">
                          {ev.event_date}
                        </span>
                        <span className="text-[11px] font-black text-slate-900 bg-blue-100 border border-blue-900 px-2 py-0.5 rounded-md">
                          {ev.outlet}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900">{ev.title}</p>
                      {ev.details && <p className="text-xs font-medium text-slate-700 mt-0.5">{ev.details}</p>}
                      <p className="text-[11px] font-semibold text-slate-600 mt-1">Por {ev.created_by}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCalendarEvent(ev)}
                      className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                      title="Borrar evento de calendario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 px-1">
                <History className="w-4 h-4" />
                <span>Registro reciente del equipo</span>
              </div>
              <div className="bg-white border-2 border-blue-900 rounded-2xl divide-y divide-slate-200">
                {logs.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-600">Sin movimientos todavía.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 text-xs flex items-center justify-between gap-2">
                      <div>
                        <span className="font-black text-slate-900">{log.user_name}</span>{' '}
                        <span className="text-slate-700 font-medium">{log.action}</span>{' '}
                        <span className="text-slate-900 font-bold">{log.target}</span>
                      </div>
                      <span className="text-slate-600 shrink-0 font-mono text-[11px] font-bold">
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

        {/* CAMBIOS DE TURNO */}
        {activeTab === 'cambiosTurno' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>{editingCambioId ? 'Editar cambio de turno' : 'Nuevo cambio de turno'}</span>
              </h2>

              <form onSubmit={editingCambioId ? handleEditCambioTurno : handleAddCambioTurno} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border-2 border-blue-900 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                      <span className="text-xs font-black uppercase text-slate-900">Turno 1</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-700">Empleado</label>
                      <input
                        type="text"
                        value={cambioEmp1}
                        onChange={(e) => setCambioEmp1(e.target.value)}
                        placeholder="Ej. Juan"
                        className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Fecha</label>
                        <input
                          type="date"
                          value={cambioFecha1}
                          onChange={(e) => setCambioFecha1(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Entrada</label>
                        <input
                          type="time"
                          value={cambioHoraEnt1}
                          onChange={(e) => setCambioHoraEnt1(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Salida</label>
                        <input
                          type="time"
                          value={cambioHoraSal1}
                          onChange={(e) => setCambioHoraSal1(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-900 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                      <span className="text-xs font-black uppercase text-slate-900">Turno 2</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-700">Empleado</label>
                      <input
                        type="text"
                        value={cambioEmp2}
                        onChange={(e) => setCambioEmp2(e.target.value)}
                        placeholder="Ej. Alejandro"
                        className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Fecha</label>
                        <input
                          type="date"
                          value={cambioFecha2}
                          onChange={(e) => setCambioFecha2(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Entrada</label>
                        <input
                          type="time"
                          value={cambioHoraEnt2}
                          onChange={(e) => setCambioHoraEnt2(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-700">Salida</label>
                        <input
                          type="time"
                          value={cambioHoraSal2}
                          onChange={(e) => setCambioHoraSal2(e.target.value)}
                          className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-700">Observaciones</label>
                  <input
                    type="text"
                    value={cambioObs}
                    onChange={(e) => setCambioObs(e.target.value)}
                    placeholder="Notas opcionales..."
                    className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-auto bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition`}
                  >
                    {editingCambioId ? 'Guardar cambios' : 'Registrar intercambio'}
                  </button>
                  {editingCambioId && (
                    <button
                      type="button"
                      onClick={() => {
                        setCambioEmp1('');
                        setCambioEmp2('');
                        setCambioFecha1('');
                        setCambioHoraEnt1('');
                        setCambioHoraSal1('');
                        setCambioFecha2('');
                        setCambioHoraEnt2('');
                        setCambioHoraSal2('');
                        setCambioObs('');
                        setEditingCambioId(null);
                      }}
                      className="w-auto bg-white hover:bg-blue-50 text-slate-900 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4" />
                  <span>Historial de cambios de turno</span>
                </h3>
                <input
                  type="date"
                  placeholder="Filtrar por fecha"
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              {cambiosTurno.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay cambios de turno registrados.
                </div>
              ) : (
                cambiosTurno.map((c) => (
                  <div
                    key={c.id}
                    className="border-2 border-blue-900 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
                          {c.empleado_1}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                          ↔
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
                          {c.empleado_2}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCambioEmp1(c.empleado_1);
                            setCambioEmp2(c.empleado_2);
                            setCambioFecha1(c.fecha_turno_1);
                            setCambioHoraEnt1(c.hora_entrada_1);
                            setCambioHoraSal1(c.hora_salida_1);
                            setCambioFecha2(c.fecha_turno_2);
                            setCambioHoraEnt2(c.hora_entrada_2);
                            setCambioHoraSal2(c.hora_salida_2);
                            setCambioObs(c.observaciones || '');
                            setEditingCambioId(c.id);
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-blue-100 text-slate-900 border-2 border-blue-900 hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCambioTurno(c)}
                          className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                          title="Borrar cambio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 border border-blue-900 rounded-lg p-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-700">Turno 1</p>
                        <p className="text-sm font-black text-slate-900">{c.fecha_turno_1}</p>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {c.hora_entrada_1} → {c.hora_salida_1}
                        </p>
                      </div>
                      <div className="bg-slate-50 border border-blue-900 rounded-lg p-2 space-y-1">
                        <p className="text-[10px] font-bold text-slate-700">Turno 2</p>
                        <p className="text-sm font-black text-slate-900">{c.fecha_turno_2}</p>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {c.hora_entrada_2} → {c.hora_salida_2}
                        </p>
                      </div>
                    </div>

                    {c.observaciones && (
                      <p className="text-xs font-medium text-slate-700 bg-blue-50 border border-blue-900 rounded-lg p-2">
                        {c.observaciones}
                      </p>
                    )}

                      <p className="text-[11px] font-semibold text-slate-600">
                        Creado: {new Date(c.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} por {c.creado_por}
                      </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS Y HORAS PUNTA */}
        {activeTab === 'estadisticas' && (
          <div className="space-y-4">
            {/* FORMULARIO DE REGISTRO RÁPIDO */}
            <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>{editingActividadId ? 'Editar registro' : 'Registro de actividad horaria'}</span>
              </h2>

              <form onSubmit={editingActividadId ? handleEditActividad : handleAddActividad} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Fecha</label>
                    <input
                      type="date"
                      value={actFecha}
                      onChange={(e) => setActFecha(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Punto de venta</label>
                    <select
                      value={actPuntoVenta}
                      onChange={(e) => setActPuntoVenta(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      {['Thalassa', 'Lobby Bar', 'Alborán', 'Pool-Side', 'Chill-Out', 'Salones'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Hora inicio</label>
                    <input
                      type="time"
                      value={actFranjaInicio}
                      onChange={(e) => setActFranjaInicio(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Hora fin</label>
                    <input
                      type="time"
                      value={actFranjaFin}
                      onChange={(e) => setActFranjaFin(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Nivel actividad</label>
                    <select
                      value={actNivel}
                      onChange={(e) => setActNivel(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                      <option value="muy_alto">Muy alto</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Nº Empleados</label>
                    <input
                      type="number"
                      value={actEmpleados}
                      onChange={(e) => setActEmpleados(e.target.value)}
                      placeholder="Opcional"
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-700">Observaciones</label>
                    <input
                      type="text"
                      value={actObs}
                      onChange={(e) => setActObs(e.target.value)}
                      placeholder="Notas opcionales..."
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-auto bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition`}
                  >
                    {editingActividadId ? 'Guardar cambios' : 'Registrar actividad'}
                  </button>
                  {editingActividadId && (
                    <button
                      type="button"
                      onClick={() => {
                        setActFecha(toLocalDateStr(new Date()));
                        setActPuntoVenta('Thalassa');
                        setActFranjaInicio('08:00');
                        setActFranjaFin('09:00');
                        setActNivel('medio');
                        setActEmpleados('');
                        setActObs('');
                        setEditingActividadId(null);
                      }}
                      className="w-auto bg-white hover:bg-blue-50 text-slate-900 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* FILTROS */}
            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-700">Filtrar por punto de venta:</span>
                <div className="flex gap-1 overflow-x-auto">
                  {['Todos', 'Thalassa', 'Lobby Bar', 'Alborán', 'Pool-Side', 'Chill-Out', 'Salones'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setActFiltroPunto(p)}
                      className={`px-3 py-1 rounded-xl text-xs font-black border-2 transition ${
                        actFiltroPunto === p
                          ? 'bg-blue-900 text-blue-600 border-blue-900'
                          : 'bg-white text-slate-900 border-blue-900 hover:bg-blue-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-700">Fecha:</label>
                <input
                  type="date"
                  value={actFiltroFecha}
                  onChange={(e) => setActFiltroFecha(e.target.value)}
                  className="bg-white border-2 border-blue-900 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* TARJETAS RESUMEN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">Total registros</p>
                <p className="text-2xl font-black text-slate-900">{filteredActividad.length}</p>
              </div>
              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">Punto más activo</p>
                <p className="text-xl font-black text-slate-900">{puntoMasActivo || '—'}</p>
              </div>
              <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">Franja punta</p>
                <p className="text-xl font-black text-slate-900">{franjaPunta || '—'}</p>
              </div>
            </div>

            {/* MAPA DE CALOR */}
            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Mapa de calor - Actividad por día y hora
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-[10px] font-black text-slate-700 border-b-2 border-blue-900">Día \ Hora</th>
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map((h) => (
                        <th key={h} className="px-1 py-2 text-[10px] font-black text-slate-700 border-b-2 border-blue-900">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => (
                      <tr key={dia} className="border-b border-slate-200">
                        <td className="px-2 py-2 text-[10px] font-black text-slate-900 border-r border-slate-200 bg-slate-50">{dia}</td>
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map((hora) => (
                          <td key={hora} className={`px-1 py-2 h-10 border-r border-slate-200 ${celdaCalorColor(dia, hora)}`}>
                            {celdaCalorValor(dia, hora)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-600 text-center">
                Colores: bajo=verde, medio=ámbar, alto=naranja, muy alto=rosa
              </p>
            </div>

            {/* LISTA DE REGISTROS */}
            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" />
                <span>Registros de actividad</span>
              </h3>

              {filteredActividad.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay registros de actividad horaria.
                </div>
              ) : (
                filteredActividad.map((a) => (
                  <div key={a.id} className="border-2 border-blue-900 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            a.nivel_actividad === 'bajo' ? 'bg-green-100 text-green-800 border-green-300' :
                            a.nivel_actividad === 'medio' ? 'bg-blue-100 text-amber-800 border-blue-300' :
                            a.nivel_actividad === 'alto' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {a.nivel_actividad}
                        </span>
                        <span className="text-[10px] font-black text-slate-600">{a.franja_horaria}</span>
                        <span className="text-[10px] font-black text-slate-600">{a.fecha}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActFecha(a.fecha);
                            setActPuntoVenta(a.punto_venta);
                            {
                              const partes = a.franja_horaria.split(' - ');
                              if (partes.length === 2) {
                                setActFranjaInicio(partes[0]);
                                setActFranjaFin(partes[1]);
                              }
                            }
                            setActNivel(a.nivel_actividad);
                            setActEmpleados(String(a.num_empleados || ''));
                            setActObs(a.observaciones || '');
                            setEditingActividadId(a.id);
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-blue-100 text-slate-900 border-2 border-blue-900 hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteActividad(a)}
                          className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
                          title="Borrar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900">{a.punto_venta}</span>
                      {a.num_empleados && (
                        <span className="text-xs font-black text-slate-600">{a.num_empleados} empleados</span>
                      )}
                      {a.observaciones && (
                        <span className="text-xs font-medium text-slate-700 bg-blue-50 border border-blue-900 rounded px-2 py-1">{a.observaciones}</span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Por {a.creado_por} · {new Date(a.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AVISOS DE ÚLTIMA HORA - GESTIÓN */}
        {activeTab === 'avisos' && (
          <div className="space-y-4">
            {/* FORMULARIO DE AVISO */}
            <div className="bg-blue-50 border-2 border-blue-900 rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                <span>{editingAvisoId ? 'Editar aviso' : 'Nuevo aviso de última hora'}</span>
              </h2>

              <form onSubmit={editingAvisoId ? handleEditAviso : handleAddAviso} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Título</label>
                    <input
                      type="text"
                      value={avisoTitulo}
                      onChange={(e) => setAvisoTitulo(e.target.value)}
                      placeholder="Ej. Cierre inesperado de cocina"
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Prioridad</label>
                    <select
                      value={avisoPrioridad}
                      onChange={(e) => setAvisoPrioridad(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-700">Mensaje</label>
                  <textarea
                    rows={3}
                    value={avisoMensaje}
                    onChange={(e) => setAvisoMensaje(e.target.value)}
                    placeholder="Describe el aviso de última hora..."
                    className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-700">Fecha expiración (opcional)</label>
                    <input
                      type="date"
                      value={avisoFechaExpiracion}
                      onChange={(e) => setAvisoFechaExpiracion(e.target.value)}
                      className="bg-white border-2 border-blue-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-auto bg-blue-900 hover:bg-blue-800 text-blue-600 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition`}
                  >
                    {editingAvisoId ? 'Guardar cambios' : 'Publicar aviso'}
                  </button>
                  {editingAvisoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvisoTitulo('');
                        setAvisoMensaje('');
                        setAvisoPrioridad('alta');
                        setAvisoFechaExpiracion('');
                        setEditingAvisoId(null);
                      }}
                      className="w-auto bg-white hover:bg-blue-50 text-slate-900 font-black px-4 py-2 rounded-xl border-2 border-blue-900 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* LISTADO DE AVISOS ACTIVOS */}
            <div className="bg-white border-2 border-blue-900 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4" />
                <span>Avisos activos</span>
              </h3>

              {avisos.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-blue-900 rounded-2xl p-8 text-center text-xs font-semibold text-slate-600">
                  No hay avisos de última hora activos.
                </div>
              ) : (
                avisos.map((a) => (
                  <div key={a.id} className="border-2 border-blue-900 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            a.prioridad === 'alta'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : a.prioridad === 'media'
                              ? 'bg-blue-100 text-amber-800 border-blue-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          {a.prioridad.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-black text-slate-600">
                          Por {a.creado_por}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAvisoTitulo(a.titulo);
                            setAvisoMensaje(a.mensaje);
                            setAvisoPrioridad(a.prioridad);
                            setAvisoFechaExpiracion(a.fecha_expiracion || '');
                            setEditingAvisoId(a.id);
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-blue-100 text-slate-900 border-2 border-blue-900 hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => cerrarAviso(a)}
                          className="text-slate-900 hover:bg-rose-400 p-1.5 rounded-lg border border-blue-900 bg-rose-100"
                          title="Cerrar aviso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900">{a.titulo}</p>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{a.mensaje}</p>
                    {a.fecha_expiracion && (
                      <p className="text-[10px] font-black text-slate-500 mt-0.5">
                        Vence: {a.fecha_expiracion}
                      </p>
                    )}
                    <p className="text-[11px] font-semibold text-slate-600 mt-1">
                      Creado: {new Date(a.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white border-2 border-blue-900 rounded-2xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Vista previa de imagen</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1.5 rounded-lg bg-blue-600 border border-blue-900 text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewImageUrl}
              alt="Adjunto"
              className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentPreview({ url, name, onOpenImage }) {
  if (!url) return null;

  if (isImageUrl(url)) {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onOpenImage(url)}
          className="group relative inline-block overflow-hidden rounded-xl border-2 border-blue-900"
        >
          <img
            src={url}
            alt={name || 'Foto adjunta'}
            className="h-24 w-36 object-cover group-hover:scale-105 transition"
          />
          <span className="block text-[10px] font-bold bg-blue-900 text-blue-600 px-2 py-0.5 truncate max-w-[144px]">
            {name || 'Ver foto'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-blue-100 hover:bg-blue-600 border-2 border-blue-900 px-3 py-1.5 rounded-xl transition"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{name || 'Abrir archivo adjunto'}</span>
      </a>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, showRollover, onRollover }) {
  return (
    <div
      className={`bg-white border-2 border-blue-900 rounded-2xl p-3.5 flex items-start justify-between gap-3 transition ${
        task.completed ? 'opacity-60 bg-slate-100' : ''
      }`}
    >
      <button type="button" onClick={onToggle} className="flex items-start gap-3 text-left flex-1">
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-slate-900 border border-blue-900">
              {task.outlet}
            </span>
            {task.shift_phase && task.shift_phase !== 'general' && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-600">
                {task.shift_phase}
              </span>
            )}
            {task.assigned_role && task.assigned_role !== 'Todos' && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-200 text-slate-900 border border-blue-900">
                {task.assigned_role}
              </span>
            )}
          </div>
          <p
            className={`text-sm font-black ${
              task.completed ? 'line-through text-slate-500' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>
          {task.notes && <p className="text-xs font-medium text-slate-700">{task.notes}</p>}
          <p className="text-[11px] font-semibold text-slate-600">
            Creado por <span className="text-slate-900 font-bold">{task.created_by}</span>
            {task.completed && task.completed_by ? ` · Hecho por ${task.completed_by}` : ''}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        {showRollover && !task.completed && (
          <button
            type="button"
            onClick={onRollover}
            className="text-[10px] font-black px-2 py-1 rounded-lg bg-blue-100 text-slate-900 border-2 border-blue-900 hover:bg-blue-600"
            title="Pasar pendiente al día siguiente"
          >
            +1 día
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-900 hover:bg-blue-600 p-1.5 rounded-lg border border-blue-900 bg-blue-100"
          title="Borrar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
