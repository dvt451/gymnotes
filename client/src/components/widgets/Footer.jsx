import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaRegUser } from "react-icons/fa";
import { createFooterStyle } from './footerStyle.js'
import { MdHomeFilled } from "react-icons/md";
import { GlobalContext } from '../../context/GlobalContext.jsx';
import { GiMuscleUp } from "react-icons/gi";

export default function Footer() {
	const location = useLocation().pathname;
	const { mainColor } = useContext(GlobalContext);

	const footerStyle = createFooterStyle(mainColor);

	return (
		<footer style={footerStyle.footer}>
			<div style={footerStyle.linkList}>
				<Link
					to="/home"
					style={{
						...footerStyle.footerLink,
						...(location === '/home' && footerStyle.footerLinkActive)
					}}
				>
					<MdHomeFilled style={{
						...footerStyle.footerLinkIcon,
						...(location === '/home' && footerStyle.footerLinkActive)
					}} />
					<span style={footerStyle.footerLinkText}>Home</span>
					<span style={{
						...footerStyle.footerLink,
						...(location === '/home' && footerStyle.footerLinkActive)
					}}></span>
				</Link>
				<Link
					to="/exercise-library"
					style={{
						...footerStyle.footerLink,
						...(location === '/exercise-library' && footerStyle.footerLinkActive)
					}}
				>
					<GiMuscleUp style={{
						...footerStyle.footerLinkIcon,
						...(location === '/exercise-library' && footerStyle.footerLinkActive)
					}} />
					<span style={footerStyle.footerLinkText}>Exercise Library</span>
					<span style={{
						...footerStyle.footerLink,
						...(location === '/exercise-library' && footerStyle.footerLinkActive)
					}}></span>
				</Link>
				<Link
					to="/profile"
					style={{
						...footerStyle.footerLink,
						...(location === '/profile' && footerStyle.footerLinkActive)
					}}
				>
					<FaRegUser style={{
						...footerStyle.footerLinkIcon,
						...(location === '/profile' && footerStyle.footerLinkActive)
					}} />
					<span style={footerStyle.footerLinkText}>Profile</span>
					<span style={{
						...footerStyle.footerLink,
						...(location === '/profile' && footerStyle.footerLinkActive)
					}}></span>
				</Link>
			</div>
		</footer>
	)
}