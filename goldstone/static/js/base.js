/**
 * Copyright 2014 Solinea, Inc.
 *
 * Licensed under the Solinea Software License Agreement (goldstone),
 * Version 1.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *     http://www.solinea.com/goldstone/LICENSE.pdf
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: John Stanford
 */

// create a project namespace and utility for creating descendants
var goldstone = goldstone || {}
goldstone.namespace = function (name) {
    "use strict";
    var parts = name.split('.')
    var current = goldstone
    for (var i = 0; i < parts.length; i++) {
        if (!current[parts[i]]) {
            current[parts[i]] = {}
        }
        current = current[parts[i]]
    }
}

goldstone.namespace('settings')
goldstone.namespace('time')
goldstone.namespace('charts')
goldstone.namespace('settings.charts')

goldstone.settings.charts.maxChartPoints = 100
goldstone.settings.charts.ordinalColors = ["#6a51a3", "#2171b5", "#238b45", "#d94801", "#cb181d"]
goldstone.settings.charts.margins = { top: 30, bottom: 60, right: 30, left: 50 }

// set up the alert elements in the base template
$(document).ready(function () {
    "use strict";
    $(".alert-danger > a").click(function () {
        $(".alert-danger").alert()
    })
    $(".alert-warning > a").click(function () {
        $(".alert-warning").alert()
    })
    $(".alert-info > a").click(function () {
        $(".alert-info").alert()
    })
    $(".alert-success > a").click(function () {
        $(".alert-success").alert()
    })
})

$('#settingsStartTime').datetimepicker({
    format: 'M d Y H:i:s',
    lang: 'en'
})

$('#settingsEndTime').datetimepicker({
    format: 'M d Y H:i:s',
    lang: 'en'
})

$("#endTimeNow").click(function () {
    "use strict";
    $("#autoRefresh").prop("disabled", false)
    $("#autoRefresh").prop("checked", true)
    $("#autoRefreshInterval").prop("disabled", false)
    $("#settingsEndTime").prop("disabled", true)
})

$("#endTimeSelected").click(function () {
    "use strict";
    $("#autoRefresh").prop("checked", false)
    $("#autoRefresh").prop("disabled", true)
    $("#autoRefreshInterval").prop("disabled", true)
    $("#settingsEndTime").prop("disabled", false)
})

$("#settingsEndTime").click(function () {
    "use strict";
    $("#endTimeSelected").prop("checked", true)
    $("#autoRefresh").prop("checked", false)
    $("#autoRefresh").prop("disabled", true)
    $("#autoRefreshInterval").prop("disabled", true)
})


// tools for raising alerts
goldstone.raiseError = function (message) {
    "use strict";
    goldstone.raiseDanger(message)
}

goldstone.raiseDanger = function (message) {
    "use strict";
    goldstone.raiseAlert(".alert-danger", message)
}

goldstone.raiseWarning = function (message) {
    "use strict";
    goldstone.raiseAlert(".alert-warning", message)
}

goldstone.raiseSuccess = function (message) {
    "use strict";
    goldstone.raiseAlert(".alert-success", message)
}

goldstone.raiseInfo = function (message) {
    "use strict";
    goldstone.raiseAlert(".alert-info", message)
}

goldstone.raiseAlert = function (selector, message) {
    "use strict";
    $(selector).html(message + '<a href="#" class="close" data-dismiss="alert">&times;</a>')
    $(selector).fadeIn("slow")
    window.setTimeout(function () {
        $(selector).fadeOut("slow")
    }, 4000)
}

goldstone.uuid = function () {
    "use strict";
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}

goldstone.populateSettingsFields = function (start, end) {
    "use strict";
    var s = new Date(start).toString(),
        e = new Date(end).toString(),
        sStr = s.substr(s.indexOf(" ") + 1),
        eStr = e.substr(e.indexOf(" ") + 1)

    $('#settingsStartTime').val(sStr)
    $('#settingsEndTime').val(eStr)
}

goldstone.isRefreshing = function () {
    "use strict";
    return $("#autoRefresh").prop("checked")
}

goldstone.getRefreshInterval = function () {
    "use strict";
    return $("select#autoRefreshInterval").val()
}


goldstone.time.fromPyTs = function (t) {
    "use strict";

    if (typeof t === 'number') {
        return new Date(Math.round(t) * 1000)
    } else {
        return new Date(Math.round(Number(t) * 1000))
    }
}

goldstone.time.toPyTs = function (t) {
    "use strict";

    // TODO decide whether toPyTs should only handle date objects.  Handling numbers may cause unexpected results.
    if (typeof t === 'number') {
        return String(Math.round(t / 1000))
    } else if (Object.prototype.toString.call(t) === '[object Date]') {
        return String(Math.round(t.getTime() / 1000))
    }
}

/**
 * Returns a Date object if given a Date or a numeric string
 * @param {[Date, String]} the date representation
 * @return {Date} the date representation of the string
 */
goldstone.time.paramToDate = function (param) {
    "use strict";
    if (param instanceof Date) {
        return param
    } else {
        // TODO should validate the string and handle appropriately
        return new Date(Number(param))
    }
}

goldstone.time.getDateRange = function () {
    "use strict";
    //grab the values from the standard time settings modal/window
    var end = (function () {
            if (! $("#endTimeNow").prop("checked")) {
                var e = $("input#settingsEndTime").val()
                switch (e) {
                    case '':
                        return new Date()
                    default:
                        var d = new Date(e)
                        if (d === 'Invalid Date') {
                            alert("End date must be valid. Using now.")
                            d = new Date()
                        }
                        return d
                }
            } else {
                return new Date()
            }
        })(),
        start = (function () {
            var s = $("input#settingsStartTime").val()
            switch (s) {
                case '':
                    // TODO devise a better way to handle the default start.  Should probably be a setting.
                    return (new Date(end)).addWeeks(-1)
                default:
                    var d = new Date(s)
                    if (d === 'Invalid Date') {
                        alert("Start date must be valid. Using 1 week " +
                            "prior to end date.")
                        // TODO devise a better way to handle the default start.  Should probably be a setting.
                        d = (new Date(end)).addWeeks(-1)
                    }
                    return d
            }
        })()

    return [start, end]
}

