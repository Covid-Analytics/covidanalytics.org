# This script pre-processes a bunch of notebooks generating all of the figures, and then creates
# a bundle of pics and html ready for frontend compiling into our react UI.

import glob
import os
import nbformat
from nbconvert import HTMLExporter
from nbconvert.preprocessors import ExecutePreprocessor, ClearOutputPreprocessor
from traitlets.config import Config
from jinja2 import DictLoader

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


def convert_notebook_to_assets(notebook_file_name, output_file_name):
    # open file
    print('Converting Notebook (' + notebook_file_name + ')')
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
        ep.preprocess(nb, {'__metadata': {'path': 'notebooks/'}})
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
        }
    })
    html_exporter = HTMLExporter(config=c_clean, extra_loaders=[inline_template])
    html_exporter.template_file = 'ours.tpl'
    (body, resources) = html_exporter.from_notebook_node(nb)

    # save html output file, with reference to the pictures
    print(" - saving html to file (" + output_file_name + ")")
    with open(output_file_name, 'wt') as the_file:
        the_file.write(body)

    return body


# find all notebooks
notebooks = []
for probe_dir in ['../../../analysis', '.']:
    for nb_file_name in glob.glob(probe_dir + '/*.ipynb'):
        file_path = os.path.normpath(nb_file_name)
        file_basename = os.path.splitext(os.path.basename(file_path))[0]
        notebooks.append({
            'input': file_path,
            'basename': file_basename,
            'output': file_basename + '.html',
        })
print("Discovered " + str(len(notebooks)) + " notebooks in the default locations. Performing the following:")
print("  " + str(notebooks))

# operate on all notebooks
for task in notebooks:
    convert_notebook_to_assets(task['input'], task['output'])

print("done.")
