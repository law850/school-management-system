import { useState, useEffect } from 'react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Data States
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [attendance, setAttendance] = useState([])
  const [subjects, setSubjects] = useState([])
  const [grades, setGrades] = useState([])

  // Edit State
  const [editId, setEditId] = useState(null) 

  // Form States (Students)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [classroom, setClassroom] = useState('')

  // Form States (Teachers)
  const [tFirstName, setTFirstName] = useState('')
  const [tLastName, setTLastName] = useState('')
  const [tEmail, setTEmail] = useState('')
  const [tPhone, setTPhone] = useState('')
  const [tSubject, setTSubject] = useState('')

  // Form States (Classrooms)
  const [cName, setCName] = useState('')
  const [cSection, setCSection] = useState('')

  // Form States (Attendance)
  const [attStudent, setAttStudent] = useState('')
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [attStatus, setAttStatus] = useState('Present')

  // Form States (Subjects)
  const [subName, setSubName] = useState('')
  const [subCode, setSubCode] = useState('')

  // Form States (Grades)
  const [gStudent, setGStudent] = useState('')
  const [gSubject, setGSubject] = useState('')
  const [gScore, setGScore] = useState('')
  const [gTerm, setGTerm] = useState('Term 1')

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
      } else setError('Invalid credentials');
    } catch (err) { setError('Server error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setter(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'students') fetchData('students', setStudents);
      if (activeTab === 'teachers') fetchData('teachers', setTeachers);
      if (activeTab === 'classrooms') fetchData('classrooms', setClassrooms);
      if (activeTab === 'attendance') {
        fetchData('attendance', setAttendance);
        fetchData('students', setStudents); 
      }
      if (activeTab === 'subjects') fetchData('subjects', setSubjects);
      if (activeTab === 'grades') {
        fetchData('grades', setGrades);
        fetchData('students', setStudents); 
        fetchData('subjects', setSubjects);
      }
      if (activeTab === 'dashboard') {
        fetchData('students', setStudents);
        fetchData('teachers', setTeachers);
        fetchData('classrooms', setClassrooms);
        fetchData('attendance', setAttendance);
      }
      setEditId(null); 
    }
  }, [token, activeTab]);

  const handleSubmit = async (e, endpoint, payload, resetFunc, fetchFunc) => {
    e.preventDefault();
    const url = editId 
      ? `http://127.0.0.1:8000/api/${endpoint}/${editId}/` 
      : `http://127.0.0.1:8000/api/${endpoint}/`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      alert("Error saving data. Check your inputs.");
      return;
    }
    setEditId(null); 
    resetFunc();
    fetchFunc();
  };

  const startEdit = (type, item) => {
    setEditId(item.id);
    if (type === 'students') {
      setFirstName(item.first_name); setLastName(item.last_name); setDob(item.date_of_birth); setClassroom(item.classroom || '');
    } else if (type === 'teachers') {
      setTFirstName(item.first_name); setTLastName(item.last_name); setTEmail(item.email); setTPhone(item.phone); setTSubject(item.subject_specialty);
    } else if (type === 'classrooms') {
      setCName(item.name); setCSection(item.section);
    } else if (type === 'subjects') {
      setSubName(item.name); setSubCode(item.code);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setFirstName(''); setLastName(''); setDob(''); setClassroom('');
    setTFirstName(''); setTLastName(''); setTEmail(''); setTPhone(''); setTSubject('');
    setCName(''); setCSection('');
    setAttStudent(''); setAttStatus('Present');
    setSubName(''); setSubCode('');
    setGStudent(''); setGSubject(''); setGScore(''); setGTerm('Term 1');
  };

  const deleteItem = async (endpoint, id, fetchFunc) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/${endpoint}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFunc();
    } catch (err) { console.error(err); }
  };

  // Dashboard Stats
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClassrooms = classrooms.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 0;

  // UI Classes
  const inputClass = "w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition text-white";
  const btnClass = "w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition text-white shadow-lg";
  const cardClass = "bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-2 relative mb-2";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <h2 className="text-3xl font-bold text-center mb-6 text-white">Admin Login</h2>
          {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="text" placeholder="Username" className={inputClass} value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className={btnClass}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          School Dashboard
        </h1>
        <button onClick={handleLogout} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition text-white">Logout</button>
      </header>

      <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
        {['dashboard', 'students', 'teachers', 'classrooms', 'attendance', 'subjects', 'grades'].map(tab => (
          <button 
            key={tab}
            className={`px-4 py-2 rounded-lg capitalize font-medium transition ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            onClick={() => { setActiveTab(tab); cancelEdit(); }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: FORMS */}
        <div className={`bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl h-max ${activeTab === 'dashboard' ? 'hidden' : ''}`}>
          <h3 className="text-2xl font-bold mb-6 text-indigo-300 capitalize">
            {editId ? `Edit ${activeTab.slice(0, -1)}` : activeTab === 'attendance' ? 'Record Attendance' : activeTab === 'grades' ? 'Record Grade' : `Add New ${activeTab.slice(0, -1)}`}
          </h3>
          
          {activeTab === 'students' && (
            <form onSubmit={(e) => handleSubmit(e, 'students', { first_name: firstName, last_name: lastName, date_of_birth: dob, classroom: classroom ? parseInt(classroom) : null }, () => { setFirstName(''); setLastName(''); setDob(''); setClassroom(''); }, () => fetchData('students', setStudents))} className="flex flex-col gap-4">
              <input type="text" placeholder="First Name" className={inputClass} value={firstName} onChange={e => setFirstName(e.target.value)} required />
              <input type="text" placeholder="Last Name" className={inputClass} value={lastName} onChange={e => setLastName(e.target.value)} required />
              <input type="date" className={inputClass} value={dob} onChange={e => setDob(e.target.value)} required />
              <input type="number" placeholder="Classroom ID" className={inputClass} value={classroom} onChange={e => setClassroom(e.target.value)} />
              <div className="flex gap-2">
                <button type="submit" className={btnClass}>{editId ? 'Update Student' : 'Add Student'}</button>
                {editId && <button type="button" onClick={cancelEdit} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition text-white">Cancel</button>}
              </div>
            </form>
          )}

          {activeTab === 'teachers' && (
            <form onSubmit={(e) => handleSubmit(e, 'teachers', { first_name: tFirstName, last_name: tLastName, email: tEmail, phone: tPhone, subject_specialty: tSubject }, () => { setTFirstName(''); setTLastName(''); setTEmail(''); setTPhone(''); setTSubject(''); }, () => fetchData('teachers', setTeachers))} className="flex flex-col gap-4">
              <input type="text" placeholder="First Name" className={inputClass} value={tFirstName} onChange={e => setTFirstName(e.target.value)} required />
              <input type="text" placeholder="Last Name" className={inputClass} value={tLastName} onChange={e => setTLastName(e.target.value)} required />
              <input type="email" placeholder="Email" className={inputClass} value={tEmail} onChange={e => setTEmail(e.target.value)} required />
              <input type="text" placeholder="Phone" className={inputClass} value={tPhone} onChange={e => setTPhone(e.target.value)} required />
              <input type="text" placeholder="Subject Specialty" className={inputClass} value={tSubject} onChange={e => setTSubject(e.target.value)} required />
              <div className="flex gap-2">
                <button type="submit" className={btnClass}>{editId ? 'Update Teacher' : 'Add Teacher'}</button>
                {editId && <button type="button" onClick={cancelEdit} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition text-white">Cancel</button>}
              </div>
            </form>
          )}

          {activeTab === 'classrooms' && (
            <form onSubmit={(e) => handleSubmit(e, 'classrooms', { name: cName, section: cSection }, () => { setCName(''); setCSection(''); }, () => fetchData('classrooms', setClassrooms))} className="flex flex-col gap-4">
              <input type="text" placeholder="Class Name (e.g. Form 1)" className={inputClass} value={cName} onChange={e => setCName(e.target.value)} required />
              <input type="text" placeholder="Section (e.g. A)" className={inputClass} value={cSection} onChange={e => setCSection(e.target.value)} required />
              <div className="flex gap-2">
                <button type="submit" className={btnClass}>{editId ? 'Update Classroom' : 'Add Classroom'}</button>
                {editId && <button type="button" onClick={cancelEdit} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition text-white">Cancel</button>}
              </div>
            </form>
          )}

          {activeTab === 'attendance' && (
            <form onSubmit={(e) => handleSubmit(e, 'attendance', { student: parseInt(attStudent), date: attDate, status: attStatus }, () => { setAttStudent(''); setAttStatus('Present'); }, () => fetchData('attendance', setAttendance))} className="flex flex-col gap-4">
              <select className={inputClass} value={attStudent} onChange={e => setAttStudent(e.target.value)} required>
                <option value="">Select Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</option>)}
              </select>
              <input type="date" className={inputClass} value={attDate} onChange={e => setAttDate(e.target.value)} required />
              <select className={inputClass} value={attStatus} onChange={e => setAttStatus(e.target.value)} required>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
              <button type="submit" className={btnClass}>Record Attendance</button>
            </form>
          )}

          {activeTab === 'subjects' && (
            <form onSubmit={(e) => handleSubmit(e, 'subjects', { name: subName, code: subCode }, () => { setSubName(''); setSubCode(''); }, () => fetchData('subjects', setSubjects))} className="flex flex-col gap-4">
              <input type="text" placeholder="Subject Name (e.g. Mathematics)" className={inputClass} value={subName} onChange={e => setSubName(e.target.value)} required />
              <input type="text" placeholder="Subject Code (e.g. MAT101)" className={inputClass} value={subCode} onChange={e => setSubCode(e.target.value)} required />
              <div className="flex gap-2">
                <button type="submit" className={btnClass}>{editId ? 'Update Subject' : 'Add Subject'}</button>
                {editId && <button type="button" onClick={cancelEdit} className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition text-white">Cancel</button>}
              </div>
            </form>
          )}

          {activeTab === 'grades' && (
            <form onSubmit={(e) => handleSubmit(e, 'grades', { student: parseInt(gStudent), subject: parseInt(gSubject), score: parseFloat(gScore), term: gTerm }, () => { setGStudent(''); setGSubject(''); setGScore(''); setGTerm('Term 1'); }, () => fetchData('grades', setGrades))} className="flex flex-col gap-4">
              <select className={inputClass} value={gStudent} onChange={e => setGStudent(e.target.value)} required>
                <option value="">Select Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
              <select className={inputClass} value={gSubject} onChange={e => setGSubject(e.target.value)} required>
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Score (0-100)" className={inputClass} value={gScore} onChange={e => setGScore(e.target.value)} required />
              <select className={inputClass} value={gTerm} onChange={e => setGTerm(e.target.value)}>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <button type="submit" className={btnClass}>Record Grade</button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: LISTS & DASHBOARD */}
        <div className={`flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-2 ${activeTab === 'dashboard' ? 'hidden' : ''}`}>
          
          {activeTab === 'students' && students.map(s => (
            <div key={s.id} className={cardClass}>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">{s.first_name} {s.last_name}</h3>
                <span className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-700">{s.admission_no}</span>
              </div>
              <p className="text-slate-400 text-sm">Classroom ID: {s.classroom || 'Unassigned'}</p>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => startEdit('students', s)} className="bg-slate-700 text-white hover:bg-indigo-600 px-3 py-1 rounded text-xs font-bold transition">Edit</button>
                <button onClick={() => deleteItem('students', s.id, () => fetchData('students', setStudents))} className="bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}

          {activeTab === 'teachers' && teachers.map(t => (
            <div key={t.id} className={cardClass}>
              <h3 className="text-xl font-bold text-white">{t.first_name} {t.last_name}</h3>
              <p className="text-indigo-400 text-sm font-medium">{t.subject_specialty}</p>
              <p className="text-slate-400 text-sm">📧 {t.email}</p>
              <p className="text-slate-400 text-sm">📞 {t.phone}</p>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => startEdit('teachers', t)} className="bg-slate-700 text-white hover:bg-indigo-600 px-3 py-1 rounded text-xs font-bold transition">Edit</button>
                <button onClick={() => deleteItem('teachers', t.id, () => fetchData('teachers', setTeachers))} className="bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}

          {activeTab === 'classrooms' && classrooms.map(c => (
            <div key={c.id} className={cardClass}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{c.name} - {c.section}</h3>
                <span className="text-slate-500 text-xs">ID: {c.id}</span>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => startEdit('classrooms', c)} className="bg-slate-700 text-white hover:bg-indigo-600 px-3 py-1 rounded text-xs font-bold transition">Edit</button>
                <button onClick={() => deleteItem('classrooms', c.id, () => fetchData('classrooms', setClassrooms))} className="bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}

          {activeTab === 'attendance' && attendance.map(a => (
            <div key={a.id} className={cardClass}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{a.student_name}</h3>
                  <p className="text-slate-400 text-sm">Date: {a.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  a.status === 'Present' ? 'bg-green-900/50 text-green-300 border-green-700' : 
                  a.status === 'Absent' ? 'bg-red-900/50 text-red-300 border-red-700' : 
                  'bg-yellow-900/50 text-yellow-300 border-yellow-700'
                }`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}

          {activeTab === 'subjects' && subjects.map(s => (
            <div key={s.id} className={cardClass}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{s.name}</h3>
                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600">{s.code}</span>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => startEdit('subjects', s)} className="bg-slate-700 text-white hover:bg-indigo-600 px-3 py-1 rounded text-xs font-bold transition">Edit</button>
                <button onClick={() => deleteItem('subjects', s.id, () => fetchData('subjects', setSubjects))} className="bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}

          {activeTab === 'grades' && grades.map(g => (
            <div key={g.id} className={cardClass}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{g.student_name}</h3>
                  <p className="text-indigo-400 text-sm font-medium">{g.subject_name} ({g.term})</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold block ${
                    g.letter_grade === 'A' ? 'text-green-400' : 
                    g.letter_grade === 'B' ? 'text-blue-400' : 
                    g.letter_grade === 'C' ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>{g.score}</span>
                  <span className="text-slate-400 text-xs font-bold">Grade: {g.letter_grade}</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => deleteItem('grades', g.id, () => fetchData('grades', setGrades))} className="bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition">Delete</button>
              </div>
            </div>
          ))}

        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center">
              <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Students</h4>
              <span className="text-5xl font-extrabold text-indigo-400">{totalStudents}</span>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center">
              <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Teachers</h4>
              <span className="text-5xl font-extrabold text-cyan-400">{totalTeachers}</span>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center">
              <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Classrooms</h4>
              <span className="text-5xl font-extrabold text-emerald-400">{totalClassrooms}</span>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center">
              <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Present Today</h4>
              <span className="text-5xl font-extrabold text-amber-400">{attendanceRate}%</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App