/**
 * @class JobModelTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 2:11 PM
 */
var should = require('chai').should(),
    dash = require('lodash' ),
    JobModel = require('../lib/JobModel' ),
    Dataset = require('./fixtures/JobQueueDataset' ),
    JobModelEvent = require('../lib/JobModelEvent');

describe('JobModel', function() {
    'use strict';

    var dataset = new Dataset();

    describe('#instance', function() {
        var job = new JobModel(),
            methods = [
                'getPriority',
                'setPriority',
                'getStatus',
                'setStatus',
                'run',
                // inherited
                'addListener',
                'emit',
                'listeners',
                'on',
                'once',
                'removeAllListeners',
                'removeListener',
                'setMaxListeners'
            ];

        it('should create an instance of JobModel', function() {
            should.exist( job );
            job.should.be.instanceof( JobModel );

            should.exist( job.id );
            should.exist( job.dateCreated );

            job.getPriority().should.equal( JobModel.NORMAL_PRIORITY );
            job.getStatus().should.equal( JobModel.NEW_STATUS );
        });

        it('should have all known methods by size and type', function() {
            dash.methods( job ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                job[ method ].should.be.a( 'function' );
            });
        });

        it('should create a new job model with parameters', function() {
            var job,
                params = {
                    description:'my test job',
                    fn: function(args) { console.log( args );},
                    opts:[ 1, 'b', 3 ],
                    callback: function(err, res) { },
                    priority: JobModel.HIGH_PRIORITY
                };

            job = new JobModel( params );

            should.exist( job );
            should.exist( job.id );
            should.exist( job.dateCreated );

            job.getStatus().should.equal( JobModel.NEW_STATUS );

            job.description.should.equal( params.description );
            job.fn.should.equal( params.fn );
            job.opts.should.equal( params.opts );
            job.callback.should.equal( params.callback );
            job.getPriority().should.equal( params.priority );
        });
    });

    describe('run', function() {
        it('should run a simple job and set status codes, start/stop times', function(done) {
            var job = new JobModel();

            job.callback = function(err, results) {
                should.exist( job.startTime );
                should.exist( job.completedTime );

                done();
            };

            job.fn = function(args, callback) {

                dash.defer( callback );
            };

            job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(status) {
                if (status === JobModel.COMPLETE) {
                    should.exist( job.startTime );
                    should.exist( job.completedTime );
                } else if (status === JobModel.RUNNING) {
                    should.exist( job.startTime );
                } else {
                    throw new Error( 'status is not valid: ', status);
                }
            });

            should.not.exist( job.startTime );
            should.not.exist( job.completedTime );

            job.run();
        });

        it('should run a scheduled job and re-schedule', function(done) {
            var job = new JobModel(),
                progress = 0;

            job.scheduledIdleTime = 10;

            job.callback = function(err, results) {
                should.exist( job.startTime );
                should.exist( job.completedTime );

                done();
            };

            job.fn = function(args, callback) {
                dash.defer( callback );
            };

            job.on( JobModelEvent.PROGRESS_EVENT, function(percent) {
                percent.should.equal( 100 );
                progress = percent;
            });

            job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(status) {
                if (status === JobModel.IDLE) {
                    should.exist( job.startTime );
                    should.exist( job.completedTime );
                    should.exist( job.scheduledTime );
                    progress.should.equal( 100 );
                } else if (status === JobModel.RUNNING) {
                    should.exist( job.startTime );
                } else {
                    throw new Error( 'status is not valid: ', status);
                }
            });

            should.not.exist( job.startTime );
            should.not.exist( job.completedTime );
            should.not.exist( job.scheduledTime );
            should.exist( job.scheduledIdleTime );

            job.run();
        });
    });

    describe('setStatus', function() {
        it('should change status and fire an event on change', function(done) {
            var job = new JobModel();

            job.on( JobModelEvent.STATUS_CHANGE_EVENT, function(value) {
                value.should.equal( JobModel.RUNNING );
                job.getStatus().should.equal( JobModel.RUNNING );

                done();
            });

            job.setStatus( JobModel.RUNNING );
        });

        it('should ignore attempts to set to existing status', function() {
            var job = new JobModel({ status:JobModel.COMPLETE });

            job.on( JobModelEvent.STATUS_CHANGE_EVENT, function() {
                throw new Error('should not fire an event');
            });

            job.getStatus().should.equal( JobModel.COMPLETE );

            job.setStatus( JobModel.COMPLETE );
        });
    });

    describe('setPriority', function() {
        it('should change priority and fire an event on change', function(done) {
            var job = new JobModel();

            job.on( JobModelEvent.PRIORITY_CHANGE_EVENT, function(value) {
                value.should.equal( JobModel.HIGH_PRIORITY );
                job.getPriority().should.equal( JobModel.HIGH_PRIORITY );

                done();
            });

            job.setPriority( JobModel.HIGH_PRIORITY );
        });

        it('should ignore attempts to set to existing priority', function() {
            var job = new JobModel({ priority:JobModel.LOW_PRIORITY });

            job.on( JobModelEvent.PRIORITY_CHANGE_EVENT, function() {
                throw new Error('should not fire an event');
            });

            job.getPriority().should.equal( JobModel.LOW_PRIORITY );

            job.setPriority( JobModel.LOW_PRIORITY );
        });
    });
});