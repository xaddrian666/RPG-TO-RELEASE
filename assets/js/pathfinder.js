module.exports = function(sx, sy, tx, ty, map) {
  this.sx = sx,
  this.sy = sy,
  this.tx = tx,
  this.ty = ty,
  // this.nodes = [...map.tiles];
  this.nodes = JSON.parse(JSON.stringify(map.tiles))

  row = map.data.width;
  col = map.data.height;
  tilesize = 32;

  this.result;

  this.openNodes = [],
  this.closedNodes = [],

  this.getNodeByPosition = function(x, y) {
    var nx = this.nodes.map(function(evt){return evt.x;}).indexOf(x);
    var ny = this.nodes.map(function(evt){return evt.y;}).indexOf(y);
    return nx + ny;
  },

  this.startNode = {x: sx, y: sy},
  this.endNode = {x: tx, y: ty},
  this.startId = this.getNodeByPosition(this.startNode.x, this.startNode.y),

  this.getDistance = function(Point, Goal) {
    // return Math.abs(Point.x - Goal.x) + Math.abs(Point.y - Goal.y);
    return Math.max(Math.abs(Point.x - Goal.x), Math.abs(Point.y - Goal.y));
  },

  this.nodes[this.startId].gcost = 0,
  this.nodes[this.startId].hcost = this.getDistance(this.startNode, this.endNode),
  this.nodes[this.startId].fcost = this.nodes[this.startId].hcost + this.nodes[this.startId].gcost,

  this.getLowestfcost = function(arr) {
    let lowest, lowestId;
    for(var i=0,len=arr.length;i<len;i++) {
      if(!lowest || lowest.fcost > arr[i].fcost) {
        lowest = arr[i].fcost;
        lowestId = i;
      }
    }
    return lowestId;
  },

  this.getNeigbours = function(id) {
    var array = [];
    current = this.nodes[id];
    // array.push(nodes[id-row-1]);
    array.push(this.nodes[id-row]);
    // array.push(nodes[id-row+1]);
    array.push(this.nodes[id-1]);
    array.push(this.nodes[id+1]);
    // array.push(nodes[id+row-1]);
    array.push(this.nodes[id+row]);
    // array.push(nodes[id+row+1]);
    return array;
  },

  this.isInArray = function(n, arr) {
    //n = neighbour
    var check = arr.filter(function(key) { return key.x == n.x && key.y == n.y; })
    if(check.length == 0) {
      return false;
    } else {
      return true;
    }
  },

  this.addToArray = function(arr, element) {
    arr.push(element);
    return this;
  },

  this.removeFromArray = function(arr, id) {
    arr.splice(id, 1);
    return this;
  },

  this.findPath = function() {
    var current,
        currentId,
        nid,
        neighbours,
        check_neighbour,
        tentative_gcost;

    this
        .addToArray(this.openNodes, this.nodes[this.startId]);

    while(this.openNodes.length !== 0) {
      // console.log(this.openNodes);
      currentId = this.getLowestfcost(this.openNodes);
      current = this.openNodes[currentId];

      if(current.x == this.endNode.x && current.y == this.endNode.y) {
        console.log("Found the way!");
        // this.drawPath(current);
        this.result = current;
        return Promise.resolve(current);
      }

      this.removeFromArray(this.openNodes, currentId)
          .addToArray(this.closedNodes, current);

      nid = this.getNodeByPosition(current.x, current.y);
      neighbours = this.getNeigbours(nid);
      for(let i=0, len = neighbours.length; i<len;i++) {
        if(neighbours[i] == undefined || neighbours[i].walkable == false) {
          continue;
        }
        else if((current.x == 0 && (neighbours[i].x + tilesize) % row == 0) || ((current.x + tilesize) % row == 0 && neighbours[i].x == 0)) {
          continue;
        }
        // ne = this.getNodeByPosition(current.x-tilesize, current.y);
        // nn = this.getNodeByPosition(current.x, current.y-tilesize);
        // nw = this.getNodeByPosition(current.x+tilesize, current.y);
        // ns = this.getNodeByPosition(current.x, current.y+tilesize);
        // if((ne != -1 && nodes[ne].walkable == true) && (nn != -1 && nodes[nn].walkable == true)
        // || (ne != -1 && nodes[ne].walkable == true) && (ns != -1 && nodes[ns].walkable == true)
        // || (nw != -1 && nodes[nw].walkable == true) && (nn != -1 && nodes[nn].walkable == true)
        // || (nw != -1 && nodes[nw].walkable == true) && (ns != -1 && nodes[ns].walkable == true)) {
        //   // console.log("aaa");
        //   continue;
        // }
        check_neighbour = this.isInArray(neighbours[i], this.closedNodes);

        if(check_neighbour == true) {
          continue;
        }

        gcost = this.getDistance(neighbours[i], this.startNode);
        hcost = this.getDistance(neighbours[i], this.endNode);
        fcost = gcost + hcost;

        tentative_gcost = current.gcost + this.getDistance(current, neighbours[i]);

        if(this.isInArray(neighbours[i], this.openNodes) == false) {
          this.addToArray(this.openNodes, neighbours[i]);
        } else if(tentative_gcost >= gcost) {
          continue;
        }
        neighbours[i].gcost = gcost;
        neighbours[i].fcost = fcost;
        neighbours[i].parent = current;
      }
    }
  },

  this.drawPath = function(curr) {
    current = curr;
    // c.moveTo(this.endNode.x+tilesize/2, this.endNode.y+tilesize/2)
    // while(current.parent) {
    //   c.strokeStyle = "red";
    //   c.lineTo(current.parent.x+tilesize/2, current.parent.y+tilesize/2);
    //   c.stroke();
    //   current = current.parent;
    // }
    c.fillStyle = "red";
    // while(current.parent) {
    //   c.lineTo(current.parent.x+tilesize/2, current.parent.y+tilesize/2);
    //   c.stroke();
    //
    // }

    var interv = setInterval(function(){
      if(!curr.parent) {
        clearInterval(interv);
      }
      c.beginPath();
      c.clearRect(curr.x, curr.y, tilesize, tilesize);
      c.rect(curr.parent.x, curr.parent.y, tilesize, tilesize);
      c.fill();
      c.closePath();
      curr = curr.parent;
    }, 100);
  }

  // this.reset = function() {
  //   c.clearRect(0,0,cw,ch);
  //   drawGrid();
  //   this.openNodes = [];
  //   this.closedNodes = [];
  //   return this;
  // }
}
