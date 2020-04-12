# Utility functions to load the latest Covid-19 data sets
#  - see the main function for how to use this
#
from datetime import datetime, timedelta, timezone
import dateutil.parser as du_parser
import pandas as pd
import numpy as np

CANONICAL_COLS = ['Date', 'X', 'CountryCode', 'CountryName', 'RegionCode', 'RegionName', 'Confirmed', 'Negative', 'Infectious', 'Deaths', 'Recovered', 'Hospitalized', 'Tampons', 'Population', 'dConfirmed', 'dNegative', 'dInfectious', 'dDeaths', 'dRecovered', 'dHospitalized', 'dTampons', 'Death_rate', 'Tampon_hit_rate', 'dateChecked']
REGION_INDEX_COLS = ['CountryCode', 'CountryName', 'RegionCode', 'RegionName']
DATE_FORMAT = '%Y-%m-%d'

# MISC functions
reference_day = datetime(2020, 1, 1)


def date_to_day_of_year(date):
    return (date - reference_day).days + 1


def day_of_year_to_date(day_of_year):
    return reference_day + timedelta(days=(day_of_year - 1))


def cleanup_canonical(df, warning_prefix='', drop_na_columns=True):
    # check if some columns are not in the canonical list
    extra_canonical_cols = list(set(df.columns) - set(CANONICAL_COLS))
    extra_canonical_cols.sort()
    if extra_canonical_cols: print(warning_prefix + ': non-canonical cols: ' + ', '.join(extra_canonical_cols))

    # return the nominal columns: excess columns are discarded, missing columns are NaN
    df = df.reindex(columns=CANONICAL_COLS)

    # remove empty columns
    if drop_na_columns:
        df = df.dropna(axis=1, how='all')

    # use integers where appropriate
    df = df.astype({'X': int})
    return df


def load_csv(filename: str, keep_cols_map: list or dict, drop_cols: list, set_cols_map: dict = None):
    df = pd.read_csv(filename)
    original_cols = set(df.columns)

    # check if: 1. the data has something extra, 2. the data is missing something we expect
    keep_cols = keep_cols_map if type(keep_cols_map) is list else list(keep_cols_map)
    new_data = original_cols - set(keep_cols + drop_cols)
    if new_data: print(filename + ": data has extra columns: '" + "','".join(new_data) + "'")
    missing_needed = set(keep_cols) - original_cols
    if missing_needed: print(filename + ": missing NEEDED columns: '" + "','".join(missing_needed) + "'")
    missing_ignored = set(drop_cols) - original_cols
    if missing_ignored: print(filename + ": missing former Ignored columns: '" + "','".join(missing_ignored) + "'")

    # safe drop (if a column doesn't exist anymore, don't break)
    df = df.drop(columns=original_cols.intersection(drop_cols))

    # set columns, if requested
    if set_cols_map:
        for item in set_cols_map.items():
            df[item[0]] = item[1]
            new_data.add(item[0])

    # safe reorder + add leftovers. if a column doesn't exist anymore, don't break - although you will have missing data (warned about it already)
    final_columns = [col for col in keep_cols if col in df.columns] + list(new_data)
    df = df.loc[:, final_columns]

    # rename columns, if the 'keep' variable is really a dictionary (it if was a list, skip this)
    if type(keep_cols_map) is dict:
        df = df.rename(columns=keep_cols_map, errors="raise")
    return df


