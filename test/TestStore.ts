import { State, Store } from 'manifold-dx'

export interface AppState extends State<null> {
  redirectTo: string;
  username?: string;
}

const appState: AppState = {
  _parent: null,
  _myPropname: '',
  redirectTo: '',
}

export const testStore = new Store(appState, {});
