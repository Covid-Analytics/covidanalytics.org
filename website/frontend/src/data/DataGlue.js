/**
 * This file will be replaced by a machine-generated file when Glueing this to the pre-converted output
 * charts from all of the analytics.
 */
import React from "react";
import {EmbeddedChart} from "./EmbeddedChart";

// Import all Figures (path is relative to the src/data folder in the Frontend)

// List the EmbeddedChart(s)
export const ChartsGlue = [
  <EmbeddedChart imageResource={process.env.PUBLIC_URL + '/placeholder.png'} folder="covid19_world" title="output_5_0.png" comment="in today's cases." updated="2020-03-31T21:58:29Z"/>,
];

// List the Notebooks
export const NotebooksGlue = [
  {id: "covid19_world", title: "Covid19 World", href: "/covid19_world/index.html"},
  {id: "us_data", title: "Us Data", href: "/us_data/index.html"}
];

// Metadata
export const MetaDataGlue = {
  convert_iso8601: '2020-03-30T17:25:13Z'
};
