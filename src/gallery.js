import { useState, useEffect, useRef } from "react";
import images from "./images";
import { gsap } from "gsap";

export default function Gallery() {
  const canvas1 = useRef(null)
  const canvas2 = useRef(null)
  const [counter1, setCounter1] = useState(0)
  const [counter2, setCounter2] = useState(0)
  const [canvasClock, setCanvasClock] = useState(1) 
  const [lower1, setLower1] = useState([0, 0, 0])
  const [lower2, setLower2] = useState([0, 0, 1])
  const intervalRef1 = useRef();
  const intervalRef2 = useRef();
  const [duration, setDuration] = useState(3000); // Duration of the animation in milliseconds
  const [blur, setBlur] = useState(20);
  const [easingType1, setEasingType1] = useState('easeOut'); // Default easing type
  const [easingType2, setEasingType2] = useState('easeOut'); // Default easing type
  const [disabled, setDisabled] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState([])


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

    useEffect(() => {        
        return () => {
          if (intervalRef1.current) {
            clearInterval(intervalRef1.current);
          }
          if (intervalRef2.current) {
            clearInterval(intervalRef2.current);
          }
        };
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            let loadedImages = [];
    
            for (let img of images) {
                let newImg = new Image();
                newImg.src = img.src;
                await new Promise(resolve => {
                    newImg.onload = () => {
                        resolve(newImg);
                        loadedImages.push(newImg);
                    };
                });
            }
    
            setPreloadedImages(loadedImages);
        }
    
        loadImages();
    }, []);

    useEffect(() => {
        if (preloadedImages[counter1]) {
            let img1 = new Image()
            img1.crossOrigin = "anonymous";
            img1.src = preloadedImages[counter1].src;
            img1.onload = function() {
                let ctx1 = canvas1.current.getContext('2d');
                ctx1.drawImage(img1, 0, 0);
                ctx1.filter = `blur(${lower1[2]*blur}px)`;
                let pixels1 = ctx1.getImageData(0, 0, canvas1.current.width, canvas1.current.height);
                thresholdHsl(pixels1, lower1, [1,1,1]);
                ctx1.putImageData(pixels1, 0, 0);
            }

        }
    }, [lower1, preloadedImages])

    useEffect(() => {
        if (preloadedImages[counter2]) {
            let img2 = new Image()
            img2.crossOrigin = "anonymous";
            img2.src = preloadedImages[counter2].src;
            img2.onload = function() {
                let ctx2 = canvas2.current.getContext('2d');
                ctx2.drawImage(img2, 0, 0);
                ctx2.filter = `blur(${lower2[2]*blur}px)`;
                let pixels2 = ctx2.getImageData(0, 0, canvas2.current.width, canvas2.current.height);
                thresholdHsl(pixels2, lower2, [1,1,1]);
                ctx2.putImageData(pixels2, 0, 0);
            }
        }

    }, [lower2, preloadedImages])

    useEffect(() => {
        let ctx1 = canvas1.current.getContext('2d');
        ctx1.clearRect(0, 0, canvas1.current.width, canvas1.current.width);

        let img2 = new Image()
        img2.crossOrigin = "anonymous";
        img2.src = images[counter2].src;
    
        img2.onload = function() {
            let ctx2 = canvas2.current.getContext('2d');
            ctx2.clearRect(0, 0, canvas2.current.width, canvas2.current.width);
            ctx2.drawImage(img2, 0, 0);
            let pixels2 = ctx2.getImageData(0, 0, canvas2.current.width, canvas2.current.height);
            thresholdHsl(pixels2, lower2, [1,1,1]);
            ctx2.putImageData(pixels2, 0, 0);
        }
    }, [counter1])

    useEffect(() => {
        let ctx2 = canvas2.current.getContext('2d');
        ctx2.clearRect(0, 0, canvas2.current.width, canvas2.current.width);

        let img1 = new Image()
        img1.crossOrigin = "anonymous";
        img1.src = images[counter1].src;
    
        img1.onload = function() {
            let ctx1 = canvas1.current.getContext('2d');
            ctx1.clearRect(0, 0, canvas1.current.width, canvas1.current.width);
            ctx1.drawImage(img1, 0, 0);
            let pixels1 = ctx1.getImageData(0, 0, canvas1.current.width, canvas1.current.height);
            thresholdHsl(pixels1, lower1, [1,1,1]);
            ctx1.putImageData(pixels1, 0, 0);
        }
    }, [counter2])

    useEffect(() => {
        let timeout
        if (counter1 !== counter2) {
            setDisabled(true)
            clearInterval(timeout)
        } else {
            timeout = setTimeout(() => {
                setDisabled(false)
                clearInterval(timeout)
            }, 800)    
        }
    }, [counter1, counter2])

    const getGsapEasing = (easingType) => {
        switch (easingType) {
          case 'linear':
            return "none";
          case 'easeIn':
            return "power1.in";
          case 'easeOut':
            return "power1.out";
          case 'easeInOut':
            return "power1.inOut";
          default:
            return "none";
        }
      };


    const nextImage = () => {
        if (canvasClock == 1) {
            setCanvasClock (2)
        } else {
            setCanvasClock (1)
        }

        if (canvasClock == 1) {
            setCounter2(counter => {
                if (counter+1 < images.length) {
                    return counter + 1
                } else {
                    return 0            
                }
            })
    
            setTimeout(() => {
                setCounter1(counter => {
                    if (counter+1 < images.length) {
                        return counter + 1
                    } else {
                        return 0            
                    }
                })
            }, duration)
        }

        if (canvasClock == 2) {
            setCounter1(counter => {
                if (counter+1 < images.length) {
                    return counter + 1
                } else {
                    return 0            
                }
            })
    
            setTimeout(() => {
                setCounter2(counter => {
                    if (counter+1 < images.length) {
                        return counter + 1
                    } else {
                        return 0            
                    }
                })
            }, duration)
        }

        
        if (canvasClock === 1) {
            let animObj1 = { value: lower1[2] };
            let animObj2 = { value: lower2[2] };

            // FadeOut 1
            gsap.to(animObj1, {
              duration: duration / 1000, // Convert milliseconds to seconds for GSAP
              value: 1,
              ease: getGsapEasing(easingType1),
              onUpdate: () => {
                setLower1([lower1[0], lower1[1], animObj1.value]);
              },
              onComplete: () => {
                setLower1([0, 0, 1]); 
              },
            });
              
        
            // FadeIn 2
            gsap.to(animObj2, {
                duration: duration / 1000, // Convert milliseconds to seconds for GSAP
                value: 0,
                ease: getGsapEasing(easingType2),
                onUpdate: () => {
                  setLower2([lower2[0], lower2[1], animObj2.value]);
                },
                onComplete: () => {
                    setLower2([0, 0, 0]);
                },
            });


          } else {
            let animObj1 = { value: lower1[2] };
            let animObj2 = { value: lower2[2] };

            // FadeOut 2
            gsap.to(animObj2, {
                duration: duration / 1000, // Convert milliseconds to seconds for GSAP
                value: 1,
                ease: getGsapEasing(easingType2),
                onUpdate: () => {
                  setLower2([lower2[0], lower2[1], animObj2.value]);
                },
                onComplete: () => {
                  setLower2([0, 0, 1]); 
                },
            });

            // FadeIn 1
            gsap.to(animObj1, {
                duration: duration / 1000, // Convert milliseconds to seconds for GSAP
                value: 0,
                ease: getGsapEasing(easingType1),
                onUpdate: () => {
                  setLower1([lower1[0], lower1[1], animObj1.value]);
                },
                onComplete: () => {
                    setLower1([0, 0, 0]);
                },
            });      
        } 

    }

    const handleLower1HChange = (e) => {
        setLower1(l => [e.target.value, l[1], l[2]])
    }

    const handleLower1SChange = (e) => {
        setLower1(l => [l[0], e.target.value, l[2]])
    }

    const handleLower1LChange = (e) => {
        setLower1(l => [l[0], l[1], e.target.value])
    }

    const handleLower2HChange = (e) => {
        setLower2(l => [e.target.value, l[1], l[2]])
    }

    const handleLower2SChange = (e) => {
        setLower2(l => [l[0], e.target.value, l[2]])
    }

    const handleLower2LChange = (e) => {
        setLower2(l => [l[0], l[1], e.target.value])
    }

    const handleBlurChange = (e) => {
        setBlur(e.target.value)
    }

    const handleSpeedChange = (e) => {
        setDuration(e.target.value)
    }

  return (
    <div>
      <canvas id="canvas1" width="638" height="475" ref={canvas1}></canvas>
      <canvas id="canvas2" width="638" height="475" ref={canvas2}></canvas>

      <div style={{
        position: 'fixed',
        width: '260px',
        backgroundColor: '#C2C2C2',
        padding: '20px',
        fontFamily: 'monospace',
        top: 10,
        right: 10
      }}>
        <button onClick={nextImage} disabled={disabled}>Next</button> <br/><br/>
       
        <span>Counter 1: {counter1}</span> <br/>
        <span>Counter 2: {counter2}</span> <br/><br/>
        <span>Canvas clock: {canvasClock}</span> <br/><br/>

        <span>1: </span><br/>
        <label>
          H
          <input 
            type = "range"
            value = {lower1[0]}
            onChange = {handleLower1HChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower1[0] * 100)/ 100}
        </label><br/>
        <label>
          S
          <input 
            type = "range"
            value = {lower1[1]}
            onChange = {handleLower1SChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower1[1] * 100)/ 100}
        </label><br/>
        <label>
          L
          <input 
            type = "range"
            value = {lower1[2]}
            onChange = {handleLower1LChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower1[2] * 100)/ 100}
        </label> <br/>

        <select value={easingType1} onChange={event => setEasingType1(event.target.value)}>
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In Out</option>
        </select>

        <br/><br/>
        <span>2: </span><br/>
        <label>
          H
          <input 
            type = "range"
            value = {lower2[0]}
            onChange = {handleLower2HChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower2[0] * 100)/ 100}
        </label><br/>
        <label>
          S
          <input 
            type = "range"
            value = {lower2[1]}
            onChange = {handleLower2SChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower2[1] * 100)/ 100}
        </label><br/>
        <label>
          L
          <input 
            type = "range"
            value = {lower2[2]}
            onChange = {handleLower2LChange}
            min = "0"
            max = "1"
            step=  "0.05"
          />
          {Math.floor(lower2[2] * 100)/ 100}
        </label><br/>

        <select value={easingType2} onChange={event => setEasingType2(event.target.value)}>
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In Out</option>
        </select>
        
        <br/><br/>

        <label>
          Blur
          <input 
            type = "range"
            value = {blur}
            onChange = {handleBlurChange}
            min = "0"
            max = "100"
            step=  "1"
          />
          {blur}
        </label><br/><br/><br/>

        <label>
          Speed
          <input 
            type = "range"
            value = {duration}
            onChange = {handleSpeedChange}
            min = "1000"
            max = "6000"
            step=  "200"
          />
          {duration}
        </label><br/><br/><br/>
      </div>
    </div>
  );
}