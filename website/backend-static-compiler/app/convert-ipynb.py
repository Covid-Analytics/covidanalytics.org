# This script pre-processes a bunch of notebooks generating all of the figures, and then creates
# a bundle of pics and html ready for frontend compiling into our react UI.

import glob
import os
import nbformat
from nbconvert import HTMLExporter
from nbconvert.preprocessors import ExecutePreprocessor, ClearOutputPreprocessor
from traitlets.config import Config
from jinja2 import DictLoader

# Configuration (shall have a command line, one day)
NOTEBOOK_PATHS = ['.', './input', '../../../analysis']
OUTPUT_FOLDER = 'output'

# This is the inline'd template
inline_template = DictLoader({'ours.tpl': """
{%- extends 'full.tpl' -%}

{% block input_group %}
    {%- if cell.metadata.get('nbconvert', {}).get('show_code', False) -%}
{{ super() }}
    {%- endif -%}
{% endblock input_group %}

{% block html_head %}
{{ super() }}
    <!-- customize looks for embedding -->
    <style type="text/css">
        div.output_subarea {
            max-width: initial;
        }
        .rendered_html table {
            width: 100%;
        }
    </style>
{% endblock html_head %}
"""})


def convert_notebook_to_assets(notebook_file_name, base_name, output_prefix):
    # define and create output folder
    output_folder = output_prefix + os.sep + base_name
    os.makedirs(output_folder, exist_ok=True)

    # open file
    print('Converting Notebook: ' + notebook_file_name + ' ...')
    nb_file = open(notebook_file_name, 'r').read()
    nb = nbformat.reads(nb_file, as_version=4)

    # 1. clear output
    print(" - clearing output...")
    ep = ClearOutputPreprocessor()
    ep.preprocess(nb, {})

    # 2. generate new outputs
    print(" - executing...")
    ep = ExecutePreprocessor(timeout=600, kernel_name='python3', allow_errors=False)
    try:
        ep.preprocess(nb, {'metadata': {'path': output_folder}})
    except Exception as e:
        print('ERROR: Execution of the notebook ' + notebook_file_name + ' stopped, likely for missing some py libs.')
        print('       Please check the output/exception and add those to the requirements.')
        print(e)
        exit(1)

    # 3. ...
    # save pics?

    # 4. export to HTML using the current template engine
    print(" - generating html...")
    c_clean = Config({
        "TemplateExporter": {
            "exclude_input": True,
            "exclude_input_prompt": True,
            "exclude_output_prompt": True,
        },
        "HTMLExporter": {
            "preprocessors": ['nbconvert.preprocessors.ExtractOutputPreprocessor']
        },
    })
    html_exporter = HTMLExporter(config=c_clean, extra_loaders=[inline_template])
    html_exporter.template_file = 'ours.tpl'
    (body, resources) = html_exporter.from_notebook_node(nb)

    # save html output file, with local reference to the pictures
    output_html_file_name = output_folder + os.sep + "index.html"
    print(" - saving html to file: " + output_html_file_name)
    with open(output_html_file_name, 'wt') as the_file:
        the_file.write(body)

    # save all the figures
    figures = resources['outputs']
    figures_count = len(figures)
    figure_index = 1
    for figure_file in figures:
        output_figure_file_name = output_folder + os.sep + figure_file
        print(" - saving figure " + str(figure_index) + " of " + str(figures_count) + ": " + output_figure_file_name)
        if not figure_file.endswith('.png'):
            print("WARNING: figure is not a PNG file")
            continue
        with open(output_figure_file_name, 'wb') as the_file:
            the_file.write(figures[figure_file])

    return body


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


# Main
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
notebooks = scan_for_notebooks(NOTEBOOK_PATHS)
for task in notebooks:
    convert_notebook_to_assets(task['input'], task['basename'], OUTPUT_FOLDER)

print("done.")
