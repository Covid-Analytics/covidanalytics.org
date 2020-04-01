/**
 * This file will be replaced by a machine-generated file when Glueing this to the pre-converted output
 * charts from all of the analytics.
 */
import React from "react";
import {EmbeddedChart} from "./EmbeddedChart";

// List the EmbeddedChart(s)
export const ChartsGlue = [
  // {src: "/placeholder.png", title: "Chart", short: "short comment", notebook_id: "covid19_world", scopes: ["us", "it"], tags: ["deaths"], highlight: false, priority: 2, updated: "2020-04-01T17:52:13Z"},
  {src: "/covid19_world/output_5_0.png", title: "Global Death Rate", short: "should be constant", notebook_id: "covid19_world", scopes: ["global", "it"], tags: ["deaths"], highlight: true, priority: 1, updated: "2020-04-01T18:30:32Z"},
  {src: "/covid19_world/output_5_1.png", title: "Trend in Global Cases", short: "how different cultures handle it", notebook_id: "covid19_world", scopes: ["global"], tags: ["cases", "log", "shifted"], highlight: false, priority: 2, updated: "2020-04-01T18:30:32Z"},
  {src: "/covid19_world/output_5_2.png", title: "Global Cases", short: "most countries are just shifted", notebook_id: "covid19_world", scopes: ["global"], tags: ["cases", "log"], highlight: false, priority: 6, updated: "2020-04-01T18:30:32Z"},
  {src: "/us_data/output_3_0.png", title: "Trend in US Cases", short: "how states are behaving", notebook_id: "us_data", scopes: ["us"], tags: ["cases", "log", "shifted"], highlight: true, priority: 3, updated: "2020-04-01T18:30:36Z"},
  {src: "/us_data/output_3_1.png", title: "US Cases by State", short: "most States are just shifted", notebook_id: "us_data", scopes: ["us"], tags: ["cases", "log"], highlight: false, priority: 4, updated: "2020-04-01T18:30:36Z"},
  {src: "/us_data/output_3_2.png", title: "US Death Rate", short: "currently between 1 and 4%, as nominal", notebook_id: "us_data", scopes: ["us"], tags: ["deaths"], highlight: false, priority: 3, updated: "2020-04-01T18:30:36Z"},
];

// List the Notebooks
export const NotebooksGlue = [
  {id: "covid19_world", title: "Covid19 World", href: "/covid19_world/index.html", updated: "2020-04-01T18:30:32Z"},
  {id: "us_data", title: "Us Data", href: "/us_data/index.html", updated: "2020-04-01T18:30:36Z"},
];

// Metadata
export const MetaDataGlue = {
  convert_iso8601: '2020-04-01T18:30:36Z',
};
