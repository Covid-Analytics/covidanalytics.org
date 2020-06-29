# Utility functions to plot data frames
from datetime import datetime
from matplotlib.ticker import ScalarFormatter
import matplotlib.pyplot as plt
import numpy as np


# noinspection PyDefaultArgument
def scatter_plot_by_series(_df,
                           x_key, y_key,                        # [data] keys (column names for X's and Y's)
                           series_key,                          # [series] the series key (column) in the df
                           series_names=None,                   # [series] the ranked names to use; defaults to col.unique()
                           series_is_secondary=None,            # [series] function: True -> gray line
                           series_secondary_width=None,         # [series] the width of the line, if secondary
                           shift_x_to_intersect_y=None,         # [transform] translate Series to intersect a point
                           y_filter=None,                       # [transform] filter the y values. valid: 'expo'
                           y_log=False,                         # [axis] make the Y axis logarithmic
                           bounds=[None, None, None, None],     # [axis] x_min, x_max,  y_min, y_max
                           legend_off=False,                    # [legend] disable if True
                           legend_decimals=0,                   # [legend] how many decimals
                           legend_suffix=None,                  # [legend] whether to append a suffix (e.g. '%')
                           data_labels=None,                    # [data labels] text: legend, series, value
                           data_labels_align="center",          # [data labels] align to: left, right, center
                           line_style_non_first_series=None,    # [style] line style: solid, dashed, dashdot, dotted, ' '
                           title=None, title_align='left', label_x=None, label_y=None, stamp_1=None, stamp_2=None):
    # label the plot
    plt.rc('font', size=14)
    fig = plt.figure(figsize=(14, 10))
    fig.patch.set_facecolor('white')
    plt.title(title if title else "'" + y_key + "' over '" + x_key + "', by '" + series_key + "'", loc=title_align)
    if not label_x:
        label_x = x_key
        if shift_x_to_intersect_y:
            label_x = label_x + " since crossing " + str(shift_x_to_intersect_y)
    plt.xlabel(label_x)
    if label_y: plt.ylabel(label_y)
    # if not stamp_1: stamp_1 = ""
    if not stamp_2: stamp_2 = "" + datetime.now().strftime("%Y-%m-%d (%H:%M UTC)")

    # if the series values are missing, enumerate them all
    if series_names is None:
        series_names = _df[series_key].unique()

    # add the lines for all the 'countries to chart'
    all_x = []
    all_y = []
    is_first_series = True
    for series_name in series_names:
        # [select rows] get the data of a single series (e.g. a country)
        df = _df[_df[series_key] == series_name]

        # [cleanup] remove metric <= 0 , as they don't play well with log
        if y_log: df = df[df[y_key] > 0]

        # [cleanup] remove NaNs
        df = df[df[y_key].notna()]

        # skip empty series
        if df.empty: continue

        # if requested, compute a per-series X translation to a set 'y' level
        x_translation = 0
        if shift_x_to_intersect_y:
            exceeding = df[df[y_key] >= shift_x_to_intersect_y]
            if len(exceeding) == 0:
                continue
            x_translation = -exceeding.iloc[0][x_key]

        # checks if this element should be grayed out
        secondary = series_is_secondary(df) if series_is_secondary else False

        # text of the label (and shorten 'USA')
        series_name = series_name if series_name != "United States of America" else "USA"
        metric_label = round(df[y_key].iloc[-1], legend_decimals)
        if legend_decimals == 0: metric_label = metric_label.astype(int)
        legend_label = series_name + "  " + str(format(metric_label, ',')) + (legend_suffix if legend_suffix else "")
        if secondary: legend_label = None

        # format the color and size
        line_color = (0.5, 0.5, 0.5, 0.2) if secondary else None
        line_style = 'solid' if ((not line_style_non_first_series) or is_first_series) else line_style_non_first_series
        line_width = 2.4
        if secondary and series_secondary_width: line_width = series_secondary_width

        # add the series data
        x = (df[x_key] + x_translation).tolist()
        y = df[y_key].tolist()
        y_plotted = y
        if y_filter == 'expo': y_plotted = df[y_key].rolling(window=(7, 20), win_type='exponential').mean(tau=20)
        if y_filter == 'sma3': y_plotted = df[y_key].rolling(window=3).mean()
        if y_filter == 'sma7': y_plotted = df[y_key].rolling(window=7).mean()
        if y_filter == 'sma30': y_plotted = df[y_key].rolling(window=30).mean()
        plt.plot(x, y_plotted, label=legend_label, color=line_color, linewidth=line_width, linestyle=line_style)
        # plt.plot(x, y, color=(0.8, 0.8, 0.8, 0.4), linewidth=1)
        # plt.scatter(x, y, color=line_color, linewidth=1, alpha=1)

        # add the data label on the endpoint
        if data_labels and not secondary:
            point_label = None
            if data_labels == "series":
                point_label = series_name
            elif data_labels == "value":
                point_label = str(metric_label)
            if data_labels == "legend":
                point_label = legend_label
            # PATCH: remove the label for China in the second chart, or it will be scaled down
            if shift_x_to_intersect_y and series_name == "China": point_label = None
            if point_label:
                plt.annotate(point_label,
                             (x[-1], y[-1]),  # this is the point to label
                             textcoords="offset points",  # how to position the text
                             xytext=(0, 2),  # distance from text to points (x,y)
                             annotation_clip=False,  # draw over the chart, to spot issues
                             ha=data_labels_align)  # horizontal alignment can be left, right or center
        # for auto bounds
        all_x.extend(x)
        all_y.extend(y)
        # not the first series anymore
        is_first_series = False

    # X/Y axes: set-up ranges and scale type
    # boundaries = [left, right, min_y, max_y] <- automatic if any is set to None
    if not bounds: bounds = [None, None, None, None]
    auto_bounds = [min(all_x), max(all_x), np.floor(min(all_y)), np.ceil(max(all_y))]
    bounds = list(map(lambda pair: pair[0] if pair[0] is not None else pair[1], zip(bounds, auto_bounds)))
    if shift_x_to_intersect_y:
        bounds[0] = 0
        bounds[1] = bounds[1] - 10  # magic number, shall remove
        bounds[2] = shift_x_to_intersect_y
    if y_log:
        plt.yscale('log')
        formatter = ScalarFormatter(useOffset=False)
        formatter.set_powerlimits((-3, 10))
        plt.gca().yaxis.set_major_formatter(formatter)
        bounds[3] = 2 * bounds[3]
    plt.xlim(bounds[0], bounds[1])
    plt.ylim(bounds[2], bounds[3])

    # add grid
    plt.gca().grid(axis='both', color=(0.4, 0.4, 0.4), alpha=0.2)

    # add
    if not legend_off:
        plt.legend()

    # add any decorative text boxes
    if stamp_1:
        plt.text(1, 1, stamp_1, transform=plt.gca().transAxes, alpha=0.5,
                 horizontalalignment='right', verticalalignment='bottom')
    if stamp_2:
        plt.text(1, -0.046, stamp_2, transform=plt.gca().transAxes, alpha=0.5,
                 horizontalalignment='right', verticalalignment='top')

    # display it
    plt.show()


def rank_data_by_metric(df, metric, unique_key, unique_pick='last', df_filter=None, rank_highest=True, max_results=None):
    # [pick latest] for data set with exploded unique keys (for days, for example), select the most relevant frame
    df = df.drop_duplicates(unique_key, keep=unique_pick)

    # [select rows] remove empty data on the metric itself
    df = df[df[metric].notna()]

    # [select rows] .. more filtering?
    if df_filter: df = df_filter(df)  # e.g. (lambda df: df[df['Population'] > 1E+06])

    # [sort] by the metric, descending
    df = df.sort_values(metric, ascending=(False if rank_highest else True))

    # [reduce] keep the top N results
    if max_results: df = df.head(max_results)
    return df
