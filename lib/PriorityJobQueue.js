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
        jobs = dash.isArray( options.jobs ) ? options.jobs : [];

    events.EventEmitter.call( this );

    this.getJobList = function() {
        return dash.clone( jobs );
    };

    /**
     * add one or more jobs (either an array or a single job model)
     *
     * @param obj - array or single model
     */
    this.add = function(obj) {
        log.info('add the job(s): ', obj);

        if (dash.isArray( obj )) {
            obj.forEach(function(job) {
                addJob( job );
            });
        } else {
            addJob( obj );
        }

        // emit a queue change event
    };

    var addJob = function(job) {
        if (!dash.find( jobs, { id:job.id })) {
            job.status = JobModel.QUEUED;

            jobs.push( job );

            return true;
        } else {
            return false;
        }
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
