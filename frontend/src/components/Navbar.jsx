import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          PocketFile
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/upload" className="navbar-link">
            Upload File
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link">
              Quản trị
            </Link>
          )}
          <div className="navbar-user">
            <span>{user?.username}</span>
            <span className="navbar-role">({user?.role})</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

