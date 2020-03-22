import React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";

import RouterContext from "./RouterContext.js";

/**
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  constructor(props) {
    super(props);

    this.state = {
      // 这里的 location 至少包括以下几个属性
      // {
      //   pathname,
      //   search,
      //   hash
      // }
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    this._isMounted = false;
    this._pendingLocation = null;

    // 静态 context ? 不太理解
    // 静态 context 就是通常是在测试的时候使用
    if (!props.staticContext) {
      // 监听路由的变化
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          // 路由变化有，更新当前的 state
          // 让 RouterContext.Provider 发生变化
          this.setState({ location });
        } else {
          // 组件还没有挂载，通常是Redirect组件的使用
          this._pendingLocation = location;
        }
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._pendingLocation) {
      // 组件挂载的时候，发现之前已发出重定向
      // 则在挂载的时候处理重定向
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  render() {
    return (
      <RouterContext.Provider
        children={this.props.children || null}
        value={{
          history: this.props.history,
          // this.props.history.location
          // 这个location的初始化的时候是从props拿到的进入的路径信息
          location: this.state.location,
          // 判断是否是根目录？
          // { path: "/", url: "/", params: {}, isExact: pathname === "/" };
          match: Router.computeRootMatch(this.state.location.pathname),
          staticContext: this.props.staticContext
        }}
      />
    );
  }
}

if (__DEV__) {
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    staticContext: PropTypes.object
  };

  Router.prototype.componentDidUpdate = function(prevProps) {
    warning(
      prevProps.history === this.props.history,
      "You cannot change <Router history>"
    );
  };
}

export default Router;
