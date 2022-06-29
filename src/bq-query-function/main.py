"""Generates a CSV from a Big Query Table."""
from flask import escape
from flask import jsonify, make_response
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
  
  destination_uri = "gs://{}/{}".format(bucket_name, import_date + ".csv")
  dataset_ref = google.cloud.bigquery.DatasetReference(project, dataset_id)
  table_ref = dataset_ref.table(table_id)

  query = """
        SELECT  lpad(zipcode,5,'0') as zipcode,population FROM `bigquery-public-data.census_bureau_usa.population_by_zip_2010` where left(lpad(zipcode,5,'0'),3) in ('100','101','102','103','104','111','112','113','114') and population>0

    """
  query_job = client.query(query)  # Make an API request.

  result=[]
  for row in query_job:
        # Row values can be accessed by field name or index.
        result.append({"zipcode": row["zipcode"], "population": ["population"]})
    # [END bigquery_query]
  
  return make_response(jsonify(result), 200)
