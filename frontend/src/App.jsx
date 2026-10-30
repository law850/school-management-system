import { useState, useEffect } from 'react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('students')

  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classrooms, setClassrooms] = useState([])

  // --- EDIT STATE ---
  const [editId, setEditId] = useState(null) 

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [classroom, setClassroom] = useState('')

  const [tFirstName, setTFirstName] = useState('')
  const [tLastName, setTLastName] = useState('')
  const [tEmail, setTEmail] = useState('')
  const [tPhone, setTPhone] = useState('')
  const [tSubject, setTSubject] = useState('')

  const [cName, setCName] = useState('')
  const [cSection, setCSection] = useState('')

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
      setEditId(null); // Clear edit mode when switching tabs
    }
  }, [token, activeTab]);

  // --- ADD OR UPDATE FUNCTION ---
  const handleSubmit = async (e, endpoint, payload, resetFunc, fetchFunc) => {
    e.preventDefault();
    
    // If editId exists, we are updating (PUT). Otherwise, we are creating (POST).
    const url = editId 
      ? `http://127.0.0.1:8000/api/${endpoint}/${editId}/` 
      : `http://127.0.0.1:8000/api/${endpoint}/`;
      
    const method = editId ? 'PUT' : 'POST';

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    setEditId(null); // Exit edit mode
    resetFunc();
    fetchFunc();
  };

  // --- POPULATE FORM FOR EDITING ---
  const startEdit = (type, item) => {
    setEditId(item.id);
    if (type === 'students') {
      setFirstName(item.first_name);
      setLastName(item.last_name);
      setDob(item.date_of_birth);
      setClassroom(item.classroom || '');
    } else if (type === 'teachers') {
      setTFirstName(item.first_name);
      setTLastName(item.last_name);
      setTEmail(item.email);
      setTPhone(item.phone);
      setTSubject(item.subject_specialty);
    } else if (type === 'classrooms') {
      setCName(item.name);
      setCSection(item.section);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setFirstName(''); setLastName(''); setDob(''); setClassroom('');
    setTFirstName(''); setTLastName(''); setTEmail(''); setTPhone(''); setTSubject('');
    setCName(''); setCSection('');
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

  // Modern UI Classes
  const inputClass = "w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition text-white";
  const btnClass = "w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition text-white shadow-lg";
  const cardClass = "bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-2 relative";

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

      <div className="flex gap-4 mb-8 bg-slate-800/50 p-2 rounded-xl w-max border border-slate-700">
        {['students', 'teachers', 'classrooms'].map(tab => (
          <button 
            key={tab}
            className={`px-6 py-2 rounded-lg capitalize font-medium transition ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            onClick={() => { setActiveTab(tab); cancelEdit(); }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Forms */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl h-max">
          <h3 className="text-2xl font-bold mb-6 text-indigo-300 capitalize">
            {editId ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
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
        </div>

        {/* Lists */}
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
          
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

        </div>
      </div>
    </div>
  )
}

export default App