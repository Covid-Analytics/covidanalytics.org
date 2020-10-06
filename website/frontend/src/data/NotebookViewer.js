import React from "react";

import GridItem from "../components/Grid/GridItem";
import GridContainer from "../components/Grid/GridContainer";

import {dashRoutes, getActiveRoute} from "../routes";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
  iframe: {
    width: '100%',
    height: '82vh',
    border: 'none',
    borderBottom: '1px solid #CCC',
  },
});

export default function NotebookViewer() {
  const classes = useStyles();

  // find the HREF to the notebook
  const route = getActiveRoute(dashRoutes);
  if (!route || !route.hasOwnProperty('nb_href')) return <div/>;
  let nb_src = route['nb_href'];
  if (!nb_src.startsWith('/'))
    nb_src = '/' + nb_src;

  return (
    <GridContainer>
      <GridItem xs={12}>
        <iframe src={nb_src} className={classes.iframe}/>
      </GridItem>
    </GridContainer>
  )
}
