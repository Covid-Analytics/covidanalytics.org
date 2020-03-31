import React from "react";
import {Switch} from "react-router-dom";

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footer/Footer.js";

import {dashRoutes, getRoutesForLayout, getActiveRouteTitle} from "routes.js";

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
    const bgMap = {
      '/register-page': register,
      '/login-page': login,
      '/pricing-page': pricing,
      '/lock-screen-page': lock,
      '/error-page': error,
    };
    for (let location in bgMap) {
      if (window.location.pathname.indexOf(location) !== -1)
        return bgMap[location];
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
            {getRoutesForLayout(dashRoutes, '/_auth')}
            {/*<Redirect from="/_auth" to="/_auth/login-page"/>*/}
          </Switch>
          <Footer white/>
        </div>
      </div>
    </div>
  );
}
