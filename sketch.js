let CERTAINTY_THRESHOLD = 0.0; // threshold for plotting the keypoints
let MIRROR_VIDEO_FEED = false;
let SHOW_NUMBERS = true;
let SHOW_SKELETON = true;
let DEBUG_MODE = true;
let UPDATE_THRESHOLD = 0.4; // certainty threshold for updating the keypoints
let ACTIVATION_FUNCTION = identityFunction;

let video;
let poseNet;
let textField; 
let overallCertainty = 0.0;
let keypoints = [];
let infoCount = 1;
let getInPositionTimer = 5;
let elbowline = -1;
let wristline = -1;
let ElbowLine = -1;
let upperHelpLine = -1;
let lowerHelpLine = -1;
let WristLine = -1;
let curlCount = 0;
let ElbowBelowLowerLine = false;
let WristAboveUpperLine = false;
let rwristX,rwristY; 
let lwristX,lwristY; 
let singlePose,skeleton;

function setup() {
  createCanvas(640, 480);
  createP(""); // blank line under canvas
  
  // instantiate the keypoints array
  for (let i=0;i<17;i++) {
    keypoints.push(new Keypoint(i));
  }
  
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);
  
  if (DEBUG_MODE == true) {
    textField = createDiv('SkyCliff Demo');
    textField.style('color', '#ffffff');
    textField.style('font-size', '32px');
    textField.position(650,0);
    textField.size(320,480);
  } else {
    video.hide();
    SHOW_NUMBERS = false;
    SHOW_SKELETON = false;
  }
  
  // every second update the getInPositionTimer
  function updateTimer() {
    if (getInPositionTimer != 0) {
      getInPositionTimer--;
      console.log(getInPositionTimer);
      if (getInPositionTimer == 0) {
        console.log("LET'S START WORKING OUT!")
      }
    }
  }
  setInterval(updateTimer,1000);
}

function gotPoses(poses) {
  
  if (infoCount != 0) {
    // only for debugging
    console.log(poses[0]);
    console.log(keypoints);
    infoCount--;
  }
  
  if (poses.length > 0) {
    // update the keypoints with the new pose data
    let pose = poses[0].pose;
    overallCertainty = pose.score;
    for (let i=0; i< pose.keypoints.length; i++) {
      keypoints[i].update(pose.keypoints[i].position.x,pose.keypoints[i].position.y,pose.keypoints[i].score,pose.keypoints[i].part);
    }
    
  e = createVector(keypoints[8].x,keypoints[8].y)
  s = createVector(keypoints[6].x,keypoints[6].y)
  w = createVector(keypoints[10].x,keypoints[10].y)

  ac = e.dist(s)
  ab = e.dist(w)
  bc = w.dist(s)

  out = Math.acos((ac*ac + ab*ab - bc*bc)/(2*ac*ab)) *  (180/Math.PI)
  text('elbow angle : ' + out + degrees(out).toFixed(2) , 10,70,90,90 );
  textSize(16);
  fill(255, 0, 0);
  console.log("ANGLE: ", out, " degrees" )

  }
}

function prettyProbability(floatNum) {
  return (round(floatNum * 10000) / 100) + " %";
}

function modelReady() {
  console.log('Ready to count your Curls !!!');
}

function draw() {
  if (MIRROR_VIDEO_FEED == true) {
    // flip the video vertically to create a video which functions as a mirror
    translate(width,0); // move canvas to the right
    scale(-1.0,1.0); // flip x-axis backwards
  }
  
  if (DEBUG_MODE == true) {
    image(video, 0, 0);
  } else {
    background(150);
  }
  
  if (getInPositionTimer > 0) {
    // show countdown of getInPositionTimer
    push()
    if (MIRROR_VIDEO_FEED == true) {
      translate(width,0);
      scale(-1.0,1.0);
    }
    fill(255,255,255); // setting color to white
    textSize(64);
    text(getInPositionTimer,width/2,height/2); // show the timer
    pop();
  }
  
  if (getInPositionTimer == 0) {
    // show curl count
    push();
    if (MIRROR_VIDEO_FEED == true) {
      translate(width,0);
      scale(-1.0,1.0);
    }
    fill(255,255,255); // setting color to white
    textSize(64);
    text(curlCount,width/16,height/8); // show the CurlCount
    pop();
    
    // d is dictance between the nose and the left eye
    let d = dist(keypoints[0].x, keypoints[0].y, keypoints[1].x, keypoints[1].y);
    
    drawElbowsAndWrists();
  
    for (let i=0; i < keypoints.length;i++) {
      fill(0,255,0); // setting color to green
      keypoints[i].display(d/2); // display the i.th keypoint
    }
  
    if (SHOW_SKELETON == true) {
      drawSkeleton();
    }

    updateCurlCount();
    }
}




function receivedPoses(poses){
  console.log(poses);

  if(poses.length > 0){
      singlePose = poses[0].pose;
      skeleton = poses[0].skeleton;
      rwristX = singlePose.rightWrist.x
      let myDegrees = map(rwristX, 0, width, 0, 360);
      let readout = 'angle = ' + nfc(myDegrees, 1) + '\xB0';
      noStroke();
      fill(0);
      text(readout, 15, 45);
      let v = p5.Vector.fromAngle(radians(myDegrees), 30);
      let vx = v.x;
      let vy = v.y;

      push();
      translate(width / 2, height / 2);
      noFill();
      stroke(150);
      line(0, 0, 30, 0);
      stroke(0);
      line(0, 0, vx, vy);
      pop();
  }
}


