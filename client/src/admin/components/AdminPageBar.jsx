import React, { useContext } from 'react'
import AdminHeader from './AdminHeader'
import AdminTabs from './AdminTabs'
import { GlobalContext } from '../../context/GlobalContext';
import { MdSpaceDashboard } from 'react-icons/md';

export default function AdminPageBar({
	adminUser,
	isRefreshingSummary,
	onRefresh,
	onLogout,
	activeTab,
	onTabChange,
	visibleTabs,
}) {
	const { mainColor, adminBarState, setAdminBarState } = useContext(GlobalContext);

	return (
		<div className={`admin-nav-block${adminBarState ? ' is-expanded' : ''}`}>
			<div className={`admin-nav-row`}>
				<AdminHeader
					adminUser={adminUser}
					isRefreshingSummary={isRefreshingSummary}
					onRefresh={onRefresh}
					onLogout={onLogout}
				/>
				<AdminTabs activeTab={activeTab} onChange={onTabChange} tabs={visibleTabs} />
			</div>
			<button className='menu-button' onClick={() => setAdminBarState(!adminBarState)}>
				<div className='column'></div>
				<div className='column'><MdSpaceDashboard /></div>
			</button>
		</div>
	)
}
