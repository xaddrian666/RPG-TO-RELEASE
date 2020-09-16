function Game() {
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
      console.log("Loading data..");
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
      console.log("Loading images..");
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
      console.log("Loading sounds..");
      
      that = this;
      sources = this.data.sounds;
      $.each(sources, function(index, value) {
        let audio = new Audio(value.src);
        audio.autoplay = false;
        audio.volume = 0.3;
        audio.onloadeddata = function() {
          // that.sounds.push(audio);
          that.sounds[value.title] = audio;
          if(index == sources.length-1) {
            resolve();
          }
        }
      });
      // checker = setInterval(function() {
      //   if(Object.keys(that.sounds).length == sources.length) {
      //     clearInterval(checker);
      //     resolve();
      //   }
      // }, 200);
    });
  }

  this.loadFonts = function() {
    return new Promise(resolve => {
      console.log("Loading fonts..");
      this.fonts.src.load().then(function(loaded_face) {
        document.fonts.add(loaded_face);
        resolve();
      });
    });
  }

  this.loadPlayerData = function() {
    let self = this;
    return new Promise(resolve => {
      self.socket.emit('get player from db', self.gamename);
      self.socket.on('retrieve player from db', function(res) {
        resolve(res);
      });
    });
  }

  this.loadCharacterData = function() {
    return new Promise(resolve => {
      game.socket.emit('get character from db', {player: game.gamename, character: game.characterName});
      game.socket.on('retrieve character from db', function(res) {
        console.log(res);
        // game.player = new Player(res);
        resolve(res);
      });
    });
  }

  this.setupPlayerPanel = function() {
    let box = document.getElementById("canvas-box");
    let panel = document.createElement("div");
    box.appendChild(panel);
  }

  this.setupListeners = function() {
    let self = this;
    self.socket.on('remove player', function(player) {
      let _player = self.players.map(function (key) { return key.name; }).indexOf(player.name);
      self.players.splice(_player, 1);
    });
    self.socket.on('get entities', function(data) {
      let _entity = new self.Entity(data);
      self.location.entities.push(_entity);
      _entity.init();
    });
    self.socket.on('update player', function(data) {
      let _playerName = data.name;
      let _player = self.players.map(function (key) { return key.name; }).indexOf(_playerName);
      console.log(_player);
      if(_player != -1) {
        self.players[_player].position = data.position;
        self.players[_player].spriteData.sx = data.spriteData.sx;
        self.players[_player].spriteData.sy = data.spriteData.sy;
      }
    });
    self.socket.on('get players', function (arr) {
      // self.players = [];
      console.log(arr);
      $.each(arr, function (i, v) {
        if (v.name != self.player.name) {
          let obj = new Object();
          obj.pos_x = v.position.x;
          obj.pos_y = v.position.y;
          obj.character_name = v.name;
          obj.location = v.location.name;
          obj.sprite_id = v.spriteId;
          let np = new Player(obj);
          np.init();
          console.log(np);
          self.players.push(np);
        }
      });
    });
  }

  this.getPropertyValue = function(array, name) {
    return array.filter(function(key) { return key.name == name; })[0].value;
  }

  this.init = async () => {
    console.log("Loading started..");
    this.gamename = "ADRN";
    $('#canvas-box').css({
      'width': this.properties.width,
      'height': this.properties.height
    });
    await this.loadPlayerData().then(res => this.playerCharacters = res);
    await this.loadData();
    await this.loadImages(this.menuImages);
    await this.loadSounds();
    await this.loadFonts();
    this.turnOnKeyboard();
    this.setupPlayerPanel();
    this.activeScene = this.scenes.menu;
    this.mouseEvent();
    if (window.innerWidth < this.properties.width) {
      this.properties.width = window.innerHeight;
      this.properties.height = window.innerWidth;
    }
    let self = this;
    $.each(this.scenes, function (index, value) {
      value.canvas.width = self.properties.width;
      value.canvas.height = self.properties.height;
      value.getContext();
      if (value.init) {
        value.init();
      }
    });
    // this.setupInterval();
    this.update();
    console.log('done');
    this.loadGame();
  }

  this.loadGame = async () => {
    // this.characterName = prompt();
    this.characterName = 'noob';
    console.log('Loading game..');
    this.setupListeners();
    await this.loadCharacterData().then(res => this.player = new Player(res));
    this.player.init();
    await this.loadImages(this.data.gameImages);
    await this.loadMap().then(canvas => this.player.screen = canvas);
    this.player.camera.setup();
    this.player.movement();
    this.socket.emit('player joined', this.player);
    this.activeCamera = this.player.camera;
    this.activeScene = this.scenes.playing;
    this.turnOnChat();
    this.activeScene = this.scenes.playing;
    return;
  }

  this.setupInterval = () => {
    this.interval = setInterval(this.update.bind(game), 1000/60);
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
  lastUpdate = Date.now();
  this.deltaTime;

  this.update = function() {
    this.animationFrame = requestAnimationFrame(this.update.bind(this));
    let now = Date.now();
    this.deltaTime = (now - lastUpdate) / 1000;
    lastUpdate = now;
    this.fpsCounter();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.activeScene == this.scenes.playing) {
      this.player.update();

      $.each(game.location.entities, function(i, v) {
        v.update();
      });

      $.each(game.players, function (i, v) {
        v.update();
      });
    }

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