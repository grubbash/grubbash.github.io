var dict = {"A":1,"B":2,"C":3,"D":4,"E":5,"F":6,"G":7,};
const re = new RegExp("^[A-G][1-7]$");
var d1c = document.getElementById("d1c"); var d2c = document.getElementById("d2c");
var d3c = document.getElementById("d3c"); var ResultField = document.getElementById("Result");
var submitbut = document.getElementById("submitbut"); const mapImg = document.getElementById("mapImg");
const pil1 = document.getElementById("pillar1"); const pil2 = document.getElementById("pillar2"); const pil3 = document.getElementById("pillar3");
const ctx = document.getElementById("resCvs").getContext("2d");
submitbut.addEventListener("click", (e) => { e.preventDefault();
}); function doEventSubmit() { 
    if (!re.test(pil1.value) || !re.test(pil2.value)) {alert("Incorrect pillar values.");return;}
    let d1 = d1c.value; let d2 = d2c.value; let d3 = d3c.value;
    let coords1 = convCoordXY(pil1.value); let coords2 = convCoordXY(pil2.value); let coords3 = convCoordXY(pil3.value);
    let result = trilaterate(coords1[0], coords1[1], d1, coords2[0], coords2[1], d2, coords3[0], coords3[1], d3);
    console.log(result);
    let x = result.x; let y = result.y;
    ctx.drawImage(mapImg, 0,0,500,500); ctx.beginPath();
    drawCircle(coords1[0],coords1[1],normaliseCanvas(d1),false);
    drawCircle(coords2[0],coords2[1],normaliseCanvas(d2),false);
    drawCircle(coords3[0],coords3[1],normaliseCanvas(d3),false);
    drawCircle(x,y,5,true);
} function normaliseCanvas(n){return n* (10/51);}
function drawCircle(x,y,rad, fill) {
    ctx.beginPath();
    ctx.arc(normaliseCanvas(x),normaliseCanvas(y), rad, 0, 2*Math.PI);
    if (fill) {ctx.fillStyle="red"; ctx.fill();}
    ctx.lineWidth=0.9;
    ctx.stroke();
}
function convCoordXY(coord) {
    let formatted = coord.trim().toUpperCase();
    let height = formatted.charAt(1); 
    height=50+(400*(height-1));
    let width = dict[formatted.charAt(0)];
    width= 50+(400*(width-1));
    console.log([width,height]);
    return [width,height]; }
function intersectCircles(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1; const dy = y2 - y1; const d = Math.hypot(dx, dy);
    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0)
        return [];
    const a = (r1*r1 - r2*r2 + d*d) / (2*d);
    const h = Math.sqrt(r1*r1 - a*a); const ux = dx / d;
    const uy = dy / d; const px = x1 + a * ux; const py = y1 + a * uy;
    return [
        {x: px + h * -uy,y: py + h * ux},
        { x: px - h * -uy, y: py - h * ux}
    ];
}
function trilaterate(
    x1, y1, r1,
    x2, y2, r2,
    x3, y3, r3
) {
    const points = intersectCircles(x1,y1,r1,x2,y2,r2);
    for (const p of points) {
        const d = Math.hypot(p.x-x3, p.y-y3);
        if (Math.abs(d-r3) < 10) {return {x:p.x, y:p.y };}}
    return {x:NaN, y:NaN};
}