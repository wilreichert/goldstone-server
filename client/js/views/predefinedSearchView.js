/**
 * Copyright 2015 Solinea, Inc.
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
 */

/*
compliance/defined_search/ results structure:

{
    "uuid": "4ed7499e-d0c6-4d0b-be67-0418cd4b5d60",
    "name": "failed authorization",
    "owner": "compliance",
    "description": "Defined Search",
    "query": "{ \"query\": { \"bool\": { \"must\": [ { \"match\": { \"component\": \"keystone\" } }, { \"match_phrase\": { \"openstack_message\": \"authorization failed\" } } ] } } }",
    "protected": true,
    "index_prefix": "logstash-*",
    "doc_type": "syslog",
    "timestamp_field": "@timestamp",
    "last_start": null,
    "last_end": null,
    "target_interval": 0,
    "created": null,
    "updated": null
}

instantiated on logSearchPageView as:

    // render predefinedSearch Dropdown
    this.predefinedSearchDropdown = new PredefinedSearchView({
        collection: this.logSearchObserverCollection,
        index_prefix: 'logstash-*',
        settings_redirect: '/#reports/logbrowser/search'
    });

    this.logBrowserViz.$el.find('.panel-primary').prepend(this.predefinedSearchDropdown.el);

    also instantiated on eventsBrowserPageView and apiBrowserPageView
*/

PredefinedSearchView = GoldstoneBaseView.extend({

    // bootstrap classes for dropdown menu heading
    className: 'nav nav-pills predefined-search-container',

    instanceSpecificInit: function() {
        // index_prefix and settings_redirect defined on instantiation
        this.processOptions();
        this.render();

        // adds listeners to <li> elements inside dropdown container
        this.processListeners();
        this.getPredefinedSearches();
    },

    // do not render these searches in any of the dropdown lists
    bannedSearchList: {
        'service status': true,
        'api call query': true,
        'event query': true,
        'log query': true
    },

    pruneSearchList: function(list, filterSet) {
        filterSet = filterSet || {};

        if (Array.isArray(list)) {
            list = list.filter(function(search) {
                return filterSet[search.name] !== true;
            });
        }
        return list;
    },

    getPredefinedSearches: function() {
        var self = this;

        // fallbacks for incompatible API return, or failed ajax call
        var failAppend = [{
            uuid: null,
            name: goldstone.translate('No predefined searches.')
        }];
        var serverError = [{
            uuid: null,
            name: goldstone.translate('Server error.')
        }];

        $.get('/core/saved_search/?page_size=1000&index_prefix=' + this.index_prefix)
            .done(
                function(result) {
                    if (result.results && result.results.length) {
                        // prune out eponymous and non-user searches
                        self.predefinedSearches = self.pruneSearchList(result.results, self.bannedSearchList);
                    } else {
                        self.predefinedSearches = failAppend;
                    }
                    self.renderUpdatedResultList();
                })
            .fail(function(result) {
                self.predefinedSearches = serverError;
                self.renderUpdatedResultList();
            });
    },

    populatePredefinedSearches: function(arr) {
        var result = '';

        // add 'none' as a method of returning to the default search
        result += '<li data-uuid="null">' + goldstone.translate("None (reset)") + '</li>';

        _.each(arr, function(item) {
            result += '<li data-uuid=' + item.uuid + '>' + goldstone.translate(item.name) + '</li>';
        });

        return result;
    },

    processListeners: function() {
        var self = this;

        // dropdown to reveal predefined search list
        this.$el.find('.dropdown-menu').on('click', 'li', function(item) {

            var clickedUuid = $(this).data('uuid');
            if (clickedUuid === null) {

                // append original name to predefined search dropdown title
                // calls function that will provide accurate translation
                // if in a different language environment
                $('#predefined-search-title').text(self.generateDropdownName());
                self.collection.modifyUrlBase(null);
                self.collection.triggerDataTableFetch();
            } else {

                // append search name to predefined search dropdown title
                $('#predefined-search-title').text($(this).text());

                var constructedUrlForTable = '/core/saved_search/' + clickedUuid + '/results/';
                self.collection.modifyUrlBase(constructedUrlForTable);
                self.collection.triggerDataTableFetch();
            }

        });

    },

    generateDropdownName: function() {

        // enclosing in a function to handle the i18n compliant
        // generation of the original dropdown name when resetting
        // to the default search
        return goldstone.translate("Predefined Searches");
    },

    template: _.template('' +
        '<li role="presentation" class="dropdown">' +
        '<a class = "droptown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">' +
        '<span id="predefined-search-title"><%= this.generateDropdownName() %></span> <span class="caret"></span>' +
        '</a>' +
        '<ul class="dropdown-menu">' +
        // populated via renderUpdatedResultList()
        '</ul>' +
        '</li>' +
        '<a href=<%= this.settings_redirect %>><i class="setting-btn">&nbsp</i></a>'
    ),

    updatedResultList: _.template('<%= this.populatePredefinedSearches(this.predefinedSearches) %>'),

    render: function() {
        $(this.el).html(this.template());
        return this;
    },

    renderUpdatedResultList: function() {
        this.$el.find('.dropdown-menu').html(this.updatedResultList());
    }

});
