(function($){
    if(!$.Indextank){
        $.Indextank = new Object();
    };
    
    $.Indextank.AjaxSearch = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("Indextank.AjaxSearch", base);
        
        base.init = function(){
            
            base.options = $.extend({},$.Indextank.AjaxSearch.defaultOptions, options);
            base.xhr = undefined;
            
            
            // TODO: make sure ize is an Indextank.Ize element somehow
            base.ize = $(base.el.form).data("Indextank.Ize");
            base.ize.$el.submit(function(e){
                // make sure the form is not submitted
                e.preventDefault();
                base.runQuery( base.getDefaultQuery().withQueryString(base.el.value) );
            });


            // make it possible for other to trigger an ajax search
            base.$el.bind( "Indextank.AjaxSearch.runQuery", function (event, query) {
                base.runQuery(query);
            });

            // create the default query, and map default parameters on it
            base.defaultQuery = new Query("")
                                    .withStart(base.options.start)
                                    .withLength(base.options.rsLength)
                                    .withFetchFields(base.options.fields)
                                    .withSnippetFields(base.options.snippets)
                                    .withScoringFunction(base.options.scoringFunction)
                                    .withQueryReWriter(base.options.rewriteQuery);
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };

        // gets a copy of the default query.
        base.getDefaultQuery = function() {
            return base.defaultQuery.clone();
        };


            base.runQuery = function( query ) {
                // don't run a query twice
                if (base.query == query ) {
                    return;
                } 
                
                // if we are running a query, an old one makes no sense.
                if (base.xhr != undefined ) {
                    base.xhr.abort();
                }
               

                // remember the current running query
                base.query = query;

                base.options.listeners.trigger("Indextank.AjaxSearch.searching");
                base.$el.trigger("Indextank.AjaxSearch.searching");


                // run the query, with ajax
                base.xhr = $.ajax( {
                    url: base.ize.apiurl + "/v1/indexes/" + base.ize.indexName + "/search",
                    dataType: "jsonp",
                    data: query.asParameterMap(),
                    success: function( data ) { 
                                // Indextank API does not send the query back.
                                // I'll save the current query inside 'data',
                                // so our listeners can use it.
                                data.query = query;
                                base.options.listeners.trigger("Indextank.AjaxSearch.success", data);
                                }
                } );
            } 
        
        // Run initializer
        base.init();
    };
    
    $.Indextank.AjaxSearch.defaultOptions = {
        // first result to fetch .. it can be overrided at query-time,
        // but we need a default. 99.95% of the times you'll want to keep the default
        start : 0,
        // how many results to fetch on every query? 
        // it can be overriden at query-time.
        rsLength : 10, 
        // default fields to fetch .. 
        fields : "name,title,image,url,link",
        // fields to make snippets for
        snippets : "text",
        // no one listening .. sad
        listeners: [],
        // scoring function to use
        scoringFunction: 0,
        // the default query re-writer is identity
        rewriteQuery: function(q) {return q}
    };
    
    $.fn.indextank_AjaxSearch = function(options){
        return this.each(function(){
            (new $.Indextank.AjaxSearch(this, options));
        });
    };
    
})(jQuery);
