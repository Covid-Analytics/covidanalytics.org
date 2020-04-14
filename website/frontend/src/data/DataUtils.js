import React from "react";

const us_flag = require("assets/img/flags/US.png");
const it_flag = require("assets/img/flags/IT.png");
const kr_flag = require("assets/img/flags/KR.png");
const cn_flag = require("assets/img/flags/CN.png");

export function scope2flag(scopeId) {
  if (scopeId === "us") return <img src={us_flag} alt="USA" key={scopeId}/>;
  if (scopeId === "it") return <img src={it_flag} alt="Italy" key={scopeId}/>;
  if (scopeId === "kr") return <img src={kr_flag} alt="South Korea" key={scopeId}/>;
  if (scopeId === "cn") return <img src={cn_flag} alt="China" key={scopeId}/>;
  return scopeId;
}

export function scope2emoji(scopeId) {
  if (scopeId === "us") return "🇺🇸";
  if (scopeId === "it") return "🇮🇹";
  if (scopeId === "kr") return "🇰🇷";
  if (scopeId === "cn") return "🇨🇳";
  return scopeId;
}
