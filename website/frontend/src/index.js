/*!

=========================================================
* Material Dashboard PRO React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router} from "react-router-dom";

import SimpleLayout from "layouts/SimpleLayout.js";

import "assets/scss/material-dashboard-pro-react.scss?v=1.8.0";

// const hist = createBrowserHistory();

ReactDOM.render(
  <Router>
    {/*<Switch>*/}
    {/*  <Route path="/">*/}
        <SimpleLayout/>
    {/*  </Route>*/}
    {/*</Switch>*/}
  </Router>,
  document.getElementById("root")
);
