import { useState, useEffect } from "react";

export default function Sliders() {
    const [lower, setLower] = useState([0, 0, 0])
  const [upper, setUpper] = useState([1, 1, 1])

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
      return [h, s, l];
    }

    const thresholdHsl = (pixels, lower, upper) => {
        let d = pixels.data;
        let createTest = function(lower, upper) {
            return lower <= upper ?
                function(v) {
                    return lower <= v && v <= upper;
                } :
                function(v) {
                    return lower <= v || v <= upper;
                };
        }
        let h = createTest(lower[0], upper[0]);
        let s = createTest(lower[1], upper[1]);
        let l = createTest(lower[2], upper[2]);

        for (let i = 0; i < d.length; i += 4) {
            let hsl = rgbToHsl(d[i], d[i + 1], d[i + 2]);
            if (!h(hsl[0]) || !s(hsl[1]) || !l(hsl[2])) {
                d[i + 3] = 0;
            }
        }
    }

    document.body.style.background = "#C2C2C2"

    let img = new Image()
    img.crossOrigin = "anonymous";
    img.src = 'https://picsum.photos/638/475';

    img.onload = function() {
        let canvas = document.getElementById('myCanvas');
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        thresholdHsl(pixels, lower, upper);
        ctx.putImageData(pixels, 0, 0);
    }

    useEffect(() => {
      let canvas = document.getElementById('myCanvas');
      let ctx = canvas.getContext('2d');
      ctx.filter = `blur(${lower[2]*30}px)`;
      console.log(ctx.filter)
    }, [lower])

    useEffect(() => {
      let canvas = document.getElementById('myCanvas');
      let ctx = canvas.getContext('2d');
      ctx.filter = `blur(${(1-upper[2])*30}px)`;
      console.log(ctx.filter)
    }, [upper])

    const handleLowerChange = (e) => {
      setLower([0, 0, e.target.value])
    }

    const handleUpperChange = (e) => {
      setUpper([1, 1, e.target.value])
    }

  return (
    <div>
      <canvas id="myCanvas" width="638" height="475"></canvas>
      <div style={{
        position: 'fixed',
        width: '200px',
        height: '200px',
        backgroundColor: '#C2C2C2',
        top: 0,
        right: 0
      }}>
        <label>
          Lower
          <input 
            type = "range"
            value = {lower[2]}
            onChange = {handleLowerChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
        </label>
        <label>
          Upper
          <input 
            type = "range"
            value = {upper[2]}
            onChange = {handleUpperChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
        </label>
      </div>
    </div>
  );
}