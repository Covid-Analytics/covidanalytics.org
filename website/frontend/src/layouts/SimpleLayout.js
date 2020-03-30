import React from "react";

import {Switch, Route, Redirect} from "react-router-dom";
import cx from "classnames";

import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

import SimpleNavbar from "components/Navbars/SimpleNavbar.js";
import Footer from "components/Footer/Footer.js";
import SimpleSidebar from "components/Sidebar/SimpleSidebar.js";

import routes from "routes.js";

import styles from "assets/jss/material-dashboard-pro-react/layouts/adminStyle.js";

import register from "assets/img/register.jpeg";
// import login from "assets/img/login.jpeg";
// import lock from "assets/img/lock.jpeg";
// style={{ backgroundImage: "url(" + getBgImage() + ")" }}

var ps; // perfect scrollbar

const useStyles = makeStyles(styles);

export default function SimpleLayout(props) {
  const {...rest} = props;
  // states and functions
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniActive, setMiniActive] = React.useState(false);
  const [image, setImage] = React.useState(null /*require("assets/img/sidebar-2.jpg")*/);
  const [color, setColor] = React.useState("rose");
  const [bgColor, setBgColor] = React.useState("white");
  const [logo, setLogo] = React.useState(require("assets/img/logo-white.svg"));
  // styles
  const classes = useStyles();
  const mainPanelClasses =
    classes.mainPanel +
    " " +
    cx({
      [classes.mainPanelSidebarMini]: miniActive,
      [classes.mainPanelWithPerfectScrollbar]:
      navigator.platform.indexOf("Win") > -1
    });

  // ref for main panel div
  const mainPanel = React.createRef();

  const resizeFunction = () => {
    if (window.innerWidth >= 960)
      setMobileOpen(false);
  };
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false
      });
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("resize", resizeFunction);

    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
      window.removeEventListener("resize", resizeFunction);
    };
  });
  // functions for changing the states from components
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const getRouteBrandText = routes => {
    let activeRoute = "Live Charts";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getRouteBrandText(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  const getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/_dash") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  const sidebarMinimize = () => {
    setMiniActive(!miniActive);
  };

  return (
    <div className={classes.wrapper}>
      <SimpleSidebar
        routes={routes}
        logoText={"Covid-19 Live"}
        logo={logo}
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
          sidebarMinimize={sidebarMinimize.bind(this)}
          miniActive={miniActive}
          brandText={getRouteBrandText(routes)}
          handleDrawerToggle={handleDrawerToggle}
          {...rest}
        />
        <div className={classes.content}>
          <div className={classes.container}>
            <Switch>
              {getRoutes(routes)}
            </Switch>
          </div>
        </div>
        <Footer fluid/>
      </div>
    </div>
  );
}