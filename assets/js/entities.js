Game.prototype.Entity = function(config) {
  this.id = game.location.entities.length;
  this.type = game.data.entities[config.type];
  this.speed = 2;
  this.state = undefined;
  this.size = {
    width: this.type.width,
    height: this.type.height
  }

  this.position = {
    x: config.x,
    y: config.y
  }

  this.canvas_position = {
    x: this.position.x + Math.round(game.activeCamera.x),
    y: this.position.y + Math.round(game.activeCamera.y)
  }

  this.getPosition = function() {
    this.canvas_position.x = this.position.x + Math.round(game.activeCamera.x);
    this.canvas_position.y = this.position.y + Math.round(game.activeCamera.y);
  }

  let frame = 0;

  this.step = 0;

  this.setTarget = function(nx, ny) {
    this.target = {
      x: nx,
      y: ny
    }
    this.faceTo(nx + Math.round(game.activeCamera.x), ny + Math.round(game.activeCamera.y));

    if(Math.abs(this.position.x - nx) > 300 || Math.abs(this.position.y - ny) > 300) {
      this.position.x = nx;
      this.position.y = ny;
    } else {
      this.state = this.move;
    }
  }

  this.move = function() {
    frame++;
    let dx = this.target.x - this.position.x;
    let dy = this.target.y - this.position.y;
    let vel = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
    if(vel <= 1) {
      this.state = undefined;
      this.target.x = undefined;
      this.target.y = undefined;
    }
    if (vel) {
      dx /= vel;
      dy /= vel;
    }
    this.position.x += dx;
    this.position.y += dy;

    if(frame % 15 == 0) {
      if(this.step == 0) {
        this.step = 1;
      } else {
        this.step = 0;
      }
    }
  }

  this.faceTo = function(x, y) {
    angles = [
      {direction: "left", angle: 360},
      {direction: "right", angle: 180},
      {direction: "up", angle: 90},
      {direction: "down", angle: 270}
    ]
    var angleDeg = Math.atan2((this.canvas_position.y + this.type.height/2) - y, (this.canvas_position.x + this.type.width/2) - x) * 180 / Math.PI;
    if(angleDeg < 0) {
      angleDeg = Math.abs(angleDeg+360);
    }
    closest = undefined;
    closest_dir = undefined;
    $.each(angles, function(i, v) {
      if(v.direction == "left" && angleDeg > 180) {
        v.angle = 360;
      } else if(v.direction == "left" && angleDeg < 180) {
        v.angle = 0;
      }
      if(closest == undefined || closest > Math.abs(v.angle-angleDeg)) {
        closest = Math.abs(v.angle-angleDeg);
        closest_dir = v.direction;
      }
    });
    this.facing = closest_dir;
  }

  this.img = new Image();

  this.init = function() {
    if(config.name) this.name = config.name;
    if (config.location) this.location = config.location;
    if (config.area) this.area = config.area;
    this.facing = !config.facing ? "down" : config.facing;
    let _that = this;
    game.socket.on("move entity"+this.id, function(obj) {
      _that.setTarget(obj.x, obj.y);
    });
    this.img.src = this.type.src;
    delete this.init;
  }

  this.draw = function() {
    game.activeScene.context.beginPath();
    if(this.name) {
      game.activeScene.context.font = "13px Pixelbroidery";
      game.activeScene.context.textAlign = "center";
      game.activeScene.context.fillStyle = "white";
      game.activeScene.context.strokeStyle = "black";
      game.activeScene.context.lineWidth = 2;
      game.activeScene.context.strokeText(this.name, this.canvas_position.x+this.size.width/2, this.canvas_position.y - this.type.animations[this.facing][this.step].height*2);
      game.activeScene.context.fillText(this.name, this.canvas_position.x+this.size.width/2, this.canvas_position.y - this.type.animations[this.facing][this.step].height*2);
    }
    if(this.state == this.move) {
      // game.activeScene.context.beginPath();
      // game.activeScene.context.moveTo(this.canvas_position.x + this.type.animations[this.facing][this.step].width/2, this.canvas_position.y - this.type.animations[this.facing][this.step].height);
      // game.activeScene.context.lineTo(this.target.x + game.activeCamera.x, this.target.y + game.activeCamera.y);
      // game.activeScene.context.stroke();
      // game.activeScene.context.closePath();
      game.activeScene.context.drawImage(this.img, this.type.animations[this.facing][this.step].sx, this.type.animations[this.facing][this.step].sy, this.type.animations[this.facing][this.step].width, this.type.animations[this.facing][this.step].height, this.canvas_position.x - ((this.type.animations[this.facing][2].width*2) - this.size.width)/2, this.canvas_position.y - this.type.animations[this.facing][this.step].height*2 + this.size.height, this.type.animations[this.facing][this.step].width*2, this.type.animations[this.facing][this.step].height*2);
    } else {
      game.activeScene.context.drawImage(this.img, this.type.animations[this.facing][2].sx, this.type.animations[this.facing][2].sy, this.type.animations[this.facing][2].width, this.type.animations[this.facing][2].height, this.canvas_position.x - ((this.type.animations[this.facing][2].width*2) - this.size.width)/2, this.canvas_position.y - this.type.animations[this.facing][2].height*2 + this.size.height, this.type.animations[this.facing][2].width*2, this.type.animations[this.facing][2].height*2);
    }
    game.activeScene.context.closePath();
  }

  this.update = function() {
    if(this.state != undefined) {
      this.state();
    }
    this.getPosition();
    // this.draw();
  }
}
