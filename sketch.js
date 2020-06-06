/*
# ant war game 
created by oran collins, and ben hem
github.com/wisehackermonkey
oranbusiness@gmail.com
20200605
*/
var grid;
var gs = 6;
var mapw=100, maph=100;
var ants;
var food;
var nest;

var WALK_SOUNDFX = 0
var soundFXs = []

//ENUMS:
WALK = 0;
FOOD = 1;
FIGHT = 2;
//X ant cant moves off screen

//todo: GOD MODE: move ants around

function preload(){
 soundFXs[WALK_SOUNDFX] = loadSound("Pickup_Coin8.wav");
}

function setup() {
  createCanvas(600, 600);
  noStroke();

  grid = InitialArray2D(mapw, maph);
  ants = new Array(30);
  nest = new Nest(30,50);
  for (var i=0;i<ants.length;i++){
    ants[i]= new Ant(nest.pos.x,nest.pos.y);
  }
  food = new Food(80,50);
  colorMode(RGB,100);
  frameRate(10);
}

function mousePressed(){
  // grabbanantanmesswithit
}

function draw() {
  background(220);
  //todo: paths get decremented for each tile
  for (var i=0;i<ants.length;i++){
    ants[i].ant_AI();
  }
  for (var y=0;y<maph;y++){
    for (var x=0;x<mapw;x++){
      grid[x][y].fade();
    }
  }
  // draw the grid
  for (var x=0;x<mapw;x++){
    for (var y=0;y<maph;y++){
      // fill(20+grid[x][y]*2);
      b = 20+grid[x][y].trails[WALK]*2;
      g =20+grid[x][y].trails[FOOD]*2;
      r = 20+grid[x][y].trails[FIGHT]*2;
      if (r>20 || g>20 || b>20) fill(color(r,g,b));
      else fill(grid[x][y].smells[FOOD]*4+grid[x][y].smells[WALK]*4);
      rect(x*gs,y*gs,gs,gs);
    }
  }
  push();
    translate(gs*.5,gs*.5);
    nest.render();
    food.render();
    for (var i=0;i<ants.length;i++){
      ants[i].render();
    }
  pop();
  fill(100);
  text("Food: " + nest.foodcounter, width-80,20);
}
// https://image.flaticon.com/icons/svg/47/47288.svg


function Nest(x,y){
  this.foodcounter=0;
  this.pos = createVector(x,y);
  this.render = nest_render;
  // populate grid with scent values
  var i=0;
  grid[x][y].smells[WALK]+=5;
  while(i<25){ // the radius of home-smell
    for (var yy=-i;yy<i;yy++){
      for (var xx=-i;xx<i;xx++){
        if (x+xx>=0 && x+xx<mapw && y+yy>=0 && y+yy<maph){
          grid[x+xx][y+yy].smells[WALK]+=random(1,1.5);
        }
      }
    }
    i++;
  }
}

function nest_render(){
  push();
    translate(this.pos.x*gs,this.pos.y*gs);
    stroke(0);
    fill("#D2691E")//dirt color
    triangle(-gs*.4,gs*.3,gs*.4,gs*.3,0,-gs*.3);
  pop();
}

function Food(x, y){
  this.pos = createVector(x,y);
  this.render = food_render;
  // populate grid with scent values
  var i=0;
  grid[x][y].smells[FOOD]+=5;
  while(i<25){ // the radius of food-smell
    for (var yy=-i;yy<i;yy++){
      for (var xx=-i;xx<i;xx++){
        if (x+xx>=0 && x+xx<mapw && y+yy>=0 && y+yy<maph){
          grid[x+xx][y+yy].smells[FOOD]+=random(1,1.5);
        }
      }
    }
    i++;
  }
}

function food_render(){
  push();
    stroke(0);
    fill("#32CD32") //bright green
    ellipse(this.pos.x*gs, this.pos.y*gs, gs*.7,gs*.7);
  pop();
}

// ant class?
function Ant(x,y){
  var state, prev_pos, pos, dir;
  
  this.state=WALK;
  this.prev_pos = createVector(x,y);
  this.pos = createVector(x,y);
  this.dir = createVector(0,0);

  this.walk = ant_walk;
  this.render = ant_render;
  this.walk_random = ant_walk_random;
  this.walk_seek = ant_walk_seek;
  this.ant_move = ant_move;
  this.ant_AI = ant_AI;
}

function ant_AI(){
  if (this.state==WALK){
    // if at the food, pick some up and head for the nest
    if (this.pos.x == food.pos.x && this.pos.y == food.pos.y)   
      this.state=FOOD;
    // otherwise, look for food
    else this.walk_seek(FOOD);
  }
  if (this.state==FOOD){
    // if at the nest, deposit food and go look for more
    if (this.pos.x == nest.pos.x && this.pos.y == nest.pos.y){
      this.state=WALK;
      nest.foodcounter++;
    }
    // otherwise, look for the nest
    else this.walk_seek(WALK);
  }
  //if (this.state==FIGHT) this.fight();
}

function ant_render(){
  push();
    translate(this.pos.x*gs,this.pos.y*gs);
    scale(gs*.8);
    rotate(PI/2+atan2(this.pos.y-this.prev_pos.y, this.pos.x-this.prev_pos.x));
    fill(0);
    noStroke();
    ellipse(0,0,.2,.2);
    ellipse(0,-.3,.25,.3);
    ellipse(0,.35,.3,.4);
    stroke(0);
    strokeWeight(.04);
    line(.2,.2,-.2,-.2);
    line(-.2,.2,.2,-.2);
    line(-.2,0,.2,0);

    line(-.2,-.2,-.3,-.4);
    line(.2,-.2,.3,-.4);
    line(-.2,-.2,-.3,-.4);

    line(.2,.2,.3,.4);
    line(-.2,.2,-.3,.4);

    line(.2,0,.4,.2);
    line(-.2,0,-.4,.2);
    
    line(0,-.3,-.15,-.5);
    line(0,-.3,.15,-.5);
  pop();
}
/*()
function ant_walk_seek(){
  // seek nonzero trail vals of a certain type and follow in a decreasing direction
  var x = this.pos.x;
  var y = this.pos.y;
  var randwalk=random_direction();
  var tx=constrain(x+randwalk.x,0,mapw);
  var ty=constrain(y+randwalk.y,0,maph);
  //current scent value where I am:
  var T = grid[x][y].trails[type];
  for (var xx=-1;xx<=1;xx++){
    for (var yy=-1;yy<=1;yy++){
      // check for trail-scent values around me and follow the lowest one (but non-0)
      if ((x!=0 || y!=0) && x+xx >=0 && x+xx<mapw && y+yy >=0 && y+yy<maph){
        // todo: all equally low T values in an array, pick a random one
        if (grid[x+xx][y+yy].trails[type]>0){
          if (grid[x+xx][y+yy].trails[type]<T
          || (grid[x+xx][y+yy].trails[type]==T && random(2)<1)){
            // equal or lesser, yet nonzero trail value found!
            T = grid[x+xx][y+yy].trails[type];
            tx = x+xx;
            ty = y+yy;
          }
        }
      }
    }
  }
  this.ant_move(tx,ty);
}
*/

function ant_walk_seek(type){
  var x = this.pos.x;
  var y = this.pos.y;
  // set to random walk: this will be the default if no high scent is found
  var randwalk=random_direction();
  var tx=constrain(x+randwalk.x,0,mapw);
  var ty=constrain(y+randwalk.y,0,maph);
  //current scent value where I am:
  var S = grid[x][y].smells[type];
  var T = grid[x][y].trails[type];
  var scentFound=false;
  // first, check for a scent indicating proximity to target
  for (var xx=-1;xx<=1;xx++){
    for (var yy=-1;yy<=1;yy++){
      // find the strongest scent value around me
      // don't go off the edge, and don't count this square
      if ((x!=0 || y!=0) && x+xx >=0 && x+xx<mapw && y+yy >=0 && y+yy<maph){
        // todo: all equally high S values in an array, pick a random one
        if (!grid[x+xx][y+yy].occupied && grid[x+xx][y+yy].smells[type]>S){
          // greater scent value found!
          S = grid[x+xx][y+yy].smells[type];
          tx = x+xx;
          ty = y+yy;
          scentFound=true;
        }
      }
    }
  }
  if (!scentFound){
    // no scent found, search for [type] trails left by other ants
    for (var xx=-1;xx<=1;xx++){
      for (var yy=-1;yy<=1;yy++){
        // check for scent values around me and follow the lowest one (but non-0)
        if ((x!=0 || y!=0) && x+xx >=0 && x+xx<mapw && y+yy >=0 && y+yy<maph){
          // todo: put all equally low T values in an array, pick a random one
          if (!grid[x+xx][y+yy].occupied && grid[x+xx][y+yy].trails[type]>0){
            if (grid[x+xx][y+yy].trails[type]<T){
              // equal or lesser, yet nonzero trail value found!
              T = grid[x+xx][y+yy].trails[type];
              tx = x+xx;
              ty = y+yy;
            }
          }
        }
      }
    }
  }
  if (tx>=0 && tx<mapw && ty>=0 && ty<maph){
    if (!grid[tx][ty].occupied) this.ant_move(tx,ty);
  }
}

function ant_move(newx, newy){
  if (newx>0 && newx<mapw && newy>=0 && newy<maph){
    this.prev_pos.x=this.pos.x;
    this.prev_pos.y=this.pos.y
    this.pos.x=newx;
    this.pos.y=newy;
    //Todo: put the 'setter' info for leaving scent trails here
    // todo: possibly in wrong place: ants who collide turn to right??
    for (var yy=-1;yy<=1;yy++){
      for (var xx=-1;xx<=1;xx++){
        if (this.pos.x+xx >=0 && this.pos.x+xx<mapw && this.pos.y+yy >=0 && this.pos.y+yy<maph){
          grid[this.pos.x+xx][this.pos.y+yy].trails[this.state] = min(100,grid[this.pos.x+xx][this.pos.y+yy].trails[this.state]+1);
        }
      }
    }
    grid[this.pos.x][this.pos.y].trails[this.state] = 100;
    grid[this.pos.x][this.pos.y].occupied=true;
    grid[this.prev_pos.x][this.prev_pos.y].occupied=false;
  }
  // soundFXs[WALK_SOUNDFX].play()
}

function ant_walk_random(){
  this.prev_pos.x=this.pos.x;
  this.prev_pos.y=this.pos.y;
  this.pos.add(random_direction())
}

function random_direction(){
  direction = [-1,0,1];
  var x=0, y=0;
  while(x==0 && y==0){
    x = direction[floor(random() * direction.length)];
    y = direction[floor(random() * direction.length)];
  }
  return createVector(x,y);
}
function ant_walk(direction){//direction is vector
  this.pos.add(direction) 
}

// https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function Node2DArray(){
  return InitialArray2D(new Node())
}

function Array2D(w, h){
  result = new Array(w);
  for (var i=0;i<w;i++){
    result[i]=new Array(h);
  }
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      // initial value:
      result[x][y] = 0;
    }
  }
  return result;
}


function InitialArray2D(w, h){
  result = new Array(w);
  for (var i=0;i<w;i++){
    result[i]=new Array(h);
  }
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      // initial value:
      result[x][y] = new Node(x,y);
    }
  }
  return result;
}


/*
Ant has a flag value, an int corresponding to its pheremone output.
0=walking
1=carrying food
2=all jacked up

Node has an array of (floats?) that represent pheremone smells.
smells[0]=walking smell
smells[1]=food carrying smell
smells.set(FOOD, .5)

etc
fading is linear (-1 per turn)
ants set the value to 100 when walking -> 0-100 gradient?
color mapping: map(value,0,100,0,255);
colorMode(RGB,100); HSB later on?

//VS
ants set (not add) scent value to 1
it fades by .9
gets set to 0 once below a certain threshold (maybe .001) -> 0-1 gradient

so ant can call a naive function:
node.increase(myflag)

and node's "increase" function takes (myflag) and increases the appropriate array index
var WALK = 0, FOOD = 1, FIGHT = 2;
*/

function Node(){
  // w=walk, f=food, a=attack/ed
  this.trails = [0,0,0];
  this.smells = [0,0,0];
  this.occupied = false;
  //
  // fun(x,y,"walked", 50)
  this.get_trails = node_get_trails;
  this.set_trails = node_set_trails;
  
  this.get_smell = node_get_smell;
  this.set_smell = node_set_smell;
  this.fade = node_fade;
 
  // grid[][].walked_strength = 50;
}

function node_fade(){
  for (var i=0;i<this.trails.length;i++){
    if (this.trails[i]>0) this.trails[i]-=.3;
  }
}

function node_get_trails(trails_type){
  switch(trails_type){
    case WALK:
      return this.trails[WALK]
    case FOOD:
      return this.trails[FOOD]
    case FIGHT:
      return this.trails[FIGHT]
  }
}


function node_set_trails(trails_type,value){
  this.trails[trails_type] = value
}



function node_get_smell(smell_type){
  switch(smell_type){
    case WALK:
      return this.smells[WALK]
    case FOOD:
      return this.smells[FOOD]
    case FIGHT:
          return this.smells[FIGHT]
  }
}


function node_set_smell(smell_type,value){
  this.smells[smell_type] = value
}

// // node structure?
// grids are 'cell' objects that retain scent information
// cells render differently depending on scent information

//behaviors
//ant 
//- move direction
//- biased dunken walk
//- 


//path traversal
  //flood fill for 
  //path change color when walked on
  
//Food 
//- collect
//- return home when 
