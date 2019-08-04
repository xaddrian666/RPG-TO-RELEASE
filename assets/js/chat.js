Game.prototype.turnOnChat = function() {
  el = document.createElement("div");
  el.setAttribute("id", "game-chat");

  text_input = document.createElement("input");
  text_input.setAttribute("id", "chat-input");
  text_input.setAttribute("type", "text");

  messages = document.createElement("div");
  messages.setAttribute("id", "messages");

  arrow = document.createElement("div");
  arrow.setAttribute("id", "arrow");
  $(arrow).css({
    "background-color": "red",
    "background": "url(sprites/_sheet_arrows.png) -72px -146px",
    "background-size": "192px 192px"
  });

  // $(arrow).mouseenter(function(){
  //   $(this).css({
  //   "background-position": "-72px -162px"
  //   });
  // });
  //
  // $(arrow).mouseleave(function(){
  //   $(this).css({
  //   "background-position": "-72px -146px"
  //   });
  // });

  $(el).html(messages);
  $(el).append(text_input);
  $(el).append(arrow);

  var toggled = true;
  $(arrow).click(function(){
    $(messages).toggle();
    $(text_input).toggle();
    if(toggled) {
      $(el).width(16);
      $(el).height(20);
      $(arrow).css({
        "background-position": "-70px -112px",
      });
      toggled = false;
    } else {
      $(el).width(300);
      $(el).height(200);
      $(arrow).css({
        "background-position": "-72px -146px",
      });
      toggled = true;
    }
  });

  $("#canvas-box").append(el);

  $(text_input).click(function() {
    $(document).unbind("keydown");
    $(document).unbind("keyup");
  });

  $("#game").click(function() {
    game.player.movement();
  });

  $("#chat-input").submit(function() {
    game.socket.emit('chat message', game.player.character.name + ": " +$(this).val());
    $(this).val("")
  });

  game.socket.on('chat message', function(txt) {
    $("#messages").append("<li>"+txt+"</li>");
  });

  $("#chat-input").keypress(function(e) {
    if(e.keyCode == 13) {
      $("#chat-input").submit();
    }
  });
}
