import React from "react";
import {Route} from "react-router-dom";

import Buttons from "views/Components/Buttons.js";
import Calendar from "views/Calendar/Calendar.js";
import Charts from "views/Charts/Charts.js";
import Dashboard from "views/Dashboard/Dashboard.js";
import ErrorPage from "views/Pages/ErrorPage.js";
import ExtendedForms from "views/Forms/ExtendedForms.js";
import ExtendedTables from "views/Tables/ExtendedTables.js";
import FullScreenMap from "views/Maps/FullScreenMap.js";
import GoogleMaps from "views/Maps/GoogleMaps.js";
import GridSystem from "views/Components/GridSystem.js";
import Icons from "views/Components/Icons.js";
import LockScreenPage from "views/Pages/LockScreenPage.js";
import LoginPage from "views/Pages/LoginPage.js";
import Notifications from "views/Components/Notifications.js";
import Panels from "views/Components/Panels.js";
import PricingPage from "views/Pages/PricingPage.js";
import ReactTables from "views/Tables/ReactTables.js";
import RegisterPage from "views/Pages/RegisterPage.js";
import RegularForms from "views/Forms/RegularForms.js";
import RegularTables from "views/Tables/RegularTables.js";
import SimpleDashboard from "views/Dashboard/SimpleDashboard.js";
import SweetAlert from "views/Components/SweetAlert.js";
import TimelinePage from "views/Pages/Timeline.js";
import Typography from "views/Components/Typography.js";
import UserProfile from "views/Pages/UserProfile.js";
import ValidationForms from "views/Forms/ValidationForms.js";
import VectorMap from "views/Maps/VectorMap.js";
import Widgets from "views/Widgets/Widgets.js";
import Wizard from "views/Forms/Wizard.js";


// @material-ui/icons
import Apps from "@material-ui/icons/Apps";
import DashboardIcon from "@material-ui/icons/Dashboard";
import DateRange from "@material-ui/icons/DateRange";
import GridOn from "@material-ui/icons/GridOn";
import Image from "@material-ui/icons/Image";
import NotesIcon from '@material-ui/icons/Notes';
import Place from "@material-ui/icons/Place";
import Timeline from "@material-ui/icons/Timeline";
import WidgetsIcon from "@material-ui/icons/Widgets";

// Other
import NotebookViewer from "views/Components/NotebookViewer";
import {NotebooksGlue} from "data/DataGlue";

