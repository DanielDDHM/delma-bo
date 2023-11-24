/**
 *
 * SelectableTabs
 *
 */

import React from 'react';
import './styles.scss';

// type TabType = {
//   key: string;
//   icon?: string,
//   title: string,
//   onClick: Function;
//   renderScreen: Function;
// };

export class SelectableTabs extends React.Component<any, any> {
	render() {
		const { selectedTab, tabs } = this.props;

		return (
			<div className="Selectable animated fadeIn">
				<div className="Selectable_tabs">
					{tabs.map((tab: any) => (
						<div
							key={`tab_${tab.key}`}
							className={`Selectable_tab ${selectedTab === tab.key ? 'active' : ''}`}
							onClick={() => tab.onClick()}>
							<i className={`moon ${tab.icon}`} style={{ paddingRight: '5px' }} />
							{tab.title}
						</div>
					))}
				</div>
				<div className="Selectable_body body">
					{tabs.map((tab: any) => {
						if (selectedTab === tab.key) return tab.renderScreen();
						return null;
					})}
				</div>
			</div>
		);
	}
}

export default SelectableTabs;
