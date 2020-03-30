import React from "react";
// react plugin for creating charts
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
// import ContentCopy from "@material-ui/icons/ContentCopy";
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
// import Place from "@material-ui/icons/Place";
// import ArtTrack from "@material-ui/icons/ArtTrack";
import Language from "@material-ui/icons/Language";
// core components
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
// import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import styles from "assets/jss/material-dashboard-pro-react/views/dashboardStyle.js";
import {dataGlue} from "data/DataGlue"

// react plugin for creating vector maps
// import {VectorMap} from "react-jvectormap";

// import priceImage1 from "assets/img/card-2.jpeg";
// import priceImage2 from "assets/img/card-3.jpeg";
// import priceImage3 from "assets/img/card-1.jpeg";

const us_flag = require("assets/img/flags/US.png");
const de_flag = require("assets/img/flags/DE.png");
const au_flag = require("assets/img/flags/AU.png");
const gb_flag = require("assets/img/flags/GB.png");
const ro_flag = require("assets/img/flags/RO.png");
const br_flag = require("assets/img/flags/BR.png");

const useStyles = makeStyles(styles);

export default function SimpleDashboard() {
  const classes = useStyles();
  return (
    <div>
      {/* 1st row: Global Stats and diffs */}
      <GridContainer>
        <GridItem xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <Icon>content_copy</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>Cases</p>
              <h3 className={classes.cardTitle}>PH</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer/>
                Tracked from John Hopkins' data set.
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success"><Store/></CardIcon>
              <p className={classes.cardCategory}>Recovered</p>
              <h3 className={classes.cardTitle}>PH</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <DateRange/>
                Last 24 Hours
              </div>
            </CardFooter>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={6} lg={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger"><Warning/></CardIcon>
              <p className={classes.cardCategory}>Deaths</p>
              <h3 className={classes.cardTitle}>PH</h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer/>
                Tracked from John Hopkins' data set.
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>

      {/* row 2: Import all the Charts */}
      <GridContainer>
        {dataGlue.map((e, idx) => (
          <GridItem xs={12} sm={12} md={4} key={idx}>
            {e}
          </GridItem>
        ))}
      </GridContainer>

      {/* 2nd row: Geo Table */}
      <GridContainer>
        <GridItem xs={12}>
          <Card>
            <CardHeader color="success" icon>
              <CardIcon color="success">
                <Language/>
              </CardIcon>
              <h4 className={classes.cardIconTitle}>
                Global Cases by Top Locations
              </h4>
            </CardHeader>
            <CardBody>
              <GridContainer justify="space-between">
                <GridItem xs={12} sm={12} md={5}>
                  Table
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                  Map
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
