// Same as GL_example1a but uses a uniform variable in the vertex
// shader to control the left or right shift of the model.  The shift is
// updated in each frame (see the bottom of the main method) to animate
// the model.

// vertex shader
const vshaderSource = `
uniform mat4 transform;
attribute vec4 a_Position;
void main()
{
  // constructs a vec4 from a float and a vec3
  gl_Position = transform * a_Position;
}
`;

// fragment shader
const fshaderSource = `
precision mediump float;
uniform vec4 color;
void main() {
    gl_FragColor = color;
  }
`;

// Raw data for some point positions - this will be a square, consisting
// of two triangles.  We provide two values per vertex for the x and y coordinates
// (z will be zero by default).
var numPoints = 6;
var vertices = new Float32Array([
0.0, 0.0,
0.3, 0.0,
0.3, 0.2,
0.0, 0.0,
-0.3, 0.0,
-0.3, -0.2
]
);


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexbuffer;

// handle to the compiled shader program on the GPU
var shader;

// a transformation matrix
var modelMatrix = new THREE.Matrix4();

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

  // set uniform in shader for color for the triangle
  var colorLoc = gl.getUniformLocation(shader, "color");
  gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);

  // set uniform in shader for transformation
  var transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, modelMatrix.elements);

  // draw, specifying the type of primitive to assemble from the vertices
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {
  let textBox = document.getElementById("scaleBox");
  let shapeSizeX = 0.5;
  let shapeSizeY = 3;
  
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
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // we could just call draw() once to see the result, but setting up an animation
  // loop to continually update the canvas makes it easier to experiment with the
  // shaders
  //draw();
  modelMatrix = new THREE.Matrix4();
  var incrementA = 4;
  var incrementO = 1;
  var angle = 0;
  var origin = 0;
  // define an animation loop
  var animate = function() {
  	draw();
    requestAnimationFrame(animate);
  	angle += incrementA;
	origin += incrementO;
	modelMatrix = new THREE.Matrix4().makeTranslation(0.75*Math.cos(toRadians(origin)),0.75*Math.sin(toRadians(origin)),0).multiply(new THREE.Matrix4().makeRotationZ(toRadians(-angle)).multiply(new THREE.Matrix4().makeScale(0.5,3,1)));
  };

  // start drawing!
  animate();


}