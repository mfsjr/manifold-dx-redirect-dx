import * as React from 'react';
import { Omit, RedirectProps, RouteComponentProps } from 'react-router';
import { AnyMappingAction, ContainerComponent, State, StateObject } from 'manifold-dx';
export declare function getHistory(): string[];
export interface RedirectDxProps<S extends StateObject> extends Partial<RedirectProps> {
    redirectDxState: S;
    redirectDxProp: Extract<keyof S, string>;
}
interface RedirectDxViewProps extends RedirectProps {
    initializing: boolean;
    historyMax?: number;
}
declare type AnyRouteComponentProps = RouteComponentProps<any>;
export interface RouteRedirectDxViewProps extends RedirectDxViewProps, AnyRouteComponentProps {
}
export declare type WithRouterViewProps = Omit<RouteRedirectDxViewProps, keyof AnyRouteComponentProps>;
export declare const render: {
    redirect: (props: RouteRedirectDxViewProps, historyMax?: number) => JSX.Element;
    nothing: () => null;
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
export declare const RedirectDxView: React.FunctionComponent<RouteRedirectDxViewProps>;
export declare const WithRouterRedirectDx: React.ComponentClass<WithRouterViewProps>;
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
export declare class RedirectDx<S extends StateObject, A extends State<null>> extends ContainerComponent<RedirectDxProps<S>, WithRouterViewProps, A> {
    /**
     * Map this component to the state property that holds the application URL.  You can override this method
     * if you want to change where the property is held in state.
     * @param mappingActions
     */
    protected appendToMappingActions(mappingActions: AnyMappingAction[]): void;
    /**
     * Default to RedirectProps passed in from container, but also apply overrides for "to" so it comes from app state.
     */
    createViewProps(): WithRouterViewProps;
}
export {};
