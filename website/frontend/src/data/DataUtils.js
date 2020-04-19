import React from "react";

const us_flag = require("assets/img/flags/US.png");
const it_flag = require("assets/img/flags/IT.png");
const kr_flag = require("assets/img/flags/KR.png");
const cn_flag = require("assets/img/flags/CN.png");
const in_flag = require("assets/img/flags/IN.png");
const br_flag = require("assets/img/flags/BR.png");

export function notebookIdToTitle(notebookId) {
  if (notebookId === "covid19_world") return "World Analysis";
  if (notebookId === "us_data") return "United States Analysis";
  if (notebookId === "predictions") return "Predictions";
  return "Others";
}

export function scope2flag(scopeId) {
  if (scopeId === "us") return <img src={us_flag} alt="USA" key={scopeId}/>;
  if (scopeId === "it") return <img src={it_flag} alt="Italy" key={scopeId}/>;
  if (scopeId === "kr") return <img src={kr_flag} alt="South Korea" key={scopeId}/>;
  if (scopeId === "cn") return <img src={cn_flag} alt="China" key={scopeId}/>;
  if (scopeId === "in") return <img src={in_flag} alt="India" key={scopeId}/>;
  if (scopeId === "br") return <img src={br_flag} alt="Brazil" key={scopeId}/>;
  return scopeId;
}

export function scope2emoji(scopeId) {
  if (scopeId === "us") return "🇺🇸";
  if (scopeId === "it") return "🇮🇹";
  if (scopeId === "kr") return "🇰🇷";
  if (scopeId === "cn") return "🇨🇳";
  if (scopeId === "in") return "🇮🇳";
  if (scopeId === "br") return "🇧🇷";
  return scopeId;
}

export function tag2emoji(tagId, skipName = false) {
  if (tagId === 'deaths') return '💀';
  if (tagId === 'forecast') return '📈';
  return skipName ? '' : tagId;
}
