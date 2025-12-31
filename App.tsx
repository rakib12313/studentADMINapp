import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, BookOpen, Trophy, Users, 
    Bell, Search, Trash2, Upload, Download, Eye, FileJson, 
    Plus, CheckCircle, Ban, LogOut, Lock, Mail, Loader2,
    X, Check, AlertTriangle, ArrowRight, ChevronRight, Edit2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, Button, Input, Select, Textarea, Modal } from './components/UI';
import { AppState, Student, Exam, LibraryItem, ExamResult, Question } from './types';
import { auth, db, uploadToCloudinary } from './services';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, onValue, set, update, remove, push } from 'firebase/database';

// --- Types for Toasts ---
interface ToastMsg {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [toasts, setToasts] = useState<ToastMsg[]>([]);

    // --- Toast Handler ---
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // Initial Empty State
    const [state, setState] = useState<AppState>({
        students: [], notices: [], library: [], exams: [], results: []
    });

    // Handle Authentication State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    // Handle Database Sync
    useEffect(() => {
        if (!user) return; // Wait for user to be authenticated

        const dbRef = ref(db);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setState({
                    students: data.students ? Object.values(data.students) : [],
                    notices: data.notices ? Object.values(data.notices) : [],
                    library: data.library ? Object.values(data.library) : [],
                    exams: data.exams ? Object.values(data.exams) : [],
                    results: data.results ? Object.values(data.results) : []
                });
            } else {
                update(ref(db), { created: Date.now() }); 
            }
        }, (error) => {
            console.error("Database Error:", error);
            showToast(`Database Error: ${error.message}. Check Realtime Database Rules.`, 'error');
        });
        return () => unsubscribe();
    }, [user]);

    const [activeTab, setActiveTab] = useState<'home' | 'library' | 'exams' | 'results' | 'students'>('home');

    // --- Actions ---
    const addNotice = (content: string) => {
        const noticesRef = ref(db, 'notices');
        const newRef = push(noticesRef);
        set(newRef, { id: newRef.key!, content, timestamp: new Date().toLocaleString(), active: true });
        showToast('Notice published to Student App!', 'success');
    };

    const toggleStudentStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        update(ref(db, `students/${id}`), { status: newStatus });
        showToast(`Student ${newStatus === 'active' ? 'unbanned' : 'banned'}`, newStatus === 'active' ? 'success' : 'error');
    };

    const handleLogout = async () => {
        await signOut(auth);
        showToast('Logged out successfully', 'info');
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0c29]">
                <Loader2 size={40} className="text-[#4FACFE] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <LoginScreen showToast={showToast} />;
    }

    return (
        <div className="min-h-screen pb-24 sm:pb-0 sm:pl-20 md:pl-72 text-white font-sans">
            
            <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            {/* Mobile Nav */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#16161d]/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 z-50 sm:hidden">
                <NavBtn icon={<LayoutDashboard />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavBtn icon={<BookOpen />} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
                <NavBtn icon={<FileJson />} label="Exams" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} />
                <NavBtn icon={<Trophy />} label="Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                <NavBtn icon={<Users />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden sm:flex fixed top-0 bottom-0 left-0 w-20 md:w-72 flex-col bg-[#0a0a0f]/50 backdrop-blur-xl border-r border-white/5 z-50">
                <div className="h-24 flex items-center justify-center md:justify-start md:px-8 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">L</div>
                    <span className="hidden md:block ml-3 font-bold text-2xl tracking-tight text-white">LMS<span className="text-[#4FACFE]">.Admin</span></span>
                </div>
                
                <div className="flex-1 py-6 px-4 space-y-2">
                     <SidebarBtn icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                     <SidebarBtn icon={<BookOpen />} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
                     <SidebarBtn icon={<FileJson />} label="Exams" active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} />
                     <SidebarBtn icon={<Trophy />} label="Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                     <SidebarBtn icon={<Users />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                </div>
                
                <div className="p-6 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center w-full p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden md:block ml-3 font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-4 md:p-10 max-w-[1600px] mx-auto animate-fade-in">
                <Header title={activeTab === 'home' ? 'Dashboard Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} userEmail={user.email} />
                
                {activeTab === 'home' && <HomeView state={state} onAddNotice={addNotice} showToast={showToast} />}
                {activeTab === 'library' && <LibraryView state={state} showToast={showToast} />}
                {activeTab === 'exams' && <ExamView state={state} showToast={showToast} />}
                {activeTab === 'results' && <ResultsView state={state} showToast={showToast} />}
                {activeTab === 'students' && <StudentsView state={state} onToggleStatus={toggleStudentStatus} showToast={showToast} />}
            </main>
        </div>
    );
};

