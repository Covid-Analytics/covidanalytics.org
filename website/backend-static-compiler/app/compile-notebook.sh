#!/bin/bash

jupyter-nbconvert --to html --template hidecode.tplx --execute notebook.ipynb