function updateCurlCount() {
  // try to detect the Elbow
  // let leftElbow = keypoints[7];
  // let rightElbow = keypoints[8];
  // try to detect the wrist
  let leftWrist = keypoints[9];
  let rightWrist = keypoints[10];
  
  if (WristAboveUpperLine == true) {
    if (leftWrist.y >= lowerHelpLine && rightWrist.y >= lowerHelpLine) {
      WristAboveUpperLine = false;
      curlCount++;
    }
  } else {
    if (leftWrist.y <= upperHelpLine && rightWrist.y <= upperHelpLine) {
      WristAboveUpperLine = true;
    } 
  }
  
}



function drawElbowsAndWrists() {
  let ElbowDetected = (ElbowLine > 0) ? true : false;
  let WristDetected = (WristLine > 0) ? true : false;
  
  if (ElbowDetected == false && WristDetected == false) {
    // try to detect the Elbow
    let leftElbow = keypoints[7];
    let rightElbow = keypoints[8];
    
    // try to detect the wrist
    let leftWrist = keypoints[9];
    let rightWrist = keypoints[10];
    
    if (leftElbow.certainty > 0.7 && rightElbow.certainty > 0.7 && leftWrist.certainty > 0.7 && rightWrist.certainty > 0.7) {
      
      // Elbows have been successfully detected
      ElbowLine = (leftElbow.y + rightElbow.y) * 0.5;
      ElbowDetected = true;
      
      // wrists have been successfully detected
      WristLine = (leftWrist.y + rightWrist.y) * 0.5;
      WristDetected = true;
      
      // calculate help lines
      distanceElbowWrist = WristLine - ElbowLine; // is a positive number!
      upperHelpLine = ElbowLine + distanceElbowWrist/3;
      lowerHelpLine = upperHelpLine + distanceElbowWrist/3;
    }
  }
  
  // draw Wrist and Elbow lines if possible
  
  if (ElbowDetected == true && WristDetected == true) {
    push();
    stroke('red');
    
    line(0,ElbowLine,width,ElbowLine); // draws Elbow
    
    line(0,WristLine,width,WristLine); // draws Wrist
    
    // draws area inbetween
    noStroke();
    fill(255,0,0,100); // color: red, slightly transparent
    
    rect(0,upperHelpLine,width,lowerHelpLine-upperHelpLine);
    pop();
  }
  
} 
  
function angleTwoPoints(leftPoint,rightPoint) {
  // tan(alpha) = opposite / adjacent; solve for alpha
  return atan((rightPoint.y-leftPoint.y)/(rightPoint.x-leftPoint.x));
}

function drawSkeleton() {
  // draw edges between these points
  let edges = [
    [5,7], // left biceps
    [7,9], // left forearm
    [6,8], // right biceps
    [8,10], // right forearm
    [5,6], // shoulders
    [5,11], // left back
    [11,13], // left quad
    [13,15], // left calf
    [6,12], // right back
    [11,12], // waist
    [12,14], // right quad
    [14,16] // right calf
  ];
  
  for (let i=0;i<edges.length;i++) {
    lineBetweenPoints(edges[i][0],edges[i][1]);
  }
}

function lineBetweenPoints(firstIndex,secondIndex) {
  let firstPoint = keypoints[firstIndex];
  let secondPoint = keypoints[secondIndex];
  
  if (firstPoint.certainty >= CERTAINTY_THRESHOLD && secondPoint.certainty >= CERTAINTY_THRESHOLD) {
    stroke(255,255,255); // setting the line color to white
    line(firstPoint.x,firstPoint.y,secondPoint.x,secondPoint.y); // draw line
  }
}

// ACTIVATION FUNCTIONS -------------------------
function identityFunction(x) {return  x;}
function logarithmicFunction(x) {return Math.log(1+x) / Math.log(2);}
function squaredFunction(x) {return x*x;}
function sigmoidFunction(x) {return 1 / (1 + Math.exp(x));}

// KEYPOINT CLASS ----------------------------
class Keypoint {
  constructor(i) {
    this.index = i;
    this.x = 0;
    this.y = 0;
    this.certainty = 0;
    this.name = '';
  }

  update(newX,newY,newCertainty,name) {

    if (newCertainty > UPDATE_THRESHOLD) {
      this.x = this.updateCoord(this.x,this.certainty,newX,newCertainty);
      this.y = this.updateCoord(this.y,this.certainty,newY,newCertainty);
      this.certainty = this.updateCertain(this.certainty,newCertainty);
    }
    
    this.name = name;
  }
  
  updateCoord(oldValue, oldCertainty, newValue, newCertainty) {
    let activatedOldCertainty = ACTIVATION_FUNCTION(oldCertainty);
    let activatedNewCertainty = ACTIVATION_FUNCTION(newCertainty);
    return (activatedOldCertainty * oldValue + activatedNewCertainty * newValue) / (activatedOldCertainty + activatedNewCertainty);
  }
  
  updateCertain(oldCertainty, newCertainty) {
    let activatedOldCertainty = ACTIVATION_FUNCTION(oldCertainty);
    let activatedNewCertainty = ACTIVATION_FUNCTION(newCertainty);
    return (activatedOldCertainty * oldCertainty + activatedNewCertainty * newCertainty) / (activatedOldCertainty + activatedNewCertainty);
  }

  display(diam) {
    if (this.certainty >= CERTAINTY_THRESHOLD) {
      // draws a circle with its center at (this.x,this.y) and diameter diam
      ellipse(this.x, this.y, diam);
      fill(0,0,0); // setting color to black
      if (SHOW_NUMBERS == true) {
        if (MIRROR_VIDEO_FEED == true) {
          translate(width,0);
          scale(-1.0,1.0);
          text(this.index,width-this.x,this.y); // show the index of the keypoint
          translate(width,0);
          scale(-1.0,1.0);
        } else {
          text(this.index,this.x,this.y); // show the index of the keypoint
        }
      }
    }
  }
}