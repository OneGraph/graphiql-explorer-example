// @flow

import React, {Component} from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import {getIntrospectionQuery, buildClientSchema} from 'graphql';

import {makeDefaultArg, getDefaultScalarArgValue} from './CustomArgs';

import 'graphiql/graphiql.css';
import './App.css';

import type {GraphQLSchema} from 'graphql';

function fetcher(params: Object): Object {
  return fetch(
    'https://serve.onegraph.com/dynamic?app_id=c333eb5b-04b2-4709-9246-31e18db397e1',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
  )
    .then(function(response) {
      return response.text();
    })
    .then(function(responseBody) {
      try {
        return JSON.parse(responseBody);
      } catch (e) {
        return responseBody;
      }
    });
}

const DEFAULT_QUERY = `{
  npm {
    package(name: "graphql") {
      name
      downloads {
        lastMonth {
          count
        }
      }
    }
  }
}`;

type State = {
  schema: ?GraphQLSchema,
  query: string,
  explorerIsOpen: boolean,
};

class App extends Component<{}, State> {
  _graphiql: GraphiQL;
  state = {schema: null, query: DEFAULT_QUERY, explorerIsOpen: true};

  componentDidMount() {
    fetcher({
      query: getIntrospectionQuery(),
    }).then(result => {
      this.setState({schema: buildClientSchema(result.data)});
    });
  }

  _handleEditQuery = (query: string): void => this.setState({query});

  _handleToggleExplorer = () => {
    this.setState({explorerIsOpen: !this.state.explorerIsOpen});
  };

  render() {
    const {query, schema} = this.state;
    return (
      <div className="graphiql-container">
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={this._handleEditQuery}
          explorerIsOpen={this.state.explorerIsOpen}
          onToggleExplorer={this._handleToggleExplorer}
          getDefaultScalarArgValue={getDefaultScalarArgValue}
          makeDefaultArg={makeDefaultArg}
        />
        <GraphiQL
          ref={ref => (this._graphiql = ref)}
          fetcher={fetcher}
          schema={schema}
          query={query}
          onEditQuery={this._handleEditQuery}>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this._graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this._graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={this._handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export default App;