const dashRoutes = [
  // Enrico mod
  {
    path: '/charts',
    name: "Latest Charts",
    icon: DashboardIcon,
    component: SimpleDashboard,
    layout: ""
  },
  {
    is_notebooks_container: true,
    collapse: true,
    name: "Analyses",
    icon: NotesIcon,
    state: "analysesCollapse",
    views: [],
    layout: "",
  },
  // Former
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: DashboardIcon,
    component: Dashboard,
    layout: "/_dash"
  },
  {
    collapse: true,
    name: "Pages",
    icon: Image,
    state: "pageCollapse",
    views: [
      {
        path: "/pricing-page",
        name: "Pricing Page",
        mini: "PP",
        component: PricingPage,
        layout: "/_auth"
      },
      {
        path: "/timeline-page",
        name: "Timeline Page",
        mini: "T",
        component: TimelinePage,
        layout: "/_dash"
      },
      {
        path: "/login-page",
        name: "Login Page",
        mini: "L",
        component: LoginPage,
        layout: "/_auth"
      },
      {
        path: "/register-page",
        name: "Register Page",
        mini: "R",
        component: RegisterPage,
        layout: "/_auth"
      },
      {
        path: "/lock-screen-page",
        name: "Lock Screen Page",
        mini: "LS",
        component: LockScreenPage,
        layout: "/_auth"
      },
      {
        path: "/user-page",
        name: "User Profile",
        mini: "UP",
        component: UserProfile,
        layout: "/_dash"
      },
      {
        path: "/error-page",
        name: "Error Page",
        mini: "E",
        component: ErrorPage,
        layout: "/_auth"
      }
    ]
  },
  {
    collapse: true,
    name: "Components",
    icon: Apps,
    state: "componentsCollapse",
    views: [
      {
        collapse: true,
        name: "Multi Level Collapse",
        mini: "MC",
        state: "multiCollapse",
        views: [
          {
            path: "/buttons",
            name: "Buttons",
            mini: "B",
            component: Buttons,
            layout: "/_dash"
          }
        ]
      },
      {
        path: "/buttons",
        name: "Buttons",
        mini: "B",
        component: Buttons,
        layout: "/_dash"
      },
      {
        path: "/grid-system",
        name: "Grid System",
        mini: "GS",
        component: GridSystem,
        layout: "/_dash"
      },
      {
        path: "/panels",
        name: "Panels",
        mini: "P",
        component: Panels,
        layout: "/_dash"
      },
      {
        path: "/sweet-alert",
        name: "Sweet Alert",
        mini: "SA",
        component: SweetAlert,
        layout: "/_dash"
      },
      {
        path: "/notifications",
        name: "Notifications",
        mini: "N",
        component: Notifications,
        layout: "/_dash"
      },
      {
        path: "/icons",
        name: "Icons",
        mini: "I",
        component: Icons,
        layout: "/_dash"
      },
      {
        path: "/typography",
        name: "Typography",
        mini: "T",
        component: Typography,
        layout: "/_dash"
      }
    ]
  },
  {
    collapse: true,
    name: "Forms",
    icon: "content_paste",
    state: "formsCollapse",
    views: [
      {
        path: "/regular-forms",
        name: "Regular Forms",
        mini: "RF",
        component: RegularForms,
        layout: "/_dash"
      },
      {
        path: "/extended-forms",
        name: "Extended Forms",
        mini: "EF",
        component: ExtendedForms,
        layout: "/_dash"
      },
      {
        path: "/validation-forms",
        name: "Validation Forms",
        mini: "VF",
        component: ValidationForms,
        layout: "/_dash"
      },
      {
        path: "/wizard",
        name: "Wizard",
        mini: "W",
        component: Wizard,
        layout: "/_dash"
      }
    ]
  },
  {
    collapse: true,
    name: "Tables",
    icon: GridOn,
    state: "tablesCollapse",
    views: [
      {
        path: "/regular-tables",
        name: "Regular Tables",
        mini: "RT",
        component: RegularTables,
        layout: "/_dash"
      },
      {
        path: "/extended-tables",
        name: "Extended Tables",
        mini: "ET",
        component: ExtendedTables,
        layout: "/_dash"
      },
      {
        path: "/react-tables",
        name: "React Tables",
        mini: "RT",
        component: ReactTables,
        layout: "/_dash"
      }
    ]
  },
  {
    collapse: true,
    name: "Maps",
    icon: Place,
    state: "mapsCollapse",
    views: [
      {
        path: "/google-maps",
        name: "Google Maps",
        mini: "GM",
        component: GoogleMaps,
        layout: "/_dash"
      },
      {
        path: "/full-screen-maps",
        name: "Full Screen Map",
        mini: "FSM",
        component: FullScreenMap,
        layout: "/_dash"
      },
      {
        path: "/vector-maps",
        name: "Vector Map",
        mini: "VM",
        component: VectorMap,
        layout: "/_dash"
      }
    ]
  },
  {
    path: "/widgets",
    name: "Widgets",
    icon: WidgetsIcon,
    component: Widgets,
    layout: "/_dash"
  },
  {
    path: "/charts",
    name: "Charts",
    icon: Timeline,
    component: Charts,
    layout: "/_dash"
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: DateRange,
    component: Calendar,
    layout: "/_dash"
  }
];

function addNotebooksRoutes(notebooksRoutes, notebooksGlue) {
  notebooksGlue.forEach(notebook => {
    const id = notebook.id;
    const href = notebook.href;
    const title = notebook.title;
    const mini = title.split(' ').map(s => s[0] || "").join('').slice(0, 2);
    notebooksRoutes.views.push({
      path: "/notebook/" + id,
      name: title,
      mini: mini,
      component: NotebookViewer,
      layout: "",
      // notebook-specific route data
      nb_id: id,
      nb_href: href,
    })
  })
}

// add the Notebooks from the Glue data
addNotebooksRoutes(dashRoutes.find(r => r.is_notebooks_container), NotebooksGlue);


function getRoutesForLayout(routes, base_layout = '') {
  return routes.map((r, idx) => {
    if (r.collapse)
      return getRoutesForLayout(r.views, base_layout);
    if (r.layout === base_layout)
      return <Route path={r.layout + r.path} component={r.component} key={idx}/>;
    else
      return null;
  });
}

function getActiveRoute(routes) {
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].collapse) {
      const collapseActiveRoute = getActiveRoute(routes[i].views);
      if (collapseActiveRoute !== null)
        return collapseActiveRoute;
    } else {
      if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1)
        return routes[i];
    }
  }
  return null;
}

function getActiveRouteTitle(routes) {
  const route = getActiveRoute(routes);
  if (route) return route.name;
  return "Route Title Not Set";
}

export {dashRoutes, getRoutesForLayout, getActiveRouteTitle, getActiveRoute};
