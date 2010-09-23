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

        var document_url = document.location.href;

        return this.each(function() {
            var $this = $(this);
            var opts = options || {};

            var json = this.innerHTML.substr(this.innerHTML.indexOf("<!--")+4);
            json = json.substr(0,json.indexOf("-->"));
            //This is unsafe, so for the love of God, only use this plugin on
            //something you've written yourself. Do not fill the div's JSON with
            //user-generated content.
            json = json ? eval("(" + json + ")") : {};

            /* 
             * Tries to set the options from the div JSON. Will default to options {} passed in or null.
             */
            var twitter_nick = json.twitter_nick || opts.twitter_nick || null;
            var share_type = json.share_type || opts.share_type || null;
            var url = json.share_url || opts.share_url || document_url || null;
            var message = json.message || opts.messsage || null;

            var html = "";
            switch(share_type){
                case 'twitter':
                    html = twitter_html.replace("{message}", message);
                    html = html.replace("{share_url}", url);
                    break;
                case 'facebook':
                    html = facebook_html.replace("{share_url}", share_url);
                    break;
                default:
                    html = "";
            }
            $this.html(html);

            $this.css({
                textAlign: 'center',
                width: '100px',
                background: '#000',
                color: '#fff'
            });

        });
    };
})( jQuery );


/*
$.ajax({
    url: "http://urls.api.twitter.com/1/urls/count.json?url="+ url +"&callback=?",
    dataType: 'json',
    success: function(data) {
        console.log(data);
    }
});

$.ajax({
    url: "http://api.facebook.com/restserver.php?method=links.getStats&urls=" + url + "http://projects.latimes.com/value-added/&format=json&callback=?",
    dataType: 'json',
    success: function(data) {
        console.log(data);
    }
});*/


