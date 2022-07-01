# Example: BigQuery Geospatial data visualization use Google Map Data Driven Style feature

## 1. Create new GCP project or use an existing GCP project

## 2. Download source code and provision cloud function
Go to cloud shell, run the following commands
```shellcript
cd $HOME
git clone https://github.com/rick-c-goog/gmp-dds-bq-example
cd $HOME/gmp-dds-bq-example
./start.sh
```
If something goes wrong, run ./start/sh again.

Validation steps:
- Go to Cloud Function console screen , make sure cloud function, bq-zipcode-function created successfully( green check on left side). 
- Click bq-zipcode-function, click "Trigger" tab, note Trigger URL, click the trigger URL, open it in browser, the page shows empty []
- In browser opened trigger url, append the URL with ?name=population
- Try the same append the URL with ?name=citibike 

## 2. Test Google Map Data Driven Style
