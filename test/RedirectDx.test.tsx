// import * as React from 'react';

import { getActionCreator, StateObject } from 'manifold-dx'
// import { WithRouterViewProps } from '../src/RedirectDx';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { factory, RedirectDx, RedirectDxProps } from '../src';
import { AppState, testStore } from './TestStore';

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
// this is needed to configur
enzyme.configure({ adapter: new Adapter() });

const rdxProps: RedirectDxProps<AppState> = {
  redirectDxState: testStore.getState(),
  redirectDxProp: 'redirectTo'
};

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

describe('RedirectDx init', () => {
  test('status on first init', () => {
    let mrouter = wrapper.find('MemoryRouter');
    expect(mrouter).toHaveLength(1);
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    let redirect = wrapper.find('Redirect');
    expect(redirect).toHaveLength(0);

  });
  test('status on second pass with new props', () => {
    // getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/help').dispatch();
    getActionCreator(rdxProps.redirectDxState).update(rdxProps.redirectDxProp, '/search').dispatch();
    // wrapper.render();
    let rdx = wrapper.find('TestRedirectDx');
    expect(rdx).toHaveLength(1);
    let redirect = wrapper.find('Redirect');
    expect(redirect).toHaveLength(1);

  });
});

// const wrapperDiv = enzyme.mount(
//   <div id={'email'}>mfs@abc.com</div>
// );
//
// describe('sanity test', () => {
//   test('getting the id', () => {
//     let div = wrapperDiv.find('div');
//     expect(div).toHaveLength(1);
//     let span = wrapperDiv.find('span');
//     expect(span).toHaveLength(0);
//   });
// });

// The functionality that we need to test is what gets rendered by the view for a given set of props
// What we don't need to test is manifold-dx or React Router
// So create the element and test the FunctionComponent view

// describe('Repeated calls to the RedirectDx FunctionComponent view', () => {
//   let rdxRender: () => AnyReactElement = () => (<div>something to render</div>);
//   let rdxProps: SubProps = {
//     path: '',
//     initializing: true,
//     to: '/'
//   };
//   let result = redirectDxViewRender(rdxProps, rdxRender);
//   expect(result === null).toBeTruthy();
//
//   // let rdx = React.createElement(TestRedirectDx, rdxProps);
//   // let fcv = rdx.getFunctionCompView();
//   // // ? Need to assemble a collection of props that structurally matches
//
// });