/**
 * Returns an appropriately sized interval to retrieve a max number
 * of points/bars on the chart
 * @param {Date} start Instance of Date representing start of interval
 * @param {Date} end Instance of Date representing end of interval
 * @param {Number} maxBuckets maximum number of buckets for the time range
 * @return {Number} An integer representation of the number of seconds of
 * an optimal interval
 */
goldstone.time.autoSizeInterval = function (start, end, maxPoints) {
    "use strict";
    var s = goldstone.settings.charts
    maxPoints = typeof maxPoints !== 'undefined' ? maxPoints : s.maxChartPoints
    var diffSeconds = (end.getTime() - start.getTime()) / 1000
    var interval = diffSeconds / maxPoints
    return String(interval).concat("s")
}


/**
 * Returns appropriately formatted start, end, and interval specifications when
 * provided the parameter strings from the request
 * @param {String} start Instance of String representing start of interval
 * @param {String} end Instance of String representing end of interval
 * @return {Object} An object of {start:Date, end:Date, interval:String}
 */
goldstone.time.processTimeBasedChartParams = function (end, start, maxPoints) {
    "use strict";

    var endDate = typeof end !== 'undefined' ?
        goldstone.time.paramToDate(end) :
        new Date(),
    startDate = typeof start !== 'undefined' ?
        goldstone.time.paramToDate(start) :
        (function () {
            var s = new Date(endDate)
            // TODO devise a better way to handle the default start.  Should probably be a setting.
            s.addWeeks(-1)
            return s
        })(),
    result = {
        'start': startDate,
        'end': endDate
    }

    if (typeof maxPoints !== 'undefined') {
        result.interval = String(goldstone.time.autoSizeInterval(startDate, endDate, maxPoints)) + "s"
    }

    return result

}

/**
 * Returns a chart stub based on a dc.barChart
 * @param {String} location String representation of a jquery selector
 * @param {Object} margins Object containing top, bottom, left, right margins
 * @param {Function} renderlet Function to be passed as a renderlet
 * @return {Object} A dc.js bar chart
 */
goldstone.charts.barChartBase = function (location, margins, renderlet) {
    "use strict";
    var panelWidth = $(location).width(),
        chart = dc.barChart(location)

    margins = typeof margins !== 'undefined' ?
            margins : { top: 50, bottom: 60, right: 30, left: 40 }

    chart
        .width(panelWidth)
        .margins(margins)
        .transitionDuration(1000)
        .centerBar(true)
        .elasticY(true)
        .brushOn(false)
        .legend(dc.legend().x(45).y(0).itemHeight(15).gap(5))
        .ordinalColors(goldstone.settings.charts.ordinalColors)
        .xAxis().ticks(5)

    if (typeof renderlet !== 'undefined') {
        chart.renderlet(renderlet)
    }

    return chart
}

/**
 * Returns a chart stub based on a dc.lineChart
 * @param {String} location String representation of a jquery selector
 * @param {Object} margins Object containing top, bottom, left, right margins
 * @param {Function} renderlet a function to be added as a renderlet
 * @return {Object} A dc.js line chart
 */
goldstone.charts.lineChartBase = function (location, margins, renderlet) {
    "use strict";
    var panelWidth = $(location).width(),
        chart = dc.lineChart(location)

    if (! margins) {
        margins = { top: 30, bottom: 60, right: 30, left: 50 }
    }

    chart
        .renderArea(true)
        .width(panelWidth)
        .margins(margins)
        .transitionDuration(1000)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .brushOn(false)
        .ordinalColors(goldstone.settings.charts.ordinalColors)
        .interpolate("basis")
        .tension(0.85)
        .xAxis().ticks(5)

    if (typeof renderlet !== 'undefined') {
        chart.renderlet(renderlet)
    }

    return chart
}

