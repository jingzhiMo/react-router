import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import RouterContext from "./RouterContext.js";
import matchPath from "./matchPath.js";

/**
 * The public API for rendering the first <Route> that matches.
 */
class Switch extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Switch> outside a <Router>");

          // 通常没有自定义 context 则是利用默认 context 的 location
          // location 的内容至少包含以下字段
          // {
          //   pathname,
          //   search,
          //   hash
          // }
          const location = this.props.location || context.location;

          let element, match;

          // We use React.Children.forEach instead of React.Children.toArray().find()
          // here because toArray adds keys to all child elements and we do not want
          // to trigger an unmount/remount for two <Route>s that render the same
          // component at different URLs.
          // 对 Switch 下的子组件进行遍历
          React.Children.forEach(this.props.children, child => {
            // undefined == null 为 true
            if (match == null && React.isValidElement(child)) {
              element = child;

              // 获取组件的 props.path 属性
              const path = child.props.path || child.props.from;

              match = path
                // 判断当前路径是否符合设定的 path 值
                // matchPath 函数返回的值是
                // {
                //   path,
                //   url, // 去掉参数
                //   isExact, // 是否完全匹配
                //   params: {} // 获取定义的参数数据
                // }
                ? matchPath(location.pathname, { ...child.props, path })
                // context 根目录的 match 对象为
                // { path: "/", url: "/", params: {}, isExact: pathname === "/" };
                // 这里判断是没有设定路径的时候，通常为404做准备
                : context.match;
            }
          });

          return match
            ? React.cloneElement(element, { location, computedMatch: match })
            : null;
        }}
      </RouterContext.Consumer>
    );
  }
}

if (__DEV__) {
  Switch.propTypes = {
    children: PropTypes.node,
    location: PropTypes.object
  };

  Switch.prototype.componentDidUpdate = function(prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}

export default Switch;
