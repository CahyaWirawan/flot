/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot navigate plugin interactions", function () {
    'use strict';

    var placeholder, plot, eventHolder;
    var options = {
        xaxes: [{
            autoScale: 'exact'
        }],
        yaxes: [{
            autoScale: 'exact'
        }],
        zoom: {
            interactive: true,
            active: true,
            amount: 10
        },
        pan: {
            interactive: true,
            active: true
        }
    };

    beforeEach(function () {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('pans on mouse drag', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        eventHolder = plot.getEventHolder();

        simulate.mouseDown(eventHolder, 50, 70);
        simulate.mouseMove(eventHolder, 50, 70);
        simulate.mouseMove(eventHolder, 50 + plot.width(), 70);
        simulate.mouseUp(eventHolder, 50 + plot.width(), 70);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        expect(xaxis.min).toBe(-10);
        expect(xaxis.max).toBe(0);
        expect(yaxis.min).toBe(0);
        expect(yaxis.max).toBe(10);
    });

    it('zooms out on mouse scroll down', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = plot.getEventHolder();
        simulate.mouseWheel(eventHolder, clientX, clientY, 0, 100);

        /*
            I would really like better precission but:
                * the browsers may place the graph to fractional pixel coordinates
                * we can only deliver mouse events at integer coordinates
                * so we can't align precisely our mouse clicks with a point specified in plot coordinates
            hence our precission sucks.

            But this test isn't about precission, so we are fine
         */
        expect(xaxis.min).toBeCloseTo(0, 0);
        expect(xaxis.max).toBeCloseTo(100, 0);
        expect(yaxis.min).toBeCloseTo(0, 0);
        expect(yaxis.max).toBeCloseTo(100, 0);
    });

    it('zooms in on mouse scroll up', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = plot.getEventHolder();
        simulate.mouseWheel(eventHolder, clientX, clientY, 0, -100);

        /*
            I would really like better precission but:
                * the browsers may place the graph to fractional pixel coordinates
                * we can only deliver mouse events at integer coordinates
                * so we can't align precisely our mouse clicks with a point specified in plot coordinates
            hence our precission sucks.

            But this test isn't about precission, so we are fine
         */
        expect(xaxis.min).toBeCloseTo(0, 1);
        expect(xaxis.max).toBeCloseTo(1, 1);
        expect(yaxis.min).toBeCloseTo(0, 1);
        expect(yaxis.max).toBeCloseTo(1, 1);
    });

    it('constrains the mouse scroll zoom to the hovered axis ', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = xaxis.box.top + xaxis.box.height/2;

        eventHolder = plot.getEventHolder();
        simulate.mouseWheel(eventHolder, clientX, clientY, 0, -100);

        expect(xaxis.min).toBeCloseTo(0, 1);
        expect(xaxis.max).toBeCloseTo(1, 1);
        expect(yaxis.min).toBeCloseTo(0, 1);
        expect(yaxis.max).toBeCloseTo(10, 1);
    });

    it('zooms out proportional with the deltaY on Mac platforms', function () {
        var smallAmount = 0.4,
            largerAmount = 0.8,
            plot1Ranges = plotAndScroll(smallAmount),
            plot2Ranges = plotAndScroll(largerAmount);
        expect(plot1Ranges.xaxisMin).toBeLessThan(plot2Ranges.xaxisMin);
        expect(plot1Ranges.xaxisMax).toBeGreaterThan(plot2Ranges.xaxisMax);
        expect(plot1Ranges.yaxisMin).toBeLessThan(plot2Ranges.yaxisMin);
        expect(plot1Ranges.yaxisMax).toBeGreaterThan(plot2Ranges.yaxisMax);
    });

    it('zooms out regardless the deltaY value on non Mac platforms', function () {
        var smallAmount = 40,
            largerAmount = 80,
            plot1Ranges = plotAndScroll(smallAmount),
            plot2Ranges = plotAndScroll(largerAmount);
        expect(plot2Ranges.xaxisMin).toBeCloseTo(plot1Ranges.xaxisMin);
        expect(plot2Ranges.xaxisMax).toBeCloseTo(plot1Ranges.xaxisMax);
        expect(plot2Ranges.yaxisMin).toBeCloseTo(plot1Ranges.yaxisMin);
        expect(plot2Ranges.yaxisMax).toBeCloseTo(plot1Ranges.yaxisMax);
    });

    function plotAndScroll(amount) {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], options);

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(5);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(5);

        eventHolder = plot.getEventHolder();
        simulate.mouseWheel(eventHolder, clientX, clientY, 0, amount);

        return {
            xaxisMin: xaxis.min,
            xaxisMax: xaxis.max,
            yaxisMin: yaxis.min,
            yaxisMax: yaxis.max
        };
    }

    it('zooms mode handles event on mouse dblclick', function () {
        plot = $.plot(placeholder, [
            [[0, 0],
            [10, 10]]
        ], {
        xaxes: [{
            autoScale: 'exact'
        }],
        yaxes: [{
            autoScale: 'exact'
        }],
        zoom: {
            interactive: false,
            highlighted: true
        },
        pan: {
            interactive: true,
            highlighted: true
        },
        selection: {
            mode: 'smart',
        }});

        var xaxis = plot.getXAxes()[0];
        var yaxis = plot.getYAxes()[0];

        var clientX = plot.getPlotOffset().left + xaxis.p2c(0);
        var clientY = plot.getPlotOffset().top + yaxis.p2c(0);

        eventHolder = plot.getEventHolder();
        var spy = spyOn(eventHolder, 'ondblclick').and.callThrough();

        var spyRecenter = jasmine.createSpy('spy');
        $(plot.getPlaceholder()).on('re-center', spyRecenter);

        simulate.dblclick(eventHolder, 10, 20);

        expect(spy).toHaveBeenCalled();
        expect(spyRecenter).toHaveBeenCalled();
    });

    it('shows that the eventHolder is cleared through shutdown when the plot is replaced', function() {
        plot = $.plot(placeholder, [[]], options);

        var eventHolder = plot.getEventHolder(),
            spy = spyOn(eventHolder, 'removeEventListener').and.callThrough();

        plot = $.plot(placeholder, [[]], options);

        expect(spy).toHaveBeenCalledWith('mousewheel', jasmine.any(Function), jasmine.any(Boolean))
        expect(spy).toHaveBeenCalledWith('dblclick', jasmine.any(Function), jasmine.any(Boolean));
    });

});
