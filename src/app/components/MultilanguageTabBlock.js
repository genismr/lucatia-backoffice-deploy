import React, { useState } from 'react'
import { AppBar, Tabs, Tab } from '@material-ui/core'
import { useSelector, shallowEqual } from "react-redux";

function MultilanguageTabBlock({ multilanguageTabContent }) {
	const [tab, setTab] = useState(0)
    const languages = useSelector((store) => store.authentication?.languages, shallowEqual)

	const handleChangeTabs = (_, newValue) => {
		setTab(newValue)
	}

	// When no languages are loaded it returns this
	if (!languages)
		return (
			<div> Loading... or an error occurred, please check your language settings </div>
		)

	return (
		<>
			<AppBar position="static" color="default" key="appbar">
				<Tabs
					value={tab}
					onChange={handleChangeTabs}
					variant="scrollable"
					scrollButtons="auto"
					key="tabs"
				>
					{languages.map((lang) => (
						<Tab
							key={lang.isocode}
							label={lang.fullName} />
					))}
				</Tabs>
			</AppBar>
			{languages.map((lang, index) =>
				tab === index && (
					<div key={`tabContainer-${index}`}>
						{multilanguageTabContent(lang.isocode)}
					</div>
				)
			)}
		</>
	)
}

export default MultilanguageTabBlock
