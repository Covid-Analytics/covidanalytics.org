import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";

import {ChartsGlue} from "./DataGlue"
import {EmbeddedChart} from "./EmbeddedChart";
import {notebookIdToTitle, scope2emoji, tag2emoji} from "./DataUtils";


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

  // find all scopes
  const allScopes = ['global'].concat(ChartsGlue.reduce((acc, chart) => {
    chart.scopes.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, []).sort());

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
    const nb_id = chart.notebook_id;
    let group = chartGroups.find(g => g.id === nb_id);
    if (!group) {
      group = {
        name: notebookIdToTitle(nb_id),
        id: nb_id,
        charts: [],
      };
      chartGroups.push(group);
    }
    group.charts.push(chart);
  });

  return (
    <React.Fragment>
      {/* Filters */}
      <GridContainer>
        {/* Scopes: exclusive selector */}
        <GridItem sm={12} md={6}>
          <h6 style={{display: 'inline', marginRight: '1em'}}>Scope:</h6>
          {allScopes.map(scopeId =>
            <Button color={activeScope === scopeId ? "rose" : undefined}
                    onClick={() => setActiveScope(scopeId)}
                    size="sm" round
              // style={{paddingLeft: '10px', paddingRight: '10px'}}
                    key={scopeId}>
              {scope2emoji(scopeId)}
            </Button>)}
        </GridItem>
        {/* Tags: any can be active */}
        <GridItem sm={12} md={6}>
          <h6 style={{display: 'inline', marginRight: '1.1em'}}>Tags:&nbsp;&nbsp;</h6>
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

      {/* Charts */}
      {chartGroups.map(chartGroup =>
        <GridContainer key={chartGroup.id}>
          <GridItem xs={12}>
            <h4>{chartGroup.name}</h4>
          </GridItem>
          {chartGroup.charts.map((chart, idx) => (
            <GridItem xs={12} sm={12} md={6} lg={4} xl={3} key={idx}>
              <EmbeddedChart chart={chart} onViewImage={onViewImage}/>
            </GridItem>
          ))}
          {charts.length === 0 && <GridItem sm={12}>
            <h4 style={{textAlign: 'center'}}>
              There are no charts matching the filter criteria.
            </h4>
          </GridItem>}
        </GridContainer>
      )}
    </React.Fragment>
  );
}
