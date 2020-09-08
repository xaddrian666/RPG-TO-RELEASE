const pf = require("./assets/js/pathfinder");
var express = require('express');
var $ = require('jquery');
var app = express();
var mysql = require('mysql')
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static(path.join(__dirname, '/')));

var online_players = [];

var DATA = JSON.parse(fs.readFileSync('assets/json/data.json', 'utf8'));

var con = mysql.createConnection({
  host     : 'localhost',
  port:      3306,
  user     : 'root',
  password : 'admin',
  database:  'game'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to mysql!");
  con.query("SELECT * FROM users", function (err, result) {
  if (err) throw err;
    // console.log(result);
  });
});

var locations = {
  woodlands: {
    name: "Woodlands",
    src: "maps/woodlands.json"
  },
  dungeon: {
    name: "Dungeon",
    src: "maps/dungeon.json"
  },
  test: {
    name: "Test",
    src: "maps/test.json"
  }
}

getTextures = (arr, img) => {
  for(var y=0;y<img.imageheight / tilesize;y++) {
    for(var x=0;x<img.imagewidth / tilesize;x++) {
      arr.push({sx:x*tilesize, sy:y*tilesize, tileset:img.name});
    }
  }
}

loadTilesets = () => {
  return new Promise(resolve => {
    console.log("Loading tilesets..");
    for(var name in locations) {
      locations[name].textures = [];
      let tst = {};
      for(var tileset in locations[name].data.tilesets) {
        getTextures(locations[name].textures, locations[name].data.tilesets[tileset]);
        for(var the_tile in locations[name].data.tilesets[tileset].tiles) {
          let obj = {};
          obj.id = locations[name].data.tilesets[tileset].tiles[the_tile].id + locations[name].data.tilesets[tileset].firstgid-1;
          if(locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup) {
            if(locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].polygon) {
              // console.log(locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0])
              obj.collision = {};
              obj.collision.lines = locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].polygon;

              for(var v in obj.collision.lines) {
                obj.collision.lines[v].x += locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].x;
                obj.collision.lines[v].y += locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].y;
              }
              obj.collision.type = "polygon";
            } else {
              obj.collision = {x: locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].x, y: locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].y, width: locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].width, height: locations[name].data.tilesets[tileset].tiles[the_tile].objectgroup.objects[0].height, type: "rect"};
            }
          }
          if(locations[name].data.tilesets[tileset].tiles[the_tile].properties) {
            for(var j in locations[name].data.tilesets[tileset].tiles[the_tile].properties) {
              obj[locations[name].data.tilesets[tileset].tiles[the_tile].properties[j].name] = locations[name].data.tilesets[tileset].tiles[the_tile].properties[j].value;
            }
          }
          locations[name].textures[obj.id].block = obj;
        }

        tst[locations[name].data.tilesets[tileset].name] = locations[name].data.tilesets[tileset];
      }
      locations[name].tilesets = tst;
    }
    resolve();
  });
}

getLocationsJSON = () => {
  return new Promise(resolve => {
    console.log("Getting locations JSON files..");
    for(var name in locations) {
       json = JSON.parse(fs.readFileSync(locations[name].src, 'utf8'));
       locations[name].data = json;
    }
    resolve();
  });
}

var tilesize = 16;
var ENTITIES_TO_SPAWN = [];

