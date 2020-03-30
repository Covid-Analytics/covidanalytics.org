import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
import cx from "classnames";

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Hidden from "@material-ui/core/Hidden";

// material-ui icons
import Menu from "@material-ui/icons/Menu";
import MoreVert from "@material-ui/icons/MoreVert";
import ViewList from "@material-ui/icons/ViewList";

// core components
// import SimpleNavbarLinks from "./SimpleNavbarLinks";
import Button from "components/CustomButtons/Button.js";

import styles from "assets/jss/material-dashboard-pro-react/components/adminNavbarStyle.js";

const useStyles = makeStyles(styles);

export default function SimpleNavbar(props) {
  const classes = useStyles();
  const {color, brandText, miniActive} = props;
  const appBarClasses = cx({
    [" " + classes[color]]: color
  });
  return (
    <AppBar className={classes.appBar + appBarClasses}>
      <Toolbar className={classes.container}>
        {/* Toggle to minimize the side bar */}
        <Hidden smDown implementation="css">
          <div className={classes.sidebarMinimize}>
            {miniActive ? (
              <Button justIcon round color="white" onClick={props.sidebarMinimize}>
                <ViewList className={classes.sidebarMiniIcon}/>
              </Button>
            ) : (
              <Button justIcon round color="white" onClick={props.sidebarMinimize}>
                <MoreVert className={classes.sidebarMiniIcon}/>
              </Button>
            )}
          </div>
        </Hidden>

        {/* Brand text*/}
        <div className={classes.flex}>
          <Button href="#" className={classes.title} color="transparent">
            {brandText}
          </Button>
        </div>

        {/* Links (none here) */}
        {/*<Hidden smDown implementation="css">*/}
        {/*<SimpleNavbarLinks/>*/}
        {/*</Hidden>*/}

        {/* Mobile: Drawer toggle on the right side */}
        <Hidden mdUp implementation="css">
          <Button
            className={classes.appResponsive}
            color="transparent"
            justIcon
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu/>
          </Button>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}

SimpleNavbar.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  brandText: PropTypes.string,
  miniActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  sidebarMinimize: PropTypes.func
};
