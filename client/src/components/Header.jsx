import { useEffect, useRef, useState } from 'react'
import { QuickSearch } from './QuickSearch.jsx'
import {
  IconChevronDown,
  IconClose,
  IconGrid,
  IconHome,
  IconList,
  IconLogout,
  IconMenu,
  IconShield,
  IconSpark,
} from './Icons.jsx'
import { useAppState, can } from '../lib/AppState.jsx'
import { paths } from '../lib/router.js'
import { roles } from '../lib/roles.js'

export function Logo({ onClick }) {
  const inner = (
    <>
      <span className="logo-mark" aria-hidden="true">CAA</span>
      <span className="logo-text">
        <span className="logo-name">AI Product Finder</span>
        <span className="logo-sub">Cabalen Auto Aircon</span>
      </span>
    </>
  )

  return onClick ? (
    <a
      href="#/"
      className="logo"
      onClick={(event) => {
        event.preventDefault()
        onClick()
      }}
      aria-label="CAA AI Product Finder, home"
    >
      {inner}
    </a>
  ) : (
    <span className="logo">{inner}</span>
  )
}

function NavLink({
  to,
  current,
  navigate,
  icon,
  children,
  onDone,
}) {
  return (
    <a
      href={`#${to}`}
      className="nav-link"
      aria-current={current ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault()
        navigate(to)
        onDone?.()
      }}
    >
      {icon}
      {children}
    </a>
  )
}

function AccountMenu({ navigate }) {
  const { currentUser, logout } = useAppState()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!currentUser) return null

  const role = roles.find((item) => item.id === currentUser.role)

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account-btn"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar" aria-hidden="true">
          {currentUser.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="account-name">{currentUser.name}</span>
        <IconChevronDown size={16} />
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div className="account-menu">
          <div className="account-head">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.email}</span>
            <span className="role-pill">
              {role?.name ?? currentUser.role}
            </span>
          </div>
          {can(currentUser, 'manageRecords') && (
            <button
              type="button"
              className="menu-item"
              onClick={() => go(paths.records())}
            >
              <IconList size={18} /> Product records
            </button>
          )}
          {can(currentUser, 'manageUsers') && (
            <button
              type="button"
              className="menu-item"
              onClick={() => go(paths.admin())}
            >
              <IconShield size={18} /> User administration
            </button>
          )}
          {!can(currentUser, 'manageRecords') && (
            <p className="menu-note">
              Viewer accounts can browse and search.
            </p>
          )}
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              setOpen(false)
              logout()
              navigate(paths.login(), { replace: true })
            }}
          >
            <IconLogout size={18} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Header({ route, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const first = route.parts[0] || ''
  const section =
    first === ''
      ? 'home'
      : first === 'brand' || first === 'brands' || first === 'vehicle'
        ? 'brands'
        : first

  useEffect(() => setMenuOpen(false), [route.path])

  return (
    <header className="header">
      <div className="header-row wrap">
        <Logo onClick={() => navigate(paths.home())} />
        <div className="header-search">
          <QuickSearch
            navigate={navigate}
            id="quick-search-desktop"
          />
        </div>
        <nav
          className={`nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Main"
          id="main-nav"
        >
          <NavLink
            to={paths.home()}
            current={section === 'home'}
            navigate={navigate}
            icon={<IconHome size={18} />}
          >
            Home
          </NavLink>
          <NavLink
            to={paths.brands()}
            current={section === 'brands'}
            navigate={navigate}
            icon={<IconGrid size={18} />}
          >
            Brands
          </NavLink>
          <NavLink
            to={paths.ai()}
            current={section === 'ai'}
            navigate={navigate}
            icon={<IconSpark size={18} />}
          >
            AI
          </NavLink>
        </nav>
        <div className="header-end">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
            <span className="sr-only">
              {menuOpen ? 'Close menu' : 'Menu'}
            </span>
          </button>
          <AccountMenu navigate={navigate} />
        </div>
      </div>
      <div className="header-search-row wrap">
        <QuickSearch
          navigate={navigate}
          id="quick-search-mobile"
        />
      </div>
    </header>
  )
}
