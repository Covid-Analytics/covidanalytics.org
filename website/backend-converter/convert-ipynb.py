# This script pre-processes a bunch of notebooks generating all of the figures, and then creates
# a bundle of pics and html ready for frontend compiling into our react UI.

import glob
import json
import os
import nbformat
import pandas
import random
from datetime import datetime, timedelta, timezone
from jinja2 import DictLoader
from nbconvert import HTMLExporter
from nbconvert.preprocessors import ExecutePreprocessor, ClearOutputPreprocessor
from traitlets.config import Config

# Configuration (shall have a command line, one day)
NOTEBOOK_PATHS = ['.', './input', '../../analysis']
OUTPUT_FOLDER = 'output'
FRONTEND_GLUE_FILE = 'DataGlue.js'
FIGURES_META_FILE = 'figures-meta.csv'
PYTHON_EXTRA_PATHS = '../;../../;../input;../../input/;../../../analysis;../../../../analysis'

# This is the inline'd template
stand_alone_tpl = """
{%- extends 'full.tpl' -%}

{% block input_group %}
    {%- if cell.metadata.get('nbconvert', {}).get('show_code', False) -%}
{{ super() }}
    {%- endif -%}
{% endblock input_group %}

{% block html_head %}
{{ super() }}
<!-- customize looks -->
<style type="text/css">
  body {
    background: transparent;
    padding: 0
  }
  div#notebook-container{
    padding: 2ex 4ex 2ex 4ex;
  }
  div.output_subarea {
    max-width: initial;
  }
  .rendered_html table {
    width: 100%;
  }
</style>
{% endblock html_head %}
"""
react_glue_tpl = """
{%- extends 'basic.tpl' -%}

{%- block header -%}
module.exports = function(props) {
  return (
{%- endblock header -%}

{% block body %}
    {{ super() }}
{%- endblock body %}

{% block footer %}
  );
};
{% endblock footer %}
"""


def current_utc_time():
    # whether to compensate for the build time - so that the UTC refresh date is now + X minutes
    compensate_build_time = 2
    return (datetime.now(timezone.utc) + timedelta(minutes=compensate_build_time)).strftime('%Y-%m-%dT%H:%M:%SZ')


def input_file_to_folder(basename):
    return basename.lower().replace(' ', '_').replace('.', '_')


def scan_for_notebooks(paths_list):
    print("Finding notebooks in: " + str(paths_list))
    nb_list = []
    for probe_dir in paths_list:
        for nb_file_name in glob.glob(probe_dir + '/*.ipynb'):
            file_path = os.path.normpath(nb_file_name)
            file_basename = os.path.splitext(os.path.basename(file_path))[0]
            nb_list.append({
                'input': file_path,
                'basename': input_file_to_folder(file_basename),
            })
    print(" - found " + str(len(nb_list)) + " notebooks:" + str(nb_list))
    return nb_list