def post_process_entries(filename: str, df, set_country_code: str = None, set_country_name: str = None, df_regions=None):
    # add Regional (State) names and set the country as US, if requested
    if set_country_code and 'CountryCode' not in df.columns: df['CountryCode'] = set_country_code
    if set_country_name and 'CountryName' not in df.columns: df['CountryName'] = set_country_name
    if (df_regions is not None) and ('RegionName' not in df.columns) and ('RegionCode' in df.columns):
        df['RegionName'] = df.join(df_regions.set_index('RegionCode'), on='RegionCode', how='left')['RegionName']

    # add other canonical values
    df['X'] = df['Date'].map(lambda d: date_to_day_of_year(datetime.strptime(d, DATE_FORMAT)))
    if 'Confirmed' in df.columns:
        if 'Deaths' in df.columns: df['Death_rate'] = 100 * df['Deaths'] / df['Confirmed']
        if 'Tampons' in df.columns: df['Tampon_hit_rate'] = 100 * df['Confirmed'] / df['Tampons']

    # TODO: add Population (regional, national) so we can have these stats
    if 'Population' not in df.columns:
        # HACK: set US data sets which miss 'Population' to a constant here
        if 'CountryName' in df.columns and 'RegionCode' not in df.columns:
            # NOTE: this number comes from the OpenCovid-19 data set - here a constant; TODO: merge it dynamically
            df_population = None
            if df['CountryName'].all() == 'United States of America':
                df_population = 329064917
            elif df['CountryName'].all() == 'Italy':
                df_population = 60550075
            if df_population:
                # print(filename + ': hack: setting ' + df['CountryName'].any() + ' population to ' + str(df_population))
                df['Population'] = df_population

    # more ratios
    # df['Confirmed_pct'] = 100 * df['Confirmed'] / df['Population']
    # df['Deaths_pct'] = 100 * df['Deaths'] / df['Population']

    # add the current date if the data didn't contain it
    if 'dateChecked' not in df.columns:
        df['dateChecked'] = datetime.now(timezone.utc).strftime(DATE_FORMAT + 'T%H:%M:%SZ')

    # cleanup (reorder columns and drop full na's)
    return cleanup_canonical(df, filename)


