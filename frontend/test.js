prevPixel = {
    x:50,
    y:59,
}

currPixel = {
    x:50,
    y:50,
}
const a = (prevPixel.x - currPixel.x); console.log(a);
const b = (prevPixel.y - currPixel.y); console.log(b);

if (!((a < 10) && (a > -10) && (b < 10) && (b >-10))) {
    console.log(prevPixel + "yes");
} else {
    console.log(prevPixel + "no");
}