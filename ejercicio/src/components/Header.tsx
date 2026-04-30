interface HeaderProps {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="panel-header">
      <p className="eyebrow">Remisoft</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </header>
  )
}
