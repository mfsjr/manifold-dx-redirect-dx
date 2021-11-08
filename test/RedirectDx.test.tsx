import { getActionCreator, StateObject } from 'manifold-dx';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { factory, getHistory, RedirectDx, RedirectDxProps } from '../src';
import { render } from '../src/RedirectDx';
import { AppState, testStore } from './TestStore';

const enzyme = require('enzyme');
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');

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
 * RedirectDx only renders if its state has changed, and its view function is purely based on
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

let spyRender = jest.spyOn(render, 'redirect');

describe('RedirectDx init', () => {
  test('status on first init', () => {
    let mrouter = wrapper.find('MemoryRouter');
    expect(mrouter).toHaveLength(1);
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    let redirect = wrapper.find('Redirect');
    expect(redirect).toHaveLength(0);
    expect(spyRender.mock.calls.length).toBe(0);
  });
  test('second pass with redirect action', () => {
    getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/search').dispatch();
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    expect(spyRender.mock.calls.length).toBe(1);
    let to = spyRender.mock.calls[0][0].to.toString();
    expect(to).toBe('/search');
    expect(to).toBe(getHistory()[0]);
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
    expect(spyRender.mock.calls.length).toBe(2);
    let to = spyRender.mock.calls[1][0].to.toString();
    expect(to).toBe('/search/help');
    expect(to).toBe(getHistory()[1]);
  });
});
