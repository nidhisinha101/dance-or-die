let video;
let poseNet;
let poses = [];
let pastPoses = [];
let maxPoses = 25;
let scale = 20;


function setup() {
    const canvas = createCanvas(640, 480);
    canvas.parent('container');
    canvas.position((windowWidth - width) / 2,
    (windowHeight - height) / 2);
    video = createCapture(VIDEO);
    video.size(width, height);

    colorMode(HSL);
 
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

function modelReady() {
    console.log('PoseNet Model Loaded!');
}

function draw() {
    image(video, 0, 0, width, height);
    drawKeypoints();
}

function drawKeypoints() {
  for (let i = 1; i < pastPoses.length; i+=2){
    let pose = pastPoses[i];
    let prevPose = pastPoses[i-1];
    if (pose && prevPose) {
      //Right Hand (Wrist) 
      let rHandX = pose[10].position.x; 
      let rHandY = pose[10].position.y;
      let rHandPX = prevPose[10].position.x; 
      let rHandPY = prevPose[10].position.y;
      //Left Hand (Wrist)
      let lHandX = pose[9].position.x; 
      let lHandY = pose[9].position.y;
      let lHandPX = prevPose[9].position.x; 
      let lHandPY = prevPose[9].position.y;
      //Nose
      let noseX = pose[0].position.x; 
      let noseY = pose[0].position.y;
      let nosePX = prevPose[0].position.x; 
      let nosePY = prevPose[0].position.y;
      
      //Movement
      let rHMove = dist(rHandX, rHandY, rHandPX, rHandPY);
      let lHMove = dist(lHandX, lHandY, lHandPX, lHandPY);
      let noseMove = dist(noseX, noseY, nosePX, nosePY);

      //Parameters 
      const MIN_SIZE = 20;         // very small base size
      const MAX_SIZE = 400;       // hard cap for safety
      const MOVEMENT_THRESHOLD = 60; // pixels under this count as small/noise
      const EXPONENT = 1.5;       // >1 makes growth accelerate with speed
      const HAND_MULTIPLIER = 1;   // tunes eye responsiveness
      const NOSE_MULTIPLIER = 1;  // nose tends to produce larger effect

      function dramaticSize(movement, multiplier){
        // apply deadzone so tiny jitters don't affect size
        let m = max(0, movement - MOVEMENT_THRESHOLD);
        // normalize to keep values reasonable across webcams; increase divisor to reduce sensitivity
        let norm = m / 4.0;
        let s = MIN_SIZE + pow(norm, EXPONENT) * multiplier + scale * 0.15;
        return constrain(s, MIN_SIZE, MAX_SIZE);
      }

      let RHSize = dramaticSize(rHMove, HAND_MULTIPLIER);
      let LHSize = dramaticSize(lHMove, HAND_MULTIPLIER);
      let nosesize = dramaticSize(noseMove, NOSE_MULTIPLIER);
      
      //Draw animations using dramatic sizes
      prettyCircle(rHandX, rHandY, RHSize, "rightHand");
      prettyCircle(lHandX, lHandY, LHSize, "leftHand");
      prettyCircle(noseX, noseY, nosesize, "noseY");
      prettyCircle(noseX, noseY, nosesize, "noseX");
    }
  }
}

function prettyCircle(x, y, size, pose){
    if (pose == "rightHand"){ //Right Hand Blue Circles
        c = "hsla(200, 83%, 41%, 1.00)";
        c2 = "hsla(185, 83%, 75%, 1.00)";
        x = 175;
        y = 120;
        x2 = 575;
        y2 = 400;
    }
    else if (pose == "noseX"){ //Nose Yellow Circles
        c = "hsla(35, 100%, 50%, 1.00)";
        c2 = "hsla(50, 100%, 80%, 1.00)";
        x = 475;
        y = 120;
        x2 = 100;
        y2 = 250;
    }
    else if (pose == "noseY"){  //Nose Green Circles
        c = "hsla(120, 73%, 40%, 1.00)";
        c2 = "hsla(121, 100%, 80%, 1.00)";
        x = 560;
        y = 250;
        x2 = 50;
        y2 = 50;
    }
    else if (pose == "leftHand"){ //Left Hand Pink Circles
        c = "hsla(300, 86%, 28%, 1.00)";
        c2 = "hsla(300, 100%, 74%, 1.00)";
        x = 330;
        y = 65;
        x2 = 85;
        y2 = 400;
    }

    // Make the circles
    drawRadialGradientCircle(x, y, size * 2, c2, c);
    drawRadialGradientCircle(x2, y2, size * 2, c2, c);
}

//Create radial gradient circles
function drawRadialGradientCircle(x, y, radius, innerColor, outerColor){
    stroke(c);
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

