import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

// 서버 재시작 시 localStorage 초기화 (dev 모드 테스트용)
const BUILD_ID = Date.now().toString();
if (localStorage.getItem("__build_id") !== BUILD_ID) {
  localStorage.clear();
  localStorage.setItem("__build_id", BUILD_ID);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
