import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import './FileUpload.css'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api')

const FileUpload = () => {
  const [file, setFile] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/files/projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File không được vượt quá 100MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Vui lòng chọn file')
      return
    }

    if (!version) {
      setError('Vui lòng nhập version')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('version', version)

      // Xử lý logic dự án:
      // - Nếu chọn dự án có sẵn -> dùng projectId (số)
      // - Nếu chọn "+ Tạo dự án mới" -> tạo project mới rồi dùng id mới
      if (projectId && projectId !== 'new') {
        formData.append('project_id', projectId)
      } else if (projectId === 'new' && projectName) {
        // Tạo project mới trước
        const projectResponse = await axios.post(`${API_URL}/files/projects`, {
          name: projectName
        })
        formData.append('project_id', projectResponse.data.id)
      }

      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess('Upload file thành công!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      setError(error.response?.data?.error || 'Upload thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>Upload File</h1>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Chọn File (tối đa 100MB):</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className="file-info">
                  File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Version:</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="VD: 1.0.0"
                required
              />
            </div>

            <div className="form-group">
              <label>Dự án:</label>
              <select
                value={projectId}
                onChange={(e) => {
                  const value = e.target.value
                  setProjectId(value)
                  if (value !== 'new') {
                    setProjectName('')
                  }
                }}
              >
                <option value="">-- Chọn dự án --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
                <option value="new">+ Tạo dự án mới</option>
              </select>
            </div>

            {projectId === 'new' && (
              <div className="form-group">
                <label>Tên dự án mới:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nhập tên dự án"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang upload...' : 'Upload'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default FileUpload