// --- TOAST COMPONENTS ---
const ToastContainer = ({ toasts, removeToast }: { toasts: ToastMsg[], removeToast: (id: number) => void }) => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
            <div 
                key={toast.id} 
                className={`animate-slide-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 text-sm font-medium
                ${toast.type === 'success' ? 'bg-green-500/10 text-green-200 border-green-500/20' : ''}
                ${toast.type === 'error' ? 'bg-red-500/10 text-red-200 border-red-500/20' : ''}
                ${toast.type === 'info' ? 'bg-blue-500/10 text-blue-200 border-blue-500/20' : ''}`}
            >
                {toast.type === 'success' && <CheckCircle size={16} className="text-green-400" />}
                {toast.type === 'error' && <AlertTriangle size={16} className="text-red-400" />}
                {toast.type === 'info' && <Bell size={16} className="text-blue-400" />}
                {toast.message}
                <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70"><X size={14} /></button>
            </div>
        ))}
    </div>
);

// --- LOGIN SCREEN ---
const LoginScreen = ({ showToast }: { showToast: (m: string, t: 'success' | 'error') => void }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast('Admin account created successfully!', 'success');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('Welcome back, Admin!', 'success');
            }
        } catch (err: any) {
            let msg = 'Authentication failed.';
            if (err.code === 'auth/email-already-in-use') msg = 'Email already exists.';
            if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
            if (err.code === 'auth/weak-password') msg = 'Password is too weak (min 6 chars).';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            showToast('Successfully signed in with Google!', 'success');
        } catch (error: any) {
            showToast('Google Sign-In failed. Please try again.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f0c29]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40"></div>
                <div className="relative z-10 flex flex-col justify-between p-16 h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#4FACFE] flex items-center justify-center font-bold text-white text-xl">L</div>
                    <div>
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">Control Your <br/> <span className="text-[#4FACFE]">Digital Campus</span></h1>
                        <p className="text-gray-300 text-lg max-w-md">Manage students, exams, and resources in real-time with next-gen admin controls.</p>
                    </div>
                </div>
            </div>
            
            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0a0f]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white">
                            {isSignUp ? 'Create Admin Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-400 mt-2">
                            {isSignUp ? 'Register a new administrator profile.' : 'Sign in to access the admin dashboard.'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button 
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                        </button>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Or continue with email</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <form onSubmit={handleAuthAction} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">EMAIL ADDRESS</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-gray-500 transition-colors" size={20} />
                                        <input 
                                            type="email" 
                                            className="w-full bg-[#16161d] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#4FACFE] focus:ring-1 focus:ring-[#4FACFE] outline-none transition-all placeholder-gray-600"
                                            placeholder="admin@school.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">PASSWORD</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                        <input 
                                            type="password" 
                                            className="w-full bg-[#16161d] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#4FACFE] focus:ring-1 focus:ring-[#4FACFE] outline-none transition-all placeholder-gray-600"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-4 text-lg" isLoading={loading}>
                                {isSignUp ? 'Create Account' : 'Access Dashboard'} <ArrowRight size={20} />
                            </Button>
                        </form>
                        
                        <div className="text-center">
                            <button 
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm text-[#4FACFE] hover:text-[#00F2FE] transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NAVIGATION BUTTONS ---
const NavBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 w-full transition-all duration-300 ${active ? 'text-[#4FACFE] scale-110' : 'text-gray-500 hover:text-gray-300'}`}>
        {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
        <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">{label}</span>
    </button>
);

const SidebarBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center w-full p-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${active ? 'bg-[#4FACFE]/10 text-[#4FACFE]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4FACFE] rounded-r-full"></div>}
        {React.cloneElement(icon, { size: 20, className: active ? 'text-[#4FACFE]' : 'text-gray-500 group-hover:text-white transition-colors' })}
        <span className="hidden md:block ml-3 font-medium text-sm">{label}</span>
        {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
);

const Header = ({ title, userEmail }: { title: string, userEmail?: string | null }) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                System Operational
            </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
             <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-[#4FACFE] uppercase tracking-widest">Admin Console</div>
                <div className="text-sm text-gray-300 font-medium">{userEmail}</div>
             </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4FACFE] to-[#00F2FE] p-[2px]">
                <img src={`https://ui-avatars.com/api/?name=${userEmail || 'Admin'}&background=000&color=fff`} className="w-full h-full rounded-full object-cover bg-black" alt="Admin" />
            </div>
        </div>
    </div>
);

// ---------------- VIEWS ----------------

// 1. HOME VIEW
const HomeView = ({ state, onAddNotice, showToast }: { state: AppState, onAddNotice: (msg: string) => void, showToast: any }) => {
    const [noticeText, setNoticeText] = useState('');
    
    // Derived Stats
    const totalStudents = state.students.length;
    const activeStudents = state.students.filter(s => s.status === 'active').length;
    const onlineStudents = state.students.filter(s => s.isOnline).length;
    const offlineStudents = totalStudents - onlineStudents;
    const totalExams = state.exams.length;
    const runningExams = state.exams.filter(e => e.status === 'published').length;

    const chartData = [
        { name: 'Mon', attempts: 12 }, { name: 'Tue', attempts: 19 }, 
        { name: 'Wed', attempts: 8 }, { name: 'Thu', attempts: 24 }, 
        { name: 'Fri', attempts: 15 }, { name: 'Sat', attempts: 30 }, 
        { name: 'Sun', attempts: 10 },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard label="Total Students" value={totalStudents} subtext={`${activeStudents} Active`} icon={<Users />} color="blue" />
                <StatCard label="Online Now" value={onlineStudents} subtext="Realtime Status" icon={<div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]" />} color="green" />
                <StatCard label="Running Exams" value={runningExams} subtext={`Out of ${totalExams} Total`} icon={<Trophy />} color="purple" />
                <StatCard label="Notices" value={state.notices.length} subtext="Announcements" icon={<Bell />} color="yellow" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 min-h-[400px]" title="Exam Engagement">
                    <div className="h-[300px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4FACFE" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4FACFE" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ background: '#16161d', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="attempts" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card title="Publish Notice">
                        <div className="space-y-4">
                            <Textarea 
                                placeholder="Enter announcement content..." 
                                value={noticeText} 
                                onChange={(e) => setNoticeText(e.target.value)}
                                className="min-h-[120px] bg-[#0a0a0f]"
                            />
                            <Button 
                                className="w-full" 
                                onClick={() => { if(noticeText) { onAddNotice(noticeText); setNoticeText(''); }}}
                            >
                                <Bell size={18} /> Publish
                            </Button>
                        </div>
                    </Card>

                    <Card title="Live Activity">
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {state.students.slice(0, 5).map(s => (
                                <div key={s.id} className="flex gap-3 items-center p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className={`w-2 h-2 rounded-full ${s.isOnline ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-600'} shrink-0`}></div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-200 truncate font-medium">{s.name}</p>
                                        <p className="text-xs text-gray-500">{s.isOnline ? 'Online now' : 'Offline'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// 2. LIBRARY VIEW
const LibraryView = ({ state, showToast }: { state: AppState, showToast: any }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Partial<LibraryItem> | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const handleSave = async () => {
        if (!editItem?.title || !editItem?.subject) {
            showToast("Please fill all fields", "error");
            return;
        }
        
        setUploading(true);
        let finalUrl = editItem.url || '#';

        if (fileToUpload) {
            try {
                finalUrl = await uploadToCloudinary(fileToUpload);
            } catch (err) {
                showToast("Upload failed", "error");
                setUploading(false);
                return;
            }
        }

        if (editItem.id) {
            update(ref(db, `library/${editItem.id}`), {
                title: editItem.title,
                subject: editItem.subject,
                allowDownload: editItem.allowDownload,
                url: finalUrl
            });
            showToast("Resource updated successfully", "success");
        } else {
            const newRef = push(ref(db, 'library'));
            set(newRef, {
                id: newRef.key!,
                title: editItem.title,
                subject: editItem.subject,
                type: editItem.type || 'pdf',
                url: finalUrl,
                allowDownload: editItem.allowDownload || false,
                addedAt: new Date().toLocaleDateString()
            });
            showToast("Resource added successfully", "success");
        }

        setModalOpen(false);
        setEditItem(null);
        setFileToUpload(null);
        setUploading(false);
    };

    const openEdit = (item: LibraryItem) => {
        setEditItem({ ...item });
        setModalOpen(true);
    };

    const openNew = () => {
        setEditItem({ type: 'pdf', allowDownload: true });
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(confirm("Delete this resource from the student app?")) {
            remove(ref(db, `library/${id}`));
            showToast("Resource deleted", "info");
        }
    };

    const toggleDownload = (id: string, current: boolean) => {
        update(ref(db, `library/${id}`), { allowDownload: !current });
        showToast(`Download ${!current ? 'Enabled' : 'Disabled'}`, 'info');
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4FACFE] transition-colors pointer-events-none" size={20} />
                    <Input placeholder="Search resources..." className="pl-12 mb-0" />
                </div>
                <Button onClick={openNew} className="w-full md:w-auto"><Plus size={18} /> Upload Material</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {state.library.map(item => (
                    <div key={item.id} className="glass-panel glass-panel-hover rounded-2xl p-5 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-[#0a0a0f]/80 backdrop-blur-sm rounded-bl-2xl">
                             <button onClick={() => openEdit(item)} className="p-2 text-[#4FACFE] hover:bg-white/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                             <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>

                        <div className="flex gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-[#0a0a0f] border border-white/5`}>
                                {item.type === 'pdf' ? <BookOpen className="text-red-400"/> : <Eye className="text-blue-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-white truncate">{item.title}</h4>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-300">
                                    {item.subject}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-xs text-gray-500 font-medium">{item.addedAt}</span>
                            <button 
                                onClick={() => toggleDownload(item.id, item.allowDownload)}
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold ${item.allowDownload ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                            >
                                {item.allowDownload ? <CheckCircle size={12} /> : <Ban size={12} />}
                                {item.allowDownload ? 'Download On' : 'Download Off'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editItem?.id ? "Edit Resource" : "Upload Material"}>
                <Input placeholder="Resource Title" value={editItem?.title || ''} onChange={e => setEditItem({...editItem!, title: e.target.value})} />
                <Input placeholder="Subject Category" value={editItem?.subject || ''} onChange={e => setEditItem({...editItem!, subject: e.target.value})} />
                <Select 
                    value={editItem?.type || 'pdf'} 
                    onChange={e => setEditItem({...editItem!, type: e.target.value as any})}
                    disabled={!!editItem?.id}
                >
                    <option value="pdf">PDF Document</option>
                    <option value="image">Image / Graphic</option>
                </Select>
                
                <div className="relative border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#4FACFE] hover:bg-[#4FACFE]/5 transition-all cursor-pointer mb-6 group">
                    <input 
                        type="file" 
                        onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept={editItem?.type === 'pdf' ? '.pdf' : 'image/*'}
                    />
                    <Upload className="mx-auto text-gray-400 group-hover:text-[#4FACFE] mb-2 transition-colors" size={32} />
                    <p className="text-sm text-gray-400 group-hover:text-gray-200">
                        {fileToUpload ? <span className="text-[#4FACFE] font-medium">{fileToUpload.name}</span> : (editItem?.id ? "Upload new file to replace (optional)" : "Drop file here or click to browse")}
                    </p>
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-white/5">
                    <input 
                        type="checkbox" 
                        checked={editItem?.allowDownload || false} 
                        onChange={e => setEditItem({...editItem!, allowDownload: e.target.checked})}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-[#4FACFE] focus:ring-offset-0 focus:ring-0"
                    />
                    <span className="text-sm text-gray-300">Allow students to download original file</span>
                </div>
                <Button className="w-full py-3" onClick={handleSave} isLoading={uploading}>
                    {uploading ? 'Processing...' : (editItem?.id ? 'Update Resource' : 'Add to Library')}
                </Button>
            </Modal>
        </>
    );
};

// 3. EXAM VIEW
const ExamView = ({ state, showToast }: { state: AppState, showToast: any }) => {
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [jsonInput, setJsonInput] = useState('');
    const [examForm, setExamForm] = useState<Partial<Exam>>({ type: 'mcq', durationMinutes: 30 });
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const saveExam = (examData: any) => {
        const newRef = push(ref(db, 'exams'));
        set(newRef, { ...examData, id: newRef.key });
        showToast("Exam created successfully", "success");
        setViewMode('list');
        setExamForm({ type: 'mcq', durationMinutes: 30 });
        setJsonInput('');
        setFileToUpload(null);
    };

    const handleCreate = async () => {
        if(!examForm.title) { showToast("Title is required", "error"); return; }
        setUploading(true);

        let fileUrl = undefined;
        if (examForm.type === 'file' && fileToUpload) {
            try { fileUrl = await uploadToCloudinary(fileToUpload); } 
            catch (e) { showToast("File upload failed", "error"); setUploading(false); return; }
        }

        saveExam({
            title: examForm.title,
            durationMinutes: examForm.durationMinutes || 30,
            type: examForm.type,
            status: 'draft',
            participants: 0,
            questions: [],
            fileUrl: fileUrl
        });
        setUploading(false);
    };

    const handleJsonImport = () => {
        try {
            const data = JSON.parse(jsonInput);
            if (!data.exam_name || !Array.isArray(data.questions)) throw new Error("Missing 'exam_name' or 'questions' array.");
            
            const mappedQuestions: Question[] = data.questions.map((q: any, idx: number) => {
                if (!q.question || !q.options || !q.answer) throw new Error(`Question ${idx + 1} is incomplete.`);
                return {
                    id: `q-${idx}-${Date.now()}`,
                    subject: q.subject || 'General',
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    hint: q.hint
                };
            });

            saveExam({
                title: data.exam_name,
                durationMinutes: examForm.durationMinutes || 30,
                type: 'mcq',
                status: 'draft',
                participants: 0,
                questions: mappedQuestions
            });
        } catch (e: any) { 
            console.error(e);
            showToast(`JSON Error: ${e.message}`, "error"); 
        }
    };

    const toggleStatus = (id: string, current: string) => {
        const next = current === 'draft' ? 'published' : (current === 'published' ? 'ended' : 'draft');
        update(ref(db, `exams/${id}`), { status: next });
        showToast(`Exam status: ${next}`, "info");
    };

    if (viewMode === 'create') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setViewMode('list')} className="w-10 h-10 p-0 rounded-full"><ArrowRight className="rotate-180" /></Button>
                    <h2 className="text-2xl font-bold">New Exam Setup</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <Card title="Standard / File Upload Setup">
                        <div className="space-y-4">
                            <Input placeholder="Exam Title" onChange={e => setExamForm({...examForm, title: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="number" placeholder="Duration (min)" onChange={e => setExamForm({...examForm, durationMinutes: parseInt(e.target.value)})} />
                                <Select onChange={e => setExamForm({...examForm, type: e.target.value as any})}>
                                    <option value="mcq">MCQ (Digital)</option>
                                    <option value="file">Paper Upload (PDF/Img)</option>
                                </Select>
                            </div>
                            
                            {examForm.type === 'file' ? (
                                <div className="p-6 border border-dashed border-gray-600 rounded-xl text-center bg-[#0a0a0f]">
                                    <input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                                    <p className="text-xs text-gray-500 mt-2">Upload question paper as PDF or Image</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-200 text-sm">
                                    <AlertTriangle size={16} className="inline mr-2" />
                                    For MCQ exams, use the JSON Importer on the right for bulk upload.
                                </div>
                            )}
                            
                            <Button className="w-full mt-4" onClick={handleCreate} isLoading={uploading}>Create Draft</Button>
                        </div>
                    </Card>

                    <Card title="JSON Import">
                        <div className="mb-2 flex justify-between items-center text-xs text-gray-400">
                            <span>Paste your JSON configuration below.</span>
                            <span className="text-[#4FACFE]">Supports complex formulas</span>
                        </div>
                        <Textarea 
                            className="font-mono text-xs h-[300px] bg-[#0a0a0f] border-gray-700" 
                            placeholder='{"exam_name": "...", "questions": [...]}'
                            value={jsonInput}
                            onChange={e => setJsonInput(e.target.value)}
                        />
                        <div className="flex gap-2 mt-4">
                            <Input 
                                type="number" 
                                placeholder="Duration (mins)" 
                                className="w-32 mb-0" 
                                value={examForm.durationMinutes}
                                onChange={e => setExamForm({...examForm, durationMinutes: parseInt(e.target.value)})} 
                            />
                            <Button variant="success" className="flex-1" onClick={handleJsonImport}>Parse & Create Exam</Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex gap-4 items-center text-gray-400 text-sm font-medium">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Published</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Draft</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Ended</span>
                </div>
                <Button onClick={() => setViewMode('create')}><Plus size={18} /> New Exam</Button>
            </div>

            <div className="grid gap-4">
                {state.exams.map(exam => (
                    <div key={exam.id} className="glass-panel hover:bg-white/5 transition-colors p-5 rounded-xl flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${exam.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-gray-700/30 text-gray-500'}`}>
                            {exam.type === 'mcq' ? <CheckCircle /> : <FileJson />}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                            <div className="flex justify-center md:justify-start gap-4 text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide">
                                <span className="bg-white/5 px-2 py-1 rounded">{exam.durationMinutes} MINS</span>
                                <span className="bg-white/5 px-2 py-1 rounded">{exam.questions?.length || 0} ITEMS</span>
                                <span className="bg-white/5 px-2 py-1 rounded">{exam.type}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => toggleStatus(exam.id, exam.status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${
                                    exam.status === 'published' ? 'bg-green-500 text-black hover:bg-green-400' : 
                                    exam.status === 'draft' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 
                                    'bg-gray-700 text-white'
                                }`}
                            >
                                {exam.status}
                            </button>
                            <button onClick={() => { if(confirm("Delete Exam?")) remove(ref(db, `exams/${exam.id}`)) }} className="p-3 text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. RESULTS VIEW
const ResultsView = ({ state, showToast }: { state: AppState, showToast: any }) => {
    const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

    const handleUpdateScore = () => {
        if (!editingResult) return;
        update(ref(db, `results/${editingResult.id}`), {
            score: Number(editingResult.score),
            status: Number(editingResult.score) >= (editingResult.totalScore / 2) ? 'passed' : 'failed'
        });
        showToast("Score updated manually", "success");
        setEditingResult(null);
    };

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-medium">Student</th>
                            <th className="p-4 font-medium">Exam Name</th>
                            <th className="p-4 font-medium">Score</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {state.results.map(res => (
                            <tr key={res.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white">{res.studentName}</div>
                                    <div className="text-xs text-gray-500">{res.date}</div>
                                </td>
                                <td className="p-4 text-blue-300">{res.examTitle}</td>
                                <td className="p-4">
                                    {editingResult?.id === res.id ? (
                                        <div className="flex gap-2">
                                            <Input 
                                                type="number" 
                                                className="w-20 py-1 mb-0 h-8" 
                                                value={editingResult.score} 
                                                onChange={e => setEditingResult({...editingResult, score: Number(e.target.value)})}
                                            />
                                            <button onClick={handleUpdateScore} className="p-1 bg-green-500/20 text-green-400 rounded"><Check size={16} /></button>
                                            <button onClick={() => setEditingResult(null)} className="p-1 bg-gray-500/20 text-gray-400 rounded"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-full max-w-[80px] h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div style={{width: `${(res.score/res.totalScore)*100}%`}} className={`h-full ${res.score >= (res.totalScore/2) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <span className="font-mono text-sm">{res.score}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${res.status === 'passed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => setEditingResult(res)} className="p-2 text-gray-500 hover:text-[#4FACFE] transition-colors" title="Manual Check/Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => { if(confirm("Delete result? Student can retake.")) remove(ref(db, `results/${res.id}`)); showToast("Result deleted (Retake enabled)", "info"); }} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Delete/Retake">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {state.results.length === 0 && <div className="p-8 text-center text-gray-500">No results found in database.</div>}
            </div>
        </Card>
    );
};

// 5. STUDENTS VIEW
const StudentsView = ({ state, onToggleStatus, showToast }: { state: AppState, onToggleStatus: (id: string, s: string) => void, showToast: any }) => {
    const [search, setSearch] = useState('');
    const [editStudent, setEditStudent] = useState<Partial<Student> | null>(null);

    const filteredStudents = state.students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const saveStudent = () => {
        if(editStudent && editStudent.id) {
            update(ref(db, `students/${editStudent.id}`), {
                name: editStudent.name,
                email: editStudent.email,
                phone: editStudent.phone
            });
            showToast("Student profile updated", "success");
            setEditStudent(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4FACFE] transition-colors pointer-events-none" size={20} />
                    <Input 
                        placeholder="Filter students by name or email..." 
                        className="pl-12 mb-0" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="bg-white/5 px-4 rounded-xl flex items-center justify-center text-gray-400 font-mono border border-white/5">
                    {filteredStudents.length} / {state.students.length}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredStudents.map(student => (
                    <div key={student.id} className="glass-panel p-5 rounded-2xl flex items-start gap-4 hover:border-[#4FACFE]/30 transition-all group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${student.isOnline ? 'bg-green-500 text-white shadow-[0_0_15px_#22c55e]' : 'bg-gray-700 text-gray-400'}`}>
                            {student.avatar ? <img src={student.avatar} className="w-full h-full rounded-full object-cover"/> : student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white truncate">{student.name}</h3>
                                <button onClick={() => setEditStudent(student)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"><Edit2 size={14} /></button>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{student.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{student.phone}</p>
                            
                            <div className="mt-4 flex gap-2">
                                <Button 
                                    variant={student.status === 'active' ? 'danger' : 'success'} 
                                    className="w-full py-2 text-xs h-8"
                                    onClick={() => onToggleStatus(student.id, student.status)}
                                >
                                    {student.status === 'active' ? 'Ban User' : 'Unban User'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student Profile">
                <div className="space-y-4">
                    <Input placeholder="Full Name" value={editStudent?.name || ''} onChange={e => setEditStudent({...editStudent!, name: e.target.value})} />
                    <Input placeholder="Email" value={editStudent?.email || ''} onChange={e => setEditStudent({...editStudent!, email: e.target.value})} />
                    <Input placeholder="Phone" value={editStudent?.phone || ''} onChange={e => setEditStudent({...editStudent!, phone: e.target.value})} />
                    <Button onClick={saveStudent}>Save Changes</Button>
                </div>
            </Modal>
        </div>
    );
};

// --- HELPER COMPONENT ---
const StatCard = ({ label, value, subtext, icon, color }: any) => {
    const colors: any = {
        blue: 'text-[#4FACFE] bg-[#4FACFE]/10 border-[#4FACFE]/20',
        green: 'text-green-400 bg-green-400/10 border-green-400/20',
        purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    };
    
    // Fallback for default color
    const activeColor = colors[color] || colors.blue;

    return (
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between group">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h2 className="text-3xl font-bold text-white">{value}</h2>
                <p className="text-xs text-gray-500 mt-1">{subtext}</p>
            </div>
            <div className={`p-4 rounded-xl ${activeColor} border`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
        </div>
    );
};

export default App;