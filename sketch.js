let video;
let poseNet;
let poses = [];
let pastPoses = [];
let maxPoses = 25;

let bounceSpeed = 2; // Velocity of bouncing circles
// Positions of circles
let circles = [
  { x: 175, y: 120, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightHand" },
  { x: 600, y: 150, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightHand" },
  { x: 575, y: 400, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightHand" },
  { x: 250, y: 350, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseX" },
  { x: 475, y: 120, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseX" },
  { x: 100, y: 250, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseX" },
  { x: 450, y: 350, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseY" },
  { x: 560, y: 250, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseY" },
  { x: 50, y: 50, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "noseY" },
  { x: 330, y: 65, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftHand" },
  { x: 85, y: 400, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftHand" },
  { x: 700, y: 300, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftHand" },
  { x: 200, y: 500, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightShoulder" },
  { x: 650, y: 450, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightShoulder" },
  { x: 400, y: 200, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "rightShoulder" },
  { x: 300, y: 150, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftShoulder" },
  { x: 550, y: 350, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftShoulder" },
  { x: 150, y: 300, vx: 0, vy: 0, currentSize: 5, targetSize: 2, pose: "leftShoulder" }
];

//Set up canvas
function setup() {
    // Remove any existing canvases to avoid duplicates (cleanup from hot reloads/devtools)
    document.querySelectorAll('canvas').forEach(c => c.remove());

    const canvas = createCanvas(800,600);
    canvas.parent('container');
    canvas.position((windowWidth - width) / 2,
    (windowHeight - height) / 2);
    video = createCapture(VIDEO);
    video.size(width, height);

    colorMode(HSL);
    
    // Initialize circle velocities
    circles[0].vx = bounceSpeed * 0.7;
    circles[0].vy = bounceSpeed * 0.5;
    circles[1].vx = -bounceSpeed * 0.6;
    circles[1].vy = bounceSpeed * 0.8;
    circles[2].vx = bounceSpeed * 0.5;
    circles[2].vy = -bounceSpeed * 0.7;
    circles[3].vx = -bounceSpeed * 0.8;
    circles[3].vy = bounceSpeed * 0.6;
    circles[4].vx = bounceSpeed * 0.6;
    circles[4].vy = -bounceSpeed * 0.5;
    circles[5].vx = bounceSpeed * 0.7;
    circles[5].vy = bounceSpeed * 0.8;
    circles[6].vx = -bounceSpeed * 0.5;
    circles[6].vy = bounceSpeed * 0.7;
    circles[7].vx = bounceSpeed * 0.8;
    circles[7].vy = -bounceSpeed * 0.6;
    circles[8].vx = -bounceSpeed * 0.7;
    circles[8].vy = bounceSpeed * 0.5;
    circles[9].vx = bounceSpeed * 0.6;
    circles[9].vy = -bounceSpeed * 0.8;
    circles[10].vx = -bounceSpeed * 0.5;
    circles[10].vy = bounceSpeed * 0.7;
    circles[11].vx = bounceSpeed * 0.7;
    circles[11].vy = -bounceSpeed * 0.8;
    circles[12].vx = bounceSpeed * 0.6;
    circles[12].vy = bounceSpeed * 0.5;
    circles[13].vx = -bounceSpeed * 0.8;
    circles[13].vy = bounceSpeed * 0.6;
    circles[14].vx = bounceSpeed * 0.5;
    circles[14].vy = -bounceSpeed * 0.7;
    circles[15].vx = -bounceSpeed * 0.6;
    circles[15].vy = bounceSpeed * 0.8;
    circles[16].vx = bounceSpeed * 0.7;
    circles[16].vy = -bounceSpeed * 0.5;
 
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', function (results) {
        poses = results;
      if (poses.length > 0) { pastPoses.push(JSON.parse(JSON.stringify(poses[0].pose.keypoints))); 
        
        if (pastPoses.length > maxPoses) {
          pastPoses.shift();
        }
      }  
    });

    video.hide();
}

//Confirm model loaded
function modelReady() {
    console.log('PoseNet Model Loaded!');
}

//Draw loop
function draw() {
    image(video, 0, 0, width, height);
    updateCirclePositions();
    drawKeypoints();
}

// Update positions of bouncing circles
function updateCirclePositions() {
  // Update each circle's position based on velocity
  for (let circle of circles) {
    circle.x += circle.vx;
    circle.y += circle.vy;
    
    // Bounce off canvas edges
    const radius = 50; // Approximate bounce zone
    
    if (circle.x - radius < 0 || circle.x + radius > width) {
      circle.vx *= -1;
      circle.x = constrain(circle.x, radius, width - radius);
    }
    if (circle.y - radius < 0 || circle.y + radius > height) {
      circle.vy *= -1;
      circle.y = constrain(circle.y, radius, height - radius);
    }
    
    // Tween the current size towards target size
    circle.currentSize = lerp(circle.currentSize, circle.targetSize, 0.1);
  }
}

// Update target size for circles associated with a specific pose
function updateCircleTargetSize(pose, newSize) {
  for (let circle of circles) {
    if (circle.pose === pose) {
      circle.targetSize = newSize;
    }
  }
}

// Update circle sizes based on movement
function drawKeypoints() {
  // Initialize all circle target sizes to minimum (no movement)
  updateCircleTargetSize("rightHand", 5);
  updateCircleTargetSize("leftHand", 5);
  updateCircleTargetSize("noseX", 5);
  updateCircleTargetSize("noseY", 5);
  updateCircleTargetSize("rightShoulder", 5);
  updateCircleTargetSize("leftShoulder", 5);
  
  for (let i = 1; i < pastPoses.length; i+=2){
    let pose = pastPoses[i];
    let prevPose = pastPoses[i-1];
    if (pose && prevPose) {
      //Right Hand (Wrist) 
      let rHandX = pose[10].position.x; 
      let rHandY = pose[10].position.y;
      let rHandPX = prevPose[10].position.x; 
      let rHandPY = prevPose[10].position.y;
      let rHandConfidence = pose[10].score;
      
      //Left Hand (Wrist)
      let lHandX = pose[9].position.x; 
      let lHandY = pose[9].position.y;
      let lHandPX = prevPose[9].position.x; 
      let lHandPY = prevPose[9].position.y;
      let lHandConfidence = pose[9].score;
      
      //Nose
      let noseX = pose[0].position.x; 
      let noseY = pose[0].position.y;
      let nosePX = prevPose[0].position.x; 
      let nosePY = prevPose[0].position.y;
      let noseConfidence = pose[0].score;

      //Right Shoulder 
      let rShoulderX = pose[6].position.x; 
      let rShoulderY = pose[6].position.y;
      let rShoulderPX = prevPose[6].position.x; 
      let rShoulderPY = prevPose[6].position.y;

      //Left Shoulder 
      let lShoulderX = pose[5].position.x; 
      let lShoulderY = pose[5].position.y;
      let lShoulderPX = prevPose[5].position.x; 
      let lShoulderPY = prevPose[5].position.y;
      
      //Movement
      let rHMove = dist(rHandX, rHandY, rHandPX, rHandPY);
      let lHMove = dist(lHandX, lHandY, lHandPX, lHandPY);
      let noseMove = dist(noseX, noseY, nosePX, nosePY);
      let rShoulderMove = dist(rShoulderX, rShoulderY, rShoulderPX, rShoulderPY);
      let lShoulderMove = dist(lShoulderX, lShoulderY, lShoulderPX, lShoulderPY);

      //Parameters 
      const MIN_SIZE = 2;         // radius minimum
      const MAX_SIZE = 200;        // radius maximum
      const MOVEMENT_THRESHOLD = 1; // pixels under this count as small/noise
      const EXPONENT = 1;       // <1 makes growth less aggressive
      const HAND_MULTIPLIER = 1.5;   // tunes eye responsiveness
      const NOSE_MULTIPLIER = 2;  // tunes nose responsiveness
      const SHOULDER_MULTIPLIER = 2; // tunes shoulder responsiveness
      const SENSITIVITY_DIVISOR = 0.4; // increase to reduce sensitivity
      const CONFIDENCE_THRESHOLD = 0.6; // minimum confidence to count detection

      function dramaticSize(movement, multiplier, confidence){
        // Only calculate size if confidence is high enough
        if (confidence < CONFIDENCE_THRESHOLD) {
          return MIN_SIZE;
        }
        // apply deadzone so tiny jitters don't affect size
        let m = max(0, movement - MOVEMENT_THRESHOLD);
        // normalize to keep values reasonable across webcams; increase divisor to reduce sensitivity
        let norm = m / SENSITIVITY_DIVISOR;
        let s = MIN_SIZE + pow(norm, EXPONENT) * multiplier;
        return constrain(s, MIN_SIZE, MAX_SIZE);
      }

      let RHSize = dramaticSize(rHMove, HAND_MULTIPLIER, rHandConfidence);
      let LHSize = dramaticSize(lHMove, HAND_MULTIPLIER, lHandConfidence);
      let nosesize = dramaticSize(noseMove, NOSE_MULTIPLIER, noseConfidence);
      let shoulderSize = dramaticSize((rShoulderMove + lShoulderMove)/2, SHOULDER_MULTIPLIER, (pose[5].score + pose[6].score)/2);
      
      //Filter video to grayscale if there's not enough movement 
      if (RHSize == MIN_SIZE && LHSize == MIN_SIZE && nosesize == MIN_SIZE && shoulderSize == MIN_SIZE){
        sadMode();
      }
      else{
        // Reset filter if there is movement
        resetShader();
      }

      // Update target sizes for bouncing circles
      updateCircleTargetSize("rightHand", RHSize);
      updateCircleTargetSize("leftHand", LHSize);
      updateCircleTargetSize("noseX", nosesize);
      updateCircleTargetSize("noseY", nosesize);
      updateCircleTargetSize("rightShoulder", shoulderSize);
      updateCircleTargetSize("leftShoulder", shoulderSize);
      
      //Draw animations using dramatic sizes
      prettyCircle("rightHand");
      prettyCircle("leftHand");
      prettyCircle("noseY");
      prettyCircle("noseX");
      prettyCircle("rightShoulder");
      prettyCircle("leftShoulder");

    }
  }
}

//Assign colors for pretty circles
function prettyCircle(pose){
    let c, c2; //idea for later: assign the colors randomly
    
    if (pose == "rightHand"){ //Right Hand Blue Circles
        c = "hsla(200, 83%, 41%, 1.00)";
        c2 = "hsla(185, 83%, 75%, 1.00)";
    }
    else if (pose == "noseX"){ //Nose Yellow Circles
        c = "hsla(35, 100%, 50%, 1.00)";
        c2 = "hsla(50, 100%, 80%, 1.00)";
    }
    else if (pose == "noseY"){  //Nose Green Circles
        c = "hsla(62, 100%, 59%, 1.00)";
        c2 = "hsla(46, 100%, 78%, 1.00)";
    }
    else if (pose == "leftHand"){ //Left Hand Pink Circles
        c = "hsla(308, 100%, 54%, 1.00)";
        c2 = "hsla(300, 100%, 85%, 1.00)";
    }
    else if (pose == "rightShoulder"){ //Right Shoulder Purple Circles
        c = "hsla(291, 77%, 40%, 1.00)";
        c2 = "hsla(270, 100%, 80%, 1.00)";
    }
    else if (pose == "leftShoulder"){ //Left Shoulder Orange Circles
        c = "hsla(106, 100%, 50%, 1.00)";
        c2 = "hsla(97, 100%, 57%, 1.00)";
    }

    // Draw bouncing circles for this pose using tweened sizes
    for (let circle of circles) {
        if (circle.pose === pose) {
            drawRadialGradientCircle(circle.x, circle.y, circle.currentSize, c2, c);
        }
    }
}

//Create radial gradient circles
function drawRadialGradientCircle(x, y, radius, innerColor, outerColor){
    strokeWeight(1.25);
    stroke(outerColor);
    const steps = 30;
    for (let i = 0; i < steps; i++){
        let r1 = map(i, 0, steps, radius, 0);
        let r2 = map(i + 1, 0, steps, radius, 0);
        let t = i / steps;
        // Interpolate between inner and outer color
        fill(lerpColor(color(innerColor), color(outerColor), t));
        ellipse(x, y, r1 * 2, r2 * 2);
    }
}

//Sad mode - fade to gray and show message
function sadMode(){
  filter(GRAY); // Fade to gray when no movement
  push();
  textSize(20);
  textAlign(CENTER, BOTTOM);
  noStroke();
  fill(255);
  text("Dancing will make your world brighter", width / 2, height - 30);
  pop();
}

