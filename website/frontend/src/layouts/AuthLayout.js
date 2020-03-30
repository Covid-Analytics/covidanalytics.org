import React from "react";
import {Switch, Route, Redirect} from "react-router-dom";

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footer/Footer.js";

import {dashRoutes, getRoutes, getActiveRouteTitle} from "routes.js";

import styles from "assets/jss/material-dashboard-pro-react/layouts/authStyle.js";

import register from "assets/img/register.jpeg";
import login from "assets/img/login.jpeg";
import lock from "assets/img/lock.jpeg";
import error from "assets/img/clint-mckoy.jpg";
import pricing from "assets/img/bg-pricing.jpeg";

const useStyles = makeStyles(styles);

export default function AuthLayout(props) {
  const {...rest} = props;
  // ref for the wrapper div
  const wrapper = React.createRef();
  // styles
  const classes = useStyles();
  React.useEffect(() => {
    document.body.style.overflow = "unset";
    // Specify how to clean up after this effect:
    return function cleanup() {
    };
  });
  const getBgImage = () => {
    if (window.location.pathname.indexOf("/_auth/register-page") !== -1) {
      return register;
    } else if (window.location.pathname.indexOf("/_auth/login-page") !== -1) {
      return login;
    } else if (window.location.pathname.indexOf("/_auth/pricing-page") !== -1) {
      return pricing;
    } else if (
      window.location.pathname.indexOf("/_auth/lock-screen-page") !== -1
    ) {
      return lock;
    } else if (window.location.pathname.indexOf("/_auth/error-page") !== -1) {
      return error;
    }
  };
  return (
    <div>
      <AuthNavbar brandText={getActiveRouteTitle(dashRoutes)} {...rest} />
      <div className={classes.wrapper} ref={wrapper}>
        <div
          className={classes.fullPage}
          style={{backgroundImage: "url(" + getBgImage() + ")"}}
        >
          <Switch>
            {getRoutes(dashRoutes, '/_auth')}
            {/*<Redirect from="/_auth" to="/_auth/login-page"/>*/}
          </Switch>
          <Footer white/>
        </div>
      </div>
    </div>
  );
}
