function Game() {

  this.map = undefined;
  this.tilesets = {};
  this.textures = [];
  this.tilesize = 16;
  this.activeCamera = {x:0, y:0};
  this.tiles = [];
  this.blocks = {
    grass: {walk_sounds: [{name: "footstep_grass_01"}, {name: "footstep_grass_02"}]},
    concrete: {walk_sounds: [{name: "footstep_concrete_01"}, {name: "footstep_concrete_02"}]},
    wooden: {walk_sounds: [{name: "footstep_wood_01"}, {name: "footstep_wood_02"}]},
    dirt: {walk_sounds: [{name: "footstep_dirt_01"}, {name: "footstep_dirt_02"}]}
    // 2937: {animation: [{tileid: 2937}, {tileid: 2940}, {tileid: 2943}]}
  };

  this.properties = {
    width: 768,
    height: 480,
    fpsCounter: true
  }

  this.fonts = {
    name: "Pixelbroidery", src: new FontFace("Pixelbroidery", "url(../../fonts/Pixelbroidery.ttf)")
  }

  this.canvas = document.getElementById("game");
  this.ctx = this.canvas.getContext("2d");

  var lastCalledTime;
  this.fps;

  this.fpsCounter = function() {
    if(!lastCalledTime) {
       lastCalledTime = Date.now();
       this.fps = 0;
       return;
    }
    delta = (Date.now() - lastCalledTime)/1000;
    lastCalledTime = Date.now();
    this.fps = 1/delta;
  }

  this.mouse = {
    x:0,
    y:0,
    clickEvent: undefined,
    check: {
      buttons: function(that) {
        $.each(that.menu.buttons, function(index, value) {
          if(!value.active) {
            that.mouse.clickEvent = undefined;
          }
        });
      }
    }
  }

  this.mouseEvent = function() {
    that = this;
    document.addEventListener("mousemove", function(e) {
      that.mouse.x = e.clientX - $("#game").offset().left;
      that.mouse.y = e.clientY - $("#game").offset().top;

      that.mouse.check.buttons(that);
    });

    $("canvas").click(function() {
      if(that.mouse.clickEvent != undefined) {
        that.mouse.clickEvent();
      }
    });
  }

  this.playSound = function(snd, vlm) {
    toplay = this.sounds[snd].cloneNode();
    toplay.volume = vlm;
    toplay.play();
  }

  this.playSingleSound = function(snd, vlm) {
    toplay = this.sounds[snd];
    toplay.volume = vlm;
    toplay.play();
  }

  this.isColliding = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 < x2 + w2 &&
     x1 + w1 > x2 &&
     y1 < y2 + h2 &&
     h1 + y1 > y2) {
      return true;
    }
    return false;
  }

  this.rectToLines = function(rect) {
    let lines = [];

    lines[0] = {};
    lines[0].p1 = {x:rect.x, y:rect.y};
    lines[0].p2 = {x:rect.x+rect.width, y:rect.y};

    lines[1] = {};
    lines[1].p1 = {x:rect.x+rect.width, y:rect.y};
    lines[1].p2 = {x:rect.x+rect.width, y:rect.y+rect.height};

    lines[2] = {};
    lines[2].p1 = {x:rect.x+rect.width, y:rect.y+rect.height};
    lines[2].p2 = {x:rect.x, y:rect.y+rect.height};

    lines[3] = {};
    lines[3].p1 = {x:rect.x, y:rect.y+rect.height};
    lines[3].p2 = {x:rect.x, y:rect.y};
    return lines;
  }

  this.IsIntersecting = function(a, b, c, d)
  {
      var denominator = ((b.X - a.X) * (d.Y - c.Y)) - ((b.Y - a.Y) * (d.X - c.X));
      var numerator1 = ((a.Y - c.Y) * (d.X - c.X)) - ((a.X - c.X) * (d.Y - c.Y));
      var numerator2 = ((a.Y - c.Y) * (b.X - a.X)) - ((a.X - c.X) * (b.Y - a.Y));

      // Detect coincident lines (has a problem, read below)
      if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

      var r = numerator1 / denominator;
      var s = numerator2 / denominator;

      return {
          x: a.X + (r * (b.X - a.X)),
          y: a.Y + (r * (b.Y - a.Y)),
          seg1: r >= 0 && r <= 1,
          seg2: s >= 0 && s <= 1
      };
  }

  this.data = [];

  this.loadData = function() {
    that = this;
    return new Promise(resolve => {
      console.log("Loading data");
      that = this;
      $.ajax({
        dataType: "json",
        url: "assets/json/data.json",
        success: function(data) {
          that.data = data;
          that.menuImages = data.menuImages;
          resolve(that);
        }
      })
    });
  }

  this.images = {};
  this.sounds = {};

  this.loadImages = function() {
    return new Promise(resolve => {
      console.log("Loading images");
      that = this;
      sources = this.menuImages;
      $.each(sources, function(index, value) {
        let img = new Image();
        img.src = value.src;
        img.onload = function() {
          that.images[value.name] = img;
          if(index == sources.length-1) {
            resolve();
          }
        }
      });
    });
  }

  this.loadSounds = function() {
    return new Promise(resolve => {
      console.log("Loading sounds");
      that = this;
      sources = [
        {title: "button1", src: "./sounds/Button7.mp3"},
        {title: "button2", src: "./sounds/Button 3.mp3"},
        {title: "footstep_grass_01", src: "./sounds/footstep_grass_run_08.wav"},
        {title: "footstep_grass_02", src: "./sounds/footstep_grass_run_09.wav"},
        {title: "footstep_concrete_01", src: "./sounds/footstep_concrete_run_01.wav"},
        {title: "footstep_concrete_02", src: "./sounds/footstep_concrete_run_02.wav"},
        {title: "footstep_wood_01", src: "./sounds/footstep_wood_run_01.wav"},
        {title: "footstep_wood_02", src: "./sounds/footstep_wood_run_02.wav"},
        {title: "footstep_dirt_01", src: "./sounds/footstep_dirt_walk_run_01.wav"},
        {title: "footstep_dirt_02", src: "./sounds/footstep_dirt_walk_run_02.wav"}
      ];
      $.each(sources, function(index, value) {
        let audio = new Audio(value.src);
        audio.autoplay = false;
        audio.volume = 0.3;
        audio.onloadeddata = function() {
          // that.sounds.push(audio);
          that.sounds[value.title] = audio;
        }
      });
      checker = setInterval(function() {
        if(Object.keys(that.sounds).length == sources.length) {
          clearInterval(checker);
          resolve();
        }
      }, 200);
    });
  }

  this.loadFonts = function() {
    return new Promise(resolve => {
      console.log("Loading fonts");
      this.fonts.src.load().then(function(loaded_face) {
        document.fonts.add(loaded_face);
        resolve();
      });
    });
  }

  this.init = function() {
    that = this;
    return new Promise(resolve => {
      console.log("Loading started..");
      resolve(this);
    })
    .then(this.loadData.bind(this))
    .then(function(that) {
      return that.loadImages(that.images, that.menuImages);
    })
    .then(this.loadSounds.bind(this))
    .then(this.loadFonts.bind(this))
    .then(function() {
      return new Promise(resolve => {
        console.log("Turning on some functions");
        // that.activeScene = that.scenes.menu;
        that.mouseEvent();
        $.each(that.scenes, function(index, value) {
          value.canvas.width = that.properties.width;
          value.canvas.height = that.properties.height;
          value.getContext();
        });

        resolve();
      });
    })
    .then(this.loadGame.bind(this))
    .then(this.update.bind(this));
    // this.update();
  }

  this.locations = {
    woodlands: {name: "Woodlands", src: "maps/woodlands.json"}
  }

  this.player = {
    location: this.locations.woodlands,
    screen: undefined,
    camera: {
      x:0,
      y:0,
      setup: function() {
        px = that.player.canvas_position.x;
        py = that.player.canvas_position.y;
        this.x = -(px - that.canvas.width / 2);
        this.y = -(py - that.canvas.height / 2);
      },
      move: function(dir) {
        if(that.player.canvas_position.x + that.player.fov >= that.canvas.width && dir == "right" && that.activeCamera.x > -that.map.width * (that.tilesize*2) + that.canvas.width + that.player.speed) {
          that.player.camera.x -= that.player.speed;
          $.each(that.tiles, function(index, value){
            that.tiles[index].x -= that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.x - that.player.fov <= 0 && dir == "left" && that.activeCamera.x < 0 - that.player.speed) {
          that.player.camera.x -= -that.player.speed;
          $.each(that.tiles, function(index, value){
            that.tiles[index].x -= -that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.y + that.player.fov >= that.canvas.height && dir == "down" && that.activeCamera.y > -that.map.height * (that.tilesize*2) + that.canvas.height + that.player.speed) {
          that.player.camera.y -= that.player.speed;
          $.each(that.tiles, function(index, value){
            that.tiles[index].y -= that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.y - that.player.fov <= 0 && dir == "up" && that.activeCamera.y < 0 - that.player.speed) {
          that.player.camera.y -= -that.player.speed;
          $.each(that.tiles, function(index, value){
            that.tiles[index].y -= -that.player.speed;
          });
          return true;
        }
        return false;
      }
    },
    canvas_position: {x:708, y:790},
    position: {x:708, y:790, current_tile: undefined},
    size: {width: 20, height: 12},
    speed: 2.3,
    state: "idle",
    fov: 200,
    character: {
      name: "test_Player",
      sprite: {
        image: undefined,
        load: function() {
          return new Promise(resolve => {
            _this = this;
            img = new Image();
            img.src = this.src;
            img.onload = function() {
              _this.image = img;
              resolve();
            }
          });
        }
      }
    },
    footsteps: function() {
      that.player.getCurrentTile();
      if(this.position.current_tile.block != undefined) {
        if(this.position.current_tile.block.block_type == "floor") {
          rn = Math.floor(Math.random() * that.blocks[this.position.current_tile.block.floor_type].walk_sounds.length);
          n = 0;
          if(this.moving.left.state == true) {
            n++;
          }
          if(this.moving.right.state == true) {
            n++;
          }
          if(this.moving.up.state == true) {
            n++;
          }
          if(this.moving.down.state == true) {
            n++;
          }
          if(this.step_phase % (20 * n) == 0) {
            that.playSound(that.blocks[this.position.current_tile.block.floor_type].walk_sounds[this.step].name, 0.1);
          }
        }
      }
      if(this.step_phase % (10 * n) == 0) {
        if(this.step == 0) {
          this.step = 1;
        } else {
          this.step = 0;
        }
      }
    },
    move: function(value, coord) {
      newpos = {x:this.position.x, y:this.position.y, cx:this.canvas_position.x, cy:this.canvas_position.y};
      newpos[coord] += value * (this.speed);
      newpos["c"+coord] += value * (this.speed);

      let the_tiles = [];
      $.each(that.tiles, function(index, value) {
        if(that.isColliding(value.x, value.y, that.tilesize*2, that.tilesize*2, newpos.cx, newpos.cy, that.player.size.width, that.player.size.height) == true) {
          the_tiles.push(value);
        }
      });
      solid = true;
      collide = false;
      the_tile = the_tiles[the_tiles.length-1];

      ite = 1;
      while(the_tile.ontop) {
        the_tile = the_tiles[the_tiles.length-ite];
        ite++;
      }

      // if(the_tile.ontop) {
      //   if(the_tile.ontop == true) {
      //     the_tile = the_tiles[the_tiles.length-2];
      //   }
      //   // if(the_tiles[the_tiles.length-1].block) {
      //   //   if(the_tiles[the_tiles.length-1].block.polygon_collision) {
      //   //     the_tile = the_tiles[the_tiles.length-1];
      //   //   }
      //   // }
      // }

      if(the_tile.block) {
        if(the_tile.block.polygon_collision) {
          block_lines = the_tile.block.polygon_collision;
          player_lines = that.rectToLines({x:newpos.x, y:newpos.y, width:that.player.size.width, height:that.player.size.height});
          $.each(player_lines, function(index, value) {
            for(var i=0;i<block_lines.length;i++) {
              if(i==block_lines.length-1) {
                second = 0;
              } else {
                second = i+1;
              }
              check = that.IsIntersecting({X: value.p1.x, Y:value.p1.y}, {X: value.p2.x, Y:value.p2.y}, {X: (block_lines[i].x * 2)+(the_tile.x - that.activeCamera.x), Y:(block_lines[i].y * 2)+(the_tile.y - that.activeCamera.y)}, {X: (block_lines[second].x * 2)+(the_tile.x - that.activeCamera.x), Y:(block_lines[second].y * 2)+(the_tile.y - that.activeCamera.y)});
              if(check.seg1 == true && check.seg2 == true) {
                collide = true;
                solid = false;
                break;
                return false;
              }
            }
          });
        }
        else if(the_tile.block.solid == false) {
          solid = false;
        }
      }

      if(the_tile.walkable != undefined) {
        if(the_tile.walkable == false) {
          if(the_tile.block) {
            if(the_tile.block.polygon_collision) {
              solid = false;
            } else {
              solid = true;
            }
          }
        } else {
          solid = false;
        }
      }

      if(solid == false && collide == false && newpos.x > 0 && newpos.y > 0 && newpos.x < (that.map.width * (that.tilesize * 2)) && newpos.y < (that.map.height * (that.tilesize * 2))) {
        this.position[coord] += value * this.speed;
        return true;
      }

      return false;
    },
    moving: {
      left: {state:false, value:-1, coord:"x", direction: "horizontal"},
      right: {state:false, value: 1, coord: "x", direction: "horizontal"},
      up: {state:false, value: -1, coord: "y", direction: "vertical"},
      down: {state:false, value: 1, coord: "y", direction: "vertical"}
    },
    step_phase: 0,
    step: 0,
    facing: [],
    movement: function() {
      $(document).bind("keydown", function(e) {
        if(e.keyCode == 65) {
          that.player.moving.left.state = true;
          var index = that.player.facing.indexOf("left");
          if(index == -1) {
            that.player.facing.push("left");
          }

        }
        if(e.keyCode == 68) {
          that.player.moving.right.state = true;
          // that.player.facing = "right";
          var index = that.player.facing.indexOf("right");
          if(index == -1) {
            that.player.facing.push("right")
          }
        }
        if(e.keyCode == 87) {
          that.player.moving.up.state = true;
          // that.player.facing = "up";
          var index = that.player.facing.indexOf("up");
          if(index == -1) {
            that.player.facing.push("up")
          }

        }
        if(e.keyCode == 83) {
          that.player.moving.down.state = true;
          // that.player.facing = "down";
          var index = that.player.facing.indexOf("down");
          if(index == -1) {
            that.player.facing.push("down")
          }

        }
      });
      $(document).bind("keyup", function(e) {
        if(e.keyCode == 65) {
          that.player.moving.left.state = false;
          that.player.character.sprite.sy = that.player.character.sprite.animations.left[2].sy;
          that.player.character.sprite.sx = that.player.character.sprite.animations.left[2].sx;
          var index = that.player.facing.indexOf("left");
          if(index != -1) {
            that.player.facing.splice(index, 1);
          }
        }
        if(e.keyCode == 68) {
          that.player.moving.right.state = false;
          that.player.character.sprite.sy = that.player.character.sprite.animations.right[2].sy;
          that.player.character.sprite.sx = that.player.character.sprite.animations.right[2].sx;
          var index = that.player.facing.indexOf("right");
          if(index != -1) {
            that.player.facing.splice(index, 1);
          }
        }
        if(e.keyCode == 87) {
          that.player.moving.up.state = false;
          that.player.character.sprite.sy = that.player.character.sprite.animations.up[2].sy;
          that.player.character.sprite.sx = that.player.character.sprite.animations.up[2].sx;
          var index = that.player.facing.indexOf("up");
          if(index != -1) {
            that.player.facing.splice(index, 1);
          }
        }
        if(e.keyCode == 83) {
          that.player.moving.down.state = false;
          that.player.character.sprite.sy = that.player.character.sprite.animations.down[2].sy;
          that.player.character.sprite.sx = that.player.character.sprite.animations.down[2].sx;
          var index = that.player.facing.indexOf("down");
          if(index != -1) {
            that.player.facing.splice(index, 1);
          }
        }
      });
    },
    getCurrentTile: function() {
      tx = Math.floor((this.position.x + this.size.width/2) / (that.tilesize * 2));
      ty = Math.floor((this.position.y + this.size.height/2) / (that.tilesize * 2));
      tile = (ty * that.map.width) + tx;

      id = that.tiles.filter(function(key) {
        return key.id == tile;
      });
      $.each(id, function(index, value) {
        // that.player.position.current_tile = value;
        // that.player.position.current_tile = value;
        if(value.block) {
          if(value.block.block_type == "floor") {
            that.player.position.current_tile = value;
          }
        }
      });
    },
    init: function() {
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      //>>>>>>>>>>>>>>>>>>>>>>TEST>>>>>>>>>>>>>>>>>>>>>>
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      test = Math.floor(Math.random() * game.data.characters.length);
      console.log(test);
      $.each(game.data.characters[test], function(i, v) {
        game.player.character.sprite[i] = v;
      });
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      //<<<<<<<<<<<<<<<<<<<<<<TEST<<<<<<<<<<<<<<<<<<<<<<
      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      this.getCurrentTile();
      this.camera.setup();
      this.movement();
      game.socket = io();
      game.socket.emit('player joined', "someone has joined the game");
      game.socket.on('test', function(data) {
        game.entities.push(new game.Entity(game.data.entities[data.name], data.x, data.y));
      });
    },
    update: function() {
      $.each(this.moving, function(index, result) {
        if(result.state == true) {
          that.player.camera.move(index);
          is_moving = that.player.move(result.value, result.coord);
          id = that.player.facing.length-1;
          if(is_moving) {
            that.player.step_phase++;
            that.player.character.sprite.sx = that.player.character.sprite.animations[that.player.facing[id]][that.player.step].sx;
            that.player.character.sprite.sy = that.player.character.sprite.animations[that.player.facing[id]][that.player.step].sy;
            that.player.footsteps();
          } else {
            that.player.character.sprite.sx = that.player.character.sprite.animations[that.player.facing[id]][2].sx;
            that.player.character.sprite.sy = that.player.character.sprite.animations[that.player.facing[id]][2].sy;
          }
        }
      });
      this.canvas_position.x = that.player.position.x - Math.abs(game.activeCamera.x);
      this.canvas_position.y = that.player.position.y - Math.abs(game.activeCamera.y);
    }
  }

  this.update = function() {
    // this.activeCamera.x = Math.round(this.activeCamera.x);
    // this.activeCamera.y = Math.round(this.activeCamera.y);
    requestAnimationFrame(this.update.bind(this));
    this.fpsCounter();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    scene = this.activeScene.draw(this);
    if(scene != undefined) {
      this.ctx.drawImage(scene, 0, 0);
    }

    if(this.properties.fpsCounter == true) {
      hud = this.scenes.hud.draw(this, this.fps);
      this.ctx.drawImage(hud, 0, 0);
    }
  }
}
