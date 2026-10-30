import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')

  // Form states for creating a student
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [admissionNo, setAdmissionNo] = useState('')
  const [dob, setDob] = useState('')
  const [classroom, setClassroom] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Server error. Is Django running?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setStudents([]);
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/students/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CREATE: Add a new student
  const addStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          admission_no: admissionNo,
          date_of_birth: dob,
          classroom: classroom ? parseInt(classroom) : null
        })
      });
      if (response.ok) {
        alert("Student Added!");
        setFirstName(''); setLastName(''); setAdmissionNo(''); setDob(''); setClassroom('');
        fetchStudents(); // Refresh the list
      } else {
        alert("Failed to add student. Check if the classroom ID exists.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE: Remove a student
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/students/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchStudents(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <h2>Admin Login</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>School Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* CREATE FORM */}
      <div className="add-form">
        <h3>Add New Student</h3>
        <form onSubmit={addStudent}>
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          <input type="number" placeholder="Classroom ID (e.g., 1)" value={classroom} onChange={(e) => setClassroom(e.target.value)} />
          <button type="submit">Add Student</button>
        </form>
      </div>

      <button onClick={fetchStudents} className="fetch-btn">Refresh List</button>

      <div className="student-list">
        {students.map(student => (
          <div key={student.id} className="student-card">
            <div>
              <h3>{student.first_name} {student.last_name}</h3>
              <p>Admission No: {student.admission_no}</p>
            </div>
            <button onClick={() => deleteStudent(student.id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App