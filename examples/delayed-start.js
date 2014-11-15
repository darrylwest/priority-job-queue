#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.08
'use strict';

var PriorityJobQueue = require('../index').PriorityJobQueue,
    JobModel = require('../index').models.JobModel,
    JobModelEvent = require('../index').events.JobModelEvent,
    dash = require('lodash'),
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } ),
    job;

log.info('\n\n>>> This example creates a queue and starts the clock.  Then, a job is created and scheduled time and status set and added to the queue.  The job will run in 3.5 seconds...\n');

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj.id);
});

queue.on( PriorityJobQueue.JOB_REMOVED_EVENT, function(obj) {
    log.info('job removed event: ', obj.id);
});

queue.on( PriorityJobQueue.ONE_SECOND_TICK_EVENT, function() {
    log.info('one second tick: ', Date.now());

    if (queue.getJobList().length === 0) {
        log.info('stop the ticker...');
        queue.stopRealTimeTicker();
    }

});

// the worker
var delayed = function(opts, callback) {

    log.info('delayed invocation run at: ', Date.now());

    callback(null, opts);
};

queue.startRealTimeTicker();

job = queue.createJob();
job.fn = delayed;
job.callback = function(err, results) {
    log.info('use the optional callback to remove from the queue');
    dash.defer(function() {
        queue.remove( job );
    });
};

log.info('set the scheduled run time to 3.5 seconds in the future...');
job.scheduledTime = new Date( Date.now() + 3500 );

// set to idle prior to adding to the list
job.setStatus( JobModel.IDLE );

job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(status) {
    log.info( 'status change: ', status, ', scheduled time: ', job.scheduledTime );
});

log.info( 'add the job: ', job.id, ' sceduled to run: ', job.scheduledTime.getTime() );
queue.add( job );

