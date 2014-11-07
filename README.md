# Priority Job Queue
- - -
A client-side priority job queue.

[![Build Status](https://travis-ci.org/darrylwest/priority-job-queue.svg?branch=master)](https://travis-ci.org/darrylwest/priority-job-queue)
[![Dependency Status](https://david-dm.org/darrylwest/priority-job-queue.svg)](https://david-dm.org/darrylwest/priority-job-queue)

## Overview

Priority Job Queue iterates over a list of jobs to select the highest priority job to run.  When a job is selected, it's 'fn' method is called with args and callback.  The JobModel's status changes from 'queued' to 'running' and a status change event is fired.

When the job completes, the JobModel's status is changed to 'complete' and a status change is again fired.  The queue also fires a 'queue change' event and removes the old job, then searches for the next one to run.

Typically jobs run serially but it's possible to run jobs in parallel by adding more than a single job to the JobModel.  This way, a set of jobs would run to completion before the next job or job set was run.

_Although this module could be used server side, it was designed for client projects that use browserify..._

## Installation

```
	npm install priority-job-queue --save
```

## Use

## API

### JobQueue
#### Methods
#### Events

### JobModel
#### Methods
#### Events

## Examples

* simple

## Tests

## Mocks

- - -
<p><small><em>copyright © 2014 rain city software | version 0.90.10</em></small></p>