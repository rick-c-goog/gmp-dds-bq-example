"""Generates a CSV from a Big Query Table."""
from flask import escape
from flask import jsonify, make_response,request
import functions_framework
import google.cloud
import google.cloud.bigquery
import json

@functions_framework.http
def bq_query_zipcode(request):
  """Generates CSV from Big Query Table and places it in Cloud Storage bucket."""
  client = google.cloud.bigquery.Client()

  # Set the necessary values for Big Query Assets
  project = "PROJECT_ID"
  dataset_id = "DATASET_ID"
  table_id = "TABLE_ID"

  # Create params for ingestion
  # Month abbreviation, day and year
  
  dataset_ref = google.cloud.bigquery.DatasetReference(project, dataset_id)
  
  #table_ref = dataset_ref.table(table_id)
  args = request.args
  queryType = args.get('name')
  if queryType is None:
    return "Please append URL with parameter: ?name=citibike or ?name=population"
  if queryType == "citibike":
     query = """
        WITH
    hs AS (
  SELECT
    h.start_station_id AS station_name,
    IF
    (EXTRACT(DAYOFWEEK
      FROM
        h.starttime) = 1
      OR EXTRACT(DAYOFWEEK
      FROM
        h.starttime) = 7,
      "weekend",
      "weekday") AS isweekday,
    (h.stoptime-h.starttime) as duration
  FROM
    `bigquery-public-data.new_york_citibike.citibike_trips` AS h
  JOIN
    `bigquery-public-data.new_york_citibike.citibike_stations` AS s
  ON
    h.start_station_id = s.station_id
  WHERE
    h.starttime BETWEEN CAST('2017-01-01 00:00:00' AS datetime) AND CAST('2018-01-01 00:00:00' AS datetime)),
  stationstats AS (
  SELECT
    station_name,
    AVG(duration) AS duration,
    COUNT(duration) AS num_trips
  FROM
    hs
  GROUP BY
    station_name ), 
  zipcode_geom as(
    select zipcode, ST_GEOGFROMTEXT(zipcode_geom) as zip_geom from `bigquery-public-data.utility_us.zipcode_area` where left(zipcode,3) in ('100','101','102','103','104','111','112','113','114')),
  station_geom as (
    select station_id, ST_GEOGPOINT(longitude,latitude) as station_geom from `bigquery-public-data.new_york_citibike.citibike_stations` 
  )

SELECT
  zipcode, sum(num_trips) as total_trips
FROM zipcode_geom inner join station_geom on ST_CONTAINS(zipcode_geom.zip_geom, station_geom.station_geom) join stationstats on station_geom.station_id=stationstats.station_name
Group By zipcode_geom.zipcode
    """
  elif queryType == "population":
     query = """
       select  zip_code, sum(population) as population from `bigquery-public-data.census_bureau_usa.population_by_zip_2010` as zip_pop inner join `bigquery-public-data.geo_us_boundaries.zip_codes` as zip_geom on lpad(zipcode,5,'0')=zip_geom.zip_code  where city='New York city' group by zip_code
    """
  else:
    return "Invalid parameter, append URL with parameter: ?name=citibike or ?name=population "
  query_job = client.query(query)  # Make an API request.

  result=[]
  for row in query_job:
        # Row values can be accessed by field name or index.
      if  queryType == "citibike": 
        result.append({"zipcode": row["zipcode"], "rides": row["total_trips"]})
      elif queryType == "population":
        result.append({"zipcode": row["zip_code"], "population": row["population"]})
        
    # [END bigquery_query]
  return make_response(jsonify(result), 200)
