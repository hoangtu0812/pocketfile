import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const Dashboard = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files`)
      setFiles(response.data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getDownloadUrl = (filePath) => {
    const baseUrl = window.location.origin
    return `${baseUrl}${filePath}`
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Đã copy đường dẫn vào clipboard!')
    } catch (error) {
      alert('Không thể copy. Vui lòng thử lại.')
    }
  }

  const generateQRCode = async (fileId) => {
    try {
      const response = await axios.get(`${API_URL}/files/${fileId}/qrcode`)
      const { qrCode, downloadUrl } = response.data
      
      // Open QR code in new window
      const newWindow = window.open('', '_blank')
      newWindow.document.write(`
        <html>
          <head><title>QR Code</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial;">
            <h2>QR Code Download</h2>
            <img src="${qrCode}" alt="QR Code" style="margin: 20px;" />
            <p>Đường dẫn: <a href="${downloadUrl}" target="_blank">${downloadUrl}</a></p>
            <button onclick="navigator.clipboard.writeText('${downloadUrl}').then(() => alert('Đã copy!'))" style="padding: 10px 20px; margin-top: 10px;">
              Copy đường dẫn
            </button>
          </body>
        </html>
      `)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Không thể tạo QR code')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading">Đang tải...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <a href="/upload" className="btn btn-primary">
            Upload File Mới
          </a>
        </div>

        <div className="card">
          <h2>Danh sách Files</h2>
          {files.length === 0 ? (
            <p>Chưa có file nào được upload.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên File</th>
                  <th>Dự án</th>
                  <th>Version</th>
                  <th>Kích thước</th>
                  <th>Người upload</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const downloadUrl = getDownloadUrl(file.file_path)
                  return (
                    <tr key={file.id}>
                      <td>{file.original_filename}</td>
                      <td>{file.project_name || 'N/A'}</td>
                      <td>{file.version}</td>
                      <td>{formatFileSize(file.file_size)}</td>
                      <td>{file.uploaded_by_username}</td>
                      <td>{formatDate(file.upload_time)}</td>
                      <td>
                        <div className="action-buttons">
                          <a
                            href={downloadUrl}
                            download
                            className="btn btn-success"
                            style={{ marginRight: '5px' }}
                          >
                            Tải về
                          </a>
                          <button
                            onClick={() => copyToClipboard(downloadUrl)}
                            className="btn btn-secondary"
                            style={{ marginRight: '5px' }}
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => generateQRCode(file.id)}
                            className="btn btn-primary"
                          >
                            QR Code
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard

