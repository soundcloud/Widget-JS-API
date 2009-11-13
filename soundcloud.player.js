/*
*   JavaScript interface for the SoundCloud Player widget
*   Author: Matas Petrikas, matas@soundcloud.com
*   Licensed under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/

window.soundcloud = {
  version: "0.1",
  debug: false,
  _listeners: [],
  // re-dispatches player events in the DOM, using JS library support, the events also should bubble up the DOM
  _redispatch: function(eventType, flashId, data) {
    // find the flash player, if there's no ID set, will dispatch events of the document node
    try{
      var playerNode = this.getPlayer(flashId),
          listeners  = this._listeners[eventType] || [];
          // construct the custom eventType  e.g. 'soundcloud:onPlayerReady'
          customEventType = 'soundcloud:' + eventType;
      // re-dispatch SoundCloud events up in the DOM
      if(window.jQuery){
        // if jQuery is available, trigger the custom event
        jQuery(playerNode).trigger(customEventType, [data]);
      }else if(window.Prototype){
        // if Prototype.js is available, fire the custom event
        $(playerNode).fire(customEventType, data);
      }else{
        // TODO add more JS libraries that support custom DOM events
      }
      // if there are any listeners registered to this event, trigger them all
      for(i in listeners){
        listeners[i].apply(playerNode, [playerNode, data]);
      }
      // log the events in debug mode
      if(this.debug && window.console){
        console.log(customEventType, eventType, flashId, data);
      }
      
    }catch(e){
      if(window.console){
        console.error('unable to dispatch player event ' + eventType, flashId, data, e);
      }
    }
  },
  // you can add multiple listeners to a certain event
  // e.g. soundcloud.addEventListener('onPlayerReady', myFunctionOne);
  //      soundcloud.addEventListener('onPlayerReady', myFunctionTwo);
  addEventListener: function(eventType, callback) {
    if(!this._listeners[eventType]){
      this._listeners[eventType] = [];
    }
    this._listeners[eventType].push(callback);
  },
  // you can also remove the function listener if e.g you want to trigger it only once
  // soundcloud.removeEventListener('onMediaPlay', myFunctionOne);
  removeEventListener: function(eventType, callback) {
    var listeners = this._listeners[eventType];
    if(listeners){
      for(i in listeners){
        if(listeners[i] === callback){
          listeners.splice(i, 1);
        }
      }
    }
  },
  // get player node based on its id (if object tag) or name (if embed tag)
  // if you're using SWFObject or other dynamic Flash generators, please make sure that you set the id parameter
  //  only if the DOM has an id/name it's possible to call player's methods.
  // Important!: because of the bug in Opera browser, the Flash can't get its own id
  // so the generator should set it additionally through flashvars parameter 'object_id'
  getPlayer: function(id){
    try{
      if(!id){
        throw "The SoundCloud player DOM object needs an id atribute, please refer to SoundCloud Widget API documentation.";
      }
      var flash = document.embeds && document.embeds[id] || document.getElementById(id);
      if(flash){
        if(flash.api_getFlashId){
          return flash;
        }else{
          throw "The SoundCloud player External Interface is not accessible. Check that allowscriptaccess is set to 'always' in embed code";
        }
      }else{
        throw "The SoundCloud player with an id " + id + " couldn't be found";
      }
    }catch(e){
      if (console && console.error) {
       console.error(e);
      }
      throw e;
    }
  },
  // fired when player has loaded its data and is ready to accept calls from outside
  // the player will call these functions only if in it's flashvars there's a parameter enable_api=true
  // @flashId: the player id, basically the Flash node should be accessible to JS with soundcloud.getPlayer(flashId)
  // @data: an object containing .mediaType (eg. 'set', 'track', 'group', etc,) .mediaId (e.g. '4532')
  // in buffering events data contains also .percent = (e.g. '99')
  onPlayerReady: function(flashId, data) {
    this._redispatch('onPlayerReady', flashId, data);
  },
  // fired when player starts playing current track (fired only once per track)
  onMediaStart : function(flashId, data) {
    this._redispatch('onMediaStart', flashId, data);
  },
  // fired when the track/playlist has finished playing
  onMediaEnd : function(flashId, data) {
    this._redispatch('onMediaEnd', flashId, data);
  },
  // fired when player starts playing current track (fired on every play, seek)
  onMediaPlay : function(flashId, data) {
    this._redispatch('onMediaPlay', flashId, data);
  },
  // fired when track was paused
  onMediaPause : function(flashId, data) {
    this._redispatch('onMediaPause', flashId, data);
  },
  // fired when the player is still buffering, means you can't seek in the track fully yet
  onMediaBuffering : function(flashId, data) {
    this._redispatch('onMediaBuffering', flashId, data);
  },
  // fired when the player is done buffering and the whole track length is seekable
  onMediaDoneBuffering : function(flashId, data) {
    this._redispatch('onMediaDoneBuffering', flashId, data);
  }
};
