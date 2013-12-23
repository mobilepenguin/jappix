/*

Jappix - An open social platform
These are the chatstate JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var ChatState = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Sends a given chatstate to a given entity
     * @public
     * @param {string} state
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self.chatStateSend = function(state, xid, hash) {

        try {
            var user_type = $('#' + hash).attr('data-type');
            
            // If the friend client supports chatstates and is online
            if((user_type == 'groupchat') || ((user_type == 'chat') && $('#' + hash + ' .message-area').attr('data-chatstates') && !exists('#page-switch .' + hash + ' .unavailable'))) {
                // Already sent?
                if(getDB(DESKTOP_HASH, 'currentchatstate', xid) == state)
                    return;
                
                // Write the state
                setDB(DESKTOP_HASH, 'currentchatstate', xid, state);
                
                // New message stanza
                var aMsg = new JSJaCMessage();
                aMsg.setTo(xid);
                aMsg.setType(user_type);
                
                // Append the chatstate node
                aMsg.appendNode(state, {'xmlns': NS_CHATSTATES});
                
                // Send this!
                con.send(aMsg);
            }
        } catch(e) {
            Console.error('ChatState.send', e);
        }

    };


    /**
     * Displays a given chatstate in a given chat
     * @public
     * @param {string} state
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.displayChatState = function(state, hash, type) {

        try {
            // CODE
        } catch(e) {
            Console.error('ChatState.display', e);
        }

    };


    /**
     * Displays a given chatstate in a given chat
     * @public
     * @param {string} state
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.displayChatState = function(state, hash, type) {

        try {
            // Groupchat?
            if(type == 'groupchat') {
                resetChatState(hash, type);
                
                // "gone" state not allowed
                if(state != 'gone')
                    $('#page-engine .page-engine-chan .user.' + hash).addClass(state);
            }
            
            // Chat
            else {
                // We change the buddy name color in the page-switch
                resetChatState(hash, type);
                $('#page-switch .' + hash + ' .name').addClass(state);
                
                // We generate the chatstate text
                var text = '';
                
                switch(state) {
                    // Active
                    case 'active':
                        text = _e("Your friend is paying attention to the conversation.");
                        
                        break;
                    
                    // Composing
                    case 'composing':
                        text = _e("Your friend is writing a message...");
                        
                        break;
                    
                    // Paused
                    case 'paused':
                        text = _e("Your friend stopped writing a message.");
                        
                        break;
                    
                    // Inactive
                    case 'inactive':
                        text = _e("Your friend is doing something else.");
                        
                        break;
                    
                    // Gone
                    case 'gone':
                        text = _e("Your friend closed the chat.");
                        
                        break;
                }
                
                // We reset the previous state
                $('#' + hash + ' .chatstate').remove();
                
                // We create the chatstate
                $('#' + hash + ' .content').after('<div class="' + state + ' chatstate">' + text + '</div>');
            }
        } catch(e) {
            Console.error('ChatState.display', e);
        }

    };


    /**
     * Resets the chatstate switcher marker
     * @public
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.resetChatState = function(hash, type) {

        try {
            // Define the selector
            var selector;
            
            if(type == 'groupchat')
                selector = $('#page-engine .page-engine-chan .user.' + hash);
            else
                selector = $('#page-switch .' + hash + ' .name');
            
            // Reset!
            selector.removeClass('active')
            selector.removeClass('composing')
            selector.removeClass('paused')
            selector.removeClass('inactive')
            selector.removeClass('gone');
        } catch(e) {
            Console.error('ChatState.reset', e);
        }

    };


    /**
     * Adds the chatstate events
     * @public
     * @param {object} target
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.eventsChatState = function(target, xid, hash, type) {

        try {
            target.keyup(function(e) {
                if(e.keyCode != 13) {
                    // Composing a message
                    if($(this).val() && (getDB(DESKTOP_HASH, 'chatstate', xid) != 'on')) {
                        // We change the state detect input
                        setDB(DESKTOP_HASH, 'chatstate', xid, 'on');
                        
                        // We send the friend a "composing" chatstate
                        chatStateSend('composing', xid, hash);
                    }
                    
                    // Flushed the message which was being composed
                    else if(!$(this).val() && (getDB(DESKTOP_HASH, 'chatstate', xid) == 'on')) {
                        // We change the state detect input
                        setDB(DESKTOP_HASH, 'chatstate', xid, 'off');
                        
                        // We send the friend an "active" chatstate
                        chatStateSend('active', xid, hash);
                    }
                }
            });
            
            target.change(function() {
                // Reset the composing database entry
                setDB(DESKTOP_HASH, 'chatstate', xid, 'off');
            });
            
            target.focus(function() {
                // Not needed
                if(target.is(':disabled'))
                    return;
                
                // Something was written, user started writing again
                if($(this).val())
                    chatStateSend('composing', xid, hash);

                // Chat only: Nothing in the input, user is active
                else if(type == 'chat')
                    chatStateSend('active', xid, hash);
            });
            
            target.blur(function() {
                // Not needed
                if(target.is(':disabled'))
                    return;
                
                // Something was written, user paused
                if($(this).val())
                    chatStateSend('paused', xid, hash);

                // Chat only: Nothing in the input, user is inactive
                else if(type == 'chat')
                    chatStateSend('inactive', xid, hash);
            });
        } catch(e) {
            Console.error('ChatState.events', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();