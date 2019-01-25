import { getActionCreator, StateObject } from 'manifold-dx';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { factory, getHistory, RedirectDx, RedirectDxProps } from '../src'
import { render, RouteRedirectDxViewProps } from '../src/RedirectDx';
import { AppState, testStore } from './TestStore';

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
// this is needed to configur
enzyme.configure({ adapter: new Adapter() });

import { JSDOM } from 'jsdom';
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
export interface Global {
  document: Document;
  window: Window;
  navigator: {
    userAgent: string;
  };
}

declare var global: Global;
global.window = window;
global.document = window.document;
global.navigator = { userAgent: 'node.js' };

const rdxProps: RedirectDxProps<AppState> = {
  redirectDxState: testStore.getState(),
  redirectDxProp: 'redirectTo'
};

/**
 * PROBLEMS:
 * 1. Jest.spyOn works on functions defined on objects, we need to spy on a standalone function.
 *    Our code becomes a little contrived, but more testable, using the RedirectDx.render
 * 2. React is rendering RedirectDx multiple times, and since the view function will only render
 *    if the state is different than React Router's currentPath, we don't get one update per action.
 *    (and if we do attempt to render when state is the same as currentPath, we get browser errors)
 *
 * So, RedirectDx only renders if its state has changed, and its view function is purely based on
 * the new state and the existing React Router currentPath.
 *
 * As a result, we need to spy on render and simply count the resulting re-renders of redirect.
 */

class TestRedirectDx<S extends StateObject> extends RedirectDx<S, AppState> {
  constructor(_props: RedirectDxProps<S>) {
    super(_props, testStore.getState(), factory);
  }
}

const wrapper = enzyme.mount(
  <MemoryRouter>
    <TestRedirectDx {...rdxProps} />
  </MemoryRouter>
);

let renderHistory: string[] = [];
const renderDx = render.redirect;

let renderSpy = (props: RouteRedirectDxViewProps) => {
  renderHistory.push(props.to.toString());
  return renderDx(props);
};

render.redirect = renderSpy;

describe('RedirectDx init', () => {
  test('status on first init', () => {
    let mrouter = wrapper.find('MemoryRouter');
    expect(mrouter).toHaveLength(1);
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    let redirect = wrapper.find('Redirect');
    expect(redirect).toHaveLength(0);
    expect(renderHistory.length).toBe(0);
  });
  test('second pass with redirect action', () => {
    getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/search').dispatch();
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    expect(renderHistory.length).toBe(1);
    expect(renderHistory[0]).toBe('/search');
    expect(renderHistory[0]).toBe(getHistory()[0]);
  });
  test('third pass with same redirect action', () => {
    // should throw because manifold-dx detects same values
    expect( () => {
      getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/search').dispatch();
    }).toThrow();
  });
  test('fourth pass with new redirect action', () => {
    getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/search/help').dispatch();
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    expect(renderHistory.length).toBe(2);
    expect(renderHistory[1]).toBe('/search/help');
    expect(renderHistory[1]).toBe(getHistory()[1]);
  });
});