// Host availability chart (front page)
goldstone.charts.hostAvail = {
    ns: null,

    _getInstance: function (ns) {
        var o = Object.create(this)
        o.ns = ns
        return o
    },

    isRefreshSelected: function () {
        return $(".autoRefresh").prop("checked")
    },

    refreshInterval: function () {
        return $("select#autoRefreshInterval").val()
    },

    initSettingsForm: function () {
        $("#settingsUpdateButton").click(function () {
            goldstone.goldstone.hostAvail.animation.delay = goldstone.charts.hostAvail.refreshInterval();
            goldstone.goldstone.hostAvail.animation.pause = !goldstone.charts.hostAvail.isRefreshSelected()

            if(!goldstone.goldstone.hostAvail.animation.pause) {
                d3.timer(goldstone.charts.hostAvail.update, goldstone.goldstone.hostAvail.animation.delay * 1000);
            }
        });
    },

    init: function () {
        this.initSettingsForm()
        this.initSvg()
        this.update()
    },

    initSvg: function () {
        this.ns.margin = { top: 25, bottom: 25, right: 40, left: 60 }
        this.ns.w = $(this.ns.location).width()
        this.ns.mw = this.ns.w - this.ns.margin.left - this.ns.margin.right
        this.ns.mh = this.ns.h.main - this.ns.margin.top - this.ns.margin.bottom

        this.ns.r = d3.scale.sqrt();
        this.ns.loglevel = d3.scale.ordinal()
            .domain(["debug", "audit", "info", "warning", "error"])
            .range(["#6a51a3", "#2171b5", "#238b45", "#d94801", "#cb181d"]);

        this.ns.pingAxis = d3.svg.axis()
            .orient("top")
            .ticks(5)
            .tickFormat(d3.time.format("%H:%M:%S"))
        this.ns.unadminAxis = d3.svg.axis()
            .orient("bottom")
            .ticks(5)
            .tickFormat(d3.time.format("%H:%M:%S"))
        this.ns.xScale = d3.time.scale()
            .range([this.ns.margin.left, this.ns.mw - this.ns.margin.right])
            .nice()
            .clamp(true)
        this.ns.yAxis = d3.svg.axis().orient("right")
        this.ns.swimAxis = d3.svg.axis().orient("left")
        this.ns.ySwimLane = d3.scale.ordinal()
            .domain(["unadmin"].concat(this.ns.loglevel.domain().concat(["padding1", "padding2", "ping"])))
            .rangeRoundBands([this.ns.h.main, 0], 0.1);
        this.ns.yLogs = d3.scale.linear()
            .range([
                this.ns.ySwimLane("unadmin") - this.ns.ySwimLane.rangeBand(),
                this.ns.ySwimLane("ping") + this.ns.ySwimLane.rangeBand()
            ]);

        this.ns.animation = { pause: false, delay: 5, index: 1 }
        /*
         * The filter buttons
         */
        this.ns.filter = {
            debug:   true,
            audit:   true,
            info:    true,
            warning: true,
            error:   true
        };

        // The log-level buttons toggle the specific log level into the total count
        d3.select("#filterer")
          .append("div")
            .attr("class", "btn-group")
            .selectAll("button")
            .data(d3.keys(this.ns.filter), function (d) {return d; })
          .enter().append("button")
            .attr("id", function (d) { return d; })
            .attr("class", function (d) { return "btn btn-log-" + d; })
            .classed("active", function (d) {
                return goldstone.goldstone.hostAvail.filter[d];
            })
            .attr("type", "button")
            .text(function (d) { return d; })
            .on("click", function (d) {
                goldstone.goldstone.hostAvail.filter[d] = !goldstone.goldstone.hostAvail.filter[d];
                goldstone.charts.hostAvail.redraw();
            });

        /*
         * The graph and axes
         */

        this.ns.svg = d3.select(this.ns.location).append("svg")
            .attr("width", this.ns.w)
            .attr("height", this.ns.h.main + (this.ns.h.swim * 2) + this.ns.margin.top + this.ns.margin.bottom)
          .append("g")
            .attr("transform", "translate(" + this.ns.margin.left + "," + this.ns.margin.top + ")");

        this.ns.graph = this.ns.svg.append("g").attr("id", "graph");

        // Visual swim lanes
        this.ns.swimlanes = {
            ping: {
                label: "Ping Only",
                offset: goldstone.goldstone.hostAvail.ySwimLane.rangeBand()/2 * -1,
            },
            unadmin: {
                label: "Disabled",
                offset: goldstone.goldstone.hostAvail.ySwimLane.rangeBand()/2,
            }
        };

        this.ns.graph.selectAll(".swimlane")
            .data(d3.keys(goldstone.goldstone.hostAvail.swimlanes), function(d) {
                return d;
            })
          .enter().append("g")
            .attr("class", "swimlane")
            .attr("id", function(d) { return d; })
            .attr("transform", function(d) {
                return "translate(0,"
                    + goldstone.goldstone.hostAvail.ySwimLane(d)
                    + ")";
            });

        this.ns.graph.append("g")
            .attr("class", "xping axis")
            .attr("transform", "translate(0," + (this.ns.ySwimLane.rangeBand()) + ")");

        this.ns.graph.append("g")
            .attr("class", "xunadmin axis")
            .attr("transform", "translate(0," + (this.ns.h.main - this.ns.ySwimLane.rangeBand()) + ")");

        this.ns.graph.append("g")
            .attr("class", "y axis invisible-axis")
            .attr("transform", "translate(" + this.ns.mw + ",0)");

        this.ns.graph.append("g")
            .attr("class", "swim axis invisible-axis");

        this.ns.tooltip = d3.select(this.ns.location).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.ns.dataset = null;

        // Swim Lane labels on the left
        d3.select(".swim.axis")
            .call(goldstone.goldstone.hostAvail.swimAxis.scale(goldstone.goldstone.hostAvail.ySwimLane))
            .selectAll("text")
            .text(function (d) {
                return goldstone.goldstone.hostAvail.swimlanes[d] ?
                    goldstone.goldstone.hostAvail.swimlanes[d].label : "";
            })
            .attr("transform", function (d) {
                return "translate(10," + (goldstone.goldstone.hostAvail.swimlanes[d] ?
                    goldstone.goldstone.hostAvail.swimlanes[d].offset : 0) + ")"
            })
            .attr("text-anchor", "start")
            .attr("dy", "0.71em")
            .style("display", function (d) {
                return goldstone.goldstone.hostAvail.swimlanes[d] ? null : "none";
            })
            .style("font", "12px sans-serif");

        // Add "logs" area label on the left
        goldstone.goldstone.hostAvail.graph.append("text")
            .attr("transform", "translate(0" + "," + goldstone.goldstone.hostAvail.mh / 2 + ")")
            .text("Logs")
            .attr("text-anchor", "end")
            .style("font", "12px sans-serif");
    },

    redraw: function () {
        goldstone.goldstone.hostAvail.yLogs.domain([
            0,
            d3.max(goldstone.goldstone.hostAvail.dataset.map(function (d) {
                return goldstone.charts.hostAvail.sums(d);
            }))
        ]);

        d3.select(".y.axis")
            .transition()
            .duration(500)
            .call(goldstone.goldstone.hostAvail.yAxis.scale(goldstone.goldstone.hostAvail.yLogs));

        goldstone.goldstone.hostAvail.graph.selectAll("circle")
          .transition().duration(500)
            .attr("class", function (d) {
                return d.swimlane === "unadmin" ? d.swimlane : d.level;
            })
            .attr("cx", function (d) {
                return goldstone.goldstone.hostAvail.xScale(d.last_seen);
            })
            .attr("cy", function (d) {
                return {
                    logs: goldstone.goldstone.hostAvail.yLogs(goldstone.charts.hostAvail.sums(d)),
                    ping: goldstone.goldstone.hostAvail.ySwimLane(d.swimlane),
                    unadmin: goldstone.goldstone.hostAvail.ySwimLane(d.swimlane) + goldstone.goldstone.hostAvail.ySwimLane.rangeBand()
                }[d.swimlane];
            })
            .attr("r", function (d) {
        // Fixed radii for now.
                return d.swimlane === "logs"
          ? goldstone.goldstone.hostAvail.r(64)
          : goldstone.goldstone.hostAvail.r(20);
            })
            .style("opacity", function (d) {
                return d.swimlane === "unadmin"
                ? 0.8
                : goldstone.goldstone.hostAvail.filter[d.level] ? 0.5 : 1e-6;
            });
    }, // redraw()

    sums: function (datum) {
        // Return the sums for the filters that are on
        return d3.sum(goldstone.goldstone.hostAvail.loglevel.domain().map(function (k) {
            return goldstone.goldstone.hostAvail.filter[k] ? datum[k + "_count"] : 0;
        }));
    }, // sums()

    update: function () {
            // If we are paused or beyond the available jsons, exit
            if (goldstone.goldstone.hostAvail.animation.pause) {
                return true;
            }

            // Set the animation to not step over itself
            goldstone.goldstone.hostAvail.animation.pause = true;
            //var uri = "/static/data/logging_nodes." +
            //  goldstone.goldstone.hostAvail.animation.index +
            //  ".json";
            var uri = "/logging/nodes"
            d3.xhr(uri, function (error, response) {
                var allthelogs = JSON.parse(response.responseText)
                var xStart = moment(response.getResponseHeader('LogCountStart'))
                var xEnd = moment(response.getResponseHeader('LogCountEnd'))
                console.log("xStart = " + xStart)
                console.log("xEnd = " + xEnd)

                goldstone.goldstone.hostAvail.xScale = goldstone.goldstone.hostAvail.xScale.domain([xStart, xEnd])

                // If we didn't receive any valid files, abort and pause
                // there may need to be a user notification added here at
                // some point.  We'll see.

                // TODO should paint the empty chart anyway, then start refreshing
                if (typeof allthelogs.results === "undefined") {
                    goldstone.goldstone.hostAvail.animation.pause = true;
                    return;
                }


                /*
                 * Shape the dataset
                 *   - Convert datetimes to integer
                 *   - Sort by last seen (from most to least recent)
                 */
                goldstone.goldstone.hostAvail.dataset = allthelogs.results
                    .map(function (d) {
                        d.created = moment(d.created)
                        d.updated = moment(d.updated)
                        d.last_seen = moment(d.last_seen)

                        /*
                         * Figure out the higest priority level.
                         * That will determine its color later.
                         */
                        var nonzero_levels = goldstone.goldstone.hostAvail.loglevel.domain()
                            .map(function (l) { return [l, d[l + "_count"]]; })
                            .filter(function (l) {return (l[1] > 0)})
                            .reverse()
                        d.level = typeof(nonzero_levels[0]) === 'undefined' ? "none":nonzero_levels[0][0];


            /*
             * Figure out which bucket (logs, ping, or admin disabled)
             * each node belongs to.
             */
            d.swimlane = d.admin_disabled
              ? "unadmin"
              : d.last_seen_method.toLowerCase();
                        return d;
                    })
                    .sort(function (a, b) {
                        return a.last_seen - b.last_seen;
                    });

            /*
             * Axes
             *   - calculate the new domain.
             *   - adjust each axis to its new scale.
             */

            goldstone.goldstone.hostAvail.pingAxis.scale(goldstone.goldstone.hostAvail.xScale);
            goldstone.goldstone.hostAvail.unadminAxis.scale(goldstone.goldstone.hostAvail.xScale);

            goldstone.goldstone.hostAvail.svg.select(".xping.axis")
                .call(goldstone.goldstone.hostAvail.pingAxis);

            goldstone.goldstone.hostAvail.svg.select(".xunadmin.axis")
                .call(goldstone.goldstone.hostAvail.unadminAxis);

            goldstone.goldstone.hostAvail.yLogs.domain([0, d3.max(goldstone.goldstone.hostAvail.dataset.map(function (d) {
                // add up all the *_counts
                return d3.sum(goldstone.goldstone.hostAvail.loglevel.domain().map(function (e) {
                    return +d[e + "_count"];
                }));
            }))])
            goldstone.goldstone.hostAvail.yAxis.scale(goldstone.goldstone.hostAvail.yLogs);
            goldstone.goldstone.hostAvail.svg.select(".y.axis")
                .transition()
                .duration(500)
                .call(goldstone.goldstone.hostAvail.yAxis);


            /*
             * New circles appear at the far right hand side of the graph.
             */
            var circle = goldstone.goldstone.hostAvail.graph.selectAll("circle")
                .data(goldstone.goldstone.hostAvail.dataset, function (d) {
                    return d.uuid;
                });

            circle.enter()
                .append("circle")
                .attr("cx", function (d) {
                    return goldstone.goldstone.hostAvail.xScale.range()[1];
                })
                .attr("cy", function (d) {
                    return goldstone.goldstone.hostAvail.yLogs(goldstone.charts.hostAvail.sums(d));
                })
                .attr("r", goldstone.goldstone.hostAvail.r(0))
                .attr("class", function (d) { return d.level; })
                .on("mouseover", function (d) {
                    goldstone.goldstone.hostAvail.tooltip
                        .html(d.name + "<br/>" +
                          "(" + d.uuid + ")" + "<br/>" +
                          "Last Seen:" + d.last_seen.toString() + "<br/>" +
                          "Errors: " + d.error_count + "<br/>" +
                          "Warnings: " + d.warning_count + "<br/>" +
                          "Info: " + d.info_count + "<br/>" +
                          "Audit: " + d.audit_count + "<br/>" +
                          "Debug: " + d.debug_count + "<br/>"
                          );

                    goldstone.goldstone.hostAvail.tooltip
                          .transition().duration(200)
                        .style("opacity", 0.9)
                        .style("left", d3.select(this).attr("cx"))
                        .style("top", d3.select(this).attr("cy"));
                })
                .on("mouseout", function (d) {
                    goldstone.goldstone.hostAvail.tooltip
                        .transition().duration(500)
                    .style("opacity", 1e-6);
                });

            goldstone.charts.hostAvail.redraw();

            // This behaviour is not yet fully understood
            circle.exit()
                .attr("class", function (d) { return "older"; });

            // Increment the index
            // This will probably go away for production data
            goldstone.goldstone.hostAvail.animation.index += 1;

            // Unpause the animation and rerun this function for the next frame
            goldstone.goldstone.hostAvail.animation.pause = false;
            d3.timer(goldstone.charts.hostAvail.update, goldstone.goldstone.hostAvail.animation.delay * 1000);
            return true;
        });
    } // update()

}


goldstone.charts.bivariateWithAverage = {
    ns: null,
    /**
     * Get a new instance of a bivariate chart with your namespace
     * @param ns
     * @private
     */
    _getInstance: function (ns) {
        "use strict";
        var o = Object.create(this)
        o.ns = ns
        return o
    },
    /**
     * Get basic information about the chart
     */
    info: function () {
        "use strict";
        var html = function () {
                var start = moment(goldstone.time.fromPyTs(this.ns.start)).format(),
                    end = moment(goldstone.time.fromPyTs(this.ns.end)).format(),
                    custom = _.map(this.ns.infoCustom, function (e) {
                            return e.key + ": " + e.value + "<br>"
                    }),
                    result = '<div class="body"><br>' + custom +
                    'Start: ' + start + '<br>' +
                    'End: ' + end + '<br>' +
                    'Interval: ' + this.ns.interval + '<br>' +
                    '<br></div>'
                return result
            }

        $(this.ns.infoIcon).popover({
                trigger: 'manual',
                content: html.apply(this),
                placement: 'bottom',
                html: 'true'
            }).on("click", function (d) {
                var targ = "#" + d.target.id
                $(targ).popover('toggle')
                // passing an arg to setTimeout is not supported in IE < 10
                // see https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout#Callback_arguments
                setTimeout(function (d) {
                    $(d).popover('hide')
                }, 3000, targ)
            })

    },
    /**
     * initialize the chart.  Should not need to override.
     */
    init: function () {
        "use strict";
        this.info()
        this.initSvg()
        this.update()

        // TODO test out setInterval and develop updating chart functionality
        //setInterval(function () {
        //    var now = new Date()
        //    if (now > ns.end) {
        //        ns.end = ns.end.addSeconds(ns.interval)
        //        ns.start = ns.start.addSeconds(ns.interval)
        //    }
        //    ns.loadUrl(ns.start, ns.end, ns.interval)
        //}, 60000)
    },
    /**
     * Call the backend and retrieve page content and data if render = true,
     * or just data if render = false.
     * @param start
     * @param end
     * @param interval
     * @param render
     * @param location
     */
        // TODO can the update in init be pulled to here?
    loadUrl: function (start, end, interval, render, location) {
        "use strict";
        render = typeof render !== 'undefined' ? render : false
        if (render) {
            // TODO can we generalize the url function?
            $(location).load(this.ns.url(start, end, interval, render))
        } else {
            // just get the data
            d3.json(this.ns.url(start, end, interval), function (error, data) {
                this.ns.data = data
                this.update()
            })
        }
    },
    initSvg: function () {
        "use strict";
        //TODO can we just make all these ns fields part of this?
        this.ns.margin = { top: 30, bottom: 60, right: 30, left: 60 }
        this.ns.w = $(this.ns.location).width()
        this.ns.mw = this.ns.w - this.ns.margin.left - this.ns.margin.right
        this.ns.mh = this.ns.h - this.ns.margin.top - this.ns.margin.bottom
        this.ns.svg = d3.select(this.ns.location)
            .append("svg")
                .attr("width", this.ns.w)
                .attr("height", this.ns.h)
        this.ns.chart = this.ns.svg.append("g")
            .attr('class', 'chart')
            .attr("transform", "translate(" + this.ns.margin.left + "," + this.ns.margin.top + ")")
    },

    update: function () {
        "use strict";
        if (this.ns.data !== 'undefined') {
            if (Object.keys(this.ns.data).length === 0) {
                $(this.ns.location).append("<p> Response was empty.")
                $(this.ns.spinner).hide()
            } else {
                (function (json, ns) {
                    json.forEach(function (d) {
                        d.time = moment(Number(d.key))
                    })

                    // define our x and y scaling functions
                    var x = d3.time.scale()
                            .domain(d3.extent(json, function (d) { return d.time }))
                            .rangeRound([0, ns.mw]),
                        y = d3.scale.linear()
                            .domain([0, d3.max(json, function (d) { return d.max })])
                            .range([ns.mh, 0]),
                        area = d3.svg.area()
                            .interpolate("basis")
                            .tension(0.85)
                            .x(function (d) { return x(d.time) })
                            .y0(function (d) { return y(d.min) })
                            .y1(function (d) { return y(d.max) }),
                        maxLine = d3.svg.line()
                            .interpolate("basis")
                            .tension(0.85)
                            .x(function (d) { return x(d.time) })
                            .y(function (d) { return y(d.max) }),
                        minLine = d3.svg.line()
                            .interpolate("basis")
                            .tension(0.85)
                            .x(function (d) { return x(d.time) })
                            .y(function (d) { return y(d.min) }),
                        avgLine = d3.svg.line()
                            .interpolate("basis")
                            .tension(0.85)
                            .x(function (d) { return x(d.time) })
                            .y(function (d) { return y(d.avg) }),
                        hiddenBar = ns.chart.selectAll(ns.location + ' .hiddenBar')
                            .data(json),
                        hiddenBarWidth = ns.mw / json.length,
                        xAxis = d3.svg.axis()
                            .scale(x)
                            .orient("bottom"),
                        yAxis = d3.svg.axis()
                            .scale(y)
                            .orient("left"),
                        tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .html(function (d) {
                                return "<p>" + d.time.format()  + "<br>Max: " + d.max.toFixed(2) +
                                    "<br>Avg: " + d.avg.toFixed(2) + "<br>Min: " + d.min.toFixed(2) + "<p>"
                            })

                    // initialized the axes

                    ns.svg.append("text")
                        .attr("class", "axis.label")
                        .attr("transform", "rotate(-90)")
                        .attr("x", 0 - (ns.h / 2))
                        .attr("y", -5)
                        .attr("dy", "1.5em")
                        .text(ns.yAxisLabel)
                        .style("text-anchor", "middle")

                    // Invoke the tip in the context of your visualization
                    ns.chart.call(tip)

                    // initialize the chart lines
                    ns.chart.append("path")
                        .datum(json)
                        .attr("class", "area")
                        .attr("id", "minMaxArea")
                        .attr("d", area)
                        .attr("fill", colorbrewer.Spectral[10][4])
                        .style("opacity", 0.3)

                    ns.chart.append('path')
                        .attr('class', 'line')
                        .attr('id', 'minLine')
                        .attr('data-legend', "Min")
                        .style("stroke", colorbrewer.Spectral[10][8])
                        .datum(json)
                        .attr('d', minLine)

                    ns.chart.append('path')
                        .attr('class', 'line')
                        .attr('id', 'maxLine')
                        .attr('data-legend', "Max")
                        .style("stroke", colorbrewer.Spectral[10][1])
                        .datum(json)
                        .attr('d', maxLine)

                    ns.chart.append('path')
                        .attr('class', 'line')
                        .attr('id', 'avgLine')
                        .attr('data-legend', "Avg")
                        .style("stroke-dasharray", ("3, 3"))
                        .style("stroke", colorbrewer.Greys[3][1])
                        .datum(json)
                        .attr('d', avgLine)

                    ns.chart.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0, ' + ns.mh + ')')
                        .call(xAxis);
                    ns.chart.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis)

                    var legend = ns.chart.append("g")
                        .attr("class", "legend")
                        .attr("transform", "translate(20,0)")
                        .call(d3.legend)

                    // UPDATE
                    // Update old elements as needed.


                    // ENTER
                    // Create new elements as needed.
                    hiddenBar.enter()
                        .append('g')
                        .attr("transform", function (d, i) {
                            return "translate(" + i * hiddenBarWidth + ",0)"
                        })

                    // ENTER + UPDATE
                    // Appending to the enter selection expands the update selection to include
                    // entering elements; so, operations on the update selection after appending to
                    // the enter selection will apply to both entering and updating nodes.

                    // hidden rectangle for tooltip tethering
                    hiddenBar.append("rect")
                        .attr('class', 'partialHiddenBar')
                        .attr("id", function (d, i) { return "verticalRect" + i})
                        .attr("y", function (d) { return y(d.max); })
                        .attr("height", function (d) { return ns.mh - y(d.max) })
                        .attr("width", hiddenBarWidth)
                    // narrow guideline turns on when mouse enters hidden bar
                    hiddenBar.append("rect")
                        .attr("class", "verticalGuideLine")
                        .attr("id", function (d, i) { return "verticalGuideLine" + i})
                        .attr("x", 0)
                        .attr("height", ns.mh)
                        .attr("width", 1)
                        .style("opacity", 0)
                    // wide guideline with mouse event handling to show guide and
                    // tooltip.
                    hiddenBar.append("rect")
                        .attr('class', 'hiddenBar')
                        .attr("height", ns.mh)
                        .attr("width", hiddenBarWidth)
                        .on('mouseenter', function (d, i) {
                            var rectId = ns.location + " #verticalRect" + i,
                                guideId = ns.location + " #verticalGuideLine" + i,
                                targ = d3.select(guideId).pop().pop()
                            d3.select(guideId).style("opacity", 0.8)
                            tip.offset([50, 0]).show(d, targ)
                        })
                        .on('mouseleave', function (d, i) {
                            var id = ns.location + " #verticalGuideLine" + i
                            d3.select(id).style("opacity", 0)
                            tip.hide()
                        })

                    // EXIT
                    // Remove old elements as needed.

                })(this.ns.data, this.ns)
                $(this.ns.spinner).hide()
            }
        }
    }
}