generateTilesForLocation = () => {
  return new Promise(resolve => {
    for(var name in locations) {
      console.log(`Generating tiles for ${locations[name].name}`);
      let posx = 0,
          posy = 0,
          iteration = 0,
          tiles = [],
          interactions = [],
          areas = [];
      for(var layer in locations[name].data.layers) {
        if(locations[name].data.layers[layer].type == "tilelayer") {
          posx = 0;
          posy = 0;
          iteration = 0;
          for(var id in locations[name].data.layers[layer].data) {
            if(locations[name].data.layers[layer].data[id] == 0) {
              iteration++;
              posx += tilesize*2;
              if(iteration % locations[name].data.layers[layer].width == 0) {
                posx = 0;
                posy += tilesize*2;
              }
              continue;
            }
            let txt = locations[name].textures[locations[name].data.layers[layer].data[id]-1],
                tileset = locations[name].tilesets[txt.tileset];

            tile = {id: iteration, tile_id: locations[name].data.layers[layer].data[id], block: txt.block, x: posx, y: posy, tileset: tileset.name, layer:locations[name].data.layers[layer].name};
            for(let prop in locations[name].data.layers[layer].properties) {
              tile[locations[name].data.layers[layer].properties[prop].name] = locations[name].data.layers[layer].properties[prop].value;
            }
            //
            // if(!tiles[id]) {
            //   tiles.push(new Array());
            // }

            tiles.push(tile);

            iteration++;
            posx += tilesize*2;
            if(iteration % locations[name].data.layers[layer].width == 0) {
              posx = 0;
              posy += tilesize*2;
            }
          }
        } else if(locations[name].data.layers[layer].type == "objectgroup") {
          if(locations[name].data.layers[layer].properties) {
            for(var index in locations[name].data.layers[layer].properties) {
              if(locations[name].data.layers[layer].properties[index].name == "type" && locations[name].data.layers[layer].properties[index].value == "areas") {
                for(let id in locations[name].data.layers[layer].objects) {
                  areas.push(locations[name].data.layers[layer].objects[id]);
                }
              } else if(locations[name].data.layers[layer].properties[index].name == "type" && locations[name].data.layers[layer].properties[index].value == "entities") {
                  for(var object_id in locations[name].data.layers[layer].objects) {
                    let obj = {};
                    for(var prop_id in locations[name].data.layers[layer].objects[object_id].properties) {
                      // console.log(locations[name].data.layers[layer].objects[object_id].properties[prop_id])
                      let prop = locations[name].data.layers[layer].objects[object_id].properties[prop_id];
                      obj[prop.name] = prop.value;
                    }
                    if(typeof obj.area === 'undefined') {
                      obj.x = locations[name].data.layers[layer].objects[object_id].x * 2;
                      obj.y = locations[name].data.layers[layer].objects[object_id].y * 2;
                    }
                    obj.location = locations[name].name;
                    ENTITIES_TO_SPAWN.push(obj);
                  }
                } else if(locations[name].data.layers[layer].properties[index].name == "type" && locations[name].data.layers[layer].properties[index].value == "interactions") {
                  for(let id in locations[name].data.layers[layer].objects) {
                    interactions.push(locations[name].data.layers[layer].objects[id]);
                  }
                }
            }
          }
        }
      }
      locations[name].entities = [];
      locations[name].interactions = interactions;
      locations[name].areas = areas;
      locations[name].tiles = tiles;
    }
    resolve();
  });
}

var entities = [];

