import React from "react";

import {Switch, Redirect, useLocation} from "react-router-dom";
import cx from "classnames";

import GoogleAnalytics from "react-ga";

// import PerfectScrollbar from "perfect-scrollbar";
// import "perfect-scrollbar/css/perfect-scrollbar.css";

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

import SimpleNavbar from "components/Navbars/SimpleNavbar.js";
import Footer from "components/Footer/Footer.js";
import SimpleSidebar from "components/Sidebar/SimpleSidebar.js";

import {dashRoutes, getRoutesForLayout, getActiveRouteTitle} from "routes.js";

import styles from "assets/jss/material-dashboard-pro-react/layouts/adminStyle.js";

// style={{ backgroundImage: "url(" + getBgImage() + ")" }}

// let ps; // perfect scrollbar

// Analytics
GoogleAnalytics.initialize('UA-65634159-7', {debug: false});

function Analytics() {
  const location = useLocation();
  React.useEffect(() => {
    GoogleAnalytics.pageview(window.location.pathname + window.location.search);
  }, [location]);
  return <React.Fragment/>
}

const useStyles = makeStyles(styles);

export default function SimpleLayout(props) {
  const {...rest} = props;
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniActive, setMiniActive] = React.useState(false);
  const [image] = React.useState(undefined /*require("assets/img/sidebar-image-2.jpg")*/);
  const [color] = React.useState("rose");
  const [bgColor] = React.useState("white");
  // styles
  const classes = useStyles();
  const mainPanelClasses =
    classes.mainPanel +
    " " +
    cx({
      [classes.mainPanelSidebarMini]: miniActive,
      // [classes.mainPanelWithPerfectScrollbar]:
      // navigator.platform.indexOf("Win") > -1
    });

  // ref for main panel div
  const mainPanel = React.createRef();

  React.useEffect(() => {
    const resizeFunction = () => {
      if (window.innerWidth >= 960)
        setMobileOpen(false);
    };
    /*if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false
      });
      document.body.style.overflow = "hidden";
    }*/
    window.addEventListener("resize", resizeFunction);

    // Specify how to clean up after this effect:
    return function cleanup() {
      /*if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }*/
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);
  // functions for changing the states from components
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarMinimize = () => setMiniActive(!miniActive);
  return (
    <div className={classes.wrapper}>
      <Analytics/>
      <SimpleSidebar
        routes={dashRoutes}
        logoText={"Covid-19 Live"}
        // logo={logo}
        image={image}
        handleDrawerToggle={handleDrawerToggle}
        open={mobileOpen}
        color={color}
        bgColor={bgColor}
        miniActive={miniActive}
        {...rest}
      />
      <div className={mainPanelClasses} ref={mainPanel}>
        <SimpleNavbar
          sidebarMinimize={handleSidebarMinimize.bind(this)}
          miniActive={miniActive}
          brandText={getActiveRouteTitle(dashRoutes)}
          handleDrawerToggle={handleDrawerToggle}
          {...rest}
        />
        <div className={classes.content}>
          <div className={classes.container}>
            <Switch>
              {getRoutesForLayout(dashRoutes, '')}
              <Redirect from="/" to={dashRoutes[0].path}/>
            </Switch>
          </div>
        </div>
        <Footer fluid/>
      </div>
    </div>
  );
}
