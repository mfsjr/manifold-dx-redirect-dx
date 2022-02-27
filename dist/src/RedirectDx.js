"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectDx = exports.factory = exports.WithRouterRedirectDx = exports.RedirectDxView = exports.render = exports.getHistory = void 0;
var React = require("react");
var react_router_1 = require("react-router");
var manifold_dx_1 = require("manifold-dx");
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
var history = [];
function getHistory() {
    return history.slice();
}
exports.getHistory = getHistory;
// Creating a render object makes spying/testing a little simpler
exports.render = {
    redirect: function (props, historyMax) {
        var max = historyMax || 20;
        if (max > 0 && max <= history.length) {
            history.copyWithin(0, 1);
        }
        history.push(props.to.toString());
        return (React.createElement(react_router_1.Redirect, __assign({}, props)));
    },
    nothing: function () { return null; }
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
var RedirectDxView = function (props) {
    // We'll get warnings if we try to redirect to the same place, so we programmatically prevent that
    var newLocation = props.to !== props.history.location.pathname;
    if (newLocation && !props.initializing) {
        return exports.render.redirect(props);
    }
    return exports.render.nothing();
};
exports.RedirectDxView = RedirectDxView;
exports.WithRouterRedirectDx = react_router_1.withRouter(exports.RedirectDxView);
exports.factory = React.createFactory(exports.WithRouterRedirectDx);
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
var RedirectDx = /** @class */ (function (_super) {
    __extends(RedirectDx, _super);
    function RedirectDx() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Map this component to the state property that holds the application URL.  You can override this method
     * if you want to change where the property is held in state.
     * @param mappingActions
     */
    RedirectDx.prototype.appendToMappingActions = function (mappingActions) {
        var _this = this;
        var initFn = function (action) {
            _this.viewProps.initializing = false;
        };
        mappingActions.push(manifold_dx_1.getMappingActionCreator(this.props.redirectDxState, this.props.redirectDxProp)
            // @ts-ignore   manifold-dx uses ExtractMatching (mapped conditional types) for exhaustive source/target
            // type-matching we don't need, by defn `redirectDxProp: Extract<keyof S, string>;` ie, string to string
            .createPropertyMappingAction(this, 'to', initFn));
    };
    /**
     * Default to RedirectProps passed in from container, but also apply overrides for "to" so it comes from app state.
     */
    RedirectDx.prototype.createViewProps = function () {
        var _a = this.props, children = _a.children, redirectDxState = _a.redirectDxState, redirectDxProp = _a.redirectDxProp, redirectProps = __rest(_a, ["children", "redirectDxState", "redirectDxProp"]);
        return __assign(__assign({}, redirectProps), { to: this.props.redirectDxProp, initializing: true, historyMax: 10 });
    };
    return RedirectDx;
}(manifold_dx_1.ContainerComponent));
exports.RedirectDx = RedirectDx;
//# sourceMappingURL=RedirectDx.js.map