/**
 * @class PriorityJobQueue
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 8:57 AM
 */
var dash = require('lodash' ),
    util = require( 'util' ),
    events = require( 'events' ),
    JobModel = require( './JobModel' );

var PriorityJobQueue = function(options) {
    'use strict';

    var queue = this,
        log = options.log,
        jobs = [];

    events.EventEmitter.call( this );

    this.getJobList = function() {
        return dash.clone( jobs );
    };

    this.add = function(job) {
        log.info('add the job: ', job);

        // emit a queue change event
    };

    this.remove = function(job) {
        log.info('remove the job: ', job);

        // emit a queue change event
    };

    this.createJob = function(params) {
        var job = new JobModel(params);

        return job;
    };

    if (!log) throw new Error('job queue must be constructed with a logger');
};

util.inherits( PriorityJobQueue, events.EventEmitter );

module.exports = PriorityJobQueue;
