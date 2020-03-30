import React from "react";
import Card from "../../components/Card/Card";
import CardHeader from "../../components/Card/CardHeader";
import CardBody from "../../components/Card/CardBody";
import CardFooter from "../../components/Card/CardFooter";
import {makeStyles} from "@material-ui/core/styles";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";

import {cardTitle, grayColor, successColor} from "assets/jss/material-dashboard-pro-react";

import figure1 from "data/ex1/card-3.jpeg"

const embeddedChartStyles = {
  cardTitle: {
    ...cardTitle,
    marginTop: "0px",
    marginBottom: "3px"
  },
  cardHover: {
    "&:hover": {
      "& $cardHeaderHover": {
        // transform: "translate3d(0, -50px, 0)"
      }
    }
  },
  cardHeaderHover: {
    transition: "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)"
  },
  cardImagePreview: {
    width: '100%',
  },
  successText: {
    color: successColor[0]
  },
  cardCategory: {
    color: grayColor[0],
    fontSize: "14px",
    paddingTop: "10px",
    marginBottom: "0",
    marginTop: "0",
    margin: "0"
  },
  upArrowCardCategory: {
    width: 14,
    height: 14
  },
  stats: {
    color: grayColor[0],
    fontSize: "12px",
    lineHeight: "22px",
    display: "inline-flex",
    "& svg": {
      position: "relative",
      top: "4px",
      width: "16px",
      height: "16px",
      marginRight: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      position: "relative",
      top: "4px",
      fontSize: "16px",
      marginRight: "3px"
    }
  },
};
const useStyles = makeStyles(embeddedChartStyles);

export function EmbeddedChart() {
  const classes = useStyles();
  console.log(figure1);
  return (
    <Card chart className={classes.cardHover}>
      <CardHeader color="info" className={classes.cardHeaderHover} style={{padding: 0}}>
        <img src={figure1} alt="Chart data" className={classes.cardImagePreview}/>
      </CardHeader>
      <CardBody>
        <h4 className={classes.cardTitle}>Chart Title</h4>
        <p className={classes.cardCategory}>
          <span className={classes.successText}>
            <ArrowUpward className={classes.upArrowCardCategory}/> 55%
          </span>{" "}
          increase in today's cases.
        </p>
      </CardBody>
      <CardFooter chart>
        <div className={classes.stats}><AccessTime/>{" "}updated 4 minutes ago</div>
      </CardFooter>
    </Card>
  );
}
