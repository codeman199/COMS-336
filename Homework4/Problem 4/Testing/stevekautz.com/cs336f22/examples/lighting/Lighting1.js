//
// Illustration of basic diffuse lighting using a cube.  Color is hard-coded
// in the shader.  In this example, we use a light position
//


// vertex shader for lighting
const vLightingShaderSource = `
precision mediump float;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

attribute vec4 a_Position;
attribute vec3 a_Normal;

varying vec4 fColor;

void main()
{
  // hard-coded surface color
  vec4 color = vec4(1.0, 1.0, 0.0, 1.0);

  // ambient term based on surface color
  vec4 ambient =  0.1 * color;

  // convert position to eye coords
  vec4 positionEye = view * model * a_Position;

	// hard-coded light direction (vector from vertex position toward light)
  // let's assume light is directly overhead (i.e. high noon)
  vec3 lightVectorWorld = vec3(1.0, 1.0, 0.0);

  // then transform the light direction into eye coords
  vec3 L = normalize(view * vec4(lightVectorWorld, 0.0)).xyz;

	// transform normal vector into eye coords
  // (this strategy only works if there isn't any scaling in the model)
  vec3 N = normalize(view * model * vec4(a_Normal, 0.0)).xyz;

  // Factor from Lambert's law, clamp negative values to zero
  float diffuseFactor = max(0.0, dot(L, N));

  // scale color by above factor, and some arbitrary constant
  fColor = 0.6 * color * diffuseFactor + ambient;

  // restore alpha to fully opaque
  fColor.a = 1.0;

  // don't forget to compute the vertex position!
  gl_Position = projection * view * model * a_Position;
}
`;


// fragment shader for lighting
const fLightingShaderSource = `
precision mediump float;
varying vec4 fColor;
void main()
{
  gl_FragColor = fColor;
}
`;

// vertex shader for color only
const vColorShaderSource = `
uniform mat4 transform;
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 color;
void main()
{
  color = a_Color;
  gl_Position = transform * a_Position;
}
`;


// fragment shader for color only
const fColorShaderSource = `
precision mediump float;
varying vec4 color;
void main()
{
  gl_FragColor = color;
}
`;



// raw data for drawing coordinate axes
var axisVertices = new Float32Array([
0.0, 0.0, 0.0,
1.5, 0.0, 0.0,
0.0, 0.0, 0.0,
0.0, 1.5, 0.0,
0.0, 0.0, 0.0,
0.0, 0.0, 1.5]);

var axisColors = new Float32Array([
1.0, 0.0, 0.0, 1.0,
1.0, 0.0, 0.0, 1.0,
0.0, 1.0, 0.0, 1.0,
0.0, 1.0, 0.0, 1.0,
0.0, 0.0, 1.0, 1.0,
0.0, 0.0, 1.0, 1.0]);

// A few global variables...

// the OpenGL context
var gl;

// our model
var theModel;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;

var axisBuffer;
var axisColorBuffer;

// handle to the compiled shader program on the GPU
var lightingShader;
var colorShader;

// transformation matrices
var model = new THREE.Matrix4();

// view matrix
var view = createLookAtMatrix(
               new THREE.Vector3(1.77, 3.54, 3.06),   // eye
               new THREE.Vector3(0.0, 0.0, 0.0),      // at - looking at the origin
               new THREE.Vector3(0.0, 1.0, 0.0));    // up vector - y axis

// Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
//var projection = new Matrix4().setPerspective(30, 1.5, 0.1, 1000);
var projection = createPerspectiveMatrix(30, 1.5, 1, 100);

var axis = 'x';
var paused = false;

var lightPosition = new THREE.Vector3(2.0, 4.0, 2.0);

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

//handler for key press events will choose which axis to
// rotate around
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	case ' ':
		paused = !paused;
		break;
	case 'x':
		axis = 'x';
		break;
	case 'y':
		axis = 'y';
		break;
	case 'z':
		axis = 'z';
		break;
	case 'o':
		model.setIdentity();
		axis = 'x';
		break;
		default:
			return;
	}
}



// code to actually render our geometry
function draw()
{
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
  if (normalIndex < 0) {
	    console.log('Failed to get the storage location of a_Normal');
	    return;
	  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set uniforms in shader for projection, view, model transformations
  var loc = gl.getUniformLocation(lightingShader, "model");
  gl.uniformMatrix4fv(loc, false, model.elements);
  loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  // loc = gl.getUniformLocation(lightingShader, "normalMatrix");
  // gl.uniformMatrix3fv(loc, false, makeNormalMatrixElements(model, view));

  // set a light position at (2, 4, 2)
  // loc = gl.getUniformLocation(lightingShader, "lightPosition");
  // gl.uniform4f(loc, lightPosition.x, lightPosition.y, lightPosition.z, 1.0);

  gl.drawArrays(gl.TRIANGLES, 0, 36);

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);


  // bind the shader for drawing axes
  gl.useProgram(colorShader);

  // get the index for the a_Position attribute defined in the vertex shader
  positionIndex = gl.getAttribLocation(colorShader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  var colorIndex = gl.getAttribLocation(colorShader, 'a_Color');
  if (colorIndex < 0) {
	    console.log('Failed to get the storage location of a_Color');
	    return;
	  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);


  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set transformation to projection * view only
  loc = gl.getUniformLocation(colorShader, "transform");
  transform = new THREE.Matrix4().multiply(projection).multiply(view);
  gl.uniformMatrix4fv(loc, false, transform.elements);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {

  theModel = makeCube();

    // get graphics context
    gl = getGraphicsContext("theCanvas");

    // key handlers
    window.onkeypress = handleKeyPress;

    // load and compile the shaders
    lightingShader = createShaderProgram(gl, vLightingShaderSource, fLightingShaderSource);
    colorShader = createShaderProgram(gl, vColorShaderSource, fColorShaderSource);

    // load the vertex data into GPU memory
    vertexBuffer = createAndLoadBuffer(theModel.vertices);

    // buffer for vertex normals
    vertexNormalBuffer = createAndLoadBuffer(theModel.normals);

    // buffer for axis vertices
    axisBuffer = createAndLoadBuffer(axisVertices)

    // buffer for axis colors
    axisColorBuffer = createAndLoadBuffer(axisColors)

    // specify a fill color for clearing the framebuffer
    gl.clearColor(0.0, 0.3, 0.3, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // define an animation loop
    var animate = function() {
  	draw();

    // increase the rotation by 1 degree, depending on the axis chosen
    if (!paused)
    {
      switch(axis)
      {
      case 'x':
        model = new THREE.Matrix4().makeRotationX(toRadians(0.5)).multiply(model);
        axis = 'x';
        break;
      case 'y':
        axis = 'y';
        model = new THREE.Matrix4().makeRotationY(toRadians(0.5)).multiply(model);
        break;
      case 'z':
        axis = 'z';
        model = new THREE.Matrix4().makeRotationZ(toRadians(0.5)).multiply(model);
        break;
      default:
      }
    }
  	// request that the browser calls animate() again "as soon as it can"
      requestAnimationFrame(animate);
    };

    // start drawing!
    animate();


}
