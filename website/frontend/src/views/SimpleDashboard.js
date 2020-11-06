import React from "react";
// import Icon from "@material-ui/core/Icon";
// import Store from "@material-ui/icons/Store";
// import Warning from "@material-ui/icons/Warning";
// import DateRange from "@material-ui/icons/DateRange";
// import LocalOffer from "@material-ui/icons/LocalOffer";
// import Language from "@material-ui/icons/Language";
// import {makeStyles} from "@material-ui/core/styles";

// core components
// import GridContainer from "components/Grid/GridContainer.js";
// import GridItem from "components/Grid/GridItem.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardIcon from "components/Card/CardIcon.js";
// import CardBody from "components/Card/CardBody.js";
// import CardFooter from "components/Card/CardFooter.js";
// import dashboardStyles from "assets/jss/material-dashboard-pro-react/views/dashboardStyle";

// our components
import Viewer from 'react-viewer';
import {EmbeddedChartContainer} from "data/EmbeddedChartContainer";

// const useStyles = makeStyles(dashboardStyles);

export default function SimpleDashboard() {
  // const classes = useStyles();
  const [chartViewerOpen, setChartViewerOpen] = React.useState(false);
  const [chartViewerSrc, setChartViewerSrc] = React.useState('');
  const viewChart = (src) => {
    setChartViewerOpen(true);
    setChartViewerSrc(src);
  };
  return (
    <div>
      {/* row: Global Stats and diffs */}
      {/*<Hidden smDown implementation="css">*/}
      {/*<GridContainer style={{display: 'none'}}>*/}
      {/*  <GridItem xs={12} sm={6} md={6} lg={3} xl={2}>*/}
      {/*    <Card>*/}
      {/*      <CardHeader color="warning" stats icon>*/}
      {/*        <CardIcon color="warning">*/}
      {/*          <Icon>content_copy</Icon>*/}
      {/*        </CardIcon>*/}
      {/*        <p className={classes.cardCategory}>Cases</p>*/}
      {/*        <h3 className={classes.cardTitle}>PH</h3>*/}
      {/*      </CardHeader>*/}
      {/*      <CardFooter stats>*/}
      {/*        <div className={classes.stats}>*/}
      {/*          <LocalOffer/>*/}
      {/*          Tracked from John Hopkins' data set.*/}
      {/*        </div>*/}
      {/*      </CardFooter>*/}
      {/*    </Card>*/}
      {/*  </GridItem>*/}

      {/*  <GridItem xs={12} sm={6} md={6} lg={3} xl={2}>*/}
      {/*    <Card>*/}
      {/*      <CardHeader color="success" stats icon>*/}
      {/*        <CardIcon color="success"><Store/></CardIcon>*/}
      {/*        <p className={classes.cardCategory}>Recovered</p>*/}
      {/*        <h3 className={classes.cardTitle}>PH</h3>*/}
      {/*      </CardHeader>*/}
      {/*      <CardFooter stats>*/}
      {/*        <div className={classes.stats}>*/}
      {/*          <DateRange/>*/}
      {/*          Last 24 Hours*/}
      {/*        </div>*/}
      {/*      </CardFooter>*/}
      {/*    </Card>*/}
      {/*  </GridItem>*/}

      {/*  <GridItem xs={12} sm={6} md={6} lg={3} xl={2}>*/}
      {/*    <Card>*/}
      {/*      <CardHeader color="danger" stats icon>*/}
      {/*        <CardIcon color="danger"><Warning/></CardIcon>*/}
      {/*        <p className={classes.cardCategory}>Deaths</p>*/}
      {/*        <h3 className={classes.cardTitle}>PH</h3>*/}
      {/*      </CardHeader>*/}
      {/*      <CardFooter stats>*/}
      {/*        <div className={classes.stats}>*/}
      {/*          <LocalOffer/>*/}
      {/*          Tracked from John Hopkins' data set.*/}
      {/*        </div>*/}
      {/*      </CardFooter>*/}
      {/*    </Card>*/}
      {/*  </GridItem>*/}
      {/*</GridContainer>*/}
      {/*</Hidden>*/}

      {/* row: Import all the Charts */}
      <EmbeddedChartContainer onViewImage={viewChart}/>

      {/* row: Geo Table */}
      {/*<GridContainer>*/}
      {/*  <GridItem xs={12} style={{display: 'visible'}}>*/}
      {/*    <Card>*/}
      {/*      <CardHeader color="success" icon>*/}
      {/*        <CardIcon color="success">*/}
      {/*          <Language/>*/}
      {/*        </CardIcon>*/}
      {/*        <h4 className={classes.cardIconTitle}>*/}
      {/*          Global Cases by Top Locations*/}
      {/*        </h4>*/}
      {/*      </CardHeader>*/}
      {/*      <CardBody>*/}
      {/*        <GridContainer justify="space-between">*/}
      {/*          <GridItem xs={12} sm={12} md={5}>*/}
      {/*            Table*/}
      {/*          </GridItem>*/}
      {/*          <GridItem xs={12} sm={12} md={6}>*/}
      {/*            Map*/}
      {/*          </GridItem>*/}
      {/*        </GridContainer>*/}
      {/*      </CardBody>*/}
      {/*    </Card>*/}
      {/*  </GridItem>*/}
      {/*</GridContainer>*/}

      {/* Chart viewer */}
      <Viewer visible={chartViewerOpen} images={[{src: chartViewerSrc, downloadUrl: chartViewerSrc}]}
              attribute={false} rotatable={false} downloadable={true} changeable={false} scalable={false}
              noClose={true} noNavbar={true} zoomSpeed={0.10}
              onMaskClick={() => setChartViewerOpen(false)}
              onClose={() => setChartViewerOpen(false)}/>
    </div>
  );
}