new Promise(resolve => {
  console.log("Server starting..");
  resolve();
}).then(getLocationsJSON)
  .then(loadTilesets)
  .then(generateTilesForLocation)
  .then(function() {
    // let path = new pf.pathfinder(576, 960, 672, 960, locations["woodlands"]);
    // path.findPath();
    // locations["woodlands"].path = path;
    //let path = new pf(32, 32, 128, 128, locations.woodlands).findPath().then(res => console.log(res));
    for(var i=0;i<ENTITIES_TO_SPAWN.length;i++) {
      ENTITY = ENTITIES_TO_SPAWN[i];
      entities.push(new Entity(ENTITY));
      entities[i].init();
    }

    function run() {
      for(var i=0;i<entities.length;i++) {
        entities[i].update();
      }
    }
    setInterval(run, 1000);
  });

  isColliding = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 < x2 + w2 &&
     x1 + w1 > x2 &&
     y1 < y2 + h2 &&
     h1 + y1 > y2) {
      return true;
    }
    return false;
  }

  isIntersecting = function(a, b, c, d) {
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

function Entity(config) {
  this.id = entities.length,
  this.type = DATA.entities[config.type],
  this.size = {
    width: this.type.width,
    height: this.type.height
  },
  this.randTime = function(min, max) {
    return Math.floor(Math.random() * max) + min;
  },
  this.init = function() {
    for(var i in config) {
      if(i == "area") {
        this[i] = locations[config.location.toLowerCase()].areas[config[i]];
      } else {
        this[i] = config[i];
      }
    }
    if(!this.x && !this.y) {
      if(this.area) {
        this.x = Math.floor(Math.random() * (this.area.width*2)-(this.size.width*2)) + (this.area.x * 2) + this.size.width;
        this.y = Math.floor(Math.random() * (this.area.height*2)-(this.size.height*2)) + (this.area.y * 2) + this.size.height;
      } else {
        this.x = 1200;
        this.y = 900;
      }
    }
  },
  this.getNewPosition = function() {
    let obj = {}
    obj.px = this.x + Math.floor(Math.random() * 200) - 100;
    obj.py = this.y + Math.floor(Math.random() * 200) - 100;
    obj.distance = Math.sqrt(Math.pow(this.x - obj.px, 2) + Math.pow(this.y - obj.py, 2));
    return obj;
  }
  this.move = function() {
    if(this.area) {
      do {
        NEW_POSITION = this.getNewPosition();
      } while(NEW_POSITION.px < this.area.x*2 || NEW_POSITION.px + this.size.width > this.area.x*2 + this.area.width*2 || NEW_POSITION.py < this.area.y*2 || NEW_POSITION.py + this.size.height > this.area.y*2 + this.area.height*2 || NEW_POSITION.distance < 20)
    } else {
      do {
        NEW_POSITION = this.getNewPosition();
      } while(NEW_POSITION.distance < 20)
    }
    this.x = NEW_POSITION.px;
    this.y = NEW_POSITION.py;
    io.emit('move entity'+this.id, {x: NEW_POSITION.px, y: NEW_POSITION.py});
  },
  this.frame = 0,
  this.time = undefined,
  this.update = function() {
    if(this.can_move == true) {
      if(this.time == undefined) {
        this.time = this.randTime(2, 8);
      }
      if((this.time) == this.frame) {
        this.time = undefined;
        this.frame = 0;
        this.move();
      } else {
        this.frame++;
      }
    }
  }
}

function getElementByIdInArray(arr, el, thing) {
  return arr.map(function(key) {
    return key[thing];
  }).indexOf(el[thing]);
}

function onDisconnect(socket, player) {
  socket.broadcast.emit('chat message', player.name + " left");
  console.log(`${player.name} disconnected`);
  let id = getElementByIdInArray(online_players, player, "name");
  let el = online_players[id];
  con.query(`UPDATE characters SET pos_x = '${el.position.x}', pos_y = '${el.position.y}', location = '${el.location.name}' WHERE character_name='${el.name}'`, function (err, result) {
  if (err) throw err;
    // socket.emit('retrieve userdata', result);
  });
  socket.broadcast.emit('remove player', player);

  online_players.splice(id, 1);
}

function retrieveEntities(socket, player) {
  for(var i=0;i<entities.length;i++) {
    if(entities[i].location == player.location.name) {
      socket.emit('get entities', entities[i]);
    }
  }
}

function retrieveLocation(socket, val) {
  val = val.toLowerCase();
  socket.emit('retrieve location', locations[val]);
}

io.on('connection', function(socket){
  //SEND LOCATION INFO TO PLAYER
  socket.on('get location data', function(val) {
    retrieveLocation(socket, val);
  });
  socket.on('player joined', function(player) {
    socket.join(player.location.name);
    online_players.push(player);
    console.log(online_players.length);
    io.emit('get players', online_players);
    retrieveEntities(socket, player);
    console.log(`${player.name} connected`);
    socket.broadcast.emit('chat message', player.name+" has joined the game");
    socket.on('disconnect', onDisconnect.bind(this, socket, player));

    socket.on('update player info', function (type, data) {
      id = getElementByIdInArray(online_players, player, "name");
      if (type == "position") {
        online_players[id].position = data.position;
        online_players[id].spriteData = data.spriteData;
        // console.log(online_players[id].position);
        let dataToSend = new Object();
        dataToSend.position = online_players[id].position;
        dataToSend.name = online_players[id].name;
        dataToSend.spriteData = new Object();
        dataToSend.spriteData.sx = online_players[id].spriteData.sx;
        dataToSend.spriteData.sy = online_players[id].spriteData.sy;
        socket.broadcast.emit('update player', dataToSend);
      } else if (type == "location") {
        online_players[id].location.name = data.value.charAt(0).toUpperCase() + data.value.slice(1);
        retrieveEntities(socket, online_players[id]);
      }
    });
  });

  //######################################################
  //##################UPDATE PLAYER INFO##################
  //######################################################
  // socket.on('update player info', function(type, data) {
  //   id = getElementByIdInArray(online_players, data.name, "name");
  //   if(type == "position") {
  //     online_players[id].position = data.value;
  //   } else if(type == "location") {
  //     console.log(online_players[id])
  //     online_players[id].location.name = data.value;
  //     retrieveEntities(socket, online_players[id]);
  //   }
  //   // io.broadcast.emit('update players', online_players);
  // });

  socket.on('get character from db', function(data) {
    let userName = data.player;
    let characterName = data.character;
    con.query(`SELECT * FROM characters c WHERE c.owner_name="${userName}" AND c.character_name="${characterName}"`, function (err, result) {
    if (err) throw err;
    socket.emit('retrieve character from db', result[0]);
    });
  });

  socket.on('get player from db', function(userName) {
    con.query(`SELECT * FROM users u LEFT JOIN characters c ON u.name = c.owner_name WHERE u.name="${userName}"`, function (err, result) {
    if (err) throw err;
    socket.emit('retrieve player from db', result);
    });
  });
  socket.on('chat message', function(txt) {
    io.emit('chat message', txt);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
