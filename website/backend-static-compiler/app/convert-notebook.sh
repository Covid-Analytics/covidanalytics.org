#!/bin/bash

jupyter-nbconvert --execute --allow-errors --to html --template covidanalytics --no-input --no-prompt  notebook.ipynb
