Game.prototype.drawMenuScene = function(that, scn) {
  scn.context.imageSmoothingEnabled = false;
  scn.context.clearRect(0, 0, scn.canvas.width, scn.canvas.height);
  scn.context.beginPath();
  image = that.images.buttons;
  bg = that.images.background;
  scn.context.drawImage(bg, that.menu.background.x, that.menu.background.y);

  if(Math.abs(that.menu.background.x) >= bg.width - scn.canvas.width) {
    that.menu.background.xspeed = Math.abs(that.menu.background.xspeed);
  } else if(that.menu.background.x >= 0) {
    that.menu.background.xspeed = -that.menu.background.xspeed;
  }
  if(Math.abs(that.menu.background.y) >= bg.height - scn.canvas.height) {
    that.menu.background.yspeed = Math.abs(that.menu.background.yspeed);
  } else if(that.menu.background.y >= 0) {
    that.menu.background.yspeed = -that.menu.background.yspeed;
  }
  that.menu.background.x += that.menu.background.xspeed;
  that.menu.background.y += that.menu.background.yspeed;

  scn.context.fillStyle = "rgba(0,0,0,0.4)";
  scn.context.shadowColor = "transparent";
  scn.context.fillRect(0, 0, scn.canvas.width, scn.canvas.height);
  for(var i=0;i<that.menu.buttons.length;i++) {
    scn.context.beginPath();
    scn.context.imageSmoothingEnabled = false;
    current = that.menu.buttons[i];
    if(current.scene != scn.name) {
      continue;
    }
    if(that.menu.buttons[i].active == true) {
      dx = 72;
      scn.context.fillStyle = "#7b7b7b";
    } else {
      dx = 24;
      scn.context.fillStyle = "#5f8895";
    }
    scn.context.shadowColor = "transparent";
    scn.context.drawImage(image, dx, 0, 24, 8, current.x, current.y, that.menu.button.width, that.menu.button.height);
    scn.context.rect(current.x, current.y, that.menu.button.width, that.menu.button.height);
    if(scn.context.isPointInPath(that.mouse.x, that.mouse.y)) {
      if(current.active == false) {
        that.playSound("button1", 0.3);
      }
      that.mouse.clickEvent = current.action;
      current.active = true;
    }
    else {
      current.active = false;
    }
    scn.context.font = `${that.menu.font_size}px Pixelbroidery`;
    scn.context.textAlign = "center";
    scn.context.shadowOffsetX = 3;
    scn.context.shadowOffsetY = 3;
    scn.context.shadowColor = "rgba(0,0,0,0.3)";
    scn.context.fillText(current.text, current.x + that.menu.button.width / 2, current.y + that.menu.button.height / 2);
  }
  scn.context.closePath();
  return scn.canvas;
}

