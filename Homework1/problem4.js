// Same as GL_example1a, but uses a uniform variable to set the
// color in the fragment shader.



// vertex shader
const vshaderSourceRight = `
attribute vec4 a_Position;
uniform float shiftX;
uniform float shiftY;
uniform float shapeSize;
void main() {
    // constructs a vec4 from a float and a vec3
    gl_Position = vec4((a_Position.x * shapeSize) + shiftX, (a_Position.y * shapeSize) + shiftY, a_Position.zw);
}
`;

// fragment shader
const fshaderSourceRight = `
// precision declaration required to use floats
precision mediump float;
uniform vec4 color;
void main()
{
  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	gl_FragColor = color;
}
`;

// vertex shader
const vshaderSourceLeft = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform float shiftX;
uniform float shiftY;
uniform float shapeSize;
varying vec4 color;
void main()
{
  color = a_Color;
  // constructs a vec4 from a float and a vec3
    gl_Position = vec4((a_Position.x * shapeSize) + shiftX, (a_Position.y * shapeSize) + shiftY, a_Position.zw);

}
`;

// fragment shader
// vertex shader
const fshaderSourceLeft = `
// In a webgl fragment shader, float precision has to be specified before
// any other variable declarations (in this case, "medium" precision)
precision mediump float;
varying vec4 color;
void main()
{
  gl_FragColor = color;
}
`;

// Raw data for some point positions - this will be a square, consisting
// of two triangles.  We provide two values per vertex for the x and y coordinates
// (z will be zero by default).
var numPoints = 6;
var rightSquare = new Float32Array([
-0.5, -0.5,
0.5, -0.5,
0.5, 0.5,
-0.5, -0.5,
0.5, 0.5,
-0.5, 0.5
]
);

var leftSquare = new Float32Array([
-0.5, -0.5,
0.5, -0.5,
0.5, 0.5,
-0.5, -0.5,
0.5, 0.5,
-0.5, 0.5
]
);


// A few global variables...

// the OpenGL context
var gl;

// code to actually render our geometry
function draw(currentColor, shiftXValue, shiftYValue, sizeValue, shader, vertexbuffer)
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

  let index = gl.getUniformLocation(shader, "color");
  gl.uniform4f(index, currentColor[0], currentColor[1], currentColor[2], currentColor[3]);
  //gl.uniform4fv(index, new Float32Array(currentColor));
  
  let indexX = gl.getUniformLocation(shader, "shiftX");
  gl.uniform1f(indexX, shiftXValue);
  
  let indexY = gl.getUniformLocation(shader, "shiftY");
  gl.uniform1f(indexY, shiftYValue);

  let size = gl.getUniformLocation(shader, "shapeSize");
  gl.uniform1f(size, sizeValue);

  // draw, specifying the type of primitive to assemble from the vertices
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {

  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

    // get graphics context
  gl = getGraphicsContext("theCanvas");

  // load and compile the shader pair
  shaderRight = createShaderProgram(gl, vshaderSourceRight, fshaderSourceRight);
  shaderLeft = createShaderProgram(gl, vshaderSourceLeft, fshaderSourceLeft);

  // load the vertex data into GPU memory
  vertexbufferRight = createAndLoadBuffer(rightSquare);
  vertexbufferLeft = createAndLoadBuffer(leftSquare);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  index = 0;
  increment = 0.01;
  colorVal = increment;

  // define an animation loop
  var animate = function() {
    color = [0.0, 0.0, 0.0, 1.0];
    color[index] = colorVal;
	draw(color, .45,0,.85, shaderRight, vertexbufferRight);
	draw(color, -.45,0,.85, shaderLeft, vertexbufferLeft);
    colorVal += increment;
    if (colorVal >= 1)
    {
      increment = -increment
    }
    else if (colorVal <= 0)
    {
      increment = -increment;
      index = (index + 1) % 3;
    }

	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();


}
