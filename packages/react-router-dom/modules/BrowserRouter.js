import React from "react";
import { Router } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import PropTypes from "prop-types";
import warning from "tiny-warning";

/**
 * The public API for a <Router> that uses HTML5 history.
 */
class BrowserRouter extends React.Component {
  // 在 history 库的 createBrowserHistory
  // const history = {
  //   // 当前页面的历史记录的长度
  //   // 当前tab跳转了多少个页面
  //   length: globalHistory.length,
  //   action: 'POP',
  //   // 当前页面的路径、query、hash等
  //   location: initialLocation,
  //   createHref,
  //   push,
  //   replace,
  //   // 3个goxx 都是调用原生的history方法
  //   go,
  //   goBack,
  //   goForward,
  //   block,
  //   // 绑定前进后退的事件
  //   listen
  // };
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}

if (__DEV__) {
  BrowserRouter.propTypes = {
    basename: PropTypes.string,
    children: PropTypes.node,
    forceRefresh: PropTypes.bool,
    getUserConfirmation: PropTypes.func,
    keyLength: PropTypes.number
  };

  BrowserRouter.prototype.componentDidMount = function() {
    warning(
      !this.props.history,
      "<BrowserRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { BrowserRouter as Router }`."
    );
  };
}

export default BrowserRouter;
