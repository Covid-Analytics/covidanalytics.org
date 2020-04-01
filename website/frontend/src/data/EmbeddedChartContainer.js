import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import {ChartsGlue} from "data/DataGlue"
import {EmbeddedChart} from "./EmbeddedChart";

export function EmbeddedChartContainer(props) {
  const {onViewImage} = props;
  const sortedCharts = ChartsGlue.sort((a, b) => a.priority - b.priority);
  return (
    <GridContainer>
      {sortedCharts.map((chart, idx) => (
        <GridItem xs={12} sm={12} md={6} lg={3} key={idx}>
          <EmbeddedChart chart={chart} onViewImage={onViewImage}/>
          {chart.priority}
        </GridItem>
      ))}
    </GridContainer>
  );
}
