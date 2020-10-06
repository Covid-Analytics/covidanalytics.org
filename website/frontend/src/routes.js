import React from "react";
import {Route} from "react-router-dom";

import SimpleDashboard from "views/SimpleDashboard.js";


// @material-ui/icons
import DashboardIcon from "@material-ui/icons/Dashboard";
import NotesIcon from '@material-ui/icons/Notes';

// Other
import NotebookViewer from "data/NotebookViewer";
import {NotebooksGlue} from "data/DataGlue";

const dashRoutes = [
  // Enrico mod
  {
    path: '/charts',
    name: "Live Charts",
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