# https://covidtracking.com/
def load_covidtracking_us_data():
    loc_states_info = "https://covidtracking.com/api/states/info.csv"
    loc_states_daily = "https://covidtracking.com/api/states/daily.csv"
    loc_states_latest = "https://covidtracking.com/api/states.csv"  # BARELY USEFUL
    loc_us_daily = "https://covidtracking.com/api/us/daily.csv"

    def post_process_covidtracking(filename, df, df_regions):
        # reverse list, so newer entries are at the bottom
        df = df.reindex(index=df.index[::-1])
        # compute the 'Infections' := Confirmed - Recovered - df['Deaths'], and the daily diff
        df['Infectious'] = df['Confirmed'] - df['Recovered'] - df['Deaths']
        # note: doesn't work with non-uniform daily data: df['dInfectious'] = df['Infectious'].diff(periods=1)
        return post_process_entries(filename, df, 'US', 'United States of America', df_regions)

    # US states Information: useful to join the region name (CA -> California)
    def load_us_regions_info():
        return load_csv(loc_states_info, keep_cols_map={'state': 'RegionCode', 'name': 'RegionName'}, drop_cols=['covid19SiteSecondary', 'twitter', 'covid19Site', 'covid19SiteOld', 'fips', 'pui', 'pum', 'notes'])

    # US aggregate, daily values
    #  Date, X, CountryCode, CountryName, Confirmed, Negative, Infectious, Deaths, Recovered, Hospitalized, Tampons, dConfirmed, dNegative, dDeaths, dHospitalized, dTampons, Death_rate, Tampon_hit_rate, dateChecked
    def load_us_daily(df_regions):
        df = load_csv(loc_us_daily,
                      keep_cols_map={'date': 'Date', 'positive': 'Confirmed', 'negative': 'Negative', 'hospitalizedCurrently': 'Hospitalized', 'hospitalizedCumulative': 'HospitalizedTotal', 'inIcuCurrently': 'InICU', 'inIcuCumulative': 'InICUTotal', 'onVentilatorCurrently': 'OnVentilator', 'onVentilatorCumulative': 'OnVentilatorTotal', 'recovered': 'Recovered', 'death': 'Deaths', 'totalTestResults': 'Tampons', 'positiveIncrease': 'dConfirmed', 'negativeIncrease': 'dNegative', 'deathIncrease': 'dDeaths', 'totalTestResultsIncrease': 'dTampons', 'hospitalizedIncrease': 'dHospitalized', 'dateChecked': 'dateChecked'},
                      drop_cols=['states', 'pending', 'hash', 'hospitalized', 'total', 'posNeg'])
        df['Date'] = df['Date'].astype(str).map(lambda d: d[:4] + '-' + d[4:6] + '-' + d[6:])
        return post_process_covidtracking(loc_us_daily, df, df_regions)

    # US states, daily values
    #  Date, X, CountryCode, CountryName, RegionCode, RegionName, Confirmed, Negative, Infectious, Deaths, Recovered, Hospitalized, Tampons, dConfirmed, dNegative, dDeaths, dHospitalized, dTampons, Death_rate, Tampon_hit_rate, dateChecked
    def load_us_regions_daily(df_regions):
        df = load_csv(loc_states_daily,
                      keep_cols_map={'date': 'Date', 'state': 'RegionCode', 'positive': 'Confirmed', 'negative': 'Negative', 'hospitalizedCurrently': 'Hospitalized', 'hospitalizedCumulative': 'HospitalizedTotal', 'inIcuCurrently': 'InICU', 'inIcuCumulative': 'InICUTotal', 'onVentilatorCurrently': 'OnVentilator', 'onVentilatorCumulative': 'OnVentilatorTotal', 'recovered': 'Recovered', 'death': 'Deaths', 'totalTestResults': 'Tampons', 'positiveIncrease': 'dConfirmed', 'negativeIncrease': 'dNegative', 'deathIncrease': 'dDeaths', 'totalTestResultsIncrease': 'dTampons', 'hospitalizedIncrease': 'dHospitalized', 'dateChecked': 'dateChecked'},
                      drop_cols=['pending', 'hash', 'hospitalized', 'total', 'posNeg', 'fips'])
        df['Date'] = df['Date'].astype(str).map(lambda d: d[:4] + '-' + d[4:6] + '-' + d[6:])
        return post_process_covidtracking(loc_states_daily, df, df_regions)

    # US states, latest values (Not very useful, as this is a subset (both rows and columns) of the daily values)
    #  Date, X, CountryCode, CountryName, RegionCode, RegionName, Confirmed, Negative, Infectious, Deaths, Recovered, Hospitalized, Tampons, Death_rate, Tampon_hit_rate, dateChecked
    def load_us_regions_latest(df_regions):
        df = load_csv(loc_states_latest,
                      keep_cols_map={'dateModified': 'Date', 'state': 'RegionCode', 'positive': 'Confirmed', 'negative': 'Negative', 'hospitalizedCurrently': 'Hospitalized', 'hospitalizedCumulative': 'HospitalizedTotal', 'inIcuCurrently': 'InICU', 'inIcuCumulative': 'InICUTotal', 'onVentilatorCurrently': 'OnVentilator', 'onVentilatorCumulative': 'OnVentilatorTotal', 'recovered': 'Recovered', 'death': 'Deaths', 'totalTestResults': 'Tampons', 'dateChecked': 'dateChecked'},
                      drop_cols=['pending', 'hash', 'hospitalized', 'total', 'posNeg', 'fips',
                                 'positiveScore', 'negativeScore', 'negativeRegularScore', 'commercialScore', 'grade', 'score', 'checkTimeEt', 'lastUpdateEt', 'notes'])
        df['Date'] = df['Date'].map(lambda d: du_parser.parse(d).strftime(DATE_FORMAT))
        return post_process_covidtracking(loc_states_latest, df, df_regions)

    # load the 4 APIs
    df_us_states_info = load_us_regions_info()
    df_daily = load_us_daily(df_us_states_info)
    df_states_daily = load_us_regions_daily(df_us_states_info)
    df_states_latest = load_us_regions_latest(df_us_states_info)
    return df_daily, df_states_daily, df_states_latest


