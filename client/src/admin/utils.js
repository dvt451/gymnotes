import { actionLabels } from './constants.js'

export const createMessage = (type, text) => ({ type, text })

export const formatDate = (value) => {
	if (!value) {
		return 'Never'
	}

	return new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(value))
}

export const fetchJson = async (url, options = {}) => {
	const response = await fetch(url, options)
	const contentType = response.headers.get('content-type') || ''
	const data = contentType.includes('application/json')
		? await response.json()
		: { message: await response.text() }

	if (!response.ok) {
		throw new Error(data?.message || 'Request failed')
	}

	return data
}

export const formatActionLabel = (action) => actionLabels[action] || action.replaceAll('.', ' ')

export const stringifyDetails = (details = {}) => {
	const entries = Object.entries(details).filter(([, value]) => {
		if (value === null || value === undefined || value === '') {
			return false
		}

		if (typeof value === 'object') {
			return Object.keys(value).length > 0
		}

		return true
	})

	if (entries.length === 0) {
		return 'No extra details'
	}

	return entries
		.map(([key, value]) => {
			const normalizedValue =
				typeof value === 'object'
					? JSON.stringify(value)
					: String(value)

			return `${key}: ${normalizedValue}`
		})
		.join(' | ')
}

export const getDisplayStatus = (user) =>
	user?.displayStatus || (user?.isDeleted ? 'deleted' : user?.accountStatus || 'active')

export const getStatusTone = (user) => {
	const status = getDisplayStatus(user)

	if (status === 'deleted') {
		return 'danger'
	}

	if (status === 'suspended') {
		return 'warning'
	}

	return 'success'
}

export const buildUserQueryString = (query, role) => {
	const params = new URLSearchParams()
	params.set('page', String(query.page))
	params.set('pageSize', String(query.pageSize))

	if (query.search.trim()) {
		params.set('search', query.search.trim())
	}

	if (query.status !== 'all') {
		params.set('status', query.status)
	}

	if (query.includeDeleted) {
		params.set('includeDeleted', 'true')
	}

	if (role !== 'all') {
		params.set('role', role)
	}

	return params.toString()
}

export const buildAuditQueryString = (query) => {
	const params = new URLSearchParams()
	params.set('page', String(query.page))
	params.set('pageSize', String(query.pageSize))

	if (query.search.trim()) {
		params.set('search', query.search.trim())
	}

	return params.toString()
}
