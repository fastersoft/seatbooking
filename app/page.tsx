"use client"
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import LineBeeds from "./components/LineBeeds";
import Image from 'next/image';

export default function Home() {
  const svgRef = useRef(null);
  const svggRef = useRef(null);
  const [activateDraw,setActivateDraw] = useState(false);
  const [chartWidth,setChartWidth] = useState(0);
  const [chartHeight,setChartHeight] = useState(0); 


  useEffect(()=>{
      setChartWidth(document.querySelector(".holder")?.offsetWidth);
      setChartHeight(document.querySelector(".holder")?.offsetHeight);  
  },[]);  
  
  useEffect(()=>{
     console.log(chartWidth);
     console.log(chartHeight);
  },[chartWidth,chartHeight])


  const activateDrawing = (event:any) =>{
     event.preventDefault();
     event.stopPropagation();
     setActivateDraw(!activateDraw);
  }

  return (
    <div id = "wrapper">
      <div id = "sidebar"> 
         <Sidebar>
           <Menu>
             <SubMenu label="Shapes">
               <MenuItem onClick={activateDrawing}><div style = {{display:"flex"}}><img src = '/assets/line.png' width="30" height="30" alt="Draw Line"/><span style = {{paddingLeft:"5px"}}>Line</span></div> </MenuItem>
             </SubMenu>
           </Menu>
          </Sidebar>
       </div>
       <div id = "drawarea">       
         <div className = "holder">
           <svg ref = {svgRef} id = "diagramarea">
              <defs>
                <clipPath id = "clip">
                   <rect x = "0" y = "0"  width={chartWidth} height={chartHeight}>

                   </rect>
                </clipPath>
              </defs>
              <g ref={svggRef} clipPath='url(#clip)'>           
                <LineBeeds activatedraw = {activateDraw} svgref = {svgRef} svggref = {svggRef} chartwidth={chartWidth}  chartheight = {chartHeight}/>
              </g>
           </svg>
          </div>
       </div>
    </div>         
  )
}
