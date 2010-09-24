(function( $ ){
    $.fn.shareify = function(options) {

        var twitter_html = [
            "<a href='http://twitter.com/home?status={message} {share_url}' target='_blank'>",
                "<div class='shareify_div'>",
                    "Tweet this",
                "</div>",
                "<div class='shareify_count'>",
                    "{share_count}",
                "</div>",
            "</a>",
        ].join("");

        var facebook_html = [
            "<a href='http://www.facebook.com/sharer.php?u={share_url}&src=sp' target='_blank'>",
                "<div class='shareify_div'>",
                    "Facebook this",
                "</div>",
                "<div class='shareify_count'>",
                    "{share_count}",
                "</div>",
            "</a>",
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
            var opts = options || {};

            /* 
             * Tries to set the options from the div JSON. Will default to options {} passed in or null.
             */
            var twitter_nick = $this.attr("twitter_nick") || opts.twitter_nick || "";
            var share_type = $this.attr("share_type") || opts.share_type || null;
            var url = $this.attr("share_url") || opts.share_url || document_url || "";
            var message = $this.attr("message") || opts.messsage || "";

            if(!share_type)
                return false;

            var html = "";
            switch(share_type){
                case 'twitter':
                    $.ajax({
                        url: ["http://urls.api.twitter.com/1/urls/count.json?url=", url, "&callback=?"].join(""),
                        dataType: 'json',
                        success: function(data) {
                            var count = 0;
                            if(data)
                                count = data.count || 0;
                            html = twitter_html.replace("{message}", message);
                            html = html.replace("{share_url}", url);
                            html = html.replace("{share_count}", count);
                            $this.html(html);
                        }
                    });
                    break;
                case 'facebook':
                    url = escape(url);
                    $.ajax({
                        url: ["http://api.facebook.com/restserver.php?method=links.getStats&urls=", url, "&format=json&callback=?"].join(""),
                        dataType: 'json',
                        success: function(data) {
                            var count = 0;
                            if(data)
                                count = data[0].share_count || 0;
                            html = facebook_html.replace("{share_url}", url);
                            html = html.replace("{share_count}", count);
                            $this.html(html);
                        }
                    });
                    break;
                default:
                    html = "";
            }

            $this.css({
                textAlign: 'center',
                width: '100px',
                background: '#000',
                color: '#fff'
            });

            $this.click(count_up);

        });
    };
})( jQuery );
