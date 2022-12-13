/**
 * Represents an RGBA color. Values should normally be in the range [0.0, 1.0].
 * @constructor
 * @param {Number} r - red value (default 0.0)
 * @param {Number} g - green value (default 0.0)
 * @param {Number} b - blue value (default 0.0)
 * @param {Number} a - alpha value (default 1.0)
 */
function Color(r, g, b, a)
{
	this.r = (r ? r : 0.0);
	this.g = (g ? g : 0.0);
	this.b = (b ? b : 0.0);
	this.a = (a ? a : 1.0);
}

/**
 * Interpolates a color value within a rectangle based on an
 * x, y offset from the lower left corner.  The base of the rectangle is
 * always aligned with the bottom of the canvas.  Returns null if the given
 * offset does not lie within the rectangle.
 * @param {Number} x - offset from left side
 * @param {Number} y - offset from bottom
 * @param {Number} base - base of rectangle
 * @param {Number} height - height of triangle
 * @param {Color[]} colors - colors of the four corners, counterclockwise
 *   from lower left
 * @return {Color} interpolated color at offset (x, y)
 */
function findRGB(x, y, width, height, colors)
{
  var result = new Color();
  
  //Points x and y values
  var p1x = 0;
  var p1y = 0;
  
  var p2x = width;
  var p2y = 0;
  
  var p3x = width;
  var p3y = height;
  
  var p4x = 0;
  var p4y = height;
  
  if (x > width || x < 0 || y > height || y < 0)
  {
    return null;
  }
  
  var w0 = 1 / Math.sqrt(Math.pow(p1x-x,2) + Math.pow(p1y-y,2));
  var w1 = 1 / Math.sqrt(Math.pow(p2x-x,2) + Math.pow(p2y-y,2));
  var w2 = 1 / Math.sqrt(Math.pow(p3x-x,2) + Math.pow(p3y-y,2));
  var w3 = 1 / Math.sqrt(Math.pow(p4x-x,2) + Math.pow(p4y-y,2));
  
  result.r = (w0*colors[0].r + w1*colors[1].r + w2*colors[2].r + w3*colors[3].r)/(w0 + w1 + w2 + w3);
  result.g = (w0*colors[0].g + w1*colors[1].g + w2*colors[2].g + w3*colors[3].g)/(w0 + w1 + w2 + w3);
  result.b = (w0*colors[0].b + w1*colors[1].b + w2*colors[2].b + w3*colors[3].b)/(w0 + w1 + w2 + w3);
  result.a = (w0*colors[0].a + w1*colors[1].a + w2*colors[2].a + w3*colors[3].a)/(w0 + w1 + w2 + w3);
  return result;
}

//For testing
function main() {
  var Red = new Color(1,0,0,1);
  var Green = new Color(0,1,0,1);
  var Blue = new Color(0,0,1,1);
  var White = new Color(1,1,1,1);
  var colors = [Red, Green, Blue, White];
  var result = findRGB(100,100,200,200,colors);
  console.log("Red: \t" + result.r);
  console.log("Green: \t" + result.g);
  console.log("Blue: \t" + result.b);
}