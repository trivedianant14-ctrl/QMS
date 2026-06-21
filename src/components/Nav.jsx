import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <div className="raq-nav">
      <div className="raq-nav-main">
        <div className="raq-brand">NPrep QMS</div>
        <div className="raq-tabs">
          <a className="raq-tab" href="/nprep">QBank</a>
          <NavLink className={({ isActive }) => `raq-tab ${isActive ? 'active' : ''}`} to="/form">
            Student Form
          </NavLink>
          <NavLink className={({ isActive }) => `raq-tab ${isActive ? 'active' : ''}`} to="/dashboard">
            Product Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `raq-tab ${isActive ? 'active' : ''}`} to="/resolver">
            Agent
          </NavLink>
          <NavLink className={({ isActive }) => `raq-tab ${isActive ? 'active' : ''}`} to="/manager">
            Manager
          </NavLink>
          <NavLink className={({ isActive }) => `raq-tab ${isActive ? 'active' : ''}`} to="/faculty">
            Faculty View
          </NavLink>
        </div>
      </div>
      <div className="raq-banner">Prototype — Engineering Reference Only</div>
    </div>
  )
}
