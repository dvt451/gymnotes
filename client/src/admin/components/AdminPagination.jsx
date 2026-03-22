export default function AdminPagination({ pagination, onPageChange }) {
	return (
		<div className="admin-pagination">
			<button
				className="admin-secondary-button"
				type="button"
				onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
				disabled={!pagination.hasPrev}
			>
				Previous
			</button>
			<span className="admin-pagination-label">
				Page {pagination.page} of {pagination.totalPages} | {pagination.totalItems} items
			</span>
			<button
				className="admin-secondary-button"
				type="button"
				onClick={() => onPageChange(pagination.page + 1)}
				disabled={!pagination.hasNext}
			>
				Next
			</button>
		</div>
	)
}
