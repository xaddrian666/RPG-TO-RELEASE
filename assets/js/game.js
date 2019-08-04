function Game() {

  // this.gamename = "ADRN";

  this.socket = io();
  this.players = [];
  this.interactions = [];
  this.tilesize = 16;
  this.activeCamera = {x:0, y:0};
  this.blocks = {
    grass: {walk_sounds: [{name: "footstep_grass_01"}, {name: "footstep_grass_02"}]},
    concrete: {walk_sounds: [{name: "footstep_concrete_01"}, {name: "footstep_concrete_02"}]},
    wooden: {walk_sounds: [{name: "footstep_wood_01"}, {name: "footstep_wood_02"}]},
    dirt: {walk_sounds: [{name: "footstep_dirt_01"}, {name: "footstep_dirt_02"}]}
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
      that.mouse.clickEvent = undefined;

      // that.mouse.check.buttons(that);
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

  this.IsIntersecting = function(a, b, c, d) {
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

  this.loadImages = function(sources) {
    return new Promise(resolve => {
      console.log("Loading images");
      that = this;
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

  this.loadSounds = function(sources) {
    return new Promise(resolve => {
      console.log("Loading sounds");
      that = this;
      sources = this.data.sounds;
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

  this.loadPlayerData = function() {
    return new Promise(resolve => {
      game.socket.emit('get userdata from db', game.gamename);
      game.socket.on('retrieve userdata', function(res) {
        console.log(res);
        game.player.characters = [];
        $.each(res, function(i, v) {
          game.player.characters.push({name: v.character_name, id: v.slot_id, sprite: v.sprite_id, x:v.pos_x, y:v.pos_y, location:v.location});
        });
        // char_id = prompt();
        char_id = 1;
        $.each(game.data.characters[game.player.characters[char_id].sprite], function(i, v) {
          game.player.character.sprite[i] = v;
        });
        game.player.location.name = game.player.characters[char_id].location;
        game.player.character.name = game.player.characters[char_id].name;
        game.player.position.x = game.player.characters[char_id].x;
        game.player.position.y = game.player.characters[char_id].y;
        game.player.canvas_position.x = game.player.characters[char_id].x;
        game.player.canvas_position.y = game.player.characters[char_id].y;
        resolve();
      });
    });
  }

  this.setupListeners = function() {
    game.socket.on('get entities', function(data) {
      game.player.location.entities.push(new game.Entity(data));
      game.player.location.entities[data.id].init();
    });
  }

  this.getPropertyValue = function(array, name) {
    return array.filter(function(key) { return key.name == name; })[0].value;
  }

  this.init = function() {
    that = this;
    return new Promise(resolve => {
      console.log("Loading started..");
      that.setupListeners();
      resolve(this);
    })
    .then(this.loadData.bind(this))
    .then(function(that){
      return that.loadImages(that.menuImages)
    })
    .then(this.loadSounds.bind(this))
    .then(this.loadFonts.bind(this))
    .then(function() {
      return new Promise(resolve => {
        console.log("Turning on some functions");
        that.turnOnKeyboard();

        // that.activeScene = that.scenes.menu;
        that.mouseEvent();
        $.each(that.scenes, function(index, value) {
          value.canvas.width = that.properties.width;
          value.canvas.height = that.properties.height;
          value.getContext();
          if(value.init) {
            value.init();
          }
        });
        resolve();
      });
    })
    // .then(function(){
    //   return new Promise(resolve => {
    //     that.socket.emit('get userdata from db', that.gamename);
    //     that.socket.on('retrieve userdata', function(res) {
    //       console.log(res);
    //       that.player.characters = [];
    //       $.each(res, function(i, v) {
    //         that.player.characters.push({name: v.character_name, id: v.slot_id, sprite: v.sprite_id, x:v.pos_x, y:v.pos_y});
    //       });
    //       resolve();
    //     });
    //   });
    // })
    .then(function(){
      console.log("Loading game..");
      // game.gamename = prompt();
      game.gamename = "ADRN";
      return Promise.resolve();
    })
    .then(this.loadPlayerData)
    .then(function() {
      return that.loadImages(that.data.gameImages)
    })
    .then(this.loadMap.bind(this))
    .then(function(canvas) {
      game.socket.on('get players', function(arr) {
        $.each(arr, function(i, v) {
          if(v.character.name != game.player.character.name) {
            game.players.push(v);
          }
        });
      });
      game.player.screen = canvas;
      game.activeCamera = game.player.camera;
      game.activeScene = game.scenes.playing;
    })
    .then(function(){
      that.turnOnChat();
    })
    .then(this.update.bind(this));
    // this.update();
  }

  Game.prototype.player = {
    location: {},
    screen: undefined,
    camera: {
      x:0,
      y:0,
      setup: function() {
        px = game.player.position.x - Math.abs(game.activeCamera.x);
        py = game.player.position.y - Math.abs(game.activeCamera.y);

        this.x = -(px - that.canvas.width / 2);
        if(this.x > 0) {
          this.x = 0;
        } else if(Math.abs(this.x) - that.tilesize*2 > (that.player.location.data.width)*(that.tilesize)) {
          this.x = -((that.player.location.data.width*(that.tilesize*2))-that.canvas.width);
        }
        this.y = -(py - that.canvas.height / 2);
        if(this.y > 0) {
          this.y = 0;
        } else if(Math.abs(this.y) - that.tilesize*2 > (that.player.location.data.height*(that.tilesize*2))-that.canvas.height) {
          this.y = -((that.player.location.data.height*(that.tilesize*2))-that.canvas.height);
        }
      },
      move: function(dir) {
        if(that.player.canvas_position.x + that.player.fov >= that.canvas.width && dir == "right" && that.activeCamera.x > -that.player.location.data.width * (that.tilesize*2) + that.canvas.width + that.player.speed) {
          that.player.camera.x -= that.player.speed;
          $.each(that.player.location.tiles, function(index, value){
            that.player.location.tiles[index].x -= that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.x - that.player.fov <= 0 && dir == "left" && that.activeCamera.x < 0 - that.player.speed) {
          that.player.camera.x -= -that.player.speed;
          $.each(that.player.location.tiles, function(index, value){
            that.player.location.tiles[index].x -= -that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.y + that.player.fov >= that.canvas.height && dir == "down" && that.activeCamera.y > -that.player.location.data.height * (that.tilesize*2) + that.canvas.height + that.player.speed) {
          that.player.camera.y -= that.player.speed;
          $.each(that.player.location.tiles, function(index, value){
            that.player.location.tiles[index].y -= that.player.speed;
          });
          return true;
        }
        if(that.player.canvas_position.y - that.player.fov <= 0 && dir == "up" && that.activeCamera.y < 0 - that.player.speed) {
          that.player.camera.y -= -that.player.speed;
          $.each(that.player.location.tiles, function(index, value){
            that.player.location.tiles[index].y -= -that.player.speed;
          });
          return true;
        }
        return false;
      }
    },
    canvas_position: {x:null, y:null},
    position: {x:null, y:null, current_tile: undefined},
    size: {width: 20, height: 12},
    speed: 2.3,
    state: "idle",
    follower: undefined,
    fov: 200,
    character: {
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
      },
      stats: {
        max_hp: 120,
        curr_hp: 60
      }
    },
    footsteps: function() {
      that.player.getCurrentTile();
      n = 0;
      if(this.moving.left.state == true) n++;
      if(this.moving.right.state == true) n++;
      if(this.moving.up.state == true) n++;
      if(this.moving.down.state == true) n++;
      if(this.position.current_tile) {
        let isThereAFloor = this.position.current_tile.filter(function(key) {
          let isFloor = false;
          $.each(key.block, function(i, v) {
          	if(i == "block_type" && v == "floor") isFloor = true;
          });
          if(isFloor == true) return true;
          else return false;
        });
        var theFloor;
        if(isThereAFloor.length == 1) {
          theFloor = isThereAFloor[0];
        } else {
          theFloor = isThereAFloor[isThereAFloor.length-1];
        }
        if(theFloor) {
          rn = Math.floor(Math.random() * that.blocks[theFloor.block.floor_type].walk_sounds.length);

          if(this.step_phase % (20 * n) == 0) {
            that.playSound(that.blocks[theFloor.block.floor_type].walk_sounds[this.step].name, 0.1);
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

      let can_go = true;
      let the_tiles = [];
      $.each(this.location.tiles, function(index, value) {
        if(that.isColliding(value.x, value.y, that.tilesize*2, that.tilesize*2, newpos.cx, newpos.cy, that.player.size.width, that.player.size.height) == true) {
          the_tiles.push(value);
        }
      });

      $.each(the_tiles, function(i, v) {
        if(can_go == true || can_go == false) {
          if(v.block) {
            if(v.block.collision) {
              console.log(v);
              if(v.block.collision.type == "polygon") {
                      block_lines = v.block.collision.lines;
                      player_lines = that.rectToLines({x:newpos.x, y:newpos.y, width:that.player.size.width, height:that.player.size.height});
                      $.each(player_lines, function(index, value) {
                        for(var i=0;i<block_lines.length;i++) {
                          if(i==block_lines.length-1) {
                            second = 0;
                          } else {
                            second = i+1;
                          }
                          check = that.IsIntersecting({X: value.p1.x, Y:value.p1.y}, {X: value.p2.x, Y:value.p2.y}, {X: (block_lines[i].x * 2)+(v.x - that.activeCamera.x), Y:(block_lines[i].y * 2)+(v.y - that.activeCamera.y)}, {X: (block_lines[second].x * 2)+(v.x - that.activeCamera.x), Y:(block_lines[second].y * 2)+(v.y - that.activeCamera.y)});
                          if(check.seg1 == true && check.seg2 == true) {
                            can_go = false;
                            break;
                            return false;
                          }
                        }
                      });
                      if(can_go == false) {
                        return true;
                      }
              } else if(v.block.collision.type == "rect") {
                if(that.isColliding((v.block.collision.x*2) + v.x, (v.block.collision.y*2) + v.y, v.block.collision.width*2, v.block.collision.height*2, newpos.cx, newpos.cy, that.player.size.width, that.player.size.height) == true) {
                  can_go = false;
                  return true;
                }
              }
            } else if(v.block.solid == true) {
                can_go = false;
                return true;
            }
          }
          if(v.walkable) {
            can_go = true;
          }
        }
      });

      if(can_go == true && newpos.x > 0 && newpos.y > 0 && newpos.x < (that.player.location.data.width * (that.tilesize * 2)) && newpos.y < (that.player.location.data.height * (that.tilesize * 2))) {
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
    utilities: {
      keys: {
        65: "left",
        68: "right",
        87: "up",
        83: "down"
      }
    },
    step_phase: 0,
    step: 0,
    facing: [],
    movement: function() {
      $(document).bind("keydown", function(e) {
        if(e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83) {
          that.player.moving[that.player.utilities.keys[e.keyCode]].state = true;
          var index = that.player.facing.indexOf(that.player.utilities.keys[e.keyCode]);
          if(index == -1) {
            that.player.facing.push(that.player.utilities.keys[e.keyCode]);
          }
        }
      });
      $(document).bind("keyup", function(e) {
        if(e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83) {
          that.player.moving[that.player.utilities.keys[e.keyCode]].state = false;
          that.player.character.sprite.sy = that.player.character.sprite.animations[that.player.utilities.keys[e.keyCode]][2].sy;
          that.player.character.sprite.sx = that.player.character.sprite.animations[that.player.utilities.keys[e.keyCode]][2].sx;
          var index = that.player.facing.indexOf(that.player.utilities.keys[e.keyCode]);
          if(index != -1) {
            that.player.facing.splice(index, 1);
          }
        }
      });
    },
    getCurrentTile: function() {
      tx = Math.floor((this.position.x + this.size.width/2) / (that.tilesize * 2));
      ty = Math.floor((this.position.y + this.size.height/2) / (that.tilesize * 2));
      tile = (ty * game.player.location.data.width) + tx;

      id = that.player.location.tiles.filter(function(key) {
        return key.id == tile;
      });
      this.position.current_tile = id;
    },
    init: function() {
      this.getCurrentTile();
      this.camera.setup();
      this.movement();
      game.socket.emit('player joined', this);
    },
    draw: function() {
        game.activeScene.context.imageSmoothingEnabled = false;
        game.activeScene.context.drawImage(this.character.sprite.image, this.character.sprite.sx, this.character.sprite.sy, this.character.sprite.width, this.character.sprite.height, this.canvas_position.x - ((this.character.sprite.width*2) - this.size.width)/2, this.canvas_position.y - this.character.sprite.height*2 + this.size.height, 2*this.character.sprite.width, 2*this.character.sprite.height);
        // game.activeScene.context.font = "13px Pixelbroidery";
        // game.activeScene.context.textAlign = "center";
        // measure = game.activeScene.context.measureText(this.character.name);
        // game.activeScene.context.fillStyle = "white";
        // game.activeScene.context.strokeStyle = "black";
        // game.activeScene.context.lineWidth = 2;
        // game.activeScene.context.strokeText(this.character.name, this.canvas_position.x+(this.character.sprite.width*2 - (measure.width/2))/2, this.canvas_position.y - this.character.sprite.height-20);
        // game.activeScene.context.fillText(this.character.name, this.canvas_position.x+(this.character.sprite.width*2 - (measure.width/2))/2, this.canvas_position.y - this.character.sprite.height-20);

        // context.beginPath();
        // context.fillStyle = "black";
        // context.rect(this.canvas_position.x, this.canvas_position.y, this.size.width, this.size.height);
        // context.fill();
        // if(this.position.current_tile) {
        //   context.beginPath();
        //   context.rect(this.position.current_tile.x, this.position.current_tile.y, 32, 32);
        //   context.strokeStyle = "red";
        //   context.stroke();
        // }
    },
    update: function() {
      let THIS = this;
      $.each(this.moving, function(index, result) {
        if(result.state == true) {
          THIS.camera.move(index);
          is_moving = THIS.move(result.value, result.coord);
          id = THIS.facing.length-1;
          if(is_moving) {
            if(THIS.follower != undefined) {
              THIS.follower.setTarget(THIS.position.x, THIS.position.y);
            }
            that.socket.emit('update player info', "position", {name:THIS.character.name, value:THIS.position});
            THIS.step_phase++;
            THIS.character.sprite.sx = THIS.character.sprite.animations[THIS.facing[id]][THIS.step].sx;
            THIS.character.sprite.sy = THIS.character.sprite.animations[THIS.facing[id]][THIS.step].sy;
            THIS.footsteps();
          } else {
            THIS.character.sprite.sx = THIS.character.sprite.animations[THIS.facing[id]][2].sx;
            THIS.character.sprite.sy = THIS.character.sprite.animations[THIS.facing[id]][2].sy;
          }
        }
      });
      this.canvas_position.x = this.position.x - Math.abs(game.activeCamera.x);
      this.canvas_position.y = this.position.y - Math.abs(game.activeCamera.y);
    }
  }

  this.keyboardKeys = {
    INTERACTION: {
      key: 69, //E
      event: undefined
    }
  }

  this.turnOnKeyboard = function() {

    document.addEventListener("keydown", function(e) {
      if(e.keyCode == that.keyboardKeys.INTERACTION.key) {
        if(that.keyboardKeys.INTERACTION.event != undefined) {
          that.keyboardKeys.INTERACTION.event();
        }
      }
    });
  }

  this.animationFrame;

  this.update = function() {
    this.animationFrame = requestAnimationFrame(this.update.bind(this));
    this.fpsCounter();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.player.update();

    $.each(game.player.location.entities, function(i, v) {
      v.update();
    });

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