goldstone.charts.topologyTree = {
    ns: null,
    /**
     * Get a new instance of a topology tree chart with your namespace
     * @param ns
     * @private
     */
    _getInstance: function (ns) {
        "use strict";
        var o = Object.create(this)
        o.ns = ns
        return o
    },
    /**
     * Override in module's js to reduce the data that is presented in the
     * multiRsrcTable on discover pages.  Do not remove the DatatableRsrcId
     * field.  It will be hidden in the rendered table, and is required for
     * proper functionality.
     * @param data
     * @returns {*}
     */
    filterMultiRsrcData: function (data, ns) {
        "use strict";
        console.log(ns.name)
        return data
    },
    /**
     * Get basic information about the chart
     */
    info: function () {
        "use strict";
        var html = function () {
            var custom = _.map(this.ns.infoCustom, function (e) {
                            return e.key + ": " + e.value + "<br>"
                        }),
                result = '<div class="body"><br>' + custom +
                    '<br></div>'
            return result
        }

        $(this.ns.infoIcon).popover({
            trigger: 'click',
            content: html.apply(this),
            placement: 'bottom',
            html: 'true'
        })
    },
    /**
     * initialize the chart.  Should not need to override.
     */
    init: function () {
        "use strict";
        //this.info()
        this.initSvg()
        this.update()
    },
    /**
     * Call the backend and retrieve page content and data if render = true,
     * or just data if render = false.
     * @param render
     * @param location
     */
    // TODO can the update in init be pulled to here?
    loadUrl: function (render, location) {
        "use strict";
        //Error.stackTraceLimit = Infinity;
        render = typeof render !== 'undefined' ? render : false
        if (render) {
            // TODO can we generalize the url function?
            $(location).load(this.ns.url(render))
        } else {
            // just get the data
            d3.json(this.ns.url(), function (error, data) {
                this.ns.data = data
                this.update()
            })
        }
    },
    initSvg: function () {
        "use strict";
        //TODO can we just make all these ns fields part of this?
        this.ns.self = this
        this.ns.margin = { top: 10, bottom: 10, right: 10, left: 50 }
        this.ns.w = $(this.ns.location).width()
        this.ns.mw = this.ns.w - this.ns.margin.left - this.ns.margin.right
        this.ns.mh = this.ns.h - this.ns.margin.top - this.ns.margin.bottom
        this.ns.svg = d3.select(this.ns.location)
            .append("svg")
                .attr("width", this.ns.w)
                .attr("height", this.ns.h)
        this.ns.tree = d3.layout.tree()
            .size([this.ns.mh, this.ns.mw])
            .separation(function (a, b) {
                var sep = a.parent === b.parent ? 1 : 2
                return sep
            })
        this.ns.i = 0 // used in processTree for node id
        this.ns.diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; }),
        this.ns.chart = this.ns.svg.append("g")
            .attr('class', 'chart')
            .attr("transform", "translate(" + this.ns.margin.left + "," + this.ns.margin.top + ")")
    },
    hasNewHiddenChildren: function (d) {
        "use strict";
        return d._children && _.findWhere(d._children, {'lifeStage': 'new'})
    },
    isNewChild: function (d) {
        "use strict";
        return d.lifeStage === 'new'
    },
    hasMissingHiddenChildren: function (d) {
        "use strict";
        return d._children && _.findWhere(d._children, {'missing': true})
    },
    isMissingChild: function (d) {
        "use strict";
        return d.missing
    },
    hasRemovedChildren: function (d) {
        "use strict";
        return d._children && _.findWhere(d._children, {'lifeStage': 'removed'})
    },
    isRemovedChild: function (d) {
        "use strict";
        return d.lifeStage === 'removed'
    },
    toggleAll: function (d) {
        "use strict";
        if (d.children) {
            d.children.forEach(goldstone.charts.topologyTree.toggleAll, this)
            goldstone.charts.topologyTree.toggle(d)
        }
    },
    toggle: function (d) {
        "use strict";
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    },
    drawSingleRsrcInfoTable: function (location, spinner, scrollYpx, json) {
        "use strict";
        var oTable,
            keys = Object.keys(json),
            data = _.map(keys, function (k) {
                if (json[k] === Object(json[k])) {
                    return [k, JSON.stringify(json[k])]
                } else {
                    return [k, json[k]]
                }
            })

        $("#multi-rsrc-body").popover({
            trigger: "manual",
            placement: "left",
            html: true,
            title: '<div>Resource Info<button type="button" style="color:#fff; opacity:1.0;" id="popover-close" class="close pull-right" data-dismiss="modal"' +
                'aria-hidden="true">&times;</button></div>',
            content: '<div id="single-rsrc-body" class="panel-body">' +
                '<table id="single-rsrc-table" class="table table-hover"></table>' +
                '</div>'
        })
        $("#multi-rsrc-body").popover("show")
        $("#popover-close").on("click", function () {$("#multi-rsrc-body").popover("hide")})
        if ($.fn.dataTable.isDataTable(location)) {
            oTable = $(location).DataTable()
            oTable.clear().rows.add(data).draw()
        } else {
            var oTableParams = {
                "data": data,
                "scrollY": "300px",
                "autoWidth": true,
                "info": false,
                "paging": false,
                "searching": false,
                "columns": [
                    { "title": "Key" },
                    { "title": "Value" }
                ]
            }
            oTable = $(location).dataTable(oTableParams)
            //$(window).bind('resize', function () {
            //    oTable.fnAdjustColumnSizing();
            //});
        }
    },
    loadLeafData: function (dataUrl, ns) {
        "use strict";
        $.get(dataUrl, function (payload) {
            // the response may have multiple lists of services for different
            // timestamps.  The first one will be the most recent.
            var firstTsData = payload[0] !== 'undefined' ? payload[0] : [],
                myUuid = goldstone.uuid()(),
                filteredFirstTsData,
                keys,
                columns,
                columnDefs,
                oTable

            // firstTsData[0] if it exists, contains key/values representative
            // of table structure.
            if (firstTsData[0] !== 'undefined') {
                firstTsData = _.map(firstTsData, function (e) {
                    e.datatableRecId = goldstone.uuid()()
                    return e
                })

                if ($.fn.dataTable.isDataTable("#multi-rsrc-table")) {
                    oTable = $("#multi-rsrc-table").DataTable()
                    oTable.destroy(true)
                }

                filteredFirstTsData = ns.topologyTree.filterMultiRsrcData(firstTsData, ns)
                if (filteredFirstTsData.length > 0) {
                    keys = Object.keys(filteredFirstTsData[0])
                    columns = _.map(keys, function (k) {
                        if (k === 'datatableRecId') {
                            return {'data': k, 'title': k, 'visible': false, 'searchable': false}
                        } else {
                            return {'data': k, 'title': k}
                        }
                    })



                    $("#multi-rsrc-body").prepend('<table id="multi-rsrc-table" class="table table-hover"><thead></thead><tbody></tbody></table>')
                    oTable = $("#multi-rsrc-table").DataTable({
                        "processing": true,
                        "serverSide": false,
                        "data": filteredFirstTsData,
                        "columns": columns,
                        "scrollX": true
                    })
                    $("#multi-rsrc-table tbody").on('click', 'tr', function (event) {
                        // we want to identify the row, find the datatable id,
                        // then find the matching element in the full data.s
                        var row = oTable.row(this).data()
                        var data = _.where(firstTsData, {'datatableRecId': row.datatableRecId})
                        var singleRsrcData = jQuery.extend(true, {}, data[0])
                        if (singleRsrcData !== 'undefined') {
                            delete singleRsrcData.datatableRecId
                            ns.topologyTree.drawSingleRsrcInfoTable(
                            ns.singleRsrcLocation, ns.singleRsrcSpinner,
                            ns.mh, data[0])
                        }
                    })
                } else {
                    $("#multi-rsrc-table").html("<p>No data</p>")
                }
            }
        })



    },
    processTree: function (json, ns) {
        "use strict";
        var duration = d3.event && d3.event.altKey ? 5000 : 500,
            // Compute the new tree layout.
            nodes = ns.tree.nodes(ns.data).reverse()

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            // TODO make the tree branch length configurable
            d.y = d.depth * 150;
        })

        // Update the nodes…

        var node = ns.chart.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++ns.i);
            })

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", function (d) {
                if (d.rsrcType.match(/-leaf$/)) {
                    return "data-leaf node"
                } else {
                    return "node"
                }
            })
            .attr("id", function (d, i) {return "node-" + d.label + i})
            .attr("transform", function (d) {
                return "translate(" + json.y0 + "," + json.x0 + ")"
            })
            .on("click", function (d) {
                if (d.rsrcType.match(/-leaf$/) && ns.hasOwnProperty('leafDataUrls')) {
                    var url = ns.leafDataUrls[d.rsrcType]
                    if (url !== undefined) {
                        var hasParam = false
                        if (d.hasOwnProperty('region')) {
                            url = hasParam ? url + "&" : url + "?"
                            hasParam = true
                            url = url + "region=" + d.region
                        }
                        if (d.hasOwnProperty('zone')) {
                            url = hasParam ? url + "&" : url + "?"
                            hasParam = true
                            url = url + "zone=" + d.zone
                        }
                        ns.self.loadLeafData(url, ns)
                    }
                } else {
                    ns.self.toggle(d)
                    ns.self.processTree(d, ns)
                }
            })

        // add a circle to make clicking cleaner
        nodeEnter.append("svg:circle")
            .attr("id", function (d, i) {return "circle" + i})
            .attr("cx", 8)
            .attr("cy", 2)
            .attr("r", 15)
            .style("fill-opacity", 1e-6)
            .style("stroke-opacity", 1e-6)

        // Add the text label (initially transparent)
        nodeEnter.append("svg:text")
            .attr("x", function (d) { return d.children ?  0 : 40 })
            .attr("dy", function (d) {return d.children ? "-1em" : ".5em" })
            .attr("text-anchor", function (d) { return d.children ? "middle" : "left" })
            .text(function (d) {
                return d.label
            })
            .style("fill-opacity", 1e-6)

        // Add the main icon (initially miniscule)
        nodeEnter
            .append("g")
            .attr("class", function (d) {
                return "icon main " + (d.rsrcType || "cloud") + "-icon"
            })
            .attr("transform", "scale(0.0000001)")

    // Map of icons to the classes in which they'll be used
    d3.map({
      icon_backup      : ['backups-leaf', 'snapshots-leaf'],
      icon_cloud       : ['cloud', 'region'],
      icon_endpoint    : ['endpoints-leaf'],
      icon_host        : ['host', 'hosts-leaf', 'hypervisors-leaf',
        'servers-leaf'],
      icon_image       : ['images-leaf'],
      icon_module      : ['module', 'secgroups-leaf'],
      icon_role        : ['roles-leaf'],
      icon_service     : ['service', 'services-leaf'],
      icon_tenant      : ['tenants-leaf'],
      icon_types       : ['volume-types-leaf'],
      icon_user        : ['users-leaf'],
      icon_volume      : ['volume', 'volumes-leaf'],
      icon_vol_transfer: ['agents-leaf', 'transfers-leaf'],
      icon_zone        : ['zone', 'aggregates-leaf', 'cloudpipes-leaf',
        'flavors-leaf', 'floating-ip-pools-leaf', 'networks-leaf'],

    }).forEach(function(icon, classes) {
      // Acutally attach the icons to the classes
      d3.xml(imgFile(icon), "image/svg+xml", function (img) {
        classes.forEach(function(c) {
          ns.chart.selectAll(".icon.main." + c + "-icon")
            .each(function () {
              d3.select(this).node().appendChild(
                img.getElementsByTagName("svg")[0].cloneNode(true))
            })
        });
      }); // d3.xml()
    }); // forEach

    function imgFile(icon) {
      return "/static/images/" + icon + ".svg";
    }

        // Transition nodes to their new position.
        var nodeUpdate = node

        nodeUpdate.select(".icon.main")
            .attr("transform", 'translate(-5, -10) scale(0.05)')
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff"
            })

        nodeUpdate.select("text")
            .attr("x", function (d) { return d.children ?  0 : 25 })
            .attr("dy", function (d) {return d.children ? "-1em" : ".5em" })
            .attr("text-anchor", function (d) { return d.children ? "middle" : "left" })
            .style("fill-opacity", 1)
            .style("text-decoration", function (d) {
                return (ns.self.hasRemovedChildren(d) || ns.self.isRemovedChild(d)) ?
                    "line-through" : ""
            })

        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")"
            })

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + json.y + "," + json.x + ")";
            })
            .remove()

        nodeExit.select("text")
            .style("fill-opacity", 1e-6)

        // Update the links…
        var link = ns.chart.selectAll("path.link")
            .data(ns.tree.links(nodes), function (d) {
                return d.target.id
            })

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {x: json.x0, y: json.y0};
                return ns.diagonal({source: o, target: o});
            })
            .transition()
            .duration(duration)
            .attr("d", ns.diagonal)

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", ns.diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {x: json.x, y: json.y};
                return ns.diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x
            d.y0 = d.y
        })
    },
    update: function () {
        "use strict";

        if (this.ns.data !== 'undefined') {
            if (Object.keys(this.ns.data).length === 0) {
                $(this.ns.location).append("<p> Response was empty.")
                $(this.ns.spinner).hide()
            } else {
                (function (ns) {
                    ns.data.x0 = ns.h / 2
                    ns.data.y0 = 0
                    // Initialize the display to show only the first tier of children
                    if (ns.data.hasOwnProperty('children')) {
                        ns.data.children.forEach(ns.topologyTree.toggleAll)
                    }
                    ns.topologyTree.processTree(ns.data, ns)
                    $(ns.spinner).hide()
                })(this.ns)
            }
        }
    }
}

window.onerror = function (message, fileURL, lineNumber) {
    console.log(message + ': ' + fileURL + ': ' + lineNumber)
}

// convenience for date manipulation
Date.prototype.addSeconds = function (m) {
    "use strict";
    this.setTime(this.getTime() + (m * 1000))
    return this
}

Date.prototype.addMinutes = function (m) {
    "use strict";
    this.setTime(this.getTime() + (m * 60 * 1000))
    return this
}

Date.prototype.addHours = function (h) {
    "use strict";
    this.setTime(this.getTime() + (h * 60 * 60 * 1000))
    return this
}

Date.prototype.addDays = function (d) {
    "use strict";
    this.setTime(this.getTime() + (d * 24 * 60 * 60 * 1000))
    return this
}

Date.prototype.addWeeks = function (d) {
    "use strict";
    this.setTime(this.getTime() + (d * 7 * 24 * 60 * 60 * 1000))
    return this
}

// test whether a script is included already
goldstone.jsIncluded = function (src) {
    "use strict";
    var scripts = document.getElementsByTagName("script")
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].getAttribute('src') === src) {
            return true
        }
    }
    return false
}
