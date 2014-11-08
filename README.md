# Priority Job Queue
- - -
A client-side priority job queue.

[![NPM version](https://badge.fury.io/js/priority-job-queue.svg)](http://badge.fury.io/js/priority-job-queue)
[![Build Status](https://travis-ci.org/darrylwest/priority-job-queue.svg?branch=master)](https://travis-ci.org/darrylwest/priority-job-queue)
[![Dependency Status](https://david-dm.org/darrylwest/priority-job-queue.svg)](https://david-dm.org/darrylwest/priority-job-queue)

## Overview

Priority Job Queue iterates over a list of jobs to select the highest priority job to run.  When a job is selected, it's 'fn' method is called with optional args and callback.  The JobModel's status changes from 'queued' to 'running' and a status change event is fired.

When the job completes, the JobModel's status is changed to 'complete' and a status change is again fired.  The queue also fires a 'queue change' event when a job is removed from the queue.

Typically jobs run serially but it's possible to run jobs in parallel by adding more than a single job to the JobModel.  This way, a set of jobs would run to completion before the next job or job set was run.

_Although this module could be used server side, it was designed for client projects that use browserify..._

## Installation

```
	npm install priority-job-queue --save
```

## Use

The best way to see how the queue/job model work is to look at the examples below.  The basics are 

1. create the queue and start clock `queue.startRealTimeTicker()`.
2. create a job with `new JobModel()` or `queue.createJob()`
3. assign a runnable function `job.fn = function(opts, callback) {};`
4. add to the queue `queue.add( job )`
5. let the queue run it.

If you add a job with a low or normal priority, then other jobs with a higher priority or older jobs with the same priority will run first.

The job runner is based on a real-time tick that evaluates queued jobs to select the highest priority then run it.  The next tick repeats this process by first checking to see that there are no running jobs.  

Since the entire queue is evaluated at each tick, a job's priority may change up or down while in the queue to move it up or down in the list.

When a job completes it's status is set to 'complete'.  Or, if the job is re-occurring it will run, then set the scheduledTime to now() + the scheduledIdleTime.  When it completes, it's status is set to idle so that it won't be removed from the list.

## API

### PriorityJobQueue

The priority job queue object selects the highest priority job from the list and runs it.  It also searches for schedule jobs and runs them.  A typical use would look like this:

```
	var PriorityJobQueue = require('priority-job-queue').PriorityJobQueue,
		JobModel = require('priority-job-queue').models.JobModel,
		queue = PriorityJobQueue.createInstance();
		
	var job = queue.createJob({ description:'my test job' });
	
	// now implement the job...
	job.fn = function(opts, callback) {
		var err, results;
		
		log.info('doing some work...');
		
		// the callback must be invoked to signal the 
		// queue that the job has run
		callback( err, results );
	};
	
	queue.add( job );
	
	// start the internal ticker
	queue.startRealTimeTicker();
	
```

#### Methods

* getJobList() - returns a copy of the job list
* add( obj ) - adds a job or list of jobs, sets the job's status to queued; fires an event
* remove( job ) - removes a job and fires an event
* tickHandler - searches for running jobs; if none are found it locates the next and runs it
* createJob - creates a JobModel object with defaults
* startRealTimeTicker - starts the real time event chain
* stopRealTimeTicker - kills the ticker

#### Events

* JOB\_ADDED_EVENT - fired when a new job or a list of jobs are added to the queue
* JOB\_REMOVED_EVENT - fired when a job is removed from the queue
* ONE\_SECOND_TICK - fired each second when the real time ticker is running

### JobModel

The JobModel is a data model with run logic for the contained job.  The model contains status, priority, description, and pointers to the work-method, options and callback.  When a job starts, the startTime is set; when it completes, completedTime is set.  If the scheduledIdleTime is set, the job will run continually with idle time between runs, e.g., for memory cleanups, or any recurring job.

#### Methods

* setPriority(priority) - set the priority to p (99..10) and fire an event
* getPriority() - return the current priority
* setStatus(status) - set status to s and fire an event
* getStatus() - return the current status
* run() - run the job; this is called by the queue.

#### Events

* STATUS\_CHANGE_EVENT - fired when a status changes
* PRIORITY\_CHANGE_EVENT - fired when a priority is changed
* PROGRESS\_EVENT - fired with a percent complete (by default only when the progress is 100%)

## Examples

PriorityJobQueue examples can be foound in the examples folder.  The two types are command line scripts and in-browser compiled with browserify.

### Command Line Examples

* simple-loop.js : shows how to construct a single job, add it to the queue and start the queue.
* multi-jobs.js : shows how jobs are sorted and run by priority
* recurring-jobs.js : shows how to schedule jobs that run continuously
* delayed-start.js : shows how to add a job scheduled to run at some time in the future

### Browser Example

The browser example is 'index.html' in the examples folder.  You can run it by pointing your browser to the file or, if you have http-server you can do this:

```
	cd examples
	http-server -p 3000 -o
```

The example will run on port 3000.  If you have browserify installed you may modify the browser example in examples/main.js then run `make bundle` to compile the changes.

## Tests

```
	gulp test
	
	// or
	
	make test
	
	// or
	
	npm test
	
	// or 
	
	make watch
```

## Mocks

Currently no mocks but the test/fixtures folder has a JobQueueDataset to create lists of jobs for testing. 

- - -
<p><small><em>copyright © 2014 rain city software | version 0.90.21</em></small></p>
