import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'

/* 
	ThemeSwitcher

	A bootstrap-react light/dark theme toggler.

	Inspired by: 
		https://github.com/han109k/light-switch-bootstrap 

	Code based on:
		https://getbootstrap.com/docs/5.3/customize/color-modes/

	svg moon image credit:
		https://www.svgrepo.com 

	svg sun image credit:
		https://github.com/han109k/light-switch-bootstrap 
*/

// get and set our theme in local storage: 'light' or 'dark'

const getStoredTheme = () => localStorage.getItem('atfeedtheme')
const setStoredTheme = theme => localStorage.setItem('atfeedtheme', theme)


// If we have a theme in local storage, use it. 
// Otherwise, use the preferred system theme.
const getPreferredTheme = () => {

    const storedTheme = getStoredTheme()

    if (storedTheme)
      return storedTheme

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// apply the specified theme to the document and store it in local storage
const setTheme = theme => {
	document.documentElement.setAttribute('data-bs-theme',theme)
	setStoredTheme(theme)
}

// theme toggle switch handler
const onToggleTheme = e => {
	setTheme(e.target.checked ? 'dark' : 'light')
}


const ThemeSwitcher = () => {

	useEffect(()=>{

		// get either the system theme or our stored theme
		const theme = getPreferredTheme()

		// apply the theme
		setTheme(theme)

		// set toggle switch state to match the theme
		document.getElementById('lightSwitch').checked = (theme === 'dark')	

	},[])

	return (
		<div className="d-flex flex-row-reverse align-items-center gap-2 pt-3 pe-3">
			<div>
				<ReactSVG src="https://scrapnet.space/projects/atfeed/moon.svg" />
			</div>
			<div className="form-check form-switch">
				<input
				className="form-check-input"
				type="checkbox"
				id="lightSwitch"
				onChange = {e => onToggleTheme(e)}
				style = {{
					height: '24px',
					width:  '48px'
				}}
				/>
			</div>
			<div>
				<ReactSVG src="https://scrapnet.space/projects/atfeed/sun.svg" />
			</div>
		</div> 
	)
}

export default ThemeSwitcher
