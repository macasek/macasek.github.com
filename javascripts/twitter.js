$(function() {
  (function($){
    var Tweet = Backbone.Model.extend();

    var Twitter = Backbone.Collection.extend({
      model: Tweet,
      url: "https://api.twitter.com/1/statuses/user_timeline.json?screen_name=macasek&count=5&include_rts=true&callback=?"
    });
  
    var TweetView = Backbone.View.extend({
      tagName: 'li',
      className: 'tweet',
      templateStr: '<img src="<%= tweet["user"]["profile_image_url"] %>" alt="<%= tweet["user"]["name"] %>" height="32" width="32" class="rounded_small_image"><p class="body"><a href="http://twitter.com/<%= tweet["user"]["screen_name"] %>" target="_blank"><%= tweet["user"]["name"] %></a> says: "<%= tweet["text"] %></p><p class="source_time"><span class="source">via <%= tweet["source"] %></span><span class="time" data-date="<%= tweet["created_at"] %>"><%= pretty_date %></span></p><div class="separator"></div>',

      initialize: function(){
        _.bindAll(this, 'render', "template");
      },
    
      render: function() {                                  
        var tweet = this.model.get("retweeted_status") || this.model.attributes;
        var retweeted_status = this.model.get("retweeted_status");
        var element = $(this.el); 
        
        element.html(this.template(tweet, retweeted_status));
        element.find(".time").prettyDate();
         
        return this;
      },
      
      template: function(tweet, retweeted_status) {
        return _.template(this.templateStr, { 
                            tweet: tweet, 
                            retweeted_status: retweeted_status, 
                            pretty_date: 
                            this.parseDate(tweet["created_at"]) });
      },
      
      parseDate: function(date_str) {
        var d = new Date(date_str);
        var hours = d.getHours();
        var am_pm = "am";
        
        if(hours > 12) {
          am_pm = "pm";
          hours = hours - 12;
        }
        
        return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " " + hours + ":" + d.getMinutes() + am_pm;
      }
    });  
  
    var TwitterView = Backbone.View.extend({
      el: $('div#tweets'),
    
      initialize: function() {
        _.bindAll(this, 'render', 'appendItem', 'appendItems', 'refresh');  
      
        this.collection = new Twitter();
        this.collection.bind('reset', this.appendItems);
      
        this.render();
        this.refresh();
      },
    
      render: function(){   
        this.el.append('<div class="header"><div class="right"><img src="images/spinner.gif" alt="loading..." height=16 width=16 /></div></div><div class="content"><ul id="timeline"></ul></div><div class="footer"><div class="right"><small><a href="http://twitter.com/macasek" target="_twitter">see more &raquo;</a></small></div></div>');
        
        return this;       
      },
      
      appendItems: function(tweets) {
        _(this.collection.models).each(function(item) {
          this.appendItem(item);
        }, this);
      },
        
      appendItem: function(tweet) {     
        var tweetView = new TweetView({
          model: tweet
        });
        $('ul#timeline', this.el).append(tweetView.render().el);
      },
      
      refresh: function() {
        $("#tweets .header img").show();
        
        var that = this;
        var tweets = $.getJSON(this.collection.url, function(data, textStatus, jqXHR) {
          $("#tweets .header img").hide();
           
          if(textStatus == "success") {
            $("#tweets").effect("highlight", {color:"#E8F5FB"}, 3000);
            $('ul#timeline', this.el).text(""); 
            that.collection.reset(data);
          }
        });
        
        this.timeoutHandle = setTimeout(this.refresh, 12000);        
      }  
    });
  
    window.twitterView = new TwitterView();                             
  })(jQuery);
}); 