/**
 * @class JobModel
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 9:34 AM
 */
var dash = require('lodash'),
    uuid = require('node-uuid' ),
    util = require( 'util' ),
    events = require( 'events' ),
    JobModelEvent = require('./JobModelEvent');

var JobModel = function(params) {
    'use strict';

    if (!params) params = {};

    var model = this,
        status,
        priority;

    this.id = params.id || uuid.v4();
    this.dateCreated = params.dateCreated || new Date();
    this.description = params.description;

    this.fn = params.fn;
    this.opts = params.opts;
    this.callback = params.callback;

    this.startTime = params.startTime;
    this.completedTime = params.completedTime;
    this.scheduledTime = params.scheduledTime;
    this.scheduledIdleTime = params.scheduledIdleTime;

    this.timeout = dash.isNumber( params.timeout ) ? params.timout : 20000;

    this.canDelete = dash.isBoolean( params.canDelete ) ? params.canDelete : false;

    var limitPriority = function(value) {
        if (!value || !dash.isNumber( value )) {
            value = JobModel.NORMAL_PRIORITY;
        }

        if (value > 99) {
            value = 99;
        } else if (value < 10) {
            value = 10;
        }

        return value;
    };

    status = params.status || JobModel.NEW_STATUS;
    priority = limitPriority( params.priority );

    /**
     * set the priority (99..10, low..critical); if priority changes, an event is fired
     *
     * @param value
     */
    this.setPriority = function(value) {
        value = limitPriority( value );

        if (priority !== value) {
            priority = value;

            model.emit( JobModelEvent.PRIORITY_CHANGE_EVENT, priority );
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

            model.emit( JobModelEvent.STATUS_CHANGE_EVENT, status );
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

        if (typeof model.fn === 'function') {
            model.fn.call( null, model.opts, function(err, result) {
                model.completedTime = new Date();

                if (err) {
                    model.emit('error', err);
                } else {
                    // fire the 100% complete progress event
                    model.emit( JobModelEvent.PROGRESS_EVENT, 100 );
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
        } else {
            model.emit( JobModelEvent.ERROR_EVENT, 'job function not defined...' );
            model.setStatus( JobModel.COMPLETE );
        }
    };

    events.EventEmitter.call( this );
};

util.inherits( JobModel, events.EventEmitter );

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

