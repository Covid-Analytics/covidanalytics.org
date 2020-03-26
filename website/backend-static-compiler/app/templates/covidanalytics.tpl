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
