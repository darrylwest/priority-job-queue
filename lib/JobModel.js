/**
 * @class JobModel
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 9:34 AM
 */
var dash = require('lodash'),
    uuid = require('node-uuid' ),
    util = require( 'util' ),
    events = require( 'events' );

var JobModel = function(params) {
    'use strict';

    if (!params) params = {};

    var model = this,
        status,
        priority;

    status = params.status || JobModel.NEW_STATUS;
    priority = params.priority || JobModel.NORMAL_PRIORITY;

    this.id = params.id || uuid.v4();
    this.dateCreated = params.dateCreated || new Date();
    this.description = params.description;

    this.fn = params.fn;
    this.args = params.args;
    this.callback = params.callback;

    this.startTime = params.startTime;
    this.completedTime = params.completedTime;
    this.scheduledTime = params.scheduledTime;
    this.scheduledIdleTime = params.scheduledIdleTime;

    this.canDelete = dash.isBoolean( params.canDelete ) ? params.canDelete : false;

    /**
     * set the priority (low..critical); if priority changes, an event is fired
     *
     * @param value
     */
    this.setPriority = function(value) {
        if (priority !== value) {
            priority = value;

            model.emit( JobModel.PRIORITY_CHANGE_EVENT, priority );
        }
    };

    /**
     * return the priority
     */
    this.getPriority = function() {
        return priority;
    };

    /**
     * set the status; if it changes, an event is fired
     *
     * @param value - one of the status codes
     */
    this.setStatus = function(value) {
        if (status !== value) {
            status = value;

            model.emit( JobModel.STATUS_CHANGE_EVENT, status );
        }
    };

    /**
     * return the current status
     */
    this.getStatus = function() {
        return status;
    };

    /**
     * run the job
     */
    this.run = function() {
        model.startTime = new Date();
        model.setStatus( JobModel.RUNNING );

        model.fn.call( null, model.args, function(err, result) {
            model.completedTime = new Date();

            if (err) {
                model.emit('error', err);
            }

            if (typeof model.callback === 'function') {
                model.callback( err, result );
            }

            dash.defer(function() {
                if (dash.isNumber( model.scheduledIdleTime )) {
                    model.scheduledTime = new Date( Date.now() + model.scheduledIdleTime );
                    model.setStatus( JobModel.IDLE );
                } else {
                    model.setStatus( JobModel.COMPLETE );
                }
            });
        });
    };

    events.EventEmitter.call( this );
};

util.inherits( JobModel, events.EventEmitter );

JobModel.STATUS_CHANGE_EVENT = 'statusChange';
JobModel.PRIORITY_CHANGE_EVENT = 'priorityChange';
JobModel.PROGRESS_EVENT = 'progress';
JobModel.ERROR_EVENT = 'error';

JobModel.LOW_PRIORITY = 90;
JobModel.NORMAL_PRIORITY = 60;
JobModel.MEDIUM_PRIORITY = 50;
JobModel.HIGH_PRIORITY = 20;
JobModel.CRITICAL = 10;

JobModel.NEW_STATUS = 'new';
JobModel.QUEUED = 'queued';
JobModel.RUNNING = 'running';
JobModel.COMPLETE = 'complete';
JobModel.IDLE = 'idle';

module.exports = JobModel;

