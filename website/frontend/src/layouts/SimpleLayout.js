import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

import AuthNavbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footer/Footer.js";

import routes from "routes.js";

import styles from "assets/jss/material-dashboard-pro-react/layouts/authStyle.js";

import register from "assets/img/register.jpeg";
// import login from "assets/img/login.jpeg";
// import lock from "assets/img/lock.jpeg";
// style={{ backgroundImage: "url(" + getBgImage() + ")" }}

const useStyles = makeStyles(styles);

export default function SimpleLayout(props) {
  const { ...rest } = props;
  // ref for the wrapper div
  const wrapper = React.createRef();
  // styles
  const classes = useStyles();
  return (
    <div>
      <AuthNavbar brandText="{getActiveRoute(routes)}" {...rest} />
      <div className={classes.wrapper} ref={wrapper}>
        <div
          className={classes.fullPage}
          style={{ backgroundImage: "url(" + register + ")" }}
        >
          {/*<Switch>*/}
          {/*  {getRoutes(routes)}*/}
            {/*<Redirect from="/auth" to="/auth/login-page" />*/}
          {/*</Switch>*/}
          <Footer white />
        </div>
      </div>
    </div>
  );
}