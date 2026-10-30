import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')

  // 1. Function to handle login
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
        localStorage.setItem('access_token', data.access); // Save token to browser
        setToken(data.access); // Update state
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Server error. Is Django running?');
    }
  };

  // 2. Function to log out
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setStudents([]);
  };

  // 3. Function to fetch students (Now using the token!)
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/students/', {
        headers: {
          'Authorization': `Bearer ${token}` // Send the token to Django
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        alert("Your session expired. Please log in again.");
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If no token, show the Login Screen
  if (!token) {
    return (
      <div className="login-container">
        <h2>Admin Login</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // If we have a token, show the Dashboard
  return (
    <div className="App">
      <div className="header">
        <h1>School Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      <button onClick={fetchStudents} className="fetch-btn">Fetch Students</button>

      <div className="student-list">
        {students.map(student => (
          <div key={student.id} className="student-card">
            <h3>{student.first_name} {student.last_name}</h3>
            <p>Admission No: {student.admission_no}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App