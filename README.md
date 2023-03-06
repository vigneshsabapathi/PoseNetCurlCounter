# PoseNetCurlCounter
Project : Build a local web page that has access to web camera that is used to track and count bicep curls. Display repetition counter and angle of elbow joints

Step by Step Instructions:
* Opent the link hosted on Git https://vigneshsabapathi.github.io/PoseNetCurlCounter/ 
* Auto timer of 5 secounds starts. Get in position. Make sure whole body is seen by the webcamera.
* use both hands to curl. repetion counter will start counting.
* elbow angle is displayed on the left corner of the canvas.

Requirements:
For this project we are using p5.js , ml5.js and tesorflow.js(PoseNet).

Assumptions Made:
* Single person can be tracked not multiple people.
* Both arms should be in sync so angle calculated for forearm and bicep.

Current Scope:
* Displays all 17 keypoints to map human body using PoseNet.
* Both arms should be used for curls.
* Draw lines for ease of user to count and display repetition counter.

Limitation:
* If keypoints are not in the frame properly then they are pulled to left corner of the canvas.


******************************************************************************************************************************************