# https://github.com/pcm-dpc/COVID-19/
def load_pcmdpc_it_data():
    loc_it_daily = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale.csv"
    loc_regional_daily = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv"

    def post_process_pcmdpc(filename, df):
        df['dateModified'] = df['Date'].map(lambda d: d + 'Z')
        df['Date'] = df['Date'].str[0:10]
        # Extra: InICU, Infectious, dInfectious, dateModified
        # Relation: totale_casi (Confirmed/d) = totale_positivi (Infectious/d) + dimessi_guariti (Recovered) + deceduti (Deaths)
        # Relation: totale_ospedalizzati (not used) =  ricoverati_con_sintomi (Hospitalized) + terapia_intensiva (InICU)
        return post_process_entries(filename, df, set_country_code='IT', set_country_name='Italy')

    # Italy country-wide, per day
    #  Date, X, CountryCode, CountryName, Confirmed, Infectious, Deaths, Recovered, Hospitalized, Tampons, dConfirmed, dInfectious, Death_rate, Tampon_hit_rate, dateChecked
    df_daily = post_process_pcmdpc(
        loc_it_daily,
        load_csv(loc_it_daily,
                 keep_cols_map={'data': 'Date', 'ricoverati_con_sintomi': 'Hospitalized', 'terapia_intensiva': 'InICU', 'totale_positivi': 'Infectious', 'variazione_totale_positivi': 'dInfectious', 'nuovi_positivi': 'dConfirmed', 'dimessi_guariti': 'Recovered', 'deceduti': 'Deaths', 'totale_casi': 'Confirmed', 'tamponi': 'Tampons'},
                 drop_cols=['stato', 'totale_ospedalizzati', 'isolamento_domiciliare', 'note_it', 'note_en']))

    # Italy regional, latest
    #  Date, X, CountryCode, CountryName, RegionCode, RegionName, Confirmed, Infectious, Deaths, Recovered, Hospitalized, Tampons, dConfirmed, dInfectious, Death_rate, Tampon_hit_rate, dateChecked
    df_regional_daily = post_process_pcmdpc(
        loc_regional_daily,
        load_csv(loc_regional_daily,
                 keep_cols_map={'data': 'Date', 'codice_regione': 'RegionCode', 'denominazione_regione': 'RegionName', 'ricoverati_con_sintomi': 'Hospitalized', 'terapia_intensiva': 'InICU', 'totale_positivi': 'Infectious', 'variazione_totale_positivi': 'dInfectious', 'nuovi_positivi': 'dConfirmed', 'dimessi_guariti': 'Recovered', 'deceduti': 'Deaths', 'totale_casi': 'Confirmed', 'tamponi': 'Tampons'},
                 drop_cols=['stato', 'lat', 'long', 'totale_ospedalizzati', 'isolamento_domiciliare', 'note_it', 'note_en']))

    return df_daily, df_regional_daily


# https://github.com/open-covid-19
def load_opencovid19_data():
    loc_world_daily = 'https://open-covid-19.github.io/data/data.csv'

    def apply_date_offset_to_country(df, country_code, days):
        df_old_date = df.loc[(df['RegionCode'].isna()) & (df['CountryCode'] == country_code), 'Date']
        df_new_date = df_old_date.map(lambda date: (datetime.strptime(date, DATE_FORMAT) + timedelta(days=days)).strftime(DATE_FORMAT))
        df.update(df_new_date)

    # Countries by day
    def load_regions_daily():
        #  Date, X, CountryCode, CountryName, RegionCode, RegionName, Confirmed, Deaths, Death_rate, dateChecked
        df = load_csv(loc_world_daily,
                      keep_cols_map=['Date', 'CountryCode', 'CountryName', 'RegionCode', 'RegionName', 'Confirmed', 'Deaths', 'Population', 'Latitude', 'Longitude'],
                      drop_cols=['Key'])
        # ES data is 1 day ahead of the pack, bring it back
        apply_date_offset_to_country(df, country_code='ES', days=-1)
        return post_process_entries(loc_world_daily, df)

    # as a sub-table, extract the world population
    #  CountryCode, CountryName, RegionCode, RegionName, Population
    df_regions_daily = load_regions_daily()
    pop_cols = REGION_INDEX_COLS + ['Population']
    df_region_population = df_regions_daily.drop_duplicates(subset=REGION_INDEX_COLS, keep='last')[pop_cols]
    df_countries_population = df_region_population[df_region_population['RegionCode'].isna()]
    return df_regions_daily, df_countries_population