def convert_notebook_to_assets(notebook_file_name, base_name, output_prefix):
    # define and create output folder
    output_folder = output_prefix + '/' + base_name
    os.makedirs(output_folder, exist_ok=True)

    # open file
    print('Converting Notebook: ' + notebook_file_name + ' ...')
    nb_file = open(notebook_file_name, 'r').read()
    nb = nbformat.reads(nb_file, as_version=4)

    # 1. clear output
    print(" - clearing output")
    ep = ClearOutputPreprocessor()
    ep.preprocess(nb, {})

    # 2. generate fresh charts by running the notebook
    print(" - executing")
    ep = ExecutePreprocessor(timeout=600, kernel_name='python3', allow_errors=False)
    try:
        ep.preprocess(nb, {'metadata': {'path': output_folder}})
    except Exception as e:
        print('ERROR: Execution of the notebook ' + notebook_file_name + ' stopped, likely for missing some py libs.')
        print('       Please check the output/exception and add those to the requirements.')
        print(e)
        exit(1)

    # 3. export HTML
    print(" - generating html")
    cleaner_config = Config({
        "HTMLExporter": {
            "exclude_input": True,
            "exclude_input_prompt": True,
            "exclude_output_prompt": True,
            "preprocessors": ['nbconvert.preprocessors.ExtractOutputPreprocessor']
        },
    })
    local_templates = DictLoader({
        'our-html.tpl': stand_alone_tpl,
        'react-glue.tpl': react_glue_tpl,
    })
    exporter = HTMLExporter(config=cleaner_config, extra_loaders=[local_templates])
    exporter.template_file = 'our-html.tpl'
    (html_body, html_resources) = exporter.from_notebook_node(nb)
    notebook_convert_time = current_utc_time()

    # save html output file, with local reference to the pictures
    local_html = []
    output_html_file_name = output_folder + '/' + "index.html"
    print("   - saving html: " + output_html_file_name)
    with open(output_html_file_name, 'wt') as the_file:
        the_file.write(html_body)
    local_html.append({
        'notebook': base_name,
        'notebook_html': output_html_file_name,
        'convert_time': notebook_convert_time,
    })

    # save js file for react inclusion (local ref to the pictures)
    # exporter.template_file = 'react-glue.tpl'
    # (react_body, react_resources) = exporter.from_notebook_node(nb)
    # output_react_file_name = output_folder + '/' + "index.js"
    # print("   - saving react js: " + output_react_file_name)
    # with open(output_react_file_name, 'wt') as the_file:
    #     the_file.write(react_body)

    # save all the figures
    local_figures = []
    figures = html_resources['outputs']
    figures_count = len(figures)
    figure_index = 1
    for figure_file in figures:
        output_figure_file_name = output_folder + '/' + figure_file
        print("   - saving png " + str(figure_index) + " of " + str(figures_count) + ": " + output_figure_file_name)
        if not figure_file.endswith('.png'):
            print("WARNING: figure is not a PNG file")
            continue
        with open(output_figure_file_name, 'wb') as the_file:
            the_file.write(figures[figure_file])
        local_figures.append({
            'figure': figure_file,
            'file': output_figure_file_name,
            'notebook': base_name,
            'notebook_html': output_html_file_name,
            'convert_time': notebook_convert_time,
        })

    # create an empty 'custom.css'
    custom_css_file_name = output_folder + '/' + 'custom.css'
    with open(custom_css_file_name, 'wt') as the_file:
        the_file.write("")

    # return a recap of all assets
    return local_html, local_figures


glue_frontend_template = """// MACHINE GENERATED CODE, by convert-ipynb.py
import React from "react";
import {EmbeddedChart} from "./EmbeddedChart";

// List the EmbeddedChart(s)
export const ChartsGlue = [
%COMPONENTS%
];

// List the Notebooks
export const NotebooksGlue = [
%NOTEBOOKS%
];

// Metadata
export const MetaDataGlue = {
%METADATA%
};
"""


def write_assets_loader(pages, figures, output_prefix, frontend_glue_file_name):
    fig_count = len(figures)
    print('Generating Fronted Glue JS for ' + str(fig_count) + ' Figures ...')

    # begin loading Meta info about the figures - this is to compensate for the lack of information transfer between
    # the notebooks and the Glue. To compensate, manual editing is needed, and we use a simple CSV file here
    df_figures = pandas.read_csv(FIGURES_META_FILE, sep=',').fillna('')

    # Figures: generate JS statements for every figure
    frontend_components = []
    fig_index = 0
    df_warning_silencer = False
    for figure in figures:
        fig_index = fig_index + 1

        # figure: conversion parameters
        fig_id = figure['figure']
        fig_file = figure['file']
        notebook_id = figure['notebook']
        fig_updated = figure['convert_time']

        # figure: relative URL of the PNG (/public folder referencing in React) - example: '/covid19_world/output_5_0.png'
        fig_img_src = "/" + fig_file.replace(output_prefix + '/', '')

        # figure: metadata: default values - to NEVER show(!)
        fig_title = fig_id
        fig_short = "short commentary"
        fig_scopes = ",".join([scope for scope in ['global', 'us', 'italy'] if random.random() < 0.3])
        fig_tags = ",".join([scope for scope in ['mortality', 'cases', 'trends'] if random.random() < 0.3])
        fig_highlight = 1 if random.random() < 0.3 else ''
        fig_priority = fig_index

        # figure: metadata: replace with editorial values from the local 'CSV' database
        df = df_figures
        df = df[df['notebook_id'] == notebook_id]
        df = df[df['figure_id'] == fig_id]
        if len(df) != 1:
            if not df_warning_silencer:
                print("  WARNING: the following are missing metadata in " + FIGURES_META_FILE)
                df_warning_silencer = True
            print(notebook_id + "," + fig_id + ",,,,")
        else:
            fig_title = str(df['title'].iloc[0])
            fig_short = df['commentary'].iloc[0]
            fig_scopes = df['scopes'].iloc[0]
            fig_tags = df['tags'].iloc[0]
            fig_highlight = df['highlight'].iloc[0]
            fig_priority = int(df['priority'].iloc[0]) if df['priority'].iloc[0] else 99

        # append one component
        frontend_components.append(
            '{src: "' + fig_img_src + '"' +
            ', title: "' + fig_title + '"' +
            ', short: "' + fig_short + '"' +
            ', notebook_id: "' + notebook_id + '"' +
            ', scopes: ' + json.dumps(fig_scopes.split(',')) + '' +
            ', tags: ' + json.dumps(fig_tags.split(',')) + '' +
            ', highlight: ' + ('true' if fig_highlight else 'false') + '' +
            ', priority: ' + str(int(fig_priority)) + '' +
            ', updated: "' + fig_updated + '"' +
            '},')

    # Notebooks
    page_data = []
    for page in pages:
        page_name = page['notebook']
        page_title = page_name.replace('_', ' ').title()
        page_file = page['notebook_html'].replace(output_prefix + '/', '')
        page_updated = page['convert_time']
        # append one JSON descriptor
        page_def = '{id: "' + page_name + '"' + \
                   ', title: "' + page_title + '"' + \
                   ', href: "/' + page_file + '"' + \
                   ', updated: "' + page_updated + '"' + \
                   '},'
        page_data.append(page_def)

    # Metadata
    meta_strings = ["convert_iso8601: '" + current_utc_time() + "',"]

    # write the JS file
    glue_string = glue_frontend_template \
        .replace('%COMPONENTS%', "\n".join(["  " + fc for fc in frontend_components])) \
        .replace('%NOTEBOOKS%', "\n".join(["  " + pd for pd in page_data])) \
        .replace('%METADATA%', "\n".join(["  " + ms for ms in meta_strings]))

    output_frontend_glue_name = output_prefix + '/' + frontend_glue_file_name
    print(" - saving frontend glue JS: " + output_frontend_glue_name)
    with open(output_frontend_glue_name, 'wt') as the_file:
        the_file.write(glue_string)


# Main
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
# make sure the modules loaded by the notebook can be found in a relative-to-the-notebook search path
if 'PYTHONPATH' not in os.environ: os.environ['PYTHONPATH'] = ''
os.environ['PYTHONPATH'] += ';' + PYTHON_EXTRA_PATHS
notebooks = scan_for_notebooks(NOTEBOOK_PATHS)
all_pages = []
all_figures = []
for task in notebooks:
    nb_html, nb_figures = convert_notebook_to_assets(task['input'], task['basename'], OUTPUT_FOLDER)
    all_pages.extend(nb_html)
    all_figures.extend(nb_figures)
write_assets_loader(all_pages, all_figures, OUTPUT_FOLDER, FRONTEND_GLUE_FILE)

print("done.")
