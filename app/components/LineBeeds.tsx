import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface LineProps {
  svgref: any;
  svggref: any;
  activatedraw:boolean;
  chartwidth:number;
  chartheight:number;
}


interface ShapeProps {
  id: number;
  path: string;
}
//const shapecollections:any[] = [];
let editstatus = false;
let drawstatus = false;
let handledata: any = [];
let rectangle: any;
let rotatehandle : any;
let rotateimage:any;
let rotationStart:number = 0;
let svgggref:any;
let rotation = 0;
let startAngle = 0;
let rotating:boolean = false;
let firsttimerotate:boolean = false;
let editLineID = "";
let zoom = null;
let gridg:any = null;

const initialRect = { x: 50, y: 50, width: 100, height: 80 };
let resizing:boolean = false;
let xAxis:any = null;
let yAxis:any = null;
let xAxisGrid:any = null;
let yAxisGrid:any = null;
let xScale:any = null;
let yScale:any = null;

const LineBeeds: React.FC<LineProps> = ({ svgref, svggref, activatedraw, chartwidth, chartheight }) => {
  const lineRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [pathData, setPathData] = useState('');
  const [shapeCollections, setShapeCollections] = useState<ShapeProps[]>([])
  const [idCounter, setidCounter] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [drawhandles, setDrawHandles] = useState(false);


  const updateRectangle = (rect: any) => {
    rectangle.attr('x', rect.x).attr('y', rect.y).attr('width', rect.width).attr('height', rect.height);
    rotatehandle.attr("x",rect.x+(rect.width/2)-15).attr("y",rect.y-30);
    rotateimage.attr("x",rect.x+(rect.width/2)-10).attr("y",rect.y-27);
  };

  const Zoomed = (event:any)=>{
    if (editstatus){
        return
    }
    if (rotation){
        return;
    }
    svggref && svggref.current && d3.select(svggref.current).transition().duration(200).attr("transform","translate(" + event.transform.x+","+event.transform.y+ ")" + " scale(" + event.transform.k + ")");
    const newX = event.transform.rescaleX(xScale);
    const newY = event.transform.rescaleY(yScale);
    const newaxx:any = d3.axisBottom(newY).tickSize(-chartheight).tickFormat(null)
    svggref && svggref.current && d3.select(svggref.current).select('.x-grid').call(newaxx);
    const newaxy:any = d3.axisBottom(newY).tickSize(-chartwidth).tickFormat(null)
    svggref && svggref.current && d3.select(svggref.current).select('.y-grid').call(newaxy);
    svggref && svggref.current && d3.select(svggref.current).select(".x-grid").selectAll(".tick")._groups[0].forEach((tick:any)=>{
      d3.select(tick).select("text").style("display","none");
    });
    svggref && svggref.current && d3.select(svggref.current).select(".y-grid").selectAll(".tick")._groups[0].forEach((tick:any)=>{
      d3.select(tick).select("text").style("display","none");
    });     
  }

  const dragBehavior = d3
    .drag()
    .on('start', () => {
      // Save the initial position of the rectangle
      const { x, y } = initialRect;
      dragBehavior.subject({ x, y });
    })
    .on('drag', (event) => {
      const { x, y } = event;
      updateRectangle({ x, y, width: initialRect.width, height: initialRect.height });
    });

  type INode = /*unresolved*/ any

  let drg =
    d3.drag()
      .on("start", (event, d: any) => {
          resizing = true;
      })   
      .on("end", (event, d: any) => {
          resizing = false;
      })       
      .on('drag', (event, d: any) => {
        if (!editstatus) {
          return;
        }
        if (rotating){
            return;
        }
        resizing = true;
        // Update rectangle size based on the drag handle   
        switch (d.handle) {
          case 'nw':
            updateRectangle({
              x: event.x,
              y: event.y,
              width: d.rect.width - (event.x - d.rect.x),
              height: d.rect.height - (event.y - d.rect.y),
            });
            break;
          case 'ne':   // finalized
            updateRectangle({
              x: d.rect.width +  (event.x - d.rect.x - d.rect.width) > 0 ? d.rect.x : event.x,
              y: d.rect.height - event.y + d.rect.y > 0 ? event.y : d.rect.y + d.rect.height ,
              width:  d.rect.width +  (event.x - d.rect.x - d.rect.width) > 0 ? d.rect.width +  (event.x - d.rect.x - d.rect.width) : -1 * (d.rect.width +  (event.x - d.rect.x - d.rect.width)),
              height: d.rect.height - event.y + d.rect.y > 0 ? d.rect.height - event.y + d.rect.y : -1 * (d.rect.height - event.y + d.rect.y) ,
            });
            updateDraggers({
              x: d.rect.x,
              y: d.rect.y + event.y,
              width: d.rect.width + event.x,
              height: d.rect.height - event.y,
              eventX:event.x,
              eventY:event.y,
              id: "ne"
            })
            updateLine({
              x: d.rect.x,
              y: d.rect.y + event.y,
              width: d.rect.width + event.x,
              height: d.rect.height - event.y,
              eventX:event.x,
              eventY:event.y,
              id: "ne"
            })
            break;
          case 'se': // finalized
            updateRectangle({
              x: d.rect.x,
              y: d.rect.y + event.y,
              width: d.rect.width + event.x, //- d.rect.x,
              height: d.rect.height - event.y //- d.rect.y,
            });
            updateDraggers({
              x: d.rect.x,
              y: d.rect.y + event.y,
              width: d.rect.width + event.x, //- d.rect.x,
              height: d.rect.height - event.y, //- d.rect.y,
              eventX:event.x,
              eventY:event.y,
              id: "se"
            })
            updateLine({
              x: event.x,
              y: event.y,
              width: d.rect.width + event.x, //- d.rect.x,
              height: d.rect.height - event.y, //- d.rect.y,
              id: "se"
            })
            break;
          case 'sw':
            updateRectangle({
              x: event.x,
              y: d.rect.y,
              width: d.rect.width - (event.x - d.rect.x),
              height: event.y - d.rect.y,
            });
            break;
          default:
            break;
        }
      })

  const getAngle = (cx, cy, ex, ey) =>{
    const dy = ey - cy;
    const dx = ex - cx;
    let theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI;
    return theta;
  }      

  const updateDraggers = (pos: any) => {
    let element = svggref && svggref.current && d3.select(svggref.current).select(`#${pos.id}`).select("circle");
    if (pos.id === "ne"){
        element.attr("cx",pos.eventX).attr("cy",pos.eventY)
//        element.attr("transform",`translate(${pos.eventX},${pos.eventY})`);
    }   
    if (pos.id === "se"){
        element.attr("cx",pos.eventX).attr("cy",pos.eventY)
        // element.attr("transform",`translate(${pos.x},${pos.y})`);
    }   
  };

  const updateLine = (pos:any) =>{
     if (pos.id === "ne"){
         let data:any = {};
         shapeCollections.forEach((shape:any)=>{
            if (shape.id === Number(editLineID.split("_")[1])){
                data.id = shape.id;
                data.path = shape.path;
                data.points = shape.points;
                let delement = svggref && svggref.current && d3.select(svggref.current).select("#resizing").select("#ne").select("circle")
                setStartX(Number(delement.attr("cx")));
                setStartY(Number(delement.attr("cy")));
                let sx = Number(delement.attr("cx"));
                let sy = Number(delement.attr("cy"));
                data.points[0] = [Number(delement.attr("cx")),Number(delement.attr("cy"))]; 
                delement = svggref && svggref.current && d3.select(svggref.current).select("#resizing").select("#se").select("circle")
                data.points[1] = [Number(delement.attr("cx")),Number(delement.attr("cy"))]; 
                updateItemById(Number(editLineID.split("_")[1]),data,Number(delement.attr("cx")),Number(delement.attr("cy")),sx,sy)
            }
         });
     }
     if (pos.id === "se"){
         let data:any = {};
         shapeCollections.forEach((shape:any)=>{
            if (shape.id === editLineID.split("_")[1]){
                data.id = shape.id;
                data.path = shape.path;
                data.points = shape.points;
                setStartX(data.points[0][0]);
                setStartY(data.points[0][1]);                
                data.points[1] = [pos.x,pos.y]; 
                updateItemById(Number(editLineID.split("_")[1]),data,pos.x,pos.y,0,0)
            }
         });
     }
  };


  const handleMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (editstatus) {
        return;
    }
    if (drawing) {
      setDrawing(false);
      return;
    }
    if (rotating){
        return;
    }
    setDrawing(true);
    const [x, y] = d3.pointer(event);
    let idc = idCounter + 1;
    setidCounter(idc)
    setStartX(x);
    setStartY(y);
    //     let newvalue:any = {id:idc,path:`M${x},${y} L${x},${y}`};
    //     setShapeCollections(oshape => [...oshape,newvalue])
  };


  const updateItemById = (idToUpdate: any, Data: any, x: number, y: number,sx:number, sy:number) => {
    setShapeCollections(prevData => {
      const index = prevData.findIndex(item => { return item.id === idToUpdate });
      if (index !== -1) {
        const updatedArray = [...prevData];
        //         const [startX, startY]  = updatedArray[index].path.split('L')[0].substring(1).split(',');
        let currentdata = `M${startX},${startY} L${x},${y}`;
        if (sx && sy){
            currentdata  = `M${sx},${sy} L${x},${y}`;
        }
        const currentPath = { id: Data.id, path: currentdata, points: [[startX, startY], [x, y]] };
        updatedArray[index] = { ...updatedArray[index], ...currentPath };
        return updatedArray;
      }

      return prevData;
    });
  };

  const handleMouseMove = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!drawing) return;
    if (editstatus) return;
    if (rotating) return;
    const [x, y] = d3.pointer(event);
    const updatedItem = { id: idCounter, path: '' };
    if (drawstatus) {
      updateItemById(idCounter, updatedItem, x, y,0,0)
    } else {
      let newvalue: any = { id: idCounter, path: `M${startX},${startY} L${x},${y}` };
      setShapeCollections(oshape => [...oshape, newvalue])
      drawstatus = true;
    }
    //setPathData((prevPath) => {
    //    const [startX, startY] = prevPath.split('L')[0].substring(1).split(','); // Extract starting point
    //    return `M${startX},${startY} L${x},${y}`;
    //});
  }

  const handleMouseUp = () => {
    drawstatus = false;
    setDrawing(false);
  };

  const resetEdit = () =>{
     editLineID = "";
     svggref && svggref.current && d3.select(svggref.current).select("#editor").remove();
     svggref && svggref.current && d3.select(svggref.current).selectAll("#resizing").remove();
     rotating = false;
     editstatus = false;
     drawstatus = false;
     firsttimerotate = false;
  }

  useEffect(() => {
    const g = d3.select(lineRef.current);
    if (activatedraw){
        svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mousedown', handleMouseDown);
        svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mousemove', handleMouseMove);
        svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mouseup', handleMouseUp);

        return () => {
          svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mousedown', null);
          svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mousemove', null);
          svgref && svgref.current && d3.select((svgref.current as SVGElement)).on('mouseup', null);
        };
    }else{
        resetEdit();
    } 
    if (!activatedraw){
//        zoom = d3.zoom()
//                 .scaleExtent([1, 16])
//                 .extent([
//                    [0, 0],
//                    [chartwidth, chartheight]
//                 ])
//                 .translateExtent([
//                    [0, 0],
//                    [chartwidth, chartheight]
//                 ])             
//                 .on("zoom",Zoomed);  
//        svgref && svgref.current && d3.select((svgref.current as SVGElement)).call(zoom);   
    }else{
 //       if (zoom){
 //         console.log("hot");
 //           zoom.on("zoom",null);
 //           svgref && svgref.current && d3.select((svgref.current as SVGElement)).call(zoom.on("zoom",null));
 //       }
    }    
    xScale         = d3.scaleLinear().domain([0, 100]).range([0, chartwidth]);
    yScale         = d3.scaleLinear().domain([0, 100]).range([chartheight, 0]);
  //  xAxis     = d3.axisBottom(xScale).ticks(200);
  //  yAxis     = d3.axisLeft(yScale).ticks(200);
  //  console.log(chartheight);
    xAxisGrid = d3.axisBottom(xScale).tickSize(-chartheight).tickFormat(null).ticks(100);
    yAxisGrid = d3.axisLeft(yScale).tickSize(-chartwidth).tickFormat(null).ticks(100);   
    console.log(svggref && svggref.current && d3.select(svggref.current));
 //   svggref && svggref.current && d3.select(svggref.current).append('g')
 //     .attr('class', 'grid x-grid')
 //     .attr('transform', `translate(0,${chartheight})`)
 //     .call(xAxisGrid);

    // Add y gridlines
 //   svggref && svggref.current && d3.select(svggref.current).append('g')
 //     .attr('class', 'grid y-grid')
 //     .call(yAxisGrid);
 //   svggref && svggref.current && d3.select(svggref.current).select(".x-grid").selectAll(".tick")._groups[0].forEach((tick:any)=>{
 //     d3.select(tick).select("text").style("display","none");
 //   });
 //   svggref && svggref.current && d3.select(svggref.current).select(".y-grid").selectAll(".tick")._groups[0].forEach((tick:any)=>{
 //     d3.select(tick).select("text").style("display","none");
 //   });   
 
//    xAxisGrid = d3.axisBottom(x).tickSize(-chartheight).tickFormat(null).ticks(400);
//    yAxisGrid = d3.axisLeft(y).tickSize(-chartwidth).tickFormat(null).ticks(400);    
 //   console.log(chartwidth);    
//    svgref && svgref.current && d3.select((svgref.current as SVGElement)).append('g')
//       .attr('class', 'x axis-grid')
//       .attr('transform', 'translate(0,' + chartheight + ')')
//       .call(xAxisGrid);
//    svgref && svgref.current && d3.select((svgref.current as SVGElement)).append('g')
//       .attr('class', 'y axis-grid')
//        .call(yAxisGrid);    
  }, [drawing, svgref, svggref,activatedraw, chartwidth, chartheight]);


  const handleRotateDrag = (event:any) =>{
    let bbox = rectangle.node().getBBox()   //getBoundingClientRect()
    const rectCenterX = bbox.x + bbox.width / 2;
    const rectCenterY = bbox.y + bbox.height / 2;; // Center Y of the rectangle
    const mouseX = event.x;
    const mouseY = event.y;
    
    const angle = Math.atan2(mouseY - rectCenterY, mouseX - rectCenterX) * (180 / Math.PI);
    
    if (firsttimerotate) {
        firsttimerotate = false;
        startAngle = angle - rotation;
    } else {
      rotation = angle - startAngle;
      svggref && svggref.current && d3.select(svggref.current).select("#resizing").attr("transform", `rotate(${rotation} ${rectCenterX} ${rectCenterY})`);
      svggref && svggref.current && d3.select(svggref.current).select(`#gline_${editLineID.split("_")[1]}`).attr("transform", `rotate(${rotation} ${rectCenterX} ${rectCenterY})`);
    }
  }

  const editLine = (event: any) => {
    if (resizing){
        return;
    }
    editLineID = event.target.id;
    svggref && svggref.current && d3.select(svggref.current).select("#editor").remove();
    svggref && svggref.current && d3.select(svggref.current).selectAll("#resizing").remove();
    svgggref = svggref && svggref.current && d3.select(svggref.current).append("g").attr("id","resizing");
    rectangle = svgggref && svgggref
        .append('rect')
        .attr('x', initialRect.x)
        .attr('y', initialRect.y)
        .attr('width', initialRect.width)
        .attr('height', initialRect.height)
        .attr('fill', 'transparent')
        .attr("id", "editor")
        .attr('stroke', "black")
    rotatehandle  =   svgggref && svgggref
        .append("rect")
        .attr("x",initialRect.x + (initialRect.width/2) - 15)
        .attr("y", initialRect.y - 30)
        .attr("width", 30)
        .attr("height", 30)
        .attr("class", "rotate-handle")
        .attr("fill","white")
        .attr("stroke","black")
    rotateimage = svgggref && svgggref
        .append("image")
        .attr("href","/assets/rotate.png")
        .attr("x",initialRect.x + (initialRect.width/2) - 12.5)
        .attr("y", initialRect.y - 25)
        .attr("width","25")
        .attr("height","25")
        .attr("class","rotateimage")
        .call(d3.drag().on("drag", handleRotateDrag).on("start",()=>{rotating=true;firsttimerotate = true;}).on("end",()=>{rotating=false;firsttimerotate=false;}));


    const bbox = d3.select(event.target).node().getBBox();
    updateRectangle(bbox)
    //       rectangle.call(dragBehavior);  
    //       handledata.push({handle:'nw',pos:{x:bbox.x,y:bbox.y},rect:bbox});
    handledata = [];
    handledata.push({ handle: 'ne', pos: { x: bbox.x + bbox.width, y: bbox.y }, rect: bbox });
    handledata.push({ handle: 'se', pos: { x: bbox.x, y: bbox.y + bbox.height }, rect: bbox });
    //        handledata.push({handle:'sw',pos:{x:bbox.x+bbox.width,y:bbox.y+bbox.height},rect:bbox});    
    editstatus = true;
    setDrawHandles(!drawhandles);
  }

  useEffect(() => {
    const dragHandles: any = svgggref  && svgggref
      .selectAll(`.drag-handle`)
      .data(handledata)
      .enter()
      .append("g")
      .attr('class', (d:any) => `drag-handle`)
      .attr("id", (d:any) => d.handle)
 //     .attr("transform", (d:any) => `translate(${d.pos.x},${d.pos.y})`)

    dragHandles && dragHandles      //.append<SVGCircleElement>("circle")
      .append('circle')
      //          .attr('class', (d) => `drag-handle_${idCounter}`)
      .attr("cx",(d)=>d.pos.x)
      .attr("cy",(d)=>d.pos.y)
      .attr('r', 8)

    dragHandles && dragHandles.selectAll("circle").call(drg)
  }, [drawhandles])

  const adjustDisplay = ()=>{
    let boundss = svggref && svggref.current && d3.select(svggref.current).node().getBBox();   
    let bounds = new Array(2);
    bounds[0] = new Array(2)
    bounds[0][0] =  boundss.x
    bounds[0][1] =  boundss.y 
    bounds[1] = new Array(2)
    bounds[1][0] = boundss.x+boundss.width
    bounds[1][1] = boundss.y+boundss.height; 
    let s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / chartWidth, (bounds[1][1] - bounds[0][1]) / chartHeight);  
    let redfactor = 1.35;
    let __restrictmaximumscaleto = 5;
    s = s/redfactor
    if ( s > __restrictmaximumscaleto){
        s = __restrictmaximumscaleto;
    }          
    let t = [(chartWidth - s * (bounds[1][0] + bounds[0][0])) / 2, (chartHeight - s * (bounds[1][1] + bounds[0][1])) / 2];  

    var transform = d3.zoomIdentity
          .translate(t[0] ,t[1])
          .scale(s);

    d3.select(chartRef.current).transition().duration(1000).attr("transform","translate(" + t[0]+","+t[1]+ ")" + " scale(" + s + ")").on("end",() =>{
        if (settings.zoomRequired){
            zoom = d3.zoom()
               .scaleExtent([.5, 16])
               .on("zoom",Zoomed);
            d3.select("#chartholder").call(zoom);
        }          
    })
  }  


  return (
    <g>
      {
        shapeCollections.map((sc: any) =>
          <g key={sc.id} id={`gline_${sc.id}`} ref={lineRef}>
            <path onClick={editLine} id={`line_${sc.id}`} className="line" d={sc.path} fill="none" stroke="black" strokeWidth={2} />
          </g>
        )
      }
    </g>
  )
}
export default LineBeeds