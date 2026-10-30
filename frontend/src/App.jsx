import { useState } from 'react'
import './App.css'

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/students/');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Make sure your Django server is running and JWT is temporarily disabled or we are logged in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <h1>School Management System</h1>
      <button onClick={fetchStudents}>
        {loading ? 'Loading...' : 'Fetch Students'}
      </button>

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