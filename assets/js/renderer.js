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
        this.context.drawImage(img, 64, 0, _sw, _sh, x, 50, _sw * 3, _sh * 3);
        if(that.player.characters[i]) {
          chname = that.player.characters[i].name;
          spr = that.data.characters[that.player.characters[i].sprite];
          // console.log(spr);
          img = new Image();
          img.src = spr.src;
          this.context.drawImage(img, spr.sx, spr.sy, spr.width, spr.height, x+_sw, 50+_sh, spr.width * 2, spr.height * 2);
        } else {
          chname = "undefined";
        }

        img = that.images.bars;
        this.context.drawImage(img, 49, 377, 22, 6, x, 200, 24 * 6, 6 * 6);
        this.context.fillStyle = "white";
        this.context.textAlign = "left";
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
      this_scene = this;
      // DRAW NO-TOP
      this_scene.context.globalCompositeOperation = 'source-over';
      $.each(game.player.location.layers, function(index, value) {
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

      var ent = [];
      ent.push(that.player);
      ent.push.apply(ent, that.player.location.entities);
      ent.push.apply(ent, that.players);
      // ent.sort(function(a, b){return a.position.y - b.position.y});

      $.each(that.player.location.areas, function(index, value) {
        // $.each(that.player.location.areas[index].objects, function(i, v) {
        //
        // });
        if(value.properties) {
          color = value.properties.filter(function(key) { return key.name == "color"})[0].value;
          this_scene.context.beginPath();
          this_scene.context.rect((value.x*2) + that.activeCamera.x, (value.y*2) + that.activeCamera.y, value.width*2, value.height*2);
          this_scene.context.fillStyle = `rgba(${color}, 0.3)`;
          this_scene.context.fill();
          this_scene.context.strokeStyle = `rgb(${color})`;
          this_scene.context.stroke();
        }
      });

      $.each(game.player.location.layers, function(index, value) {
        if(!value.ontop || value.ontop == false) {
          return true;
        }
        colliding = [];
        if(colliding.length == 0) {
          tiles_in_layer = that.player.location.tiles.filter(function(key){ return key.layer==value.name; });
          $.each(ent, function(i2, v2) {
            $.each(tiles_in_layer, function(i, v) {
              check = that.isColliding(v.x, v.y, game.tilesize*2, game.tilesize*2, v2.canvas_position.x, v2.canvas_position.y, v2.size.width, v2.size.height);
              if(check == true) {
                colliding.push(v2);
                return false;
              }
            });
          });
        }
        if(Array.isArray(value.canvas) == false) {
          if(colliding.length == 0) {
            this_scene.context.drawImage(value.canvas, Math.round(that.activeCamera.x), Math.round(that.activeCamera.y));
          } else {
            colliding.sort(function(a, b){return a.position.y - b.position.y});
            $.each(colliding, function(i, v) {
              v.draw();
              ent.splice(ent.indexOf(v), 1);
            });
            this_scene.context.drawImage(value.canvas, Math.round(that.activeCamera.x), Math.round(that.activeCamera.y));
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
        }
      });
      ent.sort(function(a, b){return a.position.y - b.position.y});
      // console.log(ent);
      $.each(ent, function(i, v) {
        v.draw();
      });
      // path = game.player.location.path;
      // current = game.player.location.path.result;
      // this_scene.context.beginPath();
      // this_scene.context.moveTo(path.endNode.x + game.activeCamera.x, path.endNode.y + game.activeCamera.y);
      // while(current.parent) {
      //   this_scene.context.lineTo(current.x + game.activeCamera.x, current.y + game.activeCamera.y);
      //   this_scene.context.strokeStyle = "red";
      //   this_scene.context.stroke();
      //   current = current.parent;
      // }
      // this_scene.context.closePath();
      that.keyboardKeys.INTERACTION.event = undefined;
      $.each(that.player.location.interactions, function(index, value) {
        DX = (value.x * 2) - that.player.position.x;
        DY = (value.y * 2) - that.player.position.y;
        DISTANCE = Math.sqrt(Math.pow(DX, 2) + Math.pow(DY, 2));
        if(DISTANCE < 50) {
          TEXT = game.getPropertyValue(value.properties, "text");
          LOCATION = game.getPropertyValue(value.properties, "location");
          NEW_X = game.getPropertyValue(value.properties, "to_x");
          NEW_Y = game.getPropertyValue(value.properties, "to_y");
          // text = value.properties.filter(function(key) { return key.name == "text"; })[0];
          // location = value.properties.filter(function(key) { return key.name == "location"; })[0];
          // nx = value.properties.filter(function(key) { return key.name == "to_x"; })[0];
          // ny = value.properties.filter(function(key) { return key.name == "to_y"; })[0];
          that.keyboardKeys.INTERACTION.event = function() {
            game.teleport(LOCATION, NEW_X, NEW_Y);
          }
          this_scene.context.fillStyle = "rgba(0,0,0,0.8)";
          let measure = this_scene.context.measureText(TEXT);
          this_scene.context.fillRect(that.player.canvas_position.x + that.player.character.sprite.width, that.player.canvas_position.y - (that.player.character.sprite.height * 2), measure.width, 20);
          this_scene.context.fillStyle = "white";
          this_scene.context.textAlign = "left";
          this_scene.context.font = "13px Pixelbroidery";
          this_scene.context.fillText(TEXT, that.player.canvas_position.x + that.player.character.sprite.width, that.player.canvas_position.y - (that.player.character.sprite.height * 2) + 13);
        }
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
  blackScreen: {
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    init: function() {
      this.draw();
      this.canvas.style.opacity = 0;
    },
    draw: function(that) {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return this.canvas;
    }
  },
  hud: {
    canvas: document.createElement("canvas"),
    getContext: function() { this.context = this.canvas.getContext("2d"); delete this.getContext; },
    context: undefined,
    init: function() {
      this.icon_panel = {
        icons: [
          {id: 0, image:"icon_gear", width:48, height:48, action: function() {console.log("open settings");}},
          {id: 1, image:"icon_bag", width:48, height:48, action: function() {console.log("open bag");}}
        ],
        x:this.canvas.width,
        y:this.canvas.height
      }
    },
    draw: function(that, fps) {
      var padding = 5;
      this.context = this.canvas.getContext("2d");
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.beginPath();
      this.context.imageSmoothingEnabled = false;
      image = that.images.windows;
      if(that.activeScene.name == "playing") {
        this.context.drawImage(image, 0, 48, 48, 16, this.canvas.width - 188, 0, 144, 48);
        this.context.textAlign = "left";
        this.context.font = "13px Pixelbroidery";
        this.context.fillStyle = "#990000";
        this.context.shadowOffsetX = 1;
        this.context.shadowOffsetY = 1;
        this.context.shadowColor = "rgba(0,0,0,0.3)";
        txt = `x:${Math.floor(that.player.position.x)}, y:${Math.floor(that.player.position.y)}`;
        this.context.fillText(txt, that.canvas.width - (116 + (this.context.measureText(txt).width / 2)), 27);
        // this.context.fillText(``, that.canvas.width - 192, 50);
      }
      this.context.drawImage(image, 48, 48, 16, 16, this.canvas.width - 48, 0, 48, 48);
      this.context.font = "13px Pixelbroidery";
      this.context.fillStyle = "#990000";
      this.context.shadowOffsetX = 1;
      this.context.shadowOffsetY = 1;
      this.context.shadowColor = "rgba(0,0,0,0.3)";
      this.context.fillText(Math.round(fps), this.canvas.width - (24 + (this.context.measureText(Math.round(fps)).width / 2)), 27);
      if(that.activeScene == that.scenes.playing) {
        var grd = this.context.createLinearGradient(0, 0, 200, 0);
        grd.addColorStop(0, "rgba(0,0,0,0.7)");
        // grd.addColorStop(0.3, "black");
        // grd.addColorStop(0.5, "rgba(0,0,0,0.7)");
        grd.addColorStop(1, "transparent");

        this.context.fillStyle = grd;
        this.context.fillRect(0, 5, 250, 40);

        var grd = this.context.createLinearGradient(0, 0, 200, 0);
        grd.addColorStop(0, "yellow");
        // grd.addColorStop(0.3, "black");
        grd.addColorStop(0.5, "yellow");
        grd.addColorStop(1, "transparent");

        this.context.fillStyle = grd;
        this.context.fillRect(0, 5, 250, 1);
        this.context.fillRect(0, 45, 250, 1);

        this.context.imageSmoothingEnabled = true;
        this.context.fillStyle = "white";
        this.context.font = "15px Pixelbroidery";
        this.context.textAlign = "left";
        this.context.fillText(game.player.character.name, 5, 20);

        MAXHP = that.player.character.stats.max_hp;
        CURRHP = that.player.character.stats.curr_hp;

        percent = (CURRHP * 100) / MAXHP;

        this.context.fillStyle = "#ef9a9a";
        this.context.font = "12px Pixelbroidery";
        this.context.textAlign = "center";
        this.context.fillText(`${CURRHP} / ${MAXHP}`, 55, 37);

        this.context.save();
        this.context.fillStyle = "#d32f2f";
        this.context.rect(5, 25, percent, 15);
        this.context.fill();
        this.context.clip();

        this.context.fillStyle = "white";
        this.context.font = "12px Pixelbroidery";
        this.context.textAlign = "center";
        this.context.fillText(`${CURRHP} / ${MAXHP}`, 55, 37);

        this.context.restore();

        this.context.beginPath();
        this.context.moveTo(5, 40);
        this.context.lineTo(105, 40);
        this.context.lineWidth = 2;
        this.context.strokeStyle = "white";
        this.context.stroke();

        _this_ = this;
        $.each(this.icon_panel.icons, function(i, v) {
          _this_.context.beginPath();
          iw = v.width;
          ih = v.height;
          _this_.context.imageSmoothingEnabled = true;
          _this_.context.rect((_this_.icon_panel.x - ((i+1)*v.width)) - padding, (_this_.icon_panel.y - v.height) - padding, 48, 48);
          if(_this_.context.isPointInPath(that.mouse.x, that.mouse.y)) {
            that.mouse.clickEvent = v.action;
            iw+=6;
            ih+=6;
          }
          _this_.context.drawImage(that.images[v.image], (_this_.icon_panel.x - ((i)*v.width+iw)) - padding, (_this_.icon_panel.y - ih) - padding, iw, ih);
        });
      }
      this.context.closePath();
      return this.canvas;
    }
  }
}

Game.prototype.fade = function(method, time) {
  let opacity;
  if(method == "in") {
    document.getElementById("canvas-box").appendChild(game.scenes.blackScreen.canvas);
    opacity = 1;
  } else if(method == "out") {
    opacity = 0;
  }
  $(game.scenes.blackScreen.canvas).animate({
    opacity: opacity
  }, time, function() {
    if(method == "out") {
      document.getElementById("canvas-box").removeChild(game.scenes.blackScreen.canvas);
    }
  });
}

Game.prototype.getLocationFromServer = function() {
  return new Promise(resolve => {
    console.log("Getting map from server..");
    game.socket.emit('get location data', game.player.location.name);
    game.socket.on('retrieve location', function(val) {
      game.player.location = val;
      resolve();
    });
  });
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Game.prototype.loadTilesets = () => {
  return new Promise(resolve => {
    console.log("Generating tilesets sprites..");
    console.log(game.player.location.tilesets);
    $.each(game.player.location.tilesets, function(i, v) {
      let img = new Image();

      img.onload = function() {
        game.player.location.tilesets[i].sprite = img;
        if(i == Object.keys(game.player.location.tilesets)[Object.keys(game.player.location.tilesets).length-1]) {
          resolve();
        }
      }
      game.player.location.tilesets[i].sprite = img;
      img.src = v.image;
    });
  });
}

Game.prototype.loadMap = function() {
  return new Promise(resolve => {
    LAYERS = {};
    resolve(game);
  })
  .then(this.getLocationFromServer)
  .then(this.loadTilesets)
  .then(this.player.init.bind(this.player))
  .then(this.player.character.sprite.load.bind(this.player.character.sprite))
  .then(function() {
    return that.preloadMap(game, game.scenes.playing.canvas, game.scenes.playing.context);
  }).then(function(){
    $.each(that.player.location.tiles, function(index, value){
      that.player.location.tiles[index].x += that.player.camera.x;
      that.player.location.tiles[index].y += that.player.camera.y;
    });
  });
}

Game.prototype.teleport = function(location, nx, ny) {
  return new Promise(resolve => {
    cancelAnimationFrame(game.animationFrame);
    game.player.location.name = location;
    game.player.position.x = nx;
    game.player.position.y = ny;
    game.activeCamera.x = 0;
    game.activeCamera.y = 0;
    LAYERS = {};
    game.fade("in", 1000);
    // game.scenes.blackScreen.draw();
    // game.scenes.blackScreen.canvas.style.opacity = 0;
    // document.getElementById("canvas-box").appendChild(game.scenes.blackScreen.canvas);
    // $(game.scenes.blackScreen.canvas).animate({
    //   opacity: 1
    // }, 1000, function() {
    //   resolve(game);
    // });
    setTimeout(function(){
      resolve(game);
    }, 1000);
  })
  .then(this.getLocationFromServer)
  .then(this.loadTilesets)
  .then(function() {
    // let test = document.getElementById("test");
    // let test_ctx = test.getContext("2d");
    // console.log(game.player.location.tilesets);
    // if(game.player.location.name == "Woodlands") {
    //   // test_ctx.drawImage(game.player.location.tilesets["outside"].sprite, 0, 0);
    // }

    return that.preloadMap(game, game.scenes.playing.canvas, game.scenes.playing.context);
  })
  .then(function(){
    game.player.camera.setup();
    game.socket.emit("update player info", "location", {name:game.player.character.name, value:game.player.location.name});
    game.socket.emit("update player info", "position", {name:game.player.character.name, value:game.player.position});

    $.each(that.player.location.tiles, function(index, value){
      that.player.location.tiles[index].x += that.player.camera.x;
      that.player.location.tiles[index].y += that.player.camera.y;
    });
    game.update();
    game.fade("out", 1000);
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
Game.prototype.LAYERS = {};

Game.prototype.preloadMap = function(that, canvas, context) {
  return new Promise(resolve => {
    // console.log("Preloading map")
    let drawingTiles = false,
        drawingLayers = false;
    canvas = document.createElement("canvas");
    canvas.width = that.player.location.data.width * (that.tilesize * 2);
    canvas.height = that.player.location.data.height * (that.tilesize * 2);
    context = canvas.getContext("2d");

    game.player.location.layers = [];

    $.each(game.player.location.tiles, function(i, v) {
      if(!v.animated || v.animated == false) {
        if(Object.keys(LAYERS).indexOf(v.layer) == -1) {
          current_layer = document.createElement("canvas");
          current_layer.width = that.player.location.data.width * (that.tilesize * 2);
          current_layer.height = that.player.location.data.height * (that.tilesize * 2);
          obj = {
            canvas: current_layer,
            layer_ctx: current_layer.getContext("2d")
          }
          // current_layer = document.createElement("canvas");
          // current_layer.width = that.player.location.data.width * (that.tilesize * 2);
          // current_layer.height = that.player.location.data.height * (that.tilesize * 2);
          // layer_ctx = current_layer.getContext("2d");
          // LAYERS.canvas = current_layer;
          // LAYERS.context = layer_ctx;
          // layer = {};
          // LAYERS.frame_arr = frame_arr;
          LAYERS[v.layer] = obj;
        }

        let txt = game.player.location.textures[v.tile_id-1],
            tileset = game.player.location.tilesets[v.tileset].sprite;

        LAYERS[v.layer].layer_ctx.imageSmoothingEnabled = false;
        LAYERS[v.layer].layer_ctx.drawImage(tileset, txt.sx, txt.sy, that.tilesize, that.tilesize, v.x, v.y, that.tilesize*2, that.tilesize*2);

      }
      else {
        let l = game.player.location.data.layers.filter(function(key) { return key.name==v.layer; })[0];
        let frames = l.properties.filter(function(key) {return key.name=="frames"})[0].value;
        frame_arr = [];
        if(Object.keys(LAYERS).indexOf(v.layer) == -1) {
          obj = {
            canvas: []
          }
          LAYERS[v.layer] = obj;
        }
        for(var f=0;f<frames;f++) {
          if(!LAYERS[v.layer].canvas[f]) {
            let frame_canvas = document.createElement("canvas");
            let frame_context = frame_canvas.getContext("2d");
            frame_canvas.width = that.player.location.data.width * (that.tilesize * 2);
            frame_canvas.height = that.player.location.data.height * (that.tilesize * 2);
            LAYERS[v.layer].canvas.push(frame_canvas);
          }

          frame_context = LAYERS[v.layer].canvas[f].getContext("2d");

          let numer = v.tile_id + (f*3);

          let txt = game.player.location.textures[numer-1];
          let tileset = game.player.location.tilesets[v.tileset].sprite;
          frame_context.imageSmoothingEnabled = false;
          frame_context.drawImage(tileset, txt.sx, txt.sy, that.tilesize, that.tilesize, v.x, v.y, that.tilesize*2, that.tilesize*2);

          frame_arr.push(LAYERS[v.layer].canvas[f]);
        }
      }
      if(i == game.player.location.tiles.length-1) {
        drawingTiles = true;
        console.log("done");
      }
    });

    $.each(LAYERS, function(i, v) {
      layer = {};
      let l = game.player.location.data.layers.filter(function(key) { return key.name==i; })[0];
      if(l.properties) {
        chk = l.properties.filter(function(key) { return key.name=="animated"; });
        if(chk.length > 0) {
          animated = chk[0].value;
        } else {
          animated = false;
        }
      } else {
        animated = false;
      }
      if(animated == false) {
        layer.canvas = v.canvas;
      } else {
        layer.canvas = frame_arr;
        layer.frames = frames;
        layer.current_frame = 0;
        layer.fc = 0;
      }
      layer.id = Object.keys(LAYERS).indexOf(i);
      layer.name = i;
      $.each(l.properties, function(i, v) {
        layer[v.name] = v.value;
      });
      game.player.location.layers.push(layer);
      if(i == Object.keys(LAYERS)[Object.keys(LAYERS).length-1]) {
        drawingLayers = true;
        console.log("done");
      }
    });
    let interv = setInterval(function(){
      if(drawingTiles && drawingLayers) {
        resolve(canvas);
        clearInterval(interv);
      }
    }, 100);
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
      game.fade("in", 1000);
      setTimeout(function(){
        game.activeScene = game.scenes.playing;
      }, 1000);
      game.fade("out", 1000);
      // game.loadGame();
    }}
  ]
}
