import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MuiLink from "@material-ui/core/Link";
import Button from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import {ChartsGlue} from "./DataGlue"
import {EmbeddedChart} from "./EmbeddedChart";
import {notebookIdGateMessage, notebookIdToShort, notebookIdToTitle, scope2emoji, tag2emoji} from "./DataUtils";

/**
 * This component is here to provide Gating (checkbox) capability.
 */
function ChartGroup({name, notebookId, charts, onViewImage}) {
  const [gateChecked, setGateChecked] = React.useState(false);
  const gatingMessage = notebookIdGateMessage(notebookId);
  const isGated = gatingMessage.length > 0;
  const showCharts = !isGated || gateChecked;
  return (
    <React.Fragment>
      {isGated && <GridItem xs={12}>
        <h5>Click on the following to see the logistic charts.</h5>
        <FormControlLabel
          control={
            <Checkbox
              checked={gateChecked}
              disabled={false}
              color="primary"
              onChange={e => setGateChecked(e.target.checked)}/>}
          label={gatingMessage}
          style={{color: '#888'}}/>
      </GridItem>}
      {showCharts && charts.map(chart => (
        <GridItem xs={12} sm={12} md={6} lg={4} xl={3} key={chart.src}>
          <EmbeddedChart chart={chart} onViewImage={onViewImage}/>
        </GridItem>
      ))}
    </React.Fragment>
  )
}


export function EmbeddedChartContainer(props) {
  const {onViewImage} = props;
  const [activeScope, setActiveScope] = React.useState('global');
  const [activeTags, setActiveTags] = React.useState([]);
  const toggleTag = (tagId) => {
    if (activeTags.includes(tagId))
      setActiveTags(activeTags.filter(tag => tag !== tagId));
    else
      setActiveTags(activeTags.concat(tagId));
  };
  const smoothScrollTo = (event, selector) => {
    event.preventDefault();
    document.querySelector(selector).scrollIntoView({behavior: 'smooth'});
  };

  // find all scopes
  const allScopes = ['global'].concat(ChartsGlue.reduce((acc, chart) => {
    chart.scopes.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, []).sort());
  const showScopes = false;

  // find all tags
  const allTags = ChartsGlue.reduce((acc, chart) => {
    chart.tags.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, []).sort();

  // charts to display
  let charts = ChartsGlue;

  // sort by chart priority
  charts = charts.sort((a, b) => a.priority - b.priority);

  // limit scope, if not 'global'
  if (activeScope !== 'global')
    charts = charts.filter(chart => chart.scopes.includes(activeScope));

  // limit tags, if not empty
  if (activeTags.length)
    charts = charts.filter(chart => {
      for (const chartTag of chart.tags)
        if (activeTags.includes(chartTag))
          return true;
      return false;
    });

  // group by Notebook
  const chartGroups = [];
  charts.forEach(chart => {
    const notebookId = chart.notebook_id;
    let group = chartGroups.find(g => g.notebookId === notebookId);
    if (!group) {
      group = {
        name: notebookIdToTitle(notebookId),
        short: notebookIdToShort(notebookId),
        notebookId: notebookId,
        charts: [],
      };
      chartGroups.push(group);
    }
    group.charts.push(chart);
  });

  return (
    <React.Fragment>
      {/* Header: section selector, ...filters */}
      <GridContainer id="charts-top">
        <GridItem xs={12} sm={6} style={{marginTop: 'auto', marginBottom: 'auto'}}>
          <h6 style={{display: 'inline', marginRight: '1.1em'}}>Section:&nbsp;</h6>
          {chartGroups.map((group, idx) =>
            <span key={group.notebookId}>
              <MuiLink href={'#' + group.notebookId}
                       onClick={(e) => smoothScrollTo(e, '#' + group.notebookId)}>
                {group.short}
              </MuiLink>
              {idx === chartGroups.length - 1 ? '.' : ', '}
            </span>)}
        </GridItem>

        {/* Scopes: exclusive selector */}
        {showScopes && <GridItem xs={12} sm={6}>
          <h6 style={{display: 'inline', marginRight: '1em'}}>Scope:</h6>
          {allScopes.map(scopeId =>
            <Button color={activeScope === scopeId ? "rose" : undefined}
                    onClick={() => setActiveScope(scopeId)}
                    size="sm" round
                    key={scopeId}>
              {scope2emoji(scopeId)}
            </Button>)}
        </GridItem>}
        {/* Tags: any can be active */}
        <GridItem xs={12} sm={6}>
          <h6 style={{display: 'inline', marginRight: '1.1em'}}>Filter:&nbsp;&nbsp;&nbsp;&nbsp;</h6>
          {allTags.map(tagId =>
            <Button color={activeTags.includes(tagId) ? "primary" : undefined}
                    onClick={() => toggleTag(tagId)}
                    size="sm" round key={tagId}>
              {tag2emoji(tagId)}
            </Button>)}
        </GridItem>
        {/* Spacer for Desktop versions */}
        <GridItem xs={12}>
          &nbsp;
        </GridItem>
      </GridContainer>

      {/* Chart Groups (by Notebook basically) */}
      {chartGroups.map((chartGroup, groupIdx) =>
        <GridContainer key={chartGroup.notebookId} id={chartGroup.notebookId}>
          <GridItem xs={12}>
            <h3>
              {chartGroup.name}
              {groupIdx > 0 && <MuiLink href={'#'} style={{float: 'right'}}
                                        onClick={e => smoothScrollTo(e, '#charts-top')}>
                &#94;
              </MuiLink>}
            </h3>
          </GridItem>
          <ChartGroup {...chartGroup} onViewImage={onViewImage}/>
        </GridContainer>)}

      {/* Missing Charts */}
      {charts.length === 0 && <GridContainer>
        <GridItem sm={12}>
          <h4 style={{textAlign: 'center'}}>
            There are no charts matching the filter criteria.
          </h4>
        </GridItem>
      </GridContainer>}
    </React.Fragment>
  );
}
