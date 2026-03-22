export default function AdminStatusPill({ tone, children }) {
	return <span className={`admin-pill admin-pill-${tone}`}>{children}</span>
}
