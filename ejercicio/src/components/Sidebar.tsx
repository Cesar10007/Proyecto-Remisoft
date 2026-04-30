interface SidebarProps {
  items: string[]
}

export default function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">Remisoft</div>
      <nav>
        {items.map((item) => (
          <span key={item} className="sidebar-link">
            {item}
          </span>
        ))}
      </nav>
    </aside>
  )
}
