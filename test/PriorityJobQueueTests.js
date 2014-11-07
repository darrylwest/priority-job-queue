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

    describe('createJob', function() {
        var queue = new PriorityJobQueue( createOptions() );

        it('should create a new job model without params and create id, date created, status', function() {
            var job = queue.createJob();

            should.exist( job );
            should.exist( job.id );
        });
    });
});