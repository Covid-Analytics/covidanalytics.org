import React from "react";
import Card from "../components/Card/Card";
import CardHeader from "../components/Card/CardHeader";
import CardBody from "../components/Card/CardBody";
import CardFooter from "../components/Card/CardFooter";
import {makeStyles} from "@material-ui/core/styles";
import AccessTime from "@material-ui/icons/AccessTime";

import TimeAgo from 'react-timeago'

import {cardTitle, grayColor, successColor} from "assets/jss/material-dashboard-pro-react";
import GridContainer from "../components/Grid/GridContainer";
import GridItem from "../components/Grid/GridItem";

const us_flag = require("assets/img/flags/US.png");
const it_flag = require("assets/img/flags/IT.png");

const embeddedChartStyles = {
  cardTitle: {
    ...cardTitle,
    marginTop: "0px",
    marginBottom: "3px"
  },
  cardHover: {
    "&:hover": {
      "& $cardHeaderHover": {
        transform: "translate3d(0, -10px, 0)"
      }
    }
  },
  cardHeaderHover: {
    transition: "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    background: 'white',
  },
  // cardHoverUnder: {
  //   position: "absolute",
  //   zIndex: "1",
  //   top: "-50px",
  //   width: "calc(100% - 30px)",
  //   left: "17px",
  //   right: "17px",
  //   textAlign: "center"
  // },
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

// Example from DataGlue.js
// const chart = {
//   src: "/placeholder.png",
//   title: "Chart",
//   short: "short comment",
//   notebook_id: "covid19_world",
//   scopes: ["us", "it"],
//   tags: ["deaths"],
//   highlight: false,
//   priority: 2,
//   updated: "2020-04-01T17:52:13Z"
// };

export function EmbeddedChart(props) {
  const {chart, onViewImage} = props;
  const classes = useStyles();

  // unpack chart attributes
  const {src, title, short, notebook_id, scopes, tags, /*highlight,*/ /*priority,*/ updated} = chart;
  const img_src = process.env.PUBLIC_URL + src;
  const folder = "/" + notebook_id;

  const handleImageClick = (e) => {
    e.preventDefault();
    onViewImage(img_src);
  };
  return (
    <Card chart className={classes.cardHover}>
      <CardHeader color="rose" className={classes.cardHeaderHover} style={{padding: 6, background: 'white'}}>
        <a href={folder} onClick={e => handleImageClick(e)}>
          <img src={img_src} alt={title} className={classes.cardImagePreview}/>
        </a>
      </CardHeader>
      <CardBody>
        <GridContainer>
          <GridItem xs={9}>
            <h4 className={classes.cardTitle}>
              <a href={folder}>{title}</a>
            </h4>
          </GridItem>
          <GridItem xs={3} style={{textAlign: 'right'}}>
            {tags.map(tag => {
              if (tag === "deaths") return <span key={tag}>💀</span>;
            })}
            {scopes.map(scope => {
              if (scope === "us") return <img src={us_flag} alt="USA" key={scope}/>;
              if (scope === "it") return <img src={it_flag} alt="Italy" key={scope}/>;
            })}
          </GridItem>
          <GridItem xs={12}>
            <p className={classes.cardCategory}>
              {/*<span className={classes.successText}>*/}
              {/*  <ArrowUpward className={classes.upArrowCardCategory}/> 55%*/}
              {/*</span>{" "}*/}
              {short}
            </p>
          </GridItem>
        </GridContainer>
      </CardBody>
      <CardFooter chart>
        <div className={classes.stats}><AccessTime/> {<TimeAgo date={updated}/>}.</div>
      </CardFooter>
    </Card>
  );
}
