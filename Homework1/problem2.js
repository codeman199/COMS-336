// Same as GL_example1 but the js file moves the boilerplate
// code into CS336util.js.

// vertex shader
const vshaderSource = `
attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
}
`;

// fragment shaders
const fshaderSource = `
void main() {
    gl_FragColor = vec4(0.7, 0.0, 0.6, 1.0);
  }
`;


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexbuffer;

// handle to the compiled shader program on the GPU
var shader;

// code to actually render our geometry
function draw()
{
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
  // the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // draw, specifying the type of primitive to assemble
  // (do this in two steps to try out Spector.js)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {
  let textBox = document.getElementById("pointsBox");
  numPoints = parseInt(textBox.value);
  let theta = (2*Math.PI)/numPoints;
  var vertices = new Float32Array(numPoints*2);
  
  for (let i = 0; i < numPoints; i++) {
		vertices[i + i] = (.8*Math.cos((i)*theta));
		vertices[i + i + 1] = (.8*Math.sin((i)*theta));
  }
	
  textBox.onchange = function(){
    numPoints = parseInt(textBox.value);
	console.log(numPoints);
	theta = (2*Math.PI)/numPoints;
	var newVertices = new Float32Array(numPoints*2);
	for (let i = 0; i < numPoints; i++) {
		newVertices[i + i] = (.8*Math.cos((i)*theta));
		newVertices[i + i + 1] = (.8*Math.sin((i)*theta));

		console.log(newVertices[i + i]);
		console.log(newVertices[i + i + 1]);
	}
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	vertexbuffer = createAndLoadBuffer(newVertices);
	draw();
  };
  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

  // get graphics context
  gl = getGraphicsContext("theCanvas");

  // load and compile the shader pair
  shader = createShaderProgram(gl, vshaderSource, fshaderSource);

  // load the vertex data into GPU memory
  vertexbuffer = createAndLoadBuffer(vertices);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // we could just call draw() once to see the result, but setting up an animation
  // loop to continually update the canvas makes it easier to experiment with the
  // shaders
  
  
  // define an animation loop
  var animate = function() {
	  draw();

	  // request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();

}
