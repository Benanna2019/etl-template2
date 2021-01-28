# hyper63 ETL Jobs

An ETL job is the process of extracting data from and source, modifying it and loading the data into a target. 
This document describes the ETL approach using architect `arc.codes` and nodejs.

## Developer Machine Requirements

* NodeJS - https://nodejs.org 
* AWS CLI - https://docs.aws.amazon.com/cli/index.html
* Architect - https://arc.codes

> Follow the install instructions at each of the linked sites

## Configure aws

```
aws configure
```

Add your ACCESS KEY and ACCESS SECRET as the default profile
Set the region to us-east-1
And the format to JSON

## Setup

Create a new project folder

```
mkdir foo
cd foo
```

In the project folder create a file called `app.arc`

```
@app
foo

@scheduled
eltoro rate(1 day)
```

> Under the label `@app` replace foo with the name of your project, and under scheduled place the name 
of the job and the interval you would like to see the job run. [More Info](https://arc.codes)

Now that you have your app file created, you will want to run the `init` command for architect

``` sh
arc init
```

This will create a new folder in this case called `src/scheduled/eltoro`, and within that folder is two files:

* config.arc
* index.js

You will want to cd into that directory:

```
cd src/scheduled/eltoro
```

Open the config.arc file and add the `timeout 900` line to the file. This will instruct aws to allow 
the job to run up to 15 minutes if needed. 

> Now if your rate interval is less that 15 minutes, you may want to adjust this for your needs.

```
@aws
runtime nodejs12.x
timeout 900
```

Save the file.

In the `index.js` file is where your handler function lives, this is the function that will be invoked
based on the scheduled interval. So this is where you want to build your ETL pipeline.

The basic pipeline will need to do the following things:

* Authenicate with a source endpoint
* Get Stats Report by date range
* Transform Stats into target json documents
* Post JSON Documents to Target

I leverage node modules like:

* node-fetch - for http client
* zod - for schema validation
* date-fns for datetime utility
* ramda for functional utility
* crocks for pipeline flow

Clearly, all of these modules are opinionated and you may choose to use different modules to perform your ETL.

It is important to initialize the job directory with a package.json

create a file called package.json

``` json
{
  "name": "myjob",
  "version": "1.0",
  "private": true
}
```

Then you can install the npm modules you want to use for this ETL job

```
npm install node-fetch ramda date-fns crocks zod@beta
```

You can also install development dependencies: For example, I use tape and fetch-mock for testing

```
npm install -D tape fetch-mock
```

### Testing Locally

To test locally, in your test file, simply require the `index.js` file and invoke the handler function:

``` js
const job = require('./index.js')

job.handler()
```

### Document Structure for Target

When using the primal hyper63 data api, you will want to structure your documents in a meaningful and consistently accessible 
way.

I would recommend using the upsert pattern so that you can create an idempotent process, so that it will be impossible to
create duplicate records if the ETL job was run over and over again.

```
PUT https://api.ignite-board.com/data/[db]/[id]
Content-Type: application/json
Authorization: Bearer [TOKEN]

{
  "id": "type:stat_timestamp",
  "type": "type",
  ...
}
```

For example:

Type: eltoro
stat_timestamp: 2020-12-22T02:00:00.000Z

``` json
{
  "id": "eltoro:2020-12-22T02:00:00.000Z",
  "type": "eltoro",
  ...
}
```

## Deployment 

With Architect you can deploy your code to a staging environment then a production environment, if deploying to a 
staging environment make sure your staging environment is not writting out to the production database. You may 
want to set a flag for the staging enviroment just to log the target information for evaluation purposes.

### Deploying to a staging environment

To deploy to the staging environment, you would run the following command:

```
arc deploy
```

### Deploying to a production environment

To deploy to a production environment you would run the following command:

```
arc deploy --production
```

This will take a little time to provision, but once it is up and running you can access the logs via the command line

```
arc logs production src/scheduled/eltoro
```

### Environment Variables and Secrets

You will want to store configuration and secret data outside of code base, using `arc env` command you can safely 
store this information in a secure key value store:

```
arc env production KEY value
```

Example:

```
arc env production SOURCE_URL https://api-prod.eltoro.com
```

Then you can access this data using the `process.env` object in NodeJS when the job is running in that environment.

> NOTE: If you have special characters in your value use quotes

```
arc env production SOURCE_URL "https://api-prod.eltoro.com"
```

For more information: https://arc.codes/docs/en/reference/cli/env




### Fin

A couple of notes, when building ETL Jobs, try to create idempotent writes to the target.

