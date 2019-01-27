Game.prototype.entities = [];

Game.prototype.Entity = function(type, x, y, can_move) {
  this.type = type;
  this.can_move = can_move;
  this.position = {
    x: x,
    y: y
  },
  this.canvas_position = {
    x: this.position.x + Math.round(game.activeCamera.x),
    y: this.position.y + Math.round(game.activeCamera.y)
  }

  this.getPosition = function() {
    this.canvas_position.x = this.position.x + Math.round(game.activeCamera.x);
    this.canvas_position.y = this.position.y + Math.round(game.activeCamera.y);
  }

  if(this.can_move) {
    this.move = function() {

    }
  }

  this.img = new Image();

  this.init = function() {
    this.img.src = type.src;
    delete this.init;
  }

  this.draw = function() {
    game.activeScene.context.drawImage(this.img, this.type.sx, this.type.sy, this.type.width, this.type.height, this.canvas_position.x, this.canvas_position.y, this.type.width*2, this.type.height*2);
  }

  this.update = function() {
    this.getPosition();
    this.draw();
  }
}
