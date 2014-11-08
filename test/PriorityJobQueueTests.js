/**
 * @class PriorityJobQueue
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 8:59 AM
 */
var should = require('chai').should(),
    dash = require('lodash' ),
    MockLogger = require('simple-node-logger' ).mocks.MockLogger,
    PriorityJobQueue = require('../lib/PriorityJobQueue' ),
    JobModel = require('../lib/JobModel' ),
    Dataset = require('./fixtures/JobQueueDataset');

describe('ServiceFactory', function() {
    'use strict';

    var dataset = new Dataset(),
        createOptions;

    createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('PriorityJobQueue');

        return opts;
    };

    describe('#instance', function() {
        var queue = new PriorityJobQueue( createOptions() ),
            methods = [
                'getJobList',
                'add',
                'remove',
                'createJob',
                'findNextJob',
                'tickHandler',
                'startRealTimeTicker',
                'stopRealTimeTicker',
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

        it('should create an instance of ServiceFactory', function() {
            should.exist( queue );
            queue.should.be.instanceof( PriorityJobQueue );
        });

        it('should have all known methods by size and type', function() {
            dash.methods( queue ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                queue[ method ].should.be.a( 'function' );
            });
        });

        it('should create a new instance with a pre-defined list of jobs', function() {
            var options = createOptions(),
                jq;

            options.jobs = dataset.createJobList( 10 );

            jq = new PriorityJobQueue( options );

            jq.getJobList().length.should.equal( 10 );
        });
    });

    describe('add', function() {


        it('should add job to list and change status to queue and fire event', function(done) {
            var queue = new PriorityJobQueue( createOptions() ),
                job = dataset.createJob();

            job.getStatus().should.equal( JobModel.NEW_STATUS );

            queue.on( PriorityJobQueue.JOB_ADDED_EVENT, function(ref) {
                ref.getStatus().should.equal( JobModel.QUEUED );
                ref.id.should.equal( job.id );

                done();
            });

            queue.add( job );

        });

        it('should not change status if idle', function() {
            var queue = new PriorityJobQueue( createOptions() ),
                job = dataset.createJob();

            job.setStatus( JobModel.IDLE );
            job.getStatus().should.equal( JobModel.IDLE );

            queue.add( job );
            job.getStatus().should.equal( JobModel.IDLE );
        });
    });

    describe('remove', function() {
        var opts = createOptions();

        opts.jobs = dataset.createJobList( 5 );

        it('should remove a known job and fire and event', function(done) {
            var queue = new PriorityJobQueue( opts ),
                job = queue.findNextJob();

            queue.on( PriorityJobQueue.JOB_REMOVED_EVENT, function(obj) {
                should.exist( obj );

                obj.id.should.equal( job.id );

                queue.getJobList().length.should.equal( 4 );

                done();
            });

            queue.getJobList().length.should.equal( 5 );
            queue.remove( job );
        });
    });

    describe('tickHandler', function() {
        var opts = createOptions();

        opts.jobs = dataset.createJobList( 5 );

        it('should start the highest priority job in the list', function(done) {
            var queue = new PriorityJobQueue( opts ),
                job = queue.findNextJob();

            job.on( JobModel.PROGRESS_EVENT, function(percent) {
                if (percent === 100) {
                    done();
                }
            });

            queue.tickHandler();
        });

    });

    describe('findNextJob', function() {
        var opts = createOptions(),
            ref;

        opts.jobs = dataset.createJobList( 25 );
        ref = opts.jobs[ 10 ];
        ref.setPriority( JobModel.CRITICAL );

        it('should select the highest priority oldest job', function() {
            var queue = new PriorityJobQueue( opts ),
                job,
                list = queue.getJobList();

            list.length.should.equal( 25 );

            job = queue.findNextJob();

            should.exist( job );
            job.id.should.equal( ref.id );
            job.getStatus().should.equal( JobModel.QUEUED );
        });
    });

    describe('createJob', function() {
        var queue = new PriorityJobQueue( createOptions() );

        it('should create a new job model without params and create id, date created, status', function() {
            var job = queue.createJob();

            should.exist( job );
            should.exist( job.id );
        });
    });
});