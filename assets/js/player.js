class Player {
    constructor(data) {
        this.name = data.character_name;

        this.position = new Object();
        this.canvas_position = new Object();
        this.position.x = data.pos_x;
        this.position.y = data.pos_y;

        this.location = new Object();
        this.location.name = data.location;

        this.spriteId = data.sprite_id;
    }
    stats = {
        max_hp: 120,
        curr_hp: 60
    }
    size = { width:20, height:12 }
    speed = 2.5
    state = "idle"
    fov = 200

    camera = {
        x: 0,
        y: 0,
        setup: function() {
            let px = game.player.position.x - Math.abs(game.activeCamera.x);
            let py = game.player.position.y - Math.abs(game.activeCamera.y);

            this.x = -(px - that.canvas.width / 2);
            if (this.x > 0) {
            this.x = 0;
            } else if (Math.abs(this.x) - that.tilesize * 2 > (game.location.data.width) * (that.tilesize)) {
            this.x = -((game.location.data.width * (that.tilesize * 2)) - that.canvas.width);
            }
            this.y = -(py - that.canvas.height / 2);
            if (this.y > 0) {
            this.y = 0;
            } else if (Math.abs(this.y) - that.tilesize * 2 > (game.location.data.height * (that.tilesize * 2)) - that.canvas.height) {
            this.y = -((game.location.data.height * (that.tilesize * 2)) - that.canvas.height);
            }
        },
        move: function(dir) {
            if (game.player.canvas_position.x + game.player.fov >= that.canvas.width && dir == "right" && that.activeCamera.x > -game.location.data.width * (that.tilesize * 2) + that.canvas.width + game.player.speed) {
            game.player.camera.x -= game.player.speed;
            $.each(game.location.tiles, function (index, value) {
            game.location.tiles[index].x -= game.player.speed;
            });
            return true;
            }
            if (game.player.canvas_position.x - game.player.fov <= 0 && dir == "left" && that.activeCamera.x < 0 - game.player.speed) {
            game.player.camera.x -= -game.player.speed;
            $.each(game.location.tiles, function (index, value) {
            game.location.tiles[index].x -= -game.player.speed;
            });
            return true;
            }
            if (game.player.canvas_position.y + game.player.fov >= that.canvas.height && dir == "down" && that.activeCamera.y > -game.location.data.height * (that.tilesize * 2) + that.canvas.height + game.player.speed) {
            game.player.camera.y -= game.player.speed;
            $.each(game.location.tiles, function (index, value) {
            game.location.tiles[index].y -= game.player.speed;
            });
            return true;
            }
            if (game.player.canvas_position.y - game.player.fov <= 0 && dir == "up" && that.activeCamera.y < 0 - game.player.speed) {
            game.player.camera.y -= -game.player.speed;
            $.each(game.location.tiles, function (index, value) {
            game.location.tiles[index].y -= -game.player.speed;
            });
            return true;
            }
            return false;
        }
    }

    footsteps() {
        this.getCurrentTile();
        let n = 0;
        if (this.moving.left.state == true) n++;
        if (this.moving.right.state == true) n++;
        if (this.moving.up.state == true) n++;
        if (this.moving.down.state == true) n++;
        if (this.position.current_tile) {
            let isThereAFloor = this.position.current_tile.filter(function (key) {
                let isFloor = false;
                $.each(key.block, function (i, v) {
                    if (i == "block_type" && v == "floor") isFloor = true;
                });
                if (isFloor == true) return true;
                else return false;
            });
            var theFloor;
            if (isThereAFloor.length == 1) {
                theFloor = isThereAFloor[0];
            } else {
                theFloor = isThereAFloor[isThereAFloor.length - 1];
            }
            if (theFloor) {
                let rn = Math.floor(Math.random() * that.blocks[theFloor.block.floor_type].walk_sounds.length);

                if (this.step_phase % (20 * n) == 0) {
                    that.playSound(that.blocks[theFloor.block.floor_type].walk_sounds[this.step].name, 0.1);
                }
            }
        }
        if (this.step_phase % (10 * n) == 0) {
            this.step = this.step == 0 ? 1 : 0;
        }
    }
    move(value, coord) {
        let _this = this;
        let newpos = { x: this.position.x, y: this.position.y, cx: this.canvas_position.x, cy: this.canvas_position.y };
        newpos[coord] += value * (this.speed);
        newpos["c" + coord] += value * (this.speed);

        let can_go = true;
        let the_tiles = [];
        $.each(game.location.tiles, function (index, value) {
            if (that.isColliding(value.x, value.y, that.tilesize * 2, that.tilesize * 2, newpos.cx, newpos.cy, _this.size.width, _this.size.height) == true) {
                the_tiles.push(value);
            }
        });

        $.each(the_tiles, function (i, v) {
            if (can_go == true || can_go == false) {
                if (v.block) {
                    if (v.block.collision) {
                        // console.log(v);
                        if (v.block.collision.type == "polygon") {
                            let block_lines = v.block.collision.lines;
                            let player_lines = that.rectToLines({ x: newpos.x, y: newpos.y, width: _this.size.width, height: _this.size.height });
                            $.each(player_lines, function (index, value) {
                                for (var i = 0; i < block_lines.length; i++) {
                                    if (i == block_lines.length - 1) {
                                        var second = 0;
                                    } else {
                                        var second = i + 1;
                                    }
                                    let check = that.IsIntersecting({ X: value.p1.x, Y: value.p1.y }, { X: value.p2.x, Y: value.p2.y }, { X: (block_lines[i].x * 2) + (v.x - that.activeCamera.x), Y: (block_lines[i].y * 2) + (v.y - that.activeCamera.y) }, { X: (block_lines[second].x * 2) + (v.x - that.activeCamera.x), Y: (block_lines[second].y * 2) + (v.y - that.activeCamera.y) });
                                    if (check.seg1 == true && check.seg2 == true) {
                                        can_go = false;
                                        break;
                                        return false;
                                    }
                                }
                            });
                            if (can_go == false) {
                                return true;
                            }
                        } else if (v.block.collision.type == "rect") {
                            if (that.isColliding((v.block.collision.x * 2) + v.x, (v.block.collision.y * 2) + v.y, v.block.collision.width * 2, v.block.collision.height * 2, newpos.cx, newpos.cy, _this.size.width, _this.size.height) == true) {
                                can_go = false;
                                return true;
                            }
                        }
                    } else if (v.block.solid == true) {
                        can_go = false;
                        return true;
                    }
                }
                if (v.walkable) {
                    can_go = true;
                }
            }
        });

        if (can_go == true && newpos.x > 0 && newpos.y > 0 && newpos.x < (game.location.data.width * (that.tilesize * 2)) && newpos.y < (game.location.data.height * (that.tilesize * 2))) {
            this.position[coord] += value * this.speed;
            return true;
        }

        return false;
    }
    moving = {
        left: { state: false, value: -1, coord: "x", direction: "horizontal" },
        right: { state: false, value: 1, coord: "x", direction: "horizontal" },
        up: { state: false, value: -1, coord: "y", direction: "vertical" },
        down: { state: false, value: 1, coord: "y", direction: "vertical" }
    }
    utilities = {
        keys: {
            65: "left",
            68: "right",
            87: "up",
            83: "down"
        }
    }
    step_phase = 0
    step = 0
    facing = new Array()

    movement() {
    $(document).bind("keydown", function (e) {
        if (e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83) {
            game.player.moving[game.player.utilities.keys[e.keyCode]].state = true;
            var index = game.player.facing.indexOf(game.player.utilities.keys[e.keyCode]);
            if (index == -1) {
                game.player.facing.push(game.player.utilities.keys[e.keyCode]);
            }
        }
    });
    $(document).bind("keyup", function (e) {
        if (e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83) {
            game.player.moving[game.player.utilities.keys[e.keyCode]].state = false;
            game.player.spriteData.sy = game.player.spriteData.animations[game.player.utilities.keys[e.keyCode]][2].sy;
            game.player.spriteData.sx = game.player.spriteData.animations[game.player.utilities.keys[e.keyCode]][2].sx;
            var index = game.player.facing.indexOf(game.player.utilities.keys[e.keyCode]);
            if (index != -1) {
                game.player.facing.splice(index, 1);
            }
        }
    });
}

    getCurrentTile() {
        let tx = Math.floor((this.position.x + this.size.width / 2) / (game.tilesize * 2));
        let ty = Math.floor((this.position.y + this.size.height / 2) / (game.tilesize * 2));
        let tile = (ty * game.location.data.width) + tx;

        let id = game.location.tiles.filter(function (key) {
            return key.id == tile;
        });
        this.position.current_tile = id;
    }

    draw() {
        if(this.sprite) {
            // console.log(`Drawing ${this.name}`);
            game.activeScene.context.beginPath();
            game.activeScene.context.imageSmoothingEnabled = false;
            // game.activeScene.context.arc(this.canvas_position.x + this.spriteData.width / 2, this.canvas_position.y, 50, Math.PI, 0);
            // game.activeScene.context.fill();
            game.activeScene.context.drawImage(this.sprite, this.spriteData.sx, this.spriteData.sy, this.spriteData.width, this.spriteData.height, this.canvas_position.x - ((this.spriteData.width * 2) - this.size.width) / 2, this.canvas_position.y - this.spriteData.height * 2 + this.size.height, 2 * this.spriteData.width, 2 * this.spriteData.height);
            game.activeScene.context.closePath();

            if (this != game.player) {
                game.activeScene.context.font = "13px Pixelbroidery";
                game.activeScene.context.textAlign = "center";
                let measure = game.activeScene.context.measureText(this.name);
                game.activeScene.context.fillStyle = "white";
                game.activeScene.context.strokeStyle = "black";
                game.activeScene.context.lineWidth = 2;
                game.activeScene.context.strokeText(this.name, this.canvas_position.x + (this.spriteData.width * 2 - (measure.width / 2)) / 2, this.canvas_position.y - this.spriteData.height - 20);
                game.activeScene.context.fillText(this.name, this.canvas_position.x + (this.spriteData.width * 2 - (measure.width / 2)) / 2, this.canvas_position.y - this.spriteData.height - 20);
            }

            // game.activeScene.context.beginPath();
            // game.activeScene.context.fillStyle = "black";
            // game.activeScene.context.rect(this.canvas_position.x, this.canvas_position.y, this.size.width, this.size.height);
            // game.activeScene.context.fill();
            // if(this.position.current_tile) {
            //     game.activeScene.context.beginPath();
            //     game.activeScene.context.rect(this.position.current_tile.x, this.position.current_tile.y, 32, 32);
            //     game.activeScene.context.strokeStyle = "red";
            //     game.activeScene.context.stroke();
            // }
        }
    }

    update() {
        let THIS = this;
        $.each(this.moving, function (index, result) {
            if (result.state == true) {
                THIS.camera.move(index);
                let is_moving = THIS.move(result.value, result.coord);
                let id = THIS.facing.length - 1;
                if (is_moving) {
                    THIS.step_phase++;
                    THIS.spriteData.sx = THIS.spriteData.animations[THIS.facing[id]][THIS.step].sx;
                    THIS.spriteData.sy = THIS.spriteData.animations[THIS.facing[id]][THIS.step].sy;
                    that.socket.emit('update player info', "position", { name: THIS.name, position: THIS.position, spriteData: THIS.spriteData });
                    THIS.footsteps();
                } else {
                    // THIS.spriteData.sx = THIS.spriteData.animations[THIS.facing[id]][2].sx;
                    // THIS.spriteData.sy = THIS.spriteData.animations[THIS.facing[id]][2].sy;
                }
            }
        });
        this.canvas_position.x = this.position.x - Math.abs(game.activeCamera.x);
        this.canvas_position.y = this.position.y - Math.abs(game.activeCamera.y);
    }
    
    async init() {
        this.spriteData = game.data.characters[this.spriteId]
        this.sprite = await game.loadImage(this.spriteData.src);
        this.getCurrentTile();
        if(this == game.player) {
            this.camera.setup();
            this.movement();
            game.socket.emit('player joined', this);
        }
        console.log(this);
        
    }
}