import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/sparkles-no-2.ogg";
import midi from "../audio/sparkles-no-2.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[5].notes; // Synth 1
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.packedCirclesSet = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.blendMode(p.ADD);
            p.rectMode(p.CENTER);
            p.background(0);

            while(p.packedCirclesSet.length < 25) {
                let radius = p.random(p.height / 12, p.height / 6); 
                const circle = {
                    x: p.random(0, p.width),
                    y: p.random(0, p.height),
                    r: radius
                }
                
                let overlapping = false;
                for (let i = 0; i < p.packedCirclesSet.length; i++) {
                    const existingCircle = p.packedCirclesSet[i];
                    const distance = p.dist(circle.x, circle.y, existingCircle.x, existingCircle.y);
                    if (distance < circle.r + existingCircle.r) {
                        overlapping = true;
                        break;
                    }
                }
                if(!overlapping) {
                    p.packedCirclesSet.push(circle);
                }
            }
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.packedCirclesSetIndex = 0;

        p.executeCueSet1 = (note) => {
            const { duration } = note,
                circle = p.packedCirclesSet[p.packedCirclesSetIndex], 
                { x, y, r } = circle;
                
            p.drawSparkle(x, y, r, parseInt(duration * 1000));
            p.packedCirclesSetIndex++;
        }

        p.drawSparkle = (x, y, size, duration) => {
            const delayAmount = duration / 360;
            let r = size * p.random(1.2,1.5);
            let q=p.random(0,255);
            let w=p.random(0,255);
            let e=p.random(0,255);

            for (let h = 0; h < 360; h++) {
                setTimeout(
                    function () {
                        let u=p.random(1,5)
                        p.stroke(q,w,e,p.random(193));
                        p.noFill();
                        const sizeAdjuster = p.random(0, r);
                        p.line(x,y,x+sizeAdjuster*Math.cos(h),y+sizeAdjuster*Math.sin(h));
                        p.line(x,y,x+r*Math.cos(h)/u,y+r*Math.sin(h)/u);
                        p.fill(q,w,e,10);
                        if(Math.random() < 0.2) {
                            p.fill(q,w,e,64);
                            p.ellipse(x+r*Math.cos(h),y+r*Math.sin(h),r/50,r/50);
                        }
                        p.fill(q,w,e,127);
                        p.ellipse(x+r*Math.cos(h)/u,y+r*Math.sin(h)/u,r/50,r/50);
                    },
                    (delayAmount * h)
                );
            }
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
