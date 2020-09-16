class Collider {
    constructor(tiles, object, position) {
        this.tiles = tiles;
        this.object = object;
        this.position = position;
    }

    get canMove() { return this.colliding() };

    // getNeighbours() {
    //     let tempArr = new Array();
    //     let tx = Math.floor((this.object.position.x + this.object.size.width / 2) / (game.tilesize * 2));
    //     let ty = Math.floor((this.object.position.y + this.object.size.height / 2) / (game.tilesize * 2));
    //     tempArr.push(this.tiles[tx][ty]);
    //     tempArr.push(this.tiles[tx][ty-1]);
    //     tempArr.push(this.tiles[tx][ty+1]);
    //     tempArr.push(this.tiles[tx-1][ty]);
    //     tempArr.push(this.tiles[tx+1][ty]);
    //     tempArr.push(this.tiles[tx-1][ty-1]);
    //     tempArr.push(this.tiles[tx-1][ty+1]);
    //     tempArr.push(this.tiles[tx+1][ty-1]);
    //     tempArr.push(this.tiles[tx+1][ty+1]);
    //     return tempArr;
    // }

    colliding() {
        let can_go = true;
        let self = this;
        this.nearTiles = new Array();
        for(let row of this.tiles) {
            for(let tiles of row) {
                if (game.isColliding(tiles[0].x, tiles[0].y, game.tilesize * 2, game.tilesize * 2, self.position.cx, self.position.cy, self.object.size.width, self.object.size.height) == true) {
                    self.nearTiles.push(...tiles);
                }
            }
        }
        // let neighbours = this.getNeighbours();
        // for (let neighbour of neighbours) {
        //     if (game.isColliding(neighbour[0].x, neighbour[0].y, game.tilesize * 2, game.tilesize * 2, self.position.cx, self.position.cy, self.object.size.width, self.object.size.height) == true) {
        //         self.nearTiles.push(...neighbour);
        //     }
        // }
        $.each(this.nearTiles, function (index, value) {    
            if (value.block) {
                if (value.block.collision) {
                    if (value.block.collision.type == "polygon") {
                        let block_lines = value.block.collision.lines;
                        let player_lines = that.rectToLines({ x: self.position.x, y: self.position.y, width: self.object.size.width, height: self.object.size.height });
                        $.each(player_lines, function (index, value2) {
                            for (var i = 0; i < block_lines.length; i++) {
                                if (i == block_lines.length - 1) {
                                    var second = 0;
                                } else {
                                    var second = i + 1;
                                }
                                let check = that.IsIntersecting({ X: value2.p1.x, Y: value2.p1.y }, { X: value2.p2.x, Y: value2.p2.y }, { X: (block_lines[i].x * 2) + (value.x - that.activeCamera.x), Y: (block_lines[i].y * 2) + (value.y - that.activeCamera.y) }, { X: (block_lines[second].x * 2) + (value.x - that.activeCamera.x), Y: (block_lines[second].y * 2) + (value.y - that.activeCamera.y) });
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
                    } else if (value.block.collision.type == "rect") {
                        if (that.isColliding((value.block.collision.x * 2) + value.x, (value.block.collision.y * 2) + value.y, value.block.collision.width * 2, value.block.collision.height * 2, self.position.cx, self.position.cy, self.object.size.width, self.object.size.height) == true) {
                            can_go = false;
                            return true;
                        }
                    }
                } else if (value.block.solid == true) {
                    can_go = false;
                    return true;
                }
            }
            if (value.walkable) {
                can_go = true;
            }
        });

        if (can_go == true && this.position.x > 0 && this.position.y > 0 && this.position.x < (game.location.data.width * (game.tilesize * 2)) && this.position.y < (game.location.data.height * (game.tilesize * 2))) {
            return true;
        }

        return false;
    }
}

Game.prototype.moveTiles = (direction, value) => {
    for (const [xIndex, xVal] of game.location.tiles.entries()) {
        for (const [yIndex, yVal] of game.location.tiles[xIndex].entries()) {
            let currentTiles = game.location.tiles[xIndex][yIndex];
            for (let currentTile of currentTiles) {
                currentTile[direction] += value;
            }
        }
    }
}