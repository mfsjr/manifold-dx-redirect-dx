import * as React from 'react';
import { Omit, Redirect, RedirectProps, RouteComponentProps, withRouter } from 'react-router';
import {
  AnyMappingAction,
  ContainerComponent, ContainerPostReducer,
  getMappingActionCreator,
  State,
  StateObject
} from 'manifold-dx';

/**
 * To use this component in an application, subclass it.  See instructions at {@link RedirectDx}.
 *
 * Note that this component injects withRouter props into the view, a factory function, as opposed to
 * injecting into parent ContainerComponent.
 *
 * The result is the preferred behavior, where this only re-renders when the state it depends
 * on is changed (although it can still change if the user modifies the browser URL).
 *
 * We do this because a simpler implementation that uses withRouter on the ContainerComponent
 * will render every time the router changes, and this induces infinite loops of
 * route changes, then Redirect renderings.
 *
 * Note that Redirect (and Link, NavLink) are the preferred mechanism for controlling routing,
 * since they wrap (and future-proof) the browser's underlying history mechanism, see
 * https://stackoverflow.com/questions/51116747/react-router-v4-link-vs-redirect-vs-history.
 *
 * Also note that we are defaulting the Redirect's 'push' prop to false, meaning that we don't
 * want changes pushed onto the browser's history.  The reason for this is that the preferred way
 * to 'go back' is actually to undo manifold-dx actions.
 *
 */

// /**
//  * Go through the action history for redirects, return the history of URL's.  Note that the first
//  * URL retrieved is meaningless, as its what state was initialized to, not the first app URL hit.
//  */
// export function getHistory<S extends StateObject, A extends State<null>>
// (props: RedirectDxProps<S>, store: Store<A>): string[] {
//   // get action history of changes to props.state[props.propertyName]
//   let actions: Action[] = store.getManager().getActionQueue().lastActions();
//   let redirectUrls: string[] = [];
//   actions.forEach((action) => {
//     if (action instanceof StateCrudAction) {
//       if (action.parent === props.redirectDxState && action.propertyName === props.redirectDxProp) {
//         redirectUrls.push(action.getOldValue());
//       }
//     }
//   });
//   return redirectUrls;
// }

const history: string[] = [];

export function getHistory() {
  return history.slice();
}

// /** from manifold-dx
//  * Extract keys (which are strings) whose value's types match the type of S[K].
//  * See "Conditional types are particularly useful when combined with mapped types:"
//  * in https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
//  */
// export type ExtractMatching<S, K extends Extract<keyof S, string>, VP> =
//   { [TP in Extract<keyof VP, string>]: VP[TP] extends S[K] ? TP : never; } [Extract<keyof VP, string>];

/*
 * Container props
 */
export interface RedirectDxProps<S extends StateObject> extends Partial<RedirectProps> {
  redirectDxState: S;
  redirectDxProp: Extract<keyof S, string>;
}

/*
 * Unenhanced view props.
 */
interface RedirectDxViewProps extends RedirectProps {
  initializing: boolean;
  historyMax?: number;
}

/*tslint:disable:no-any*/
type AnyRouteComponentProps = RouteComponentProps<any>;
/*tslint:enable:no-any*/

// enhanced view props (of the component passed into withRouter)
export interface RouteRedirectDxViewProps extends RedirectDxViewProps, AnyRouteComponentProps { }

// enhanced view props (of the component returned by withRouter)
export type WithRouterViewProps = Omit<RouteRedirectDxViewProps, keyof AnyRouteComponentProps>;

// Creating a render object makes spying/testing a little simpler
export const render = {
  redirect: (props: RouteRedirectDxViewProps, historyMax?: number) => {
    let max: number = historyMax || 20;
    if (max > 0 && max <= history.length) {
      history.copyWithin(0, 1);
    }
    history.push(props.to.toString());
    return (<Redirect {...props} />);
  },
  nothing: () => null
};

/**
 * This is a functional component that shows how React's "createFactory" api can be used to handle either
 * class-based components (the commented code above) or this functional component, and passed into
 * ContainerComponent's FunctionComponent constructor argument.
 *
 * Note that we are using React Router's "Redirect" component, which wraps the history api so we don't
 * have to worry about the browser's underlying implementation.
 *
 * @param props
 * @constructor
 */
export const RedirectDxView: React.FunctionComponent<RouteRedirectDxViewProps> = (props: RouteRedirectDxViewProps) => {
  // We'll get warnings if we try to redirect to the same place, so we programmatically prevent that
  let newLocation = props.to !== props.history.location.pathname;
  if (newLocation && !props.initializing) {

    return render.redirect(props);
  }
  return render.nothing();
};

export const WithRouterRedirectDx: React.ComponentClass<WithRouterViewProps> = withRouter(RedirectDxView);

export const factory = React.createFactory(WithRouterRedirectDx);

/**
 * The component the app should subclass to redirect based upon the URL as maintained in manifold-dx's app state.
 *
 * The manifold-dx prop StateObject that you pass in must have a string prop that stores the
 * state of the app URL (and only the app URL, eg no domain or protocol).
 *
 * Note that this component is disabled during the initial load of the application, since its intended only
 * for use within the application itself (so any app URL can be loaded at startup).
 *
 * Applications should use this component by subclassing it.  All that needs is a class declaration and
 * an implementation for the constructor, for example:
 *
 * export class AppRedirectDx<S extends StateObject> extends RedirectDx<S, AppState> {
 * constructor(props: RedirectDxProps<S>) {
 *     super(props, appStore.getState(), factory);
 *   }
 * }
 *
 * In this example, 'AppState' is the interface that defines the application's state, and 'appStore' is
 * the application's Store instance that provides the state.  As below, 'S' is the state object that
 * contains the redirect URL string property, both of which will be passed in as props.
 *
 * The <AppRedirectDx> element would then be used to manage routing in the app.
 *
 * For the base class defined below, the following generic parameters apply:
 *
 * @param S the state object containing the redirect URL
 * @param A the application state type definition or interface
 */
export class RedirectDx<S extends StateObject, A extends State<null>>
  extends ContainerComponent<RedirectDxProps<S>, WithRouterViewProps, A> {

  /**
   * Map this component to the state property that holds the application URL.  You can override this method
   * if you want to change where the property is held in state.
   * @param mappingActions
   */
  protected appendToMappingActions(mappingActions: AnyMappingAction[]): void {
    const initFn: ContainerPostReducer = action => {
      this.viewProps.initializing = false;
    };
    mappingActions.push(
      getMappingActionCreator(this.props.redirectDxState, this.props.redirectDxProp)
        // @ts-ignore   manifold-dx uses ExtractMatching (mapped conditional types) for exhaustive source/target
        // type-matching we don't need, by defn `redirectDxProp: Extract<keyof S, string>;` ie, string to string
        .createPropertyMappingAction(this, 'to', initFn)
    );
  }

  /**
   * Default to RedirectProps passed in from container, but also apply overrides for "to" so it comes from app state.
   */
  public createViewProps(): WithRouterViewProps {
    let {children, redirectDxState, redirectDxProp, ...redirectProps} = this.props;
    return {
      ...redirectProps,
      to: this.props.redirectDxProp,
      initializing: true,
      historyMax: 10
    };
  }
}
