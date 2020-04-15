import React from "react";
import Card from "../components/Card/Card";
import CardHeader from "../components/Card/CardHeader";
import CardBody from "../components/Card/CardBody";
import CardFooter from "../components/Card/CardFooter";
import Hidden from "@material-ui/core/Hidden";
import AccessTime from "@material-ui/icons/AccessTime";
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import TimelineIcon from '@material-ui/icons/Timeline';
import Tooltip from "@material-ui/core/Tooltip";
import {makeStyles} from "@material-ui/core/styles";

import TimeAgo from 'react-timeago'

import {cardTitle, tooltip, successColor} from "assets/jss/material-dashboard-pro-react";
import dashboardStyle from "assets/jss/material-dashboard-pro-react/views/dashboardStyle.js";
import hoverCardStyle from "assets/jss/material-dashboard-pro-react/hoverCardStyle.js";
import GridContainer from "../components/Grid/GridContainer";
import GridItem from "../components/Grid/GridItem";
import Button from "../components/CustomButtons/Button";

import {scope2flag, tag2emoji} from "./DataUtils";

const embeddedChartStyles = {
  ...hoverCardStyle,
  tooltip,
  cardTitle: {
    ...cardTitle,
    marginTop: "0px",
    marginBottom: "3px"
  },
  cardHover: {
    "&:hover": {
      "& $cardHeaderHover": {
        transform: "translate3d(0, -40px, 0)"
      }
    }
  },
  cardHeaderHover: {
    ...hoverCardStyle.cardHeaderHover,
    zIndex: 5, // make sure the header covers the buttons underneath
  },
  cardHoverUnder: {
    ...hoverCardStyle.cardHoverUnder,
    top: '-40px',
  },
  underButton: {
    padding: '6px 30px',
  },
  cardImagePreview: {
    width: '100%',
  },
  successText: {
    color: successColor[0]
  },
  cardCategory: {
    ...dashboardStyle.cardCategory,
  },
  // cardCategoryArrow: {
  //   width: 14,
  //   height: 14
  // },
  cardStats: {
    ...dashboardStyle.stats,
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
  const route_notebook = "/notebook/" + notebook_id;

  const handleImageClick = (e) => {
    e.preventDefault();
    onViewImage(img_src);
  };
  return (
    <Card chart className={classes.cardHover}>
      <CardHeader color="rose" className={classes.cardHeaderHover} style={{padding: 6, background: 'white'}}>
        <a href={route_notebook} onClick={e => handleImageClick(e)}>
          <img src={img_src} alt={title} className={classes.cardImagePreview}/>
        </a>
      </CardHeader>
      <CardBody>
        <Hidden smDown implementation="css">
          <div className={classes.cardHoverUnder}>
            <Tooltip id="tooltip-top" title="View Chart" placement="bottom" classes={{tooltip: classes.tooltip}}>
              <Button color="rose" simple onClick={e => handleImageClick(e)} className={classes.underButton}>
                <TimelineIcon/>
              </Button>
            </Tooltip>
            <Tooltip id="tooltip-top" title="View Notebook" placement="bottom" classes={{tooltip: classes.tooltip}}>
              <Button color="rose" simple href={route_notebook} className={classes.underButton}>
                <LibraryBooksIcon/>
              </Button>
            </Tooltip>
          </div>
        </Hidden>
        <GridContainer>
          <GridItem xs={9}>
            <h4 className={classes.cardTitle}>
              <a href={route_notebook}>{title}</a>
            </h4>
          </GridItem>
          <GridItem xs={3} style={{textAlign: 'right'}}>
            {tags.map(tagId => <span key={tagId}>{tag2emoji(tagId, true)}</span>)}
            {scopes.map(scope => scope2flag(scope))}
          </GridItem>
          <GridItem xs={12}>
            <p className={classes.cardCategory}>
              {/*<span className={classes.successText}>*/}
              {/*  <ArrowUpward className={classes.cardCategoryArrow}/> 55%*/}
              {/*</span>{" "}*/}
              {short}
            </p>
          </GridItem>
        </GridContainer>
      </CardBody>
      <CardFooter chart>
        <div className={classes.cardStats}><AccessTime/> {<TimeAgo date={updated}/>}.</div>
      </CardFooter>
    </Card>
  );
}
