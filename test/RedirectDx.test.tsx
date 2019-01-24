// import * as React from 'react';

import { StateObject } from 'manifold-dx'
import { factory, RedirectDx, RedirectDxProps } from '../src'
import { WithRouterViewProps } from '../src/RedirectDx'
import { AppState, testStore } from './TestStore'

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
// this is needed to configur
enzyme.configure({ adapter: new Adapter() });

const redirectDxState: AppState = testStore.getState();
const redirectDxProp: Extract<keyof AppState, string> = 'redirectTo';

const rdxProps: RedirectDxProps<AppState> = {
  redirectDxState: testStore.getState(),
  redirectDxProp: 'redirectTo'
};

class TestRedirectDx<S extends StateObject> extends RedirectDx<S, AppState> {
  constructor(_props: RedirectDxProps<S>) {
    super(_props, testStore.getState(), factory);
  }
  public getFunctionCompView(): React.FunctionComponent<WithRouterViewProps> {
    return super.getFunctionCompView();
  }
}

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
