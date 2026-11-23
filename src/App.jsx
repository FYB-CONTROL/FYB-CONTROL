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
      .on('postgres_changes', { event: '*', schema:
