# This script pre-processes a bunch of notebooks generating all of the figures, and then creates
# a bundle of pics and html ready for frontend compiling into our react UI.

import glob
import os
import nbformat
from datetime import datetime, timedelta, timezone
from nbconvert import HTMLExporter
from nbconvert.preprocessors import ExecutePreprocessor, ClearOutputPreprocessor
from traitlets.config import Config
from jinja2 import DictLoader

# Configuration (shall have a command line, one day)
NOTEBOOK_PATHS = ['.', './input', '../../analysis']
OUTPUT_FOLDER = 'output'
FRONTEND_GLUE_FILE = 'DataGlue.js'

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

    # save html output file, with local reference to the pictures
    local_html = []
    output_html_file_name = output_folder + '/' + "index.html"
    print("   - saving html: " + output_html_file_name)
    with open(output_html_file_name, 'wt') as the_file:
        the_file.write(html_body)
    local_html.append({
        'notebook': base_name,
        'html_notebook': output_html_file_name,
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
            'html_notebook': output_html_file_name,
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

// Import all Figures (path is relative to the src/data folder in the Frontend)
%CHART_IMPORTS%

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
    # whether to compensate for the build time - so that the UTC refresh date is now + X minutes
    compensate_build_time = 2
    update_utc = (datetime.now(timezone.utc) + timedelta(minutes=compensate_build_time)).strftime('%Y-%m-%dT%H:%M:%SZ')
    fig_count = len(figures)
    print('Generating Fronted Glue JS for ' + str(fig_count) + ' Figures ...')

    # Figures: generate JS statements for every figure (2 statements, for importing and showing)
    frontend_imports = []
    frontend_components = []
    fig_index = 0
    for figure in figures:
        fig_alt = figure['figure']
        fig_file = figure['file']
        fig_notebook = figure['notebook']
        fig_title = fig_alt
        fig_comment = "in today's cases."

        fig_index = fig_index + 1
        var_name = 'figure' + str(fig_index)

        frontend_glue_relative_file = fig_file.replace(output_prefix + '/', '')

        # append one import
        # frontend_imports.append('import ' + var_name + ' from "./' + frontend_glue_relative_file + '";')

        # Method 2: /public folder referencing
        var_name = "process.env.PUBLIC_URL + '/" + frontend_glue_relative_file + "'"

        # append one component
        frontend_components.append(
            '<EmbeddedChart imageResource={' + var_name + '} folder="' + fig_notebook + '" title="' + fig_title + '" comment="' + fig_comment + '" updated="' + update_utc + '"/>,')

    # Notebooks
    page_data = []
    for page in pages:
        page_name = page['notebook']
        page_title = page_name.replace('_', ' ').title()
        page_file = page['html_notebook'].replace(output_prefix + '/', '')
        # append one JSON descriptor
        page_def = '{id: "' + page_name + '", title: "' + page_title + '", href: "/' + page_file + '"}'
        page_data.append(page_def)

    # Metadata
    meta_strings = ["convert_iso8601: '" + update_utc + "'"]
    glue_string = glue_frontend_template \
        .replace('%CHART_IMPORTS%', "\n".join(frontend_imports)) \
        .replace('%COMPONENTS%', "\n".join(["  " + fc for fc in frontend_components])) \
        .replace('%NOTEBOOKS%', ",\n".join(["  " + pd for pd in page_data])) \
        .replace('%METADATA%', ",\n".join(["  " + ms for ms in meta_strings]))

    # write the JS file
    output_frontend_glue_name = output_prefix + '/' + frontend_glue_file_name
    print(" - saving frontend glue JS: " + output_frontend_glue_name)
    with open(output_frontend_glue_name, 'wt') as the_file:
        the_file.write(glue_string)


# Main
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
notebooks = scan_for_notebooks(NOTEBOOK_PATHS)
all_pages = []
all_figures = []
for task in notebooks:
    nb_html, nb_figures = convert_notebook_to_assets(task['input'], task['basename'], OUTPUT_FOLDER)
    all_pages.extend(nb_html)
    all_figures.extend(nb_figures)
write_assets_loader(all_pages, all_figures, OUTPUT_FOLDER, FRONTEND_GLUE_FILE)

print("done.")
