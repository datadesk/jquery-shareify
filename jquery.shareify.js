shareifyHandlers = {
    twitter: {
        /* We have to hash some global handlers so that
         * we don't constantly redefine the handler in the 
         * $.each loop in the shareify function.
         */
        handlers: {},
        set: function(k, f) {
            var l = k.length;
            if(k[l-1] != '/'){ k=k+'/'; }
            if(k.indexOf('http://') != 0) { k='http://'+k; }
            shareifyHandlers.twitter.handlers[k] = f;
        },
        get: function(k) {
            return shareifyHandlers.twitter.handlers[k];
        },
        rcv: function(data) {
            shareifyHandlers.twitter.get(data.url)(data);
        }
    }

};
 
(function( $ ){

    $.fn.shareify = function(options) {
        var opts = options || {};


        var script_src = "";
        // Search through all of the script tags on the page,
        // attempt to pull out jquery.shareify's location so
        // we know where the media files are.
        $('script').each(function(){
            var src = $(this).attr('src');
            if(src && src.indexOf('jquery.shareify') != -1) {
                var last = src.search(/\/[.-/\w]+.js$/i);
                script_src = src.substr(0, last+1);
            }
        });
        script_src = script_src || opts.script_src;

        var permalink_html = [
            "<a title='Permalink' href='{share_url}' target='_blank'>",
                "<div class='shareify_div'>",
                    "<img src='", script_src ,"img/permalink.png'/>",
                "</div>",
                "<div class='shareify_count'>",
                    "Link",
                "</div>",
            "</a>"
        ].join("");

        var twitter_html = [
            "<a title='Share on Twitter' href='http://twitter.com/home?status={message} {share_url}' target='_blank'>",
                "<div class='shareify_div'>",
                    "<img src='", script_src ,"img/twitter-16x16-grayscale.png'/>",
                "</div>",
            "</a>",
        ].join("");

        var facebook_html = [
            "<a title='Share on Facebook' href='http://www.facebook.com/sharer.php?u={share_url}&src=sp' target='_blank'>",
                "<div class='shareify_div'>",
                    "<img src='", script_src ,"img/facebook-16x16-grayscale.png'/>",
                "</div>",
            "</a>",
        ].join("");

        var facebook_like_html = [
            "<a title='Like on Facebook' target='_blank'>",
                '<iframe src="http://www.facebook.com/plugins/like.php?href={share_url}&amp;layout=button_count&amp;show_faces=true&amp;width=0&amp;action=like&amp;colorscheme=dark&amp;height=21" scrolling="no" frameborder="0" style="position: absolute; left: 0; z-index:5; max-width:100px; opacity: 0; display:inline; border:none; overflow:hidden; height:21px; " allowTransparency="true"></iframe>',
                "<div class='shareify_div'>",
                    "<img src='", script_src ,"img/facebook-like-16x16.png'/>",
                "</div>",
            "</a>",
        ].join("");

        var count_html = [
                "<div class='shareify_count'>",
                    "{share_count}",
                "</div>",
        ].join("");

        var count_up = function() {
            var eso = $(this);
            var count_div = $($(eso.children()[0]).children()[1]);
            if(!count_div.data("has_clicked")) {
                var count = count_div.html();
                if(count)
                    count = parseInt(count) + 1;
                else
                    count = 1;
                count_div.html(count);
                count_div.data("has_clicked", true);
            }
        };

        var document_url = document.location.href;

        return this.each(function() {
            var $this = $(this);

            /* 
             * Tries to set the options from the div JSON. Will default to options {} passed in or null.
             */
            var twitter_nick = $this.attr("twitter_nick") || opts.twitter_nick || "";
            var share_type = $this.attr("share_type") || opts.share_type || null;
            var url = $this.attr("share_url") || opts.share_url || document_url || "";
            var message = $this.attr("message") || opts.messsage || "";

            if(!share_type)
                return false;

            switch(share_type){
                case 'permalink':
                    var html="";
                    html = permalink_html.replace("{share_url}", url);
                    $this.html(html);
                    break;
                case 'twitter':
                    var html = "";
                    html = twitter_html.replace("{message}", message);
                    html = html.replace("{share_url}", url);
                    $this.html(html);

                    shareifyHandlers.twitter.set(url, function(data) {
                        var count = 0;
                        if(data)
                            count = data.count || 0;
                        var a = $($this).children('a');
                        $(a).append(count_html.replace("{share_count}", count));
                    });
                    $.ajax({
                        url: ["http://urls.api.twitter.com/1/urls/count.json?url=", url].join(""),
                        dataType: 'jsonp',
                        jsonpCallback: "shareifyHandlers.twitter.rcv",
                    });
                    $this.click(count_up);
                    break;
                case 'facebook':
                    url = escape(url);
                    var html = ""
                    html = facebook_html.replace("{share_url}", url);
                    $this.html(html);
                    // Thankfully, Facebook doesn't cache the callback name,
                    // so we can let jQuery deal with handling the callbacks 
                    // for us.
                    $.getJSON(
                        ["http://api.facebook.com/restserver.php?method=links.getStats&urls=", url, "&format=json&callback=?"].join(""),
                        function(data) {
                            var count = 0;
                            if(data)
                                count = data[0].share_count || 0;
                            var a = $($this).children('a');
                            $(a).append(count_html.replace("{share_count}", count));
                        }
                    );
                    $this.click(count_up);
                    break;
                case 'facebook_like':
                    var html = ""
                    url = escape(url);
                    html = facebook_like_html.replace("{share_url}", url);
                    $this.html(html);
                    $.getJSON(
                        ["http://api.facebook.com/restserver.php?method=links.getStats&urls=", url, "&format=json&callback=?"].join(""),
                        function(data) {
                            var count = 0;
                            if(data)
                                count = data[0].total_count || 0;
                            var a = $($this).children('a');
                            $(a).append(count_html.replace("{share_count}", count));
                        }
                    );
                    break;
                default:
                    break;
            }
        });
    };
})( jQuery );