# https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data
# FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key
# Issue: US and others are broken down, while Italy for example is whole
def load_latest_johnhopkins_daily():
    loc_jh_template = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/%m-%d-%Y.csv"

    def find_latest_file_or_quit(url_template):
        tries = 3
        try_date_utc = datetime.utcnow()
        while True:
            # noinspection PyBroadException
            try:
                try_url = try_date_utc.strftime(url_template)
                pd.read_csv(try_url)
                return try_url, try_date_utc
            except:
                try_date_utc = try_date_utc - timedelta(days=1)
                tries = tries - 1
                if tries is 0:
                    print("Out of tries looking for John Hopkins' data (walking back 1 day at a time)")
                    exit(1)

    # Basic world statistics, for the last day
    #  Date, X, CountryName, RegionName, Confirmed, Infectious, Deaths, Recovered, Death_rate, dateChecked
    def load_last_day():
        loc_jh, date_jh = find_latest_file_or_quit(loc_jh_template)
        return post_process_entries(
            loc_jh,
            load_csv(loc_jh,
                     keep_cols_map={'Admin2': 'City', 'Province_State': 'RegionName', 'Country_Region': 'CountryName', 'Lat': 'Latitude', 'Long_': 'Longitude', 'Confirmed': 'Confirmed', 'Deaths': 'Deaths', 'Recovered': 'Recovered', 'Active': 'Infectious'},
                     drop_cols=['FIPS', 'Last_Update', 'Combined_Key'],
                     set_cols_map={'Date': date_jh.strftime(DATE_FORMAT)}))

    return load_last_day()


# fuse data to get the latest-and-greatest
def fuse_daily_sources(df_world, df_us, df_it):
    # start from Country-wide world data from OpenCovid-19, removing regional data (only country data is left)
    df = df_world[df_world['RegionCode'].isna()]
    df = df.drop(columns=['RegionCode', 'RegionName'])

    # overwrite the latest US data from the Covid Tracking Project (US daily)
    # overwrite the latest IT data from the PCM-DPC italian source
    df = df[df['CountryCode'] != 'US']  # remove US data
    df = df[df['CountryCode'] != 'IT']  # remove IT data
    df = pd.concat([df, df_us, df_it], ignore_index=True)  # add daily US and IT data
    return df


def add_canonical_differentials(df_src, series_column='CountryName', order_column='Date'):
    print('Computing canonical differentials... ', end='')
    diff_cols = ['Confirmed', 'Negative', 'Infectious', 'Deaths', 'Recovered', 'Hospitalized', 'Tampons']

    # select only country (not regional) data
    df_countries = df_src
    if 'RegionCode' in df_countries.columns:
        df_countries = df_countries[df_countries['RegionCode'].isna()]

    # update each series x each differential
    for country_name in df_countries[series_column].unique():
        df_country = df_countries[df_countries[series_column] == country_name]
        df_country = df_country.sort_values(order_column)
        for src_col in diff_cols:
            diff_col = 'd' + src_col
            if src_col not in df_country.columns: continue
            if df_country[src_col].isna().all(): continue
            if diff_col in df_country.columns:
                if df_country[diff_col].notna().all(): continue
            # compute 'row_n - row_(n-1)'
            df_country[diff_col] = df_country[src_col].diff()
            # add the column to the source if missing (update won't do it)
            if diff_col not in df_src.columns:
                df_src[diff_col] = np.nan
        # merge the updated series data with the source
        df_src.update(df_country)
    print('done.')


def test_load_all():
    # load all
    (df_world_daily, df_population) = load_opencovid19_data()
    (df_world_last_day) = load_latest_johnhopkins_daily()
    (df_it_daily, df_it_regional_daily) = load_pcmdpc_it_data()
    (df_us_daily, df_us_states_daily, df_us_states_latest) = load_covidtracking_us_data()
    # test data manipulation
    df_countries_daily = fuse_daily_sources(df_world_daily, df_us_daily, df_it_daily)
    add_canonical_differentials(df_countries_daily)
    # df_countries_daily = cleanup_canonical(df_countries_daily)
    # print summary
    print('Loaded data summary:')
    for df in [df_world_daily, df_world_last_day, df_it_daily, df_it_regional_daily, df_us_daily, df_us_states_daily, df_us_states_latest, df_countries_daily]:
        print(' - ' + str(len(df)) + ' rows, ' + str(len(df.columns)) + ' columns: ' + ', '.join(list(df)))


if __name__ == "__main__":
    test_load_all()
