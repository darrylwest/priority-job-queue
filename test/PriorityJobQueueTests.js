/**
 * @class PriorityJobQueue
 *
 * @author: darryl.west@roundpeg.com
 * @created: 11/6/14 8:59 AM
 */
var should = require('chai').should(),
    dash = require('lodash' ),
    MockLogger = require('simple-node-logger' ).mocks.MockLogger,
    PriorityJobQueue = require('../lib/PriorityJobQueue');

describe('ServiceFactory', function() {
    'use strict';

    var createOptions = function() {
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
    });

    describe('createJob', function() {
        var queue = new PriorityJobQueue( createOptions() );

        it('should create a new job model with id and date created', function() {
            var job = queue.createJob();
        });
    });
});