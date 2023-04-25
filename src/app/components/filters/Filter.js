import React from 'react'
import { Col, Row } from 'react-bootstrap'
import clsx from 'clsx'
import { CardHR, Card, CardBody } from '../../../_metronic/_partials/controls'
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Search as SearchIcon, Autorenew as FilterOffIcon } from '@material-ui/icons'
import './filter.scss'

function Collapsable({ collapsed, children, onSearch, onClear }) {
	return (
		<>
			<div className={clsx(collapsed && 'd-none', 'filter-header-container')}>
				<CardHR />
				{children}
				<div
					className='d-flex justify-content-between justify-content-sm-end align-items-stretch flex-wrap flex-md-nowrap'
				>
					{onSearch && <button
						type="button"
						className="btn btn-lg btn-primary"
						onClick={onSearch}
						title="Search with filters">
						<span>
							<SearchIcon />
						</span>
					</button>}
					{onClear && <button
						type="button"
						className="btn btn-lg btn-secondary"
						onClick={onClear}
						title="Clear filters"
					>
						<span>
							<FilterOffIcon />
						</span>
					</button>}
				</div>
			</div>
		</>
	)
}

const FilterHeader = ({ collapsed, toggleCollapse }) => (
	<>
		<Row className='filter-header-container'>
			<Col
				className='filter-header-title'
			>
				<h4>Filter results</h4>
			</Col>
			<Col
				className='filter-header'
			>
				<div>
					{toggleCollapse && <button
						type="button"
						className="btn btn-lg btn-secondary toggle-button"
						onClick={toggleCollapse}
						title={collapsed ? "Expand filters" : "Collapse filters"}
					>
						{collapsed
							? <ExpandMoreIcon title="Expand filters" />
							: <ExpandLessIcon title="Collapse filters" />
						}
					</button>}
				</div>
			</Col>
		</Row>
	</>
)

export const FiltersCard = ({ collapsed, setCollapsed, handleClearFilters, handleSearch, filtersContent }) => (
	<Card>
		<CardBody className='pt-3'>
			<FilterHeader
				collapsed={collapsed}
				toggleCollapse={() => setCollapsed(!collapsed)}
			/>
			<Collapsable 
				collapsed={collapsed} 
				onClear={handleClearFilters} 
				onSearch={handleSearch}
			>
				{filtersContent()}
			</Collapsable>
		</CardBody>
	</Card>	
)

export default FiltersCard