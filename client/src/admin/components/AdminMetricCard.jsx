export default function AdminMetricCard({ label, value }) {
	return (
		<div className="admin-metric-card">
			<span className="admin-metric-label">{label}</span>
			<strong className="admin-metric-value">{value}</strong>
		</div>
	)
}
