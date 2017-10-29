// see express-server.js for how to start servers

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { createStore } from 'redux';
import { connect, Provider }  from 'react-redux';
import * as queryString from 'query-string';

import {TSentenceSetList} from '../server-lib/isomporphic-types';

require('isomorphic-fetch');

/*

Maybe at some point I'll make this a true multi-page app, but at this
point I want to just get the directory in there as soon as possible.

*/

declare function fetch(input: string, init?: RequestInit): Promise<Response>;

interface IState {
	list : TSentenceSetList,
}

const actions = {
	LIST_LOADED : 'list_LIST_LOADED',
};

const happyListApp = (state : IState, action : any) : IState => {
	switch(action.type) {
		case actions.LIST_LOADED : {
			const list : TSentenceSetList = action.list;
			const sortedList = list.sort((a, b) => a.name.localeCompare(b.name));
			return {
				list : sortedList,
			};
		}
	}
}

const store = createStore(happyListApp);

class _HappyList extends React.Component<{list : TSentenceSetList}> {
	render() {
		const innards = this.props.list.map(({name, gameConfigKey}, i) => {
			const url = 'happy.html?' + queryString.stringify({gameConfigKey});
			return <div className="happy-list-row" key={i}>
				<div className="happy-list-item">
					<a href={url}>{name}</a>
				</div>
			</div>;
		});

		return <div className="happy-list">
			<div className="happy-list-row"><div className="happy-list-header">Pick one</div></div>
			{ innards }
		</div>;
	}
};

const connectHappyList = connect(
	({list} : {list : TSentenceSetList} = {list : []}) => ({list}),
	() => ({}),
);

const HappyList = connectHappyList(_HappyList);

ReactDOM.render(
	<Provider store={store}>
		<HappyList/>
	</Provider>,
	document.getElementById('happy-list-main'),
);

const init = () =>  {
	fetch('/rest/sentenceSetList', {
			credentials : 'include',
			method : 'GET',
			headers: {'Content-Type': 'application/json'},
		})
		.then(response => response.json())
		.then(raw => {
			const list = raw as TSentenceSetList;

			store.dispatch({
				type : actions.LIST_LOADED,
				list
			});
		})
		.catch(err => alert(err));
};

init();




    