Game.prototype.scenes = {
  menu: {
    name: "menu",
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      return that.drawMenuScene(that, this);
    }
  },
  settings: {
    name: "settings",
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      return that.drawMenuScene(that, this);
    }
  },
  credits: {
    name: "credits",
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      return that.drawMenuScene(that, this);
    }
  },
  character_selection: {
    name: "character_selection",
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      raw = that.drawMenuScene(that, this);

      _chars = 4;
      _abp = 50; //all boxes padding
      _pbt = 50; //padding between them
      _sw = 48; //sprite width
      _sh = 48; // sprite height
      for(var i=0;i<_chars;i++) {
        x = ((that.canvas.width - (_abp * 2) - (_sh * 3)) / (_chars-1)) * i + _abp;
        // w = (that.canvas.width - (_abp * 2) - (_pbt * _chars)) / _chars;
        this.context.beginPath();
        this.context.shadowColor = "transparent";
        img = that.images.windows2;
        this.context.drawImage(img, 64, 0, _sh, _sw, x, 50, _sh * 3, _sw * 3);
        img = that.images.bars;
        this.context.drawImage(img, 49, 377, 22, 6, x, 200, 24 * 6, 6 * 6);
        this.context.fillStyle = "white";
        this.context.textAlign = "left";
        chname = "Char name";
        this.context.font = "16px Pixelbroidery";
        _tp = ((24 * 6) - this.context.measureText(chname).width) / 2; //text padding
        this.context.fillText(chname, x + _tp, 200 + 25);
      }

      return raw;
    }
  },
  playing: {
    name: "playing",
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      that.player.update();
      this_scene = this;
      // this.context.drawImage(that.player.screen, that.activeCamera.x, that.activeCamera.y);
      this_scene.context.globalCompositeOperation = 'source-over';
      $.each(that.layers, function(index, value) {
        if(value.ontop == true) {
          return true;
        }
        if(Array.isArray(value.canvas) == false) {
          this_scene.context.drawImage(value.canvas, Math.round(that.activeCamera.x), Math.round(that.activeCamera.y));
        } else {
          value.fc+=50;
          if(value.fc >= 1000) {
            if(value.current_frame == value.frames-1) {
              value.current_frame = 0;
            } else {
              value.current_frame+=1;
            }
            value.fc = 0;
          }
          this_scene.context.drawImage(value.canvas[value.current_frame], Math.round(that.activeCamera.x), Math.round(that.activeCamera.y));
        }
      });
      // this.context.drawImage(that.layers[2].canvas, that.activeCamera.x, that.activeCamera.y);
      this.context.globalCompositeOperation = 'source-over';
      // this.canvas = that.drawPlayer(this.canvas, this.context);
      var above = [];
      // var above = false;

      $.each(that.layers, function(index, value) {
        if(value.ontop == false) {
          return true;
        }
        collision = false;
        if(collision == false) {
          tiles_in_layer = that.tiles.filter(function(key){ return key.layer==value.name; });
          $.each(tiles_in_layer, function(i, v) {
            check = that.isColliding(v.x, v.y, game.tilesize*2, game.tilesize*2, that.player.canvas_position.x, that.player.canvas_position.y, that.player.size.width, that.player.size.height);
            if(check == true) {
              collision = true;
              return false;
            }
          });
        }
        if(Array.isArray(value.canvas) == false) {
          if(collision == false && above.length == 0) {
            this_scene.context.drawImage(value.canvas, Math.round(that.activeCamera.x), Math.round(that.activeCamera.y));
          } else {
            above.push({img: value.canvas, x:Math.round(that.activeCamera.x), y:Math.round(that.activeCamera.y)});
          }
        } else {
          value.fc+=50;
          if(value.fc >= 1000) {
            if(value.current_frame == value.frames-1) {
              value.current_frame = 0;
            } else {
              value.current_frame+=1;
            }
            value.fc = 0;
          }
          // if(collision == false) {
          //   this_scene.context.drawImage(value.canvas[value.current_frame], that.activeCamera.x, that.activeCamera.y);
          // } else {
          //   after.push({img: value.canvas[value.current_frame], x:that.activeCamera.x, y:that.activeCamera.y});
          // }
        }
      });
      $.each(that.entities, function(i, v) {
        if(v.init) {
          v.init();
        } else {
          v.update();
        }
      });
      this.canvas = that.drawPlayer(this.canvas, this.context);
      $.each(above, function(i, v) {
        this_scene.context.drawImage(v.img, v.x, v.y);
      });
      // darkness = that.scenes.darkness.draw(that);
      // this_scene.context.drawImage(that.scenes.darkness.canvas, 0, 0);
      return this.canvas;
    }
  },
  darkness: {
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that) {
      this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.context.globalCompositeOperation = 'xor';
      this.context.fillStyle = "rgba(0,0,0,0.5)";
      this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
      this.context.fillStyle = "red";
      this.context.fillRect(that.player.position.x, that.player.position.y, 100, 100);
      return this.canvas;
    }
  },
  hud: {
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    draw: function(that, fps) {
      this.context = this.canvas.getContext("2d");
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.beginPath();
      image = that.images.windows;
      if(that.activeScene.name == "playing") {
        this.context.drawImage(image, 0, 48, 48, 16, this.canvas.width - 188, 0, 144, 48);
        this.context.font = "13px Pixelbroidery";
        this.context.fillStyle = "#990000";
        this.context.shadowOffsetX = 1;
        this.context.shadowOffsetY = 1;
        this.context.shadowColor = "rgba(0,0,0,0.3)";
        txt = `x:${Math.floor(that.player.position.x)}, y:${Math.floor(that.player.position.y)}`;
        this.context.fillText(txt, that.canvas.width - (116 + (this.context.measureText(txt).width / 2)), 27);
        // this.context.fillText(``, that.canvas.width - 192, 50);
      }
      this.context.imageSmoothingEnabled = false;
      this.context.drawImage(image, 48, 48, 16, 16, this.canvas.width - 48, 0, 48, 48);
      this.context.font = "13px Pixelbroidery";
      this.context.fillStyle = "#990000";
      this.context.shadowOffsetX = 1;
      this.context.shadowOffsetY = 1;
      this.context.shadowColor = "rgba(0,0,0,0.3)";
      this.context.fillText(Math.round(fps), this.canvas.width - (24 + (this.context.measureText(Math.round(fps)).width / 2)), 27);
      this.context.closePath();
      return this.canvas;
    }
  }
};

Game.prototype.drawPlayer = function(canvas, context) {
  context.imageSmoothingEnabled = false;
  context.drawImage(this.player.character.sprite.image, this.player.character.sprite.sx, this.player.character.sprite.sy, this.player.character.sprite.width, this.player.character.sprite.height, this.player.canvas_position.x - (((this.tilesize*2) - this.player.size.width) / 2), this.player.canvas_position.y - this.player.character.sprite.height*2 + this.player.size.height, 2*this.player.character.sprite.width, 2*this.player.character.sprite.height);
  // context.beginPath();
  // context.fillStyle = "black";
  // context.rect(this.player.canvas_position.x, this.player.canvas_position.y, this.player.size.width, this.player.size.height);
  // context.fill();
  // if(this.player.position.current_tile) {
  //   context.beginPath();
  //   context.rect(this.player.position.current_tile.x, this.player.position.current_tile.y, 32, 32);
  //   context.strokeStyle = "red";
  //   context.stroke();
  // }
  return canvas;
}

Game.prototype.loadGame = function() {
  return new Promise(resolve => {
    console.log("Loading game...");
    resolve(this);
  })
  .then(this.getMap.bind(this, this.player.location.src))
  // .then(this.getMap(this.player.location.src))
  .then(function(that) {
    return that.loadTilesets(that, that.map.tilesets);
  })
  .then(this.player.init.bind(this.player))
  .then(this.player.character.sprite.load.bind(this.player.character.sprite))
  .then(function() {
    return that.preloadMap(that, game.scenes.playing.canvas, game.scenes.playing.context);
  })
  .then(function(canvas) {
    that.turnOnChat();
    $.each(that.tiles, function(index, value){
      that.tiles[index].x += that.player.camera.x;
      that.tiles[index].y += that.player.camera.y;
    });
    game.player.screen = canvas;
    game.activeCamera = game.player.camera;
    game.activeScene = game.scenes.playing;
  });
}

Game.prototype.layers = [];

function Layer(data) {
  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");

  _this = this;
  if(data.properties) {
    $.each(data.properties, function(index, result) {
      _this[result.name] = result.value;
    });
  }
}

Game.prototype.animated_tiles = [];

Game.prototype.preloadMap = function(that, canvas, context) {
  return new Promise(resolve => {
    canvas = document.createElement("canvas");
    canvas.width = that.map.width * (that.tilesize * 2);
    canvas.height = that.map.height * (that.tilesize * 2);
    context = canvas.getContext("2d");
    posx = 0;
    posy = 0;
    iteration = 0;
    $.each(that.map.layers, function(index, value) {
      let current_layer = document.createElement("canvas");
      current_layer.width = that.map.width * (that.tilesize * 2);
      current_layer.height = that.map.height * (that.tilesize * 2);
      let layer_ctx = current_layer.getContext("2d");
      animated = false;
      let walkable = undefined;
      let ontop = false;
      if(value.properties) {
        $.each(value.properties, function(i, j) {
          if((j.name == "ontop" && j.value == true)) {
            ontop = true;
          }
          if((j.name == "animated" && j.value == true)) {
            animated = true;
          }
          if(j.name == "frames") {
            frames = j.value;
          }
          if(j.name == "walkable") {
            walkable = j.value;
          }
        });
      }

      posx = 0;
      posy = 0;
      iteration = 0;
      if(animated == false) {
        $.each(that.map.layers[index].data, function(index2, value2) {
          if(value2 == 0) {
            iteration++;
            posx += that.tilesize*2;
            if(iteration % that.map.layers[index].width == 0) {
              posx = 0;
              posy += that.tilesize*2;
            }
            return true;
          }

          txt = that.textures[value2-1];
          tileset = that.tilesets[txt.tileset];
          layer_ctx.imageSmoothingEnabled = false;
          layer_ctx.drawImage(tileset, txt.sx, txt.sy, that.tilesize, that.tilesize, posx, posy, that.tilesize*2, that.tilesize*2);
          that.tiles.push({id: iteration, x: posx, y: posy, tileset: txt.tileset, block: txt.block, walkable: walkable, ontop: ontop, layer:value.name});

          // layer_ctx.strokeStyle = "black";
          // layer_ctx.strokeRect(posx, posy, that.tilesize*2, that.tilesize*2);

          // if(txt.block) {
          //   if(txt.block.polygon_collision) {
          //     brr = txt.block.polygon_collision;
          //     // console.log(brr);
          //     layer_ctx.strokeStyle = "red";
          //     layer_ctx.beginPath();
          //     for(var i=0;i<brr.length;i++) {
          //       if(i==0) {
          //         layer_ctx.moveTo((brr[i].x * 2)+posx, (brr[i].y * 2)+posy);
          //       } else {
          //         layer_ctx.lineTo((brr[i].x * 2)+posx, (brr[i].y * 2)+posy);
          //       }
          //     }
          //     layer_ctx.closePath();
          //     layer_ctx.stroke();
          //   }
          // }

          iteration++;
          posx += that.tilesize*2;
          if(iteration % that.map.layers[index].width == 0) {
            posx = 0;
            posy += that.tilesize*2;
          }
        });
        that.layers.push({id:index, canvas:current_layer, ontop: ontop, name:value.name});
      } else {
        arr = [];
        for(var i=0;i<frames;i++) {
          let frame_canvas = document.createElement("canvas");
          let frame_context = frame_canvas.getContext("2d");
          frame_canvas.width = that.map.width * (that.tilesize * 2);
          frame_canvas.height = that.map.height * (that.tilesize * 2);
          posx = 0;
          posy = 0;
          iteration = 0;
          $.each(that.map.layers[index].data, function(index2, value2) {
            if(value2 == 0) {
              iteration++;
              posx += that.tilesize*2;
              if(iteration % that.map.layers[index].width == 0) {
                posx = 0;
                posy += that.tilesize*2;
              }
              return true;
            }

            let numer = value2 + (i*3);

            let txt = that.textures[numer-1];
            let tileset = that.tilesets[txt.tileset];
            frame_context.imageSmoothingEnabled = false;
            frame_context.drawImage(tileset, txt.sx, txt.sy, that.tilesize, that.tilesize, posx, posy, that.tilesize*2, that.tilesize*2);
            if(i==0) {
              that.tiles.push({id: iteration, x: posx, y: posy, tileset: txt.tileset, block: txt.block, walkable: walkable, ontop: ontop});
            }

            iteration++;
            posx += that.tilesize*2;
            if(iteration % that.map.layers[index].width == 0) {
              posx = 0;
              posy += that.tilesize*2;
            }
          });
          arr.push(frame_canvas);
        }

        that.layers.push({id:index, canvas:arr, frames: frames, current_frame: 0, fc: 0, ontop: ontop, name:value.name});
      }
      // that.layers.push({id:index, canvas:current_layer});
    });
    resolve(canvas);
  });
}

Game.prototype.getTextures = function(img) {
  // width = img.width
  for(var y=0;y<img.imageheight / this.tilesize;y++) {
    for(var x=0;x<img.imagewidth / this.tilesize;x++) {
      this.textures.push({sx:x*this.tilesize, sy:y*this.tilesize, tileset:img.name});
    }
  }
}

Game.prototype.loadTilesets = function(that, tilesets) {
  return new Promise(resolve => {
    console.log("Loading tilesets");
    let iteration = 0;
    $.each(tilesets, function(index, value) {
      that.getTextures(value);

      $.each(tilesets[index].tiles, function(index2, value2) {
        let obj = {};
        obj.id = value2.id + value.firstgid-1;
        // console.log(tilesets);
        // if(game.map.layers[index2][0].properties) {
        //   if(game.map.layers[index2].walkable) {
        //     // obj.walkable = value.properties.walkable;
        //     console.log("eee");
        //   }
        // }
        if(value2.objectgroup) {
          // value2.objectgroup.objects[0].polygon[0].x = value2.objectgroup.x;
          // value2.objectgroup.objects[0].polygon[0].y = value2.objectgroup.y;
          obj.polygon_collision = value2.objectgroup.objects[0].polygon;
          $.each(obj.polygon_collision, function(i, v) {
            v.x += value2.objectgroup.objects[0].x;
            v.y += value2.objectgroup.objects[0].y;
          });
        }
        if(value2.properties) {
          $.each(value2.properties, function(i, j) {
            obj[j.name] = j.value;
          });
        }
        that.textures[obj.id].block = obj;
      });

      let img = new Image();
      img.src = value.image;
      img.onload = function() {
        that.tilesets[value.name] = img;
        if(index == tilesets.length-1) {
          resolve();
        }
      }
    });
  });
}

Game.prototype.getMap = function(map) {
  return new Promise(resolve => {
    that = this;
    $.ajax({
      dataType: "json",
      url: map,
      cache:false,
      success: function(data) {
        that.map = data;
        resolve(that);
      }
    });
  });
}

Game.prototype.menu = {
  font_size: 26,
  button: {
    width: 192,
    height: 64
  },
  background: {
    x:0,
    y:0,
    xspeed: 0.5,
    yspeed: 0.3
  },
  buttons: [
    {x: 288, y: 100, text: "Play", scene: "menu", active: false, action: function() { game.activeScene = game.scenes.character_selection; game.playSound("button2", 0.3); }},
    {x: 288, y: 200, text: "Settings", scene: "menu", active: false, action: function() { game.activeScene = game.scenes.settings; game.playSound("button2", 0.3); }},
    {x: 288, y: 300, text: "Credits", scene: "menu", active: false, action: function() { game.activeScene = game.scenes.credits; game.playSound("button2", 0.3); }},
    {x: 288, y: 300, text: "Go back", scene: "settings", active: false, action: function() { game.activeScene = game.scenes.menu; game.playSound("button2", 0.3); }},
    {x: 288, y: 300, text: "Go back", scene: "credits", active: false, action: function() { game.activeScene = game.scenes.menu; game.playSound("button2", 0.3); }},
    {x: 288, y: 300, text: "Go back", scene: "character_selection", active: false, action: function() { game.activeScene = game.scenes.menu; game.playSound("button2", 0.3); }},
    {x: 500, y: 300, text: "Play", scene: "character_selection", active: false, action: function() {
      game.playSound("button2", 0.3);
      game.loadGame();
    }}
  ]
}
