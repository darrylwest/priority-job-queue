#!/usr/bin/env node

// dpw@alameda.local
// 2014.11.07
'use strict';

var PriorityJobQueue = require('../index').PriorityJobQueue,
    JobModel = require('../index').models.JobModel,
    JobModelEvent = require('../index').events.JobModelEvent,
    dash = require('lodash'),
    log = require('simple-node-logger').createSimpleLogger(),
    queue = new PriorityJobQueue( { log:log } );

log.info('queue created');

queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(obj) {
    log.info('job added event: ', obj);
});


// the worker
var clean = function(opts, callback) {
    opts.count--;

    if (opts.count > 0) {
        log.info('clean some stuff: ', opts.count);
    } else {
        log.info('stop the ticker...');
        queue.stopRealTimeTicker();
    }

    callback(null, opts);
};

var job = queue.createJob();
job.fn = clean;
job.opts = { count:4 };
job.scheduledIdleTime = 1000;
job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(status) {
    log.info( 'status change: ', status, ', scheduled time: ', job.scheduledTime );
});

queue.add( job );
queue.startRealTimeTicker();